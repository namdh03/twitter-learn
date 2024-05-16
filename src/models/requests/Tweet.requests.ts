import { ParamsDictionary } from 'express-serve-static-core'
import { TweetAudience, TweetTypeField } from '~/constants/enums'
import { Media } from '../Other'

export interface TweetReqBody {
  type: TweetTypeField
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc, không thì là tweet_id cha dạng string
  hashtags: string[] // tên của hashtag dạng ['javascript', 'reactjs']
  mentions: string[] // user_id[]
  medias: Media[]
}

export interface Pagination {
  limit: number
  page: number
}

export interface TweetChildrenReqQuery extends Pagination {
  tweet_type: TweetTypeField
}

export interface TweetChildrenReqParams extends ParamsDictionary {
  tweet_id: string
}
