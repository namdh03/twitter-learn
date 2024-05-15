import { Router } from 'express'
import { bookmarkController, unBookmarkController } from '~/controllers/bookmarks.controller'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

/**
 * Description. Bookmark a tweet
 * Path: /
 * Method: POST
 * Headers: {
 *    Authorization: Bearer {access_token}
 * }
 * Body: {
 *    tweet_id: string
 * }
 */
bookmarksRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkController)
)

/**
 * Description. Un Bookmark a tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Headers: {
 *    Authorization: Bearer {access_token}
 * }
 */
bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unBookmarkController)
)

export default bookmarksRouter
