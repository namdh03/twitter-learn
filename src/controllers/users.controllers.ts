import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnFollowReqParams,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/users.services'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const { _id, verify } = req.user as User
  const result = await usersService.login({
    user_id: (_id as ObjectId).toString(),
    verify
  })

  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    data: result
  })
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await usersService.oauth(code as string)
  const urlRedirect = `${process.env.GOOGLE_CLIENT_REDIRECT_CALLBACK as string}?access_token=${result.accessToken}&refresh_token=${result.refreshToken}&new_user=${result.newUser}`

  return res.redirect(urlRedirect)
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)

  return res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    data: result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)

  return res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const { user_id, verify } = req.decode_refresh_token as TokenPayload
  const result = await usersService.refreshToken({ refresh_token, user_id, verify })

  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    data: result
  })
}

export const emailVerifyController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decode_email_verify_token as TokenPayload
  const user = await usersService.getMe(user_id)

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }

  const result = await usersService.verifyEmail(user_id)

  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    data: result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.getMe(user_id)

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }

  const result = await usersService.resendEmailVerify(user_id)

  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { _id, verify } = req.user as User
  const result = await usersService.forgotPassword({
    user_id: (_id as ObjectId).toString(),
    verify
  })

  return res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response
) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  const { password } = req.body

  await usersService.resetPassword(user_id, password)

  const result = await usersService.resetPassword(user_id, password)

  return res.json(result)
}

export const meController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.getMe(user_id)

  return res.json({
    message: USERS_MESSAGES.GET_USER_INFO_SUCCESS,
    data: user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { body } = req
  const user = await usersService.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_USER_INFO_SUCCESS,
    data: user
  })
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
  const { username } = req.params
  const user = await usersService.getProfile(username)

  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    data: user
  })
}

export const followController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
  const { followed_user_id } = req.body
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await usersService.follow(user_id, followed_user_id)

  return res.json(result)
}

export const unFollowController = async (req: Request<UnFollowReqParams>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const result = await usersService.unFollow(user_id, followed_user_id)

  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword(user_id, password)

  return res.json(result)
}
