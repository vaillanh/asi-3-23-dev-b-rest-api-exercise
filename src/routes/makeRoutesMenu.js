import MenuModel from "../db/models/MenuModel.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import { sanitizeNavigationMenu, sanitizePage } from "../sanitizers.js"
import { idValidator, nameValidator, pagesValidator } from "../validators.js"

const makeRoutesMenu = ({ app }) => {
  app.post(
    "/menu",
    validate({
      body: {
        name: nameValidator.required(),
        pages: pagesValidator,
      },
    }),
    auth("menu"),
    mw(async (req, res) => {
      const { name, pages } = req.data.body
      const pagesId = pages ? pages : {}

      const menu = await MenuModel.query().insertAndFetch({
        name,
        pagesId,
      })

      res.send({ result: sanitizeNavigationMenu(menu) })
    })
  )

  app.get(
    "/menus",
    mw(async (req, res) => {
      const Menu = await MenuModel.query()

      res.send({ result: Menu.map(sanitizeNavigationMenu) })
    })
  )

  app.get(
    "/menu/:id",
    validate({
      params: {
        id: idValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const { id } = req.data.params
      const menu = await MenuModel.query().findById(id)

      if (!menu) {
        throw new Error("Menu not Exist")
      }

      res.send({ result: sanitizeNavigationMenu(menu) })
    })
  )

  app.patch(
    "/menu/:id",
    validate({
      params: { id: idValidator.required() },
      body: {
        name: nameValidator.required(),
        pagesId: pagesValidator,
      },
    }),
    auth("menu"),
    mw(async (req, res) => {
      const {
        data: {
          body: { name, pagesId },
          params: { id },
        },
      } = req
      const menu = await MenuModel.query().findById(id)

      if (!menu) {
        throw new Error("Menu not Exist")
      }

      const pages = JSON.stringify(pagesId)

      const updatedMenu = await MenuModel.query().updateAndFetchById(id, {
        ...(name ? { name } : {}),
        ...(pagesId ? { pagesId: pages } : {}),
      })

      res.send({ data: sanitizePage(updatedMenu) })
    })
  )

  app.delete(
    "/menu/:id",
    validate({
      params: { id: idValidator.required() },
    }),
    auth("menu"),
    mw(async (req, res) => {
      const { id } = req.data.params
      const menu = await MenuModel.query().findById(id)

      if (!menu) {
        throw new Error("Menu not Exist")
      }

      await MenuModel.query().deleteById(id)

      res.send({ result: menu })
    })
  )
}

export default makeRoutesMenu
