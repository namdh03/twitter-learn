import { Request } from 'express'
import { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true // Tạo folder cha nếu chưa tồn tại
    })
  }
}

export const handleUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: 4,
    maxFileSize: 300 * 1024, // 300KB
    maxTotalFileSize: 300 * 1024 * 4, // 300KB * 4
    keepExtensions: true,
    filter: ({ name, mimetype }) => {
      const isValid = name === 'image' && Boolean(mimetype?.includes('image/'))

      if (!isValid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }

      return isValid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (!files.image) {
        return reject(new Error('File is empty'))
      }

      resolve(files.image as File[])
    })
  })
}

export const getFileName = (name: string) => {
  const nameArr = name.split('.')

  nameArr.pop()

  return nameArr.join('')
}
