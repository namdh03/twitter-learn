import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { createServer } from 'http'
import { Server } from 'socket.io'

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
import Conversation from './models/schemas/Conversation.schema'
import conversationsRouter from './routes/conversations.routes'
import { ObjectId } from 'mongodb'

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 4000
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  const user_id = socket.handshake.auth._id
  users[user_id] = {
    socket_id: socket.id
  }

  socket.on('message', async (data) => {
    const { content, to, from } = data
    const receiver_socket_id = users[to]?.socket_id
    if (receiver_socket_id) {
      await databaseService.conversations.insertOne(
        new Conversation({
          sender_id: new ObjectId(from as string),
          receiver_id: new ObjectId(to as string),
          content
        })
      )

      socket.to(receiver_socket_id).emit('receive private message', {
        content,
        from: user_id
      })
    }
  })

  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

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
app.use('/conversations', conversationsRouter)
app.use(defaultErrorHandler)

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
