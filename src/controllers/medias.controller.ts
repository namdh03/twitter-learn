import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

export const serveImageController = (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name) + '.jpg', (err) => {
    if (err) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: USERS_MESSAGES.IMAGE_NOT_FOUND
      })
    }
  })
}

export const serveVideoStreamController = async (req: Request, res: Response) => {
  const mime = (await import('mime')).default
  const range = req.headers.range

  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
  }

  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  // Dung lượng video tính bằng byte
  const videoSize = fs.statSync(videoPath).size
  // Dung lượng video mỗi phân đoạn stream tính bằng byte
  const CHUNK_SIZE = 10 ** 6 // 1MB
  // Phân đoạn stream video
  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
  // Dung lượng thực tế cho mỗi đoạn video stream
  // thường sẽ là CHUCK_SIZE ngoại trừ đoạn cuối cùng
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'
  /**
   * Format của header Content-Range: bytes <start>-<end>/<videoSize>
   * Ví dụ: Content-Range: bytes 1048576-3145727/3145728
   * Yêu cầu là `end` phải luôn luôn nhỏ hơn `videoSize`
   * ❌ 'Content-Range': 'bytes 0-100/100'
   * ✅ 'Content-Range': 'bytes 0-99/100'
   *
   * Còn Content-Length sẽ là end - start + 1. Đại diện cho khoản cách.
   * Để dễ hình dung, mọi người tưởng tượng từ số 0 đến số 10 thì ta có 11 số.
   * byte cũng tương tự, nếu start = 0, end = 10 thì ta có 11 byte.
   * Công thức là end - start + 1
   *
   * ChunkSize = 50
   * videoSize = 100
   * |0----------------50|51----------------99|100 (end)
   * stream 1: start = 0, end = 50, contentLength = 51
   * stream 2: start = 51, end = 99, contentLength = 49
   */
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStreams = fs.createReadStream(videoPath, { start, end })
  videoStreams.pipe(res)
}

export const serveM3u8Controller = async (req: Request, res: Response) => {
  const { id } = req.params

  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, 'master.m3u8'), (err) => {
    if (err) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: USERS_MESSAGES.VIDEO_NOT_FOUND
      })
    }
  })
}

export const serveSegmentController = async (req: Request, res: Response) => {
  const { id, v, segment } = req.params

  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, segment), (err) => {
    if (err) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: USERS_MESSAGES.VIDEO_NOT_FOUND
      })
    }
  })
}

export const uploadImageController = async (req: Request, res: Response) => {
  const data = await mediasService.uploadImage(req)

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    data
  })
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const data = await mediasService.uploadVideo(req)

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    data
  })
}

export const uploadVideoHLSController = async (req: Request, res: Response) => {
  const data = await mediasService.uploadVideoHLS(req)

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    data
  })
}
