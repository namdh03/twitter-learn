import { Router } from 'express'
import { likeController, unLikeController } from '~/controllers/likes.controller'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()

/**
 * Description. Like a tweet
 * Path: /
 * Method: POST
 * Headers: {
 *    Authorization: Bearer {access_token}
 * }
 * Body: {
 *    tweet_id: string
 * }
 */
likesRouter.post('/', accessTokenValidator, verifiedUserValidator, tweetIdValidator, wrapRequestHandler(likeController))

/**
 * Description. Unlike a tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Headers: {
 *    Authorization: Bearer {access_token}
 * }
 */
likesRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unLikeController)
)

export default likesRouter
