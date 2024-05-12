import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

export const serveImageController = (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_DIR, name) + '.jpg', (err) => {
    if (err) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: USERS_MESSAGES.IMAGE_NOT_FOUND
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
