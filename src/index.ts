import express, { NextFunction, Request, Response } from 'express'
import 'dotenv/config'

import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'

const app = express()
const port = 3000

app.use(express.json())
app.use('/users', usersRouter)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).send(err.message)
})

databaseService.connect()
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
