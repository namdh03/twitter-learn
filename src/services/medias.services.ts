import { Request } from 'express'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { isProduction } from '~/constants/configs'
import { UPLOAD_DIR } from '~/constants/dir'
import { getFileName, handleUploadSingleImage } from '~/utils/file'

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getFileName(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)

    await sharp(file.filepath).jpeg().toFile(newPath)
    fs.unlinkSync(file.filepath)

    return isProduction
      ? `${process.env.HOST}/medias/${newName}.jpg`
      : `http://localhost:${process.env.PORT}/medias/${newName}.jpg`
  }
}

const mediasService = new MediasService()

export default mediasService
