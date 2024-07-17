import { Request } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from './jwt'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { envConfig } from '~/constants/configs'

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

export const stringEnumToArray = (stringEnum: { [key: string]: string | number }) => {
  return Object.values(stringEnum).filter((value) => typeof value === 'string') as string[]
}

export const verifyAccessToken = async (accessToken: string, req?: Request) => {
  if (!accessToken) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
    })
  }

  try {
    const decode_authorization = await verifyToken({
      token: accessToken,
      secretOrPublicKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string
    })

    if (req) {
      req.decode_authorization = decode_authorization
      return true
    }
    return decode_authorization
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: capitalize(error.message)
      })
    }
  }

  return true
}
