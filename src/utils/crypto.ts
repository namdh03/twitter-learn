import { createHash } from 'crypto'
import { envConfig } from '~/constants/configs'

function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

export default function hashPassword(password: string) {
  return sha256(password + envConfig.PASSWORD_SECRET)
}
