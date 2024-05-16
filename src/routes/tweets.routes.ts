import { Router } from 'express'
import { createTweetController, getTweetChildrenController, getTweetController } from '~/controllers/tweets.controller'
import {
  audienceValidator,
  createTweetValidator,
  tweetChildrenValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

/**
 * Description. Create a tweet
 * Path: /create-tweet
 * Method: POST
 * Headers: {
 *    Authorization: Bearer {access_token}
 * }
 * Body: TweetRequestBody
 */
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

/**
 * Description. Get tweet detail
 * Path: /:tweet_id
 * Method: GET
 */
tweetsRouter.get(
  '/:tweet_id',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  tweetIdValidator,
  wrapRequestHandler(audienceValidator),
  wrapRequestHandler(getTweetController)
)

/**
 * Description. Get tweet children
 * Path: /:tweet_id/children
 * Method: GET
 * Params: {
 *    tweet_type: TweetTypeField
 *    limit: number
 *    page: number
 * }
 */
tweetsRouter.get(
  '/:tweet_id/children',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  tweetIdValidator,
  tweetChildrenValidator,
  wrapRequestHandler(audienceValidator),
  wrapRequestHandler(getTweetChildrenController)
)

export default tweetsRouter
