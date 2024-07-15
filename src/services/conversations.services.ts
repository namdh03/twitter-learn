import { ObjectId } from 'mongodb'
import databaseService from './database.services'

class ConversationsService {
  async getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  }: {
    sender_id: string
    receiver_id: string
    limit: number
    page: number
  }) {
    const match = {
      $or: [
        {
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id)
        },
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(sender_id)
        }
      ]
    }

    const total = await databaseService.conversations.countDocuments(match)
    const conversations = await databaseService.conversations
      .find(match)
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    return {
      conversations,
      total
    }
  }
}

const conversationsService = new ConversationsService()

export default conversationsService
