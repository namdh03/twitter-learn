import { Request, Response } from 'express'
import path from 'path'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    maxFileSize: 300 * 1024, // 300KB
    keepExtensions: true
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }

    res.json({
      message: 'Image uploaded successfully'
    })
  })

  return res.json({ message: 'Image uploaded successfully' })
}
