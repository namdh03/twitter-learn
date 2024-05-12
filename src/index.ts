import express from 'express'
import 'dotenv/config'

import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import usersRouter from './routes/users.routes'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { UPLOAD_DIR } from './constants/dir'

const app = express()
const port = process.env.PORT || 4000

databaseService.connect()

// Tạo folder uploads nếu chưa tồn tại
initFolder()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use(defaultErrorHandler)
app.use('/static', express.static(UPLOAD_DIR))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
