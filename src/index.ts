import express from 'express'
import cors from 'cors'
import 'dotenv/config'

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

const app = express()
const port = process.env.PORT || 4000

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
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)
app.use('/search', searchRouter)
app.use('/static', staticsRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
