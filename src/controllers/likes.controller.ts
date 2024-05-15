import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { LIKES_MESSAGES } from '~/constants/messages'
import { LikeReqBody } from '~/models/requests/Like.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import likesService from '~/services/likes.services'

export const likeController = async (req: Request<ParamsDictionary, any, LikeReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const data = await likesService.likeTweet(user_id, req.body.tweet_id)

  return res.status(HTTP_STATUS.CREATED).json({
    message: LIKES_MESSAGES.LIKED_SUCCESSFULLY,
    data
  })
}

export const unLikeController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  await likesService.unLikeTweet(user_id, req.params.tweet_id)

  return res.status(HTTP_STATUS.OK).json({
    message: LIKES_MESSAGES.UNLIKED_SUCCESSFULLY
  })
}
