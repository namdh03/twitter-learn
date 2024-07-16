import { Request, Response } from 'express'
import { CONVERSATION_MESSAGES } from '~/constants/messages'
import { GetConversationsParams } from '~/models/requests/Conversation.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import conversationsService from '~/services/conversations.services'

export const getConversationController = async (req: Request<GetConversationsParams>, res: Response) => {
  const { receiver_id } = req.params
  const { user_id } = req.decode_authorization as TokenPayload
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const { conversations, total } = await conversationsService.getConversations({
    sender_id: user_id,
    receiver_id,
    limit,
    page
  })

  return res.json({
    message: CONVERSATION_MESSAGES.GET_CONVERSATION_SUCCESS,
    data: {
      conversations,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}
