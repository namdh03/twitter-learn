import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Follower from '~/models/schemas/Follower.schema'
import HashTag from '~/models/schemas/HashTag.schema'
import Like from '~/models/schemas/Like.schema'
import RefreshToken from '~/models/schemas/RefreshToke.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import User from '~/models/schemas/User.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter-singapore.mycwwx9.mongodb.net/?retryWrites=true&w=majority&appName=twitter-singapore`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    this.client = new MongoClient(uri)
    this.db = this.client.db('twitter-dev')
  }

  async connect() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await this.client.connect()
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.error(error)
    }
  }

  async indexUsers() {
    const isExist = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])

    if (!isExist) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexRefreshTokens() {
    const isExist = await this.refreshTokens.indexExists(['token_1', 'exp_1'])

    if (!isExist) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }

  async indexVideoStatus() {
    const isExist = await this.videoStatus.indexExists(['name_1'])

    if (!isExist) {
      this.videoStatus.createIndex({ name: 1 })
    }
  }

  async indexFollowers() {
    const isExist = await this.followers.indexExists(['user_id_1_followed_user_id_1'])

    if (!isExist) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }

  async indexTweets() {
    const isExist = await this.tweets.indexExists(['content_text'])

    if (!isExist) {
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_COLLECTION_USERS as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_COLLECTION_REFRESH_TOKENS as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_COLLECTION_FOLLOWERS as string)
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_COLLECTION_VIDEO_STATUS as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_COLLECTION_TWEETS as string)
  }

  get hashTags(): Collection<HashTag> {
    return this.db.collection(process.env.DB_COLLECTION_HASHTAGS as string)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_COLLECTION_BOOKMARKS as string)
  }

  get likes(): Collection<Like> {
    return this.db.collection(process.env.DB_COLLECTION_LIKES as string)
  }
}

const databaseService = new DatabaseService()

export default databaseService
