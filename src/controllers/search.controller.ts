import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { SearchQuery } from '~/models/requests/Search.request'
import searchService from '~/services/search.services'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const user_id = req.decode_authorization?.user_id as string
  const content = req.query.content
  const media_type = req.query.media_type
  const people_follow = Boolean(req.query.people_follow)
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const { tweets, total } = await searchService.search({ user_id, content, media_type, people_follow, limit, page })

  return res.status(HTTP_STATUS.OK).json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    data: {
      tweets,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}
