import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'
import usersService from '~/services/users.services'

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (email === 'test@gmail.com' && password === '123456') {
    return res.status(200).json({
      message: 'User logged in successfully'
    })
  }

  return res.status(401).json({
    message: 'Invalid email or password'
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  try {
    const result = await usersService.register(req.body)

    return res.status(201).json({
      message: 'User registered successfully',
      data: result
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: 'Internal server error'
    })
  }
}
