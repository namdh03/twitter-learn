export const SERVER_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error'
}

export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_BETWEEN_1_AND_100: 'Name length must be between 1 and 100',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_50: 'Password length must be between 6 and 50',
  PASSWORD_MUST_BE_STRONG:
    'Password must be 6-50 characters long, and contain at least one lowercase letter, one uppercase letter, one number, and one symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_50: 'Confirm password length must be between 6 and 50',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be 6-50 characters long, and contain at least one lowercase letter, one uppercase letter, one number, and one symbol',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  DATE_OF_BIRTH_MUST_BE_ISO_8601: 'Date of birth must be in ISO 8601 format',
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Register successful',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  REFRESH_TOKEN_HAS_BEEN_USED_OR_NOT_EXIST: "Refresh token has been used or doesn't exist",
  REFRESH_TOKEN_SUCCESS: 'Refresh token successful',
  LOGOUT_SUCCESS: 'Logout successful',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  EMAIL_VERIFY_SUCCESS: 'Email verify successful',
  RESEND_EMAIL_VERIFY_SUCCESS: 'Resend email verify successful',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password successful',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  RESET_PASSWORD_SUCCESS: 'Reset password successful',
  GET_USER_INFO_SUCCESS: 'Get user info successful',
  USER_IS_NOT_VERIFIED: 'User is not verified',
  UPDATE_USER_INFO_SUCCESS: 'Update user info successful',
  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH_MUST_BE_BETWEEN_1_AND_200: 'Bio length must be between 1 and 200',
  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  LOCATION_LENGTH_MUST_BE_BETWEEN_1_AND_200: 'Location length must be between 1 and 200',
  LINK_MUST_BE_A_URL: 'Link must be a URL',
  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  WEBSITE_LENGTH_MUST_BE_BETWEEN_1_AND_200: 'Website length must be between 1 and 200',
  USERNAME_MUST_BE_A_STRING: 'Username must be a string',
  USERNAME_INVALID:
    'Username must be 4-15 characters long and contain only letters, numbers, underscores, not only numbers',
  USERNAME_EXISTED: 'Username existed',
  IMAGE_MUST_BE_A_STRING: 'Image must be a string',
  IMAGE_LENGTH_MUST_BE_BETWEEN_1_AND_400: 'Image length must be between 1 and 400',
  GET_PROFILE_SUCCESS: 'Get profile successful',
  FOLLOW_USER_SUCCESS: 'Follow user successful',
  INVALID_USER_ID: 'Invalid user ID',
  USER_ALREADY_FOLLOWED: 'User already followed',
  ALREADY_UNFOLLOWED: 'Already unfollowed',
  UNFOLLOW_SUCCESS: 'Unfollow successful',
  CHANGE_PASSWORD_SUCCESS: 'Change password successful',
  OLD_PASSWORD_NOT_MATCH: 'Old password not match',
  GMAIL_NOT_VERIFIED: 'Gmail not verified',
  UPLOAD_SUCCESS: 'Upload successful',
  IMAGE_NOT_FOUND: 'Image not found',
  VIDEO_NOT_FOUND: 'Video not found',
  GET_VIDEO_STATUS_SUCCESS: 'Get video status successful'
} as const

export const TWEETS_MESSAGES = {
  INVALID_TYPE: 'Invalid type',
  INVALID_AUDIENCE: 'Invalid audience',
  PARENT_ID_MUST_BE_A_VALID_TWEET_ID: 'Parent ID must be a valid tweet ID',
  PARENT_ID_MUST_BE_NULL: 'Parent ID must be null',
  CONTENT_MUST_BE_A_NON_EMPTY_STRING: 'Content must be a non-empty string',
  CONTENT_MUST_BE_EMPTY_STRING: 'Content must be an empty string',
  HASHTAG_MUST_BE_AN_ARRAY_OF_STRING: 'Hashtag must be an array of string',
  MENTION_MUST_BE_AN_ARRAY_OF_USER_ID: 'Mention must be an array of user ID',
  MEDIA_MUST_BE_AN_ARRAY_OF_MEDIA: 'Media must be an array of media',
  TWEET_CREATED: 'Tweet created',
  TWEET_NOT_FOUND: 'Tweet not found',
  TWEET_ID_INVALID: 'Tweet ID invalid',
  TWEET_IS_NOT_PUBLIC: 'Tweet is not public',
  GET_TWEET_SUCCESS: 'Get tweet successful',
  LIMIT_MUST_BE_A_NUMBER_BETWEEN_1_AND_100: 'Limit must be a number between 1 and 100',
  PAGE_MUST_BE_A_NUMBER_GREATER_THAN_0: 'Page must be a number greater than 0',
  GET_NEW_FEED_SUCCESS: 'Get new feed successful'
} as const

export const BOOKMARKS_MESSAGES = {
  TWEET_HAS_BEEN_BOOKMARKED: 'Tweet has been bookmarked',
  TWEET_HAS_BEEN_UNBOOKMARKED: 'Tweet has been unbookmarked'
} as const

export const LIKES_MESSAGES = {
  LIKED_SUCCESSFULLY: 'Liked successfully',
  UNLIKED_SUCCESSFULLY: 'Unliked successfully'
} as const

export const SEARCH_MESSAGES = {
  CONTENT_MUST_BE_A_STRING: 'Content must be a string',
  INVALID_MEDIA_TYPE: 'Invalid media type',
  PEOPLE_FOLLOW_MUST_BE_A_BOOLEAN: 'People follow must be a boolean'
}

export const CONVERSATION_MESSAGES = {
  SENDER_ID_MUST_BE_A_VALID_USER_ID: 'Sender ID must be a valid user ID',
  RECEIVER_ID_MUST_BE_A_VALID_USER_ID: 'Receiver ID must be a valid user ID',
  CONVERSATION_CREATED: 'Conversation created',
  CONVERSATION_NOT_FOUND: 'Conversation not found',
  GET_CONVERSATION_SUCCESS: 'Get conversation successful'
} as const
