import { NextFunction, Request, RequestHandler, Response } from 'express'

export const wrapRequestHandler = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
