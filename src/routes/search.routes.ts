import { Router } from 'express'
import { searchController } from '~/controllers/search.controller'
import { searchValidator } from '~/middlewares/search.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const searchRouter = Router()

searchRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  searchValidator,
  wrapRequestHandler(searchController)
)

export default searchRouter
