import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'

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
import { envConfig } from './constants/configs'

const app = express()
const httpServer = createServer(app)
const port = envConfig.PORT || 4000
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'X clone (Twitter API)',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ],
    persistAuthorization: true
  },
  apis: ['./openapi/*.yaml']
}
const openapiSpecification = swaggerJsdoc(options)

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexVideoStatus()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})

// Tạo folder uploads nếu chưa tồn tại
initFolder()

app.use(express.json())
app.use(cors())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
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
