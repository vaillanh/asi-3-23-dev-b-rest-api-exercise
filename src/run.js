import express from "express"
import knex from "knex"
import BaseModel from "./db/models/BaseModel.js"
import makeRoutesMenu from "./routes/makeRoutesMenu.js"
import makeRoutesPage from "./routes/makeRoutesPage.js"
import makeRoutesSign from "./routes/makeRoutesSign.js"
import makeRoutesUsers from "./routes/makeRoutesUsers.js"

const run = async (config) => {
  const app = express()

  app.use(express.json())

  const db = knex(config.db)
  BaseModel.knex(db)

  makeRoutesSign({ app })
  makeRoutesUsers({ app })
  makeRoutesPage({ app })
  makeRoutesMenu({ app })

  app.use((req, res) => {
    res.status(404).send({ error: [`cannot POST ${req.url}`] })
  })

  // eslint-disable-next-line no-console
  app.listen(config.port, () => console.log(`Listening on :${config.port}`))
}

export default run
