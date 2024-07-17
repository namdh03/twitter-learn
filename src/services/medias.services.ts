import { Request } from 'express'
import fs from 'fs'
import { rimrafSync } from 'rimraf'
import fsPromise from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { envConfig, isProduction } from '~/constants/configs'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'
import { getFileName, getFiles, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { uploadFileToS3 } from '~/utils/s3'

class Queue {
  items: string[]
  encoding: boolean

  constructor() {
    this.items = []
    this.encoding = false
  }

  async enqueue(item: string) {
    this.items.push(item)

    const idName = getFileName(item.split('/').pop() as string)
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )

    this.processEncode()
  }

  async processEncode() {
    const mime = (await import('mime')).default

    if (this.encoding) {
      return
    }

    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]

      const idName = getFileName(videoPath.split('/').pop() as string)
      await databaseService.videoStatus.updateOne(
        { name: idName },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            updated_at: true
          }
        }
      )

      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)

        fs.unlinkSync(videoPath)
        this.items.shift()

        const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, idName))
        await Promise.all(
          files.map(async (file) => {
            const filename = 'videos-hls' + file.replace(path.resolve(UPLOAD_VIDEO_DIR), '')

            return await uploadFileToS3({
              filename,
              filePath: file,
              contentType: mime.getType(file) as string
            })
          })
        )
        rimrafSync(path.resolve(UPLOAD_VIDEO_DIR, idName))
        await databaseService.videoStatus.updateOne(
          { name: idName },
          {
            $set: {
              status: EncodingStatus.Success
            },
            $currentDate: {
              updated_at: true
            }
          }
        )

        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: {
                status: EncodingStatus.Failed
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
          .catch((error) => console.error(`Update video status failed: ${error}`))

        console.log(`Encode video ${videoPath} failed`)
        console.error(error)
      } finally {
        this.encoding = false
        this.processEncode()
      }
    } else {
      console.log(`Queue is empty`)
    }
  }
}

const queue = new Queue()

class MediasService {
  async uploadImage(req: Request) {
    const mime = (await import('mime')).default
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getFileName(file.newFilename) + '.jpg'
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newName)

        await sharp(file.filepath).jpeg().toFile(newPath)

        const s3Result = await uploadFileToS3({
          filename: 'images/' + newName,
          filePath: newPath,
          contentType: mime.getType(newPath) as string
        })

        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        return {
          url: s3Result.Location as string,
          type: MediaType.Image
        }

        // return {
        //   url: isProduction
        //     ? `${envConfig.HOST}/static/image/${newName}`
        //     : `http://localhost:${envConfig.PORT}/static/image/${newName}`,
        //   type: MediaType.Image
        // }
      })
    )

    return result
  }

  async uploadVideo(req: Request) {
    const mime = (await import('mime')).default
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename,
          filePath: file.filepath,
          contentType: mime.getType(file.filepath) as string
        })
        fsPromise.unlink(file.filepath)

        return {
          url: s3Result.Location as string,
          type: MediaType.Video
        }

        // return {
        //   url: isProduction
        //     ? `${envConfig.HOST}/static/video/${file.newFilename}`
        //     : `http://localhost:${envConfig.PORT}/static/video/${file.newFilename}`,
        //   type: MediaType.Video
        // }
      })
    )

    return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getFileName(file.newFilename)
        queue.enqueue(file.filepath)

        return {
          url: isProduction
            ? `${envConfig.HOST}/static/video-hls/${newName}/master.m3u8`
            : `http://localhost:${envConfig.PORT}/static/video-hls/${newName}/master.m3u8`,
          type: MediaType.HLS
        }
      })
    )

    return result
  }

  async getVideoStatus(id: string) {
    return await databaseService.videoStatus.findOne({ name: id })
  }
}

const mediasService = new MediasService()

export default mediasService
