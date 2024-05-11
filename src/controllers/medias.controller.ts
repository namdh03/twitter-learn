import { Request, Response } from 'express'
import path from 'path'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const data = await handleUploadSingleImage(req)

  return res.json({
    message: 'Upload image successfully',
    data
  })
}
