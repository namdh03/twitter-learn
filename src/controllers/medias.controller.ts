import { Request, Response } from 'express'
import mediasService from '~/services/medias.services'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const data = await mediasService.handleUploadSingleImage(req)

  return res.json({
    message: 'Upload image successfully',
    data
  })
}
