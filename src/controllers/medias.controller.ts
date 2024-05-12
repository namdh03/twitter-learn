import { Request, Response } from 'express'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const data = await mediasService.handleUploadSingleImage(req)

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    data
  })
}
