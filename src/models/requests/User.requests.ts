import { ParamsDictionary } from 'express-serve-static-core'
import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enums'

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: namdh03.dev@gmail.com
 *         password:
 *           type: string
 *           example: Password123@
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjczMDg0N2E1ZWM5MmJlOTQ5MThiMDRkIiwidG9rZW5fdHlwZSI6MCwidmVyaWZ5IjoxLCJpYXQiOjE3MzEyNDYxNTksImV4cCI6MTczMTI0NzA1OX0.yLTr1Ov8yKd5v0RQWzXHgn9aILomQ55jFCVBCNNhn78
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjczMDg0N2E1ZWM5MmJlOTQ5MThiMDRkIiwidG9rZW5fdHlwZSI6MSwidmVyaWZ5IjoxLCJpYXQiOjE3MzEyNDYxNTksImV4cCI6MTczOTg4NjE1OX0.AjGUtQmbE17zpwTeezyLCSQol5V6zZ-B-cplJMLK8hQ
 *     UserInfoResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Get user info successful
 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               format: MongoId
 *               example: 6730847a5ec92be94918b04d
 *             name:
 *               type: string
 *               example: Dương Hoàng Nam
 *             email:
 *               type: string
 *               example: namdh03.dev@gmail.com
 *             date_of_birth:
 *               type: string
 *               format: date-time
 *               example: 2023-06-06T08:26:33.781Z
 *             created_at:
 *               type: string
 *               format: date-time
 *               example: 2024-11-10T10:01:30.667Z
 *             updated_at:
 *               type: string
 *               format: date-time
 *               example: 2024-11-10T10:05:28.008Z
 *             verify:
 *               $ref: '#/components/schemas/UserVerifyStatus'
 *             tweet_circle:
 *               type: array
 *               items:
 *                 type: string
 *                 format: MongoId
 *               example: ['673086a5697c7df9b481c018']
 *             bio:
 *               type: string
 *               example: ''
 *             location:
 *               type: string
 *               example: ''
 *             website:
 *               type: string
 *               example: https://github.com/namdh03
 *             username:
 *               type: string
 *               example: user_6730847a5ec92be94918b04d
 *             avatar:
 *               type: string
 *               example: ''
 *             cover_photo:
 *               type: string
 *               example: ''
 *     UserVerifyStatus:
 *       type: integer
 *       enum:
 *         - Unverified
 *         - Verified
 *         - Banned
 *       example: 0
 */

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string
}

export interface ResetPasswordReqBody {
  forgot_password_token: string
  password: string
  confirm_password: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface GetProfileReqParams extends ParamsDictionary {
  username: string
}

export interface FollowReqBody {
  followed_user_id: string
}

export interface UnFollowReqParams extends ParamsDictionary {
  user_id: string
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}
