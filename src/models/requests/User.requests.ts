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
 *           example: duonghoangnam503@gmail.com
 *         password:
 *           type: string
 *           example: Password123@
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjY3MjNmODlmNTRiNzk0ZGU1OWVkNjQyIiwidG9rZW5fdHlwZSI6MCwidmVyaWZ5IjoxLCJpYXQiOjE3MjExOTA0MjYsImV4cCI6MTcyMTE5MTMyNn0.5PSmckwfgVJvuqjW7AbJzQ7XbXVseYSnxt1exYlIy-g
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjY3MjNmODlmNTRiNzk0ZGU1OWVkNjQyIiwidG9rZW5fdHlwZSI6MSwidmVyaWZ5IjoxLCJpYXQiOjE3MjExOTA0MjYsImV4cCI6MTcyOTgzMDQyNn0.k4hfXiMEo2-WQbd_KaaIJ5wK8VpuDWw3br3ipQqF0_I
 *     UserVerifyStatus:
 *       type: number
 *       enum:
 *         - Unverified
 *         - Verified
 *         - Banned
 *       example: 1
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: '66723f89f54b794de59ed642'
 *         name:
 *           type: string
 *           example: 'Dương Hoàng Nam'
 *         email:
 *           type: string
 *           example: 'duonghoangnam503@gmail.com'
 *         date_of_birth:
 *           type: string
 *           format: date-time
 *           example: '2023-06-06T08:26:33.781Z'
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: '2024-06-19T02:16:41.424Z'
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: '2024-06-19T02:16:41.424Z'
 *         verify:
 *           $ref: '#/components/schemas/UserVerifyStatus'
 *         tweet_circle:
 *           type: array
 *           items:
 *             type: string
 *           example: ['66723f89f54b794de59ed642', '66723f89f54b794de59ed643']
 *         bio:
 *           type: string
 *           example: 'Software Engineer'
 *         location:
 *           type: string
 *           example: 'Hanoi, Vietnam'
 *         website:
 *           type: string
 *           example: 'https://duonghoangnam.com'
 *         username:
 *           type: string
 *           example: 'user_66723f89f54b794de59ed642'
 *         avatar:
 *           type: string
 *           example: 'https://cellphones.com.vn/sforum/wp-content/uploads/2024/02/avatar-anh-meo-cute-5.jpg'
 *         cover_photo:
 *           type: string
 *           example: 'https://cellphones.com.vn/sforum/wp-content/uploads/2024/02/avatar-anh-meo-cute-5.jpg'
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
