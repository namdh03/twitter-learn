import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { BOOKMARKS_MESSAGES } from '~/constants/messages'
import { BookmarkReqBody } from '~/models/requests/Bookmark.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarksService from '~/services/bookmarks.services'

export const bookmarkController = async (req: Request<ParamsDictionary, any, BookmarkReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const data = await bookmarksService.bookmarkTweet(user_id, req.body.tweet_id)

  return res.status(HTTP_STATUS.CREATED).json({
    message: BOOKMARKS_MESSAGES.TWEET_HAS_BEEN_BOOKMARKED,
    data
  })
}
