import UserModel from "../db/models/UserModel.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import { sanitizeUser } from "../sanitizers.js"
import {
  idValidator,
  emailValidator,
  passwordValidator,
  queryLimitValidator,
  queryOffsetValidator,
  nameValidator,
} from "../validators.js"

const makeRoutesUsers = ({ app }) => {
  app.get(
    "/users",
    validate({
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    auth("users"),
    mw(async (req, res) => {
      const { limit, offset } = req.data.query
      const users = await UserModel.query()
        .withGraphFetched("roles")
        .limit(limit)
        .offset(offset)

      res.send({ result: sanitizeUser(users) })
    })
  )

  app.get(
    "/users/:userId",
    validate({
      params: { userId: idValidator.required() },
    }),
    auth("users"),
    mw(async (req, res) => {
      const { userId } = req.data.params
      const user = await UserModel.query()
        .findById(userId)
        .withGraphFetched("roles")

      if (!user) {
        return
      }

      res.send({ result: sanitizeUser(user) })
    })
  )

  app.patch(
    "/users/:userId",
    auth("users"),
    validate({
      params: { userId: idValidator.required() },
      body: {
        firstName: nameValidator,
        lastName: nameValidator,
        email: emailValidator,
        password: passwordValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { firstName, lastName, email },
          params: { userId },
        },
      } = req

      const user = await UserModel.query().findById(userId)

      if (!user) {
        throw new Error("Invalid Credentials")
      }

      const updatedUser = await UserModel.query().updateAndFetchById(userId, {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(email ? { email } : {}),
      })

      res.send({ result: sanitizeUser(updatedUser) })
    })
  )

  app.delete(
    "/users/:userId",
    validate({
      params: { userId: idValidator.required() },
    }),
    auth("users"),
    mw(async (req, res) => {
      const { userId } = req.data.params
      const user = await UserModel.query().findById(userId)

      if (!user) {
        throw new Error("Invalid Credentials")
      }

      await UserModel.query().deleteById(userId)

      res.send({ result: sanitizeUser(user) })
    })
  )
}

export default makeRoutesUsers
