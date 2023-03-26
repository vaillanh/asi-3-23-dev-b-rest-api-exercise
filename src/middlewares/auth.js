import UserModel from "../db/models/UserModel.js"
import parseSession from "../parseSession.js"
import mw from "./mw.js"

const auth = (resource) =>
  mw(async (req, res, next) => {
    const { jwt } = req.headers

    if (!jwt) {
      throw new Error("Invalid Session")
    }

    const payload = parseSession(jwt)
    req.session = payload

    const user = await UserModel.query()
      .findById(payload.user.id)
      .withGraphFetched("roles")

    const permission = user.roles.permissions[resource][req.method]
    const selfModify = parseInt(req.params.userId) === payload.user.id

    if (permission || selfModify) {
      return next()
    } else {
      throw new Error("No authorization")
    }
  })

export default auth
