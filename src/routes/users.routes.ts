import { Router } from 'express'
import {
  emailVerifyController,
  followController,
  forgotPasswordController,
  getProfileController,
  loginController,
  logoutController,
  meController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unFollowController,
  updateMeController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unFollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

/**
 * Description. Login a new user
 * Path: /login
 * Method: POST
 * Body: {
 *    email: string,
 *    password: string
 * }
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description. Register a new user
 * Path: /register
 * Method: POST
 * Body: {
 *    email: string,
 *    password: string
 *    confirm_password: string
 *    date_of_birth: ISO8601
 * }
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description. Logout a user
 * Path: /logout
 * Method: POST
 * Headers: {
 *    Authorization: Bearer {access_token}
 * }
 * Body: {
 *    refresh_token: string
 * }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description. Verify email when use click on the link in gmail
 * Path: /verify-email
 * Method: POST
 * Body: {
 *    email_verify_token: string
 * }
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController))

/**
 * Description. Resend verify email when user click on the button resend verify email
 * Path: /resend-verify-email
 * Method: POST
 * Headers: {
 *    Authorization: Bearer {access_token}
 * }
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Description. Forgot password when user click on the button forgot password
 * Path: /forgot-password
 * Method: POST
 * Body: {
 *    email: string
 * }
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description. Verify forget password when user click on the link in gmail
 * Path: /verify-forget-password
 * Method: POST
 * Body: {
 *    forgot_password_token: string
 * }
 */
usersRouter.post(
  '/verify-forget-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description. Reset password when user click on the button reset password
 * Path: /reset-password
 * Method: POST
 * Body: {
 *    forgot_password_token: string,
 *    password: string,
 *    confirm_password: string
 * }
 */
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 * Description. Get user information
 * Path: /me
 * Method: GET
 * HEADER: {
 *    Authorization: Bearer {access_token}
 * }
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(meController))

/**
 * Description. Update user information
 * Path: /me
 * Method: PATCH
 * HEADER: {
 *    Authorization: Bearer {access_token}
 * }
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Description. Get user information by username
 * Path: /:username
 * Method: GET
 */
usersRouter.get('/:username', wrapRequestHandler(getProfileController))

/**
 * Description. Follow a user
 * Path: /follow
 * Method: POST
 * HEADER: {
 *    Authorization: Bearer {access_token}
 * }
 * BODY: {
 *    followed_user_id: string
 * }
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

/**
 * Description. Unfollow a user
 * Path: /follow/user_id
 * Method: DELETE
 * HEADER: {
 *    Authorization: Bearer {access_token}
 * }
 */
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unFollowValidator,
  wrapRequestHandler(unFollowController)
)

export default usersRouter
