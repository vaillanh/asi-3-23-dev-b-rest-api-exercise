import jsonwebtoken from "jsonwebtoken"
import hashPassword from "../hashPassword.js"
import {
  emailValidator,
  nameValidator,
  passwordValidator,
} from "../validators.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import UserModel from "../db/models/UserModel.js"
import config from "../config.js"
import { sanitizeUser } from "../sanitizers.js"

const makeRoutesSign = ({ app }) => {
  app.post(
    "/sign-up",
    validate({
      body: {
        firstName: nameValidator.required(),
        lastName: nameValidator.required(),
        email: emailValidator.required(),
        password: passwordValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const { firstName, lastName, email, password } = req.data.body
      const [passwordHash, passwordSalt] = hashPassword(password)

      const user = await UserModel.query().insertAndFetch({
        firstName,
        lastName,
        email,
        passwordHash,
        passwordSalt,
      })

      res.send({ result: sanitizeUser(user) })
    })
  )

  app.post(
    "/sign-in",
    validate({
      body: {
        email: emailValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const { email, password } = req.data.body

      const user = await UserModel.query().where({ email }).first()

      if (!user) {
        throw new Error("Invalid Credentials")
      }

      const [passwordHash] = hashPassword(password, user.passwordSalt)

      if (user.passwordHash !== passwordHash) {
        throw new Error("Invalid Credentials")
      }

      const jwt = jsonwebtoken.sign(
        {
          payload: {
            user: {
              id: user.id,
              fullName: `${user.firstName} ${user.lastName}`,
            },
          },
        },
        config.security.session.jwt.secret,
        { expiresIn: config.security.session.jwt.expiresIn }
      )

      res.send({ result: jwt })
    })
  )
}

export default makeRoutesSign
