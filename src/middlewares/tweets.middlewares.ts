import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetTypeField } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { Media } from '~/models/Other'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/commons'
import validate from '~/utils/validate'

const tweetTypes = numberEnumToArray(TweetTypeField)
const tweetAudiences = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      },
      audience: {
        isIn: {
          options: [tweetAudiences],
          errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetTypeField
            // Nếu `type` là retweet, comment, quotetweet thì `parent_id` phải là `tweet_id` của tweet cha,
            if (
              (type === TweetTypeField.Retweet ||
                type === TweetTypeField.Comment ||
                type === TweetTypeField.QuoteTweet) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
            }

            // Nếu `type` là tweet thì `parent_id` phải là `null`
            if (type === TweetTypeField.Tweet && value !== null) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
            }

            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetTypeField
            const hashtags = req.body.hashtags as string[]
            const mentions = req.body.mentions as string[]
            // Nếu `type` là comment, quotetweet, tweet và không có `mentions` và `hashtags`
            // thì `content` phải là string và không được rỗng.
            if (
              [TweetTypeField.Comment, TweetTypeField.QuoteTweet, TweetTypeField.Tweet].includes(type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              value === ''
            ) {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
            }

            // Nếu `type` là retweet thì `content` phải là `''`
            if (type === TweetTypeField.Retweet && value !== '') {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
            }

            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần tử trong `hashtags` phải là string
            if (value.some((item: unknown) => typeof item !== 'string')) {
              throw new Error(TWEETS_MESSAGES.HASHTAG_MUST_BE_AN_ARRAY_OF_STRING)
            }

            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần tử trong `hashtags` phải là user_id
            if (value.some((item: unknown) => ObjectId.isValid(item as string))) {
              throw new Error(TWEETS_MESSAGES.MENTION_MUST_BE_AN_ARRAY_OF_USER_ID)
            }

            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần tử trong `medias` phải là Media
            if (value.some((item: Media) => typeof item.url !== 'string' || !mediaTypes.includes(item.type))) {
              throw new Error(TWEETS_MESSAGES.MEDIA_MUST_BE_AN_ARRAY_OF_MEDIA)
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const tweetIdValidator = validate(
  checkSchema({
    tweet_id: {
      custom: {
        options: async (value, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: TWEETS_MESSAGES.TWEET_ID_INVALID
            })
          }

          const tweet = await databaseService.tweets.findOne({
            _id: new ObjectId(String(value))
          })

          if (!tweet) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.NOT_FOUND,
              message: TWEETS_MESSAGES.TWEET_NOT_FOUND
            })
          }
        }
      }
    }
  })
)
