import { Pagination, TweetChildrenReqQuery, TweetReqBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import HashTag from '~/models/schemas/HashTag.schema'
import { TweetAudience, TweetTypeField } from '~/constants/enums'

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
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1,
          updated_at: 1
        }
      }
    )

    return result as WithId<Pick<Tweet, 'guest_views' | 'user_views' | 'updated_at'>>
  }

  async getTweetChildren({
    user_id,
    tweet_id,
    query
  }: {
    user_id?: string
    tweet_id: string
    query: TweetChildrenReqQuery
  }) {
    const { tweet_type, limit, page } = query
    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: {
              parent_id: new ObjectId(tweet_id),
              type: tweet_type
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'bookmarks'
            }
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'likes'
            }
          },
          {
            $lookup: {
              from: 'tweets',
              localField: '_id',
              foreignField: 'parent_id',
              as: 'tweet_children'
            }
          },
          {
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    name: '$$mention.name',
                    username: '$$mention.username',
                    email: '$$mention.email'
                  }
                }
              },
              bookmarks: {
                $size: '$bookmarks'
              },
              likes: {
                $size: '$likes'
              },
              retweet_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'children',
                    cond: {
                      $eq: ['$$children.type', TweetTypeField.Retweet]
                    }
                  }
                }
              },
              comment_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'children',
                    cond: {
                      $eq: ['$$children.type', TweetTypeField.Comment]
                    }
                  }
                }
              },
              quote_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'children',
                    cond: {
                      $eq: ['$$children.type', TweetTypeField.QuoteTweet]
                    }
                  }
                }
              },
              view: {
                $add: ['$user_views', '$guest_views']
              }
            }
          },
          {
            $project: {
              tweet_children: 0
            }
          }
        ])
        .toArray(),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])
    const ids = tweets.map((tweet) => tweet._id)
    const date = new Date()
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: ids
        }
      },
      {
        $inc: {
          [user_id ? 'user_views' : 'guest_views']: 1
        },
        $set: {
          updated_at: date
        }
      }
    )

    // Mutate tweets
    tweets.forEach((tweet) => {
      user_id ? ++tweet.user_views : ++tweet.guest_views
      tweet.updated_at = date
      tweet.view = tweet.user_views + tweet.guest_views
    })

    return {
      tweets,
      total
    }
  }

  async getNewFeed({ user_id, query }: { user_id: string; query: Pagination }) {
    const userId = new ObjectId(user_id)
    const { limit, page } = query
    const result = await databaseService.followers
      .find(
        {
          user_id: userId
        },
        {
          projection: {
            _id: 0,
            followed_user_id: 1
          }
        }
      )
      .toArray()
    const ids = result.map((follower) => new ObjectId(follower.followed_user_id))

    ids.push(userId)

    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudience.Everyone
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TwitterCircle
                    },
                    {
                      'user.tweet_circle': {
                        $in: [userId]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'bookmarks'
            }
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'likes'
            }
          },
          {
            $lookup: {
              from: 'tweets',
              localField: '_id',
              foreignField: 'parent_id',
              as: 'tweet_children'
            }
          },
          {
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    name: '$$mention.name',
                    username: '$$mention.username',
                    email: '$$mention.email'
                  }
                }
              },
              bookmarks: {
                $size: '$bookmarks'
              },
              likes: {
                $size: '$likes'
              },
              retweet_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'children',
                    cond: {
                      $eq: ['$$children.type', TweetTypeField.Retweet]
                    }
                  }
                }
              },
              comment_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'children',
                    cond: {
                      $eq: ['$$children.type', TweetTypeField.Comment]
                    }
                  }
                }
              },
              quote_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'children',
                    cond: {
                      $eq: ['$$children.type', TweetTypeField.QuoteTweet]
                    }
                  }
                }
              },
              view: {
                $add: ['$user_views', '$guest_views']
              }
            }
          },
          {
            $project: {
              tweet_children: 0,
              user: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                tweet_circle: 0,
                date_of_birth: 0
              }
            }
          }
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudience.Everyone
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TwitterCircle
                    },
                    {
                      'user.tweet_circle': {
                        $in: [userId]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    const tweet_ids = tweets.map((tweet) => tweet._id)
    const date = new Date()

    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids
        }
      },
      {
        $inc: {
          user_views: 1
        },
        $set: {
          updated_at: date
        }
      }
    )

    // Mutate tweets
    tweets.forEach((tweet) => {
      ++tweet.user_views
      tweet.updated_at = date
    })

    return {
      tweets,
      total: total[0]?.total || 0
    }
  }
}

const tweetsService = new TweetsService()

export default tweetsService
