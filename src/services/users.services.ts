import Follower from '~/models/schemas/Follower.schema'
import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
import hashPassword from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToke.schema'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import axios from 'axios'
import { sendVerifyForgotPasswordEmail, sendVerifyRegisterEmail } from '~/utils/email'
import { envConfig } from '~/constants/configs'

class UsersService {
  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: envConfig.GOOGLE_CLIENT_ID,
      client_secret: envConfig.GOOGLE_CLIENT_SECRET,
      redirect_uri: envConfig.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getOauthGoogleUser(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })

    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }

  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    const token = {
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: envConfig.JWT_SECRET_REFRESH_TOKEN as string
    }

    if (exp) {
      return signToken({
        ...token,
        payload: {
          ...token.payload,
          exp
        }
      })
    }

    return signToken({
      ...token,
      options: {
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: envConfig.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: envConfig.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: envConfig.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: envConfig.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  private signAccessAndRefreshTokens({
    user_id,
    verify,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    exp?: number
  }) {
    return Promise.all([
      this.signAccessToken({
        user_id,
        verify
      }),
      this.signRefreshToken({
        user_id,
        verify,
        exp
      })
    ])
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  async register(payload: RegisterReqBody, verify: UserVerifyStatus = UserVerifyStatus.Unverified) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user_${user_id.toString()}`,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        verify
      })
    )
    const [accessToken, refreshToken] = await this.signAccessAndRefreshTokens({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refreshToken,
        user_id: new ObjectId(user_id),
        iat,
        exp
      })
    )

    // Flow verify email
    // 1. Server send email to user
    // 2. User click link in email
    // 3. Client send request to server with email_verify_token
    // 4. Server verify email_verify_token
    // 5. Client receive access_token and refresh_token
    await sendVerifyRegisterEmail(payload.email, email_verify_token)

    return {
      accessToken,
      refreshToken
    }
  }

  async checkEmailExists(email: string) {
    return await databaseService.users.findOne({ email })
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await this.signAccessAndRefreshTokens({
      user_id,
      verify
    })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refreshToken,
        user_id: new ObjectId(user_id),
        iat,
        exp
      })
    )

    return {
      accessToken,
      refreshToken
    }
  }

  async oauth(code: string) {
    const { access_token, id_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getOauthGoogleUser(access_token, id_token)

    if (!userInfo.email) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED
      })
    }

    const user = await databaseService.users.findOne({ email: userInfo.email })

    if (user) {
      const [accessToken, refreshToken] = await this.signAccessAndRefreshTokens({
        user_id: user._id.toString(),
        verify: UserVerifyStatus.Verified
      })
      const { iat, exp } = await this.decodeRefreshToken(refreshToken)

      await databaseService.refreshTokens.insertOne(
        new RefreshToken({
          token: refreshToken,
          user_id: user._id,
          iat,
          exp
        })
      )

      return {
        accessToken,
        refreshToken,
        newUser: 0
      }
    } else {
      const password = hashPassword('user_' + userInfo.id)
      const data = await this.register(
        {
          email: userInfo.email,
          name: userInfo.name,
          date_of_birth: new Date().toISOString(),
          password: password,
          confirm_password: password
        },
        UserVerifyStatus.Verified
      )

      return {
        ...data,
        newUser: 1
      }
    }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })

    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async refreshToken({
    refresh_token,
    user_id,
    verify,
    exp
  }: {
    refresh_token: string
    user_id: string
    verify: UserVerifyStatus
    exp: number
  }) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshTokens({
        user_id,
        verify: verify,
        exp
      }),
      databaseService.refreshTokens.deleteOne({
        token: refresh_token
      })
    ])
    const [accessToken, refreshToken] = token
    const decode_refresh_token = await this.decodeRefreshToken(refreshToken)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refreshToken,
        user_id: new ObjectId(user_id),
        iat: decode_refresh_token.iat,
        exp: decode_refresh_token.exp
      })
    )

    return {
      accessToken,
      refreshToken
    }
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshTokens({
        user_id,
        verify: UserVerifyStatus.Verified
      }),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        // {
        //   $set: {
        //     email_verify_token: '',
        //     verify: UserVerifyStatus.Verified
        //   },
        //   $currentDate: {
        //     updated_at: true
        //   }
        // }
        [
          {
            $set: {
              email_verify_token: '',
              verify: UserVerifyStatus.Verified,
              updated_at: '$$NOW'
            }
          }
        ]
      )
    ])
    const [accessToken, refreshToken] = token
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refreshToken,
        user_id: new ObjectId(user_id),
        iat,
        exp
      })
    )

    return {
      accessToken,
      refreshToken
    }
  }

  async resendEmailVerify(user_id: string, email: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    await sendVerifyRegisterEmail(email, email_verify_token)

    return {
      message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS
    }
  }

  async forgotPassword({ user_id, verify, email }: { user_id: string; verify: UserVerifyStatus; email: string }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify
    })
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    await sendVerifyForgotPasswordEmail(email, forgot_password_token)

    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMe(user_id: string) {
    return await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )

    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }

    return user
  }

  async follow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (!follower) {
      await databaseService.followers.insertOne(
        new Follower({
          user_id: new ObjectId(user_id),
          followed_user_id: new ObjectId(followed_user_id)
        })
      )

      return {
        message: USERS_MESSAGES.FOLLOW_USER_SUCCESS
      }
    }

    return {
      message: USERS_MESSAGES.USER_ALREADY_FOLLOWED
    }
  }

  async unFollow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (!follower) {
      return {
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED
      }
    }

    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    return {
      message: USERS_MESSAGES.UNFOLLOW_SUCCESS
    }
  }

  async changePassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }
}

const usersService = new UsersService()

export default usersService
