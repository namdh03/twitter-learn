import { checkSchema } from 'express-validator'
import { MediaTypeQuery } from '~/constants/enums'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { stringEnumToArray } from '~/utils/commons'
import validate from '~/utils/validate'

const mediaTypeQueries = stringEnumToArray(MediaTypeQuery)

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: SEARCH_MESSAGES.CONTENT_MUST_BE_A_STRING
        },
        trim: true
      },
      media_type: {
        optional: true,
        isIn: {
          options: [mediaTypeQueries]
        },
        errorMessage: SEARCH_MESSAGES.INVALID_MEDIA_TYPE
      },
      people_follow: {
        optional: true,
        isBoolean: true,
        errorMessage: SEARCH_MESSAGES.PEOPLE_FOLLOW_MUST_BE_A_BOOLEAN
      }
    },
    ['query']
  )
)
