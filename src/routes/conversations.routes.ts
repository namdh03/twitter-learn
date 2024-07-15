import { Router } from 'express'
import { getConversationController } from '~/controllers/conversations.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

const conversationsRouter = Router()

conversationsRouter.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  getConversationController
)

export default conversationsRouter
