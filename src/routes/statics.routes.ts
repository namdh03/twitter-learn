import { Router } from 'express'
import {
  serveImageController,
  serveVideoStreamController,
  serveM3u8Controller,
  serveSegmentController
} from '~/controllers/medias.controller'

const staticsRouter = Router()

staticsRouter.get('/image/:name', serveImageController)
staticsRouter.get('/video-stream/:name', serveVideoStreamController)
staticsRouter.get('/video-hls/:id/master.m3u8', serveM3u8Controller)
staticsRouter.get('/video-hls/:id/:v/:segment', serveSegmentController)

export default staticsRouter
