import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { SERVER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    if (err instanceof ErrorWithStatus) {
      return res.status(err.status).json(omit(err, ['status']))
    }

    Object.getOwnPropertyNames(err).forEach((key) => {
      if (
        !Object.getOwnPropertyDescriptor(err, key)?.configurable &&
        !Object.getOwnPropertyDescriptor(err, key)?.writable
      )
        return
      Object.defineProperty(err, key, { enumerable: true })
    })

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: err.message,
      errorInfo: omit(err, ['stack'])
    })
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR,
      errorInfo: error
    })
  }
}
