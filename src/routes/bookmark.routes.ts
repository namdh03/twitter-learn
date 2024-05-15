import { Router } from 'express'
import { bookmarkController } from '~/controllers/bookmarks.controller'
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
bookmarksRouter.post('/', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(bookmarkController))

export default bookmarksRouter
