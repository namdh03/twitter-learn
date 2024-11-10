import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
// import YAML from 'yaml'
// import fs from 'fs'
// import path from 'path'

import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import usersRouter from './routes/users.routes'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import staticsRouter from './routes/statics.routes'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likesRouter from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import conversationsRouter from './routes/conversations.routes'
import initSocket from './utils/socket'
import { envConfig, isProduction } from './constants/configs'

const app = express()
const httpServer = createServer(app)
const port = envConfig.PORT || 4000
const corsOptions: cors.CorsOptions = {
  origin: isProduction ? envConfig.CLIENT_URL : '*'
}
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
})
// const file = fs.readFileSync(path.resolve('./twitter-swagger.yaml'), 'utf8')
// const swaggerDocument = YAML.parse(file)

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexVideoStatus()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Twitter Clone API - OpenAPI 3.0',
      description: `
Welcome to the Twitter Clone API, built on OpenAPI 3.0 specifications! This API provides core functionalities for a Twitter-like social media platform, where users can post tweets, follow other users, like and retweet content, and much more.

API Highlights:
- User Management: Register, log in, and manage user profiles.
- Tweets and Timelines: Create, view, and interact with tweets, including features like replies, retweets, and likes.
- Social Features: Follow/unfollow other users, view timelines, and receive notifications for key activities.
- Real-time Updates: Get instant updates with support for notifications and live feeds.

Helpful Links:
- [Platform Repository](https://github.com/your-organization/twitter-clone)
- [API Definition](https://github.com/your-organization/twitter-clone/blob/main/api-definition.yaml)

Explore and contribute to this Twitter clone project as we aim to provide a rich, interactive social media experience!`,
      termsOfService: 'http://yourtwitterclone.com/terms/',
      contact: {
        email: 'support@yourtwitterclone.com'
      },
      license: {
        name: 'Apache 2.0',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
      },
      version: '1.0.0'
    },
    externalDocs: {
      description: 'Learn more about the Twitter Clone Project',
      url: 'http://yourtwitterclone.com'
    },
    servers: [{ url: 'http://localhost:4000' }, { url: 'https://api.yourtwitterclone.com/v1' }],
    tags: [
      {
        name: 'users',
        description: 'Operations related to user accounts and profiles'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./openapi/**/*.yaml']
}

const openapiSpecification = swaggerJsdoc(options)

// Tạo folder uploads nếu chưa tồn tại
initFolder()

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.use(limiter)
app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)
app.use('/search', searchRouter)
app.use('/static', staticsRouter)
app.use('/conversations', conversationsRouter)
app.use(defaultErrorHandler)

initSocket(httpServer)

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
