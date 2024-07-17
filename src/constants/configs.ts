import argv from 'minimist'
import { config } from 'dotenv'

const options = argv(process.argv.slice(2))
export const isProduction = options.env === 'production'
config({
  path: options.env ? `.env.${options.env}` : '.env'
})

export const envConfig = {
  HOST: process.env.HOST || 'http://localhost',
  PORT: process.env.PORT || 4000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  PASSWORD_SECRET: process.env.PASSWORD_SECRET as string,
  DB_USERNAME: process.env.DB_USERNAME as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_NAME: process.env.DB_NAME as string,
  DB_COLLECTION_USERS: process.env.DB_COLLECTION_USERS as string,
  DB_COLLECTION_REFRESH_TOKENS: process.env.DB_COLLECTION_REFRESH_TOKENS as string,
  DB_COLLECTION_FOLLOWERS: process.env.DB_COLLECTION_FOLLOWERS as string,
  DB_COLLECTION_VIDEO_STATUS: process.env.DB_COLLECTION_VIDEO_STATUS as string,
  DB_COLLECTION_TWEETS: process.env.DB_COLLECTION_TWEETS as string,
  DB_COLLECTION_HASHTAGS: process.env.DB_COLLECTION_HASHTAGS as string,
  DB_COLLECTION_BOOKMARKS: process.env.DB_COLLECTION_BOOKMARKS as string,
  DB_COLLECTION_LIKES: process.env.DB_COLLECTION_LIKES as string,
  DB_COLLECTION_CONVERSATIONS: process.env.DB_COLLECTION_CONVERSATIONS as string,
  JWT_SECRET_FORGOT_PASSWORD_TOKEN: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  JWT_SECRET_ACCESS_TOKEN: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  JWT_SECRET_REFRESH_TOKEN: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  JWT_SECRET_EMAIL_VERIFY_TOKEN: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  EMAIL_VERIFY_TOKEN_EXPIRES_IN: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,
  GOOGLE_CLIENT_REDIRECT_CALLBACK: process.env.GOOGLE_CLIENT_REDIRECT_CALLBACK as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI as string,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
  AWS_REGION: process.env.AWS_REGION as string,
  SES_FROM_ADDRESS: process.env.SES_FROM_ADDRESS as string,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME as string
}
