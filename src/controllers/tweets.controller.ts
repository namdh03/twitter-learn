import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetTypeField } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetChildrenReqParams, TweetChildrenReqQuery, TweetReqBody } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetsService from '~/services/tweets.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const data = await tweetsService.createTweet(user_id, req.body)

  return res.status(HTTP_STATUS.CREATED).json({
    message: TWEETS_MESSAGES.TWEET_CREATED,
    data
  })
}

export const getTweetController = async (req: Request, res: Response) => {
  const { guest_views, user_views, updated_at } = await tweetsService.increaseViewCount(
    req.params.tweet_id,
    req.decode_authorization?.user_id
  )
  const tweet = {
    ...req.tweet,
    guest_views,
    user_views,
    view: guest_views + user_views,
    updated_at
  }

  return res.status(HTTP_STATUS.OK).json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    data: tweet
  })
}

export const getTweetChildrenController = async (
  req: Request<TweetChildrenReqParams, any, any, TweetChildrenReqQuery>,
  res: Response
) => {
  const user_id = req.decode_authorization?.user_id
  const tweet_type = Number(req.query.tweet_type) as TweetTypeField
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const { tweets, total } = await tweetsService.getTweetChildren({
    user_id,
    tweet_id: req.params.tweet_id,
    query: { tweet_type, limit, page }
  })

  return res.status(HTTP_STATUS.OK).json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    data: {
      tweets,
      tweet_type,
      limit,
      page,
      total_pages: Math.ceil(total / limit)
    }
  })
}
