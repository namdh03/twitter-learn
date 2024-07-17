import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import fs from 'fs'
import path from 'path'
import { envConfig } from '~/constants/configs'

interface SendEmailParams {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}

const verifyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf8')

// Create SES service object.
const sesClient = new SESClient({
  region: envConfig.AWS_REGION,
  credentials: {
    secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: envConfig.AWS_ACCESS_KEY_ID as string
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: SendEmailParams) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

const sendEmail = async (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: envConfig.SES_FROM_ADDRESS as string,
    toAddresses: toAddress,
    body,
    subject
  })

  return sesClient.send(sendEmailCommand)
}

export const sendVerifyRegisterEmail = (
  toAddress: string,
  token: string,
  template: string | undefined = verifyEmailTemplate
) => {
  return sendEmail(
    toAddress,
    'Verify your email address',
    template
      .replace('{{title}}', 'Please verify your email')
      .replace('{{content}}', 'Click the link below to verify your email address')
      .replace('{{titleLink}}', 'Verify')
      .replace('{{link}}', `${envConfig.CLIENT_URL}/verify-email?token=${token}`)
  )
}

export const sendVerifyForgotPasswordEmail = (
  toAddress: string,
  token: string,
  template: string | undefined = verifyEmailTemplate
) => {
  return sendEmail(
    toAddress,
    'Forgot password',
    template
      .replace('{{title}}', 'You are receiving this email because you have requested to reset your password')
      .replace('{{content}}', 'Click the link below to reset your password')
      .replace('{{titleLink}}', 'Reset password')
      .replace('{{link}}', `${envConfig.CLIENT_URL}/forgot-password?token=${token}`)
  )
}
