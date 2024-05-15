import { TweetReqBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import HashTag from '~/models/schemas/HashTag.schema'

class TweetsService {
  async checkAndCreateHashTags(hashtags: string[]) {
    const hashTagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        // Tìm hashtag trong database, nếu không tìm thấy thì tạo mới
        return databaseService.hashTags.findOneAndUpdate(
          {
            name: hashtag
          },
          {
            $setOnInsert: new HashTag({
              name: hashtag
            })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )

    return hashTagDocuments.map((hashTagDocument) => (hashTagDocument as WithId<HashTag>)._id)
  }

  async createTweet(user_id: string, body: TweetReqBody) {
    const hashTags = await this.checkAndCreateHashTags(body.hashtags)

    const { insertedId } = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: hashTags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )
    const tweet = await databaseService.tweets.findOne({
      _id: new ObjectId(insertedId)
    })

    return tweet
  }

  async increaseViewCount(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )

    return result as WithId<Tweet>
  }
}

const tweetsService = new TweetsService()

export default tweetsService
