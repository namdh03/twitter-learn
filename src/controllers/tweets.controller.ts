import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetReqBody } from '~/models/requests/Tweet.requests'
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
  return res.status(HTTP_STATUS.OK).json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    data: req.tweet
  })
}
