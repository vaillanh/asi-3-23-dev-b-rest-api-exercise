import * as yup from "yup"
import mw from "./mw.js"

const validate = (validators) =>
  mw(async (req, res, next) => {
    const { body, params, query } = validators

    try {
      ;["body", "params", "query"].forEach((key) => {
        if (validators[key] && !req[key]) {
          throw new Error(`Missing req.${key}`)
        }
      })

      req.data = await yup
        .object()
        .shape({
          ...(body ? { body: yup.object().shape(body) } : {}),
          ...(query ? { query: yup.object().shape(query) } : {}),
          ...(params ? { params: yup.object().shape(params) } : {}),
        })
        .validate(
          {
            params: req.params,
            body: req.body,
            query: req.query,
          },
          {
            abortEarly: false,
          }
        )

      next()
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        res.status(422).send({ error: err.errors })

        return
      }

      res.status(500).send({ error: "Oops. Something went wrong." })

      throw err
    }
  })

export default validate
