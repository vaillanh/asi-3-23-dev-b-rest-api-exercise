import config from "../config.js"
import PagesModel from "../db/models/PagesModel.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import { sanitizePage } from "../sanitizers.js"
import {
  contentValidator,
  idValidator,
  queryLimitValidator,
  queryOffsetValidator,
  statusValidator,
  titleValidator,
} from "../validators.js"

const makeRoutesPage = ({ app }) => {
  app.post(
    "/page",
    validate({
      body: {
        title: titleValidator.required(),
        content: contentValidator.required(),
        status: statusValidator.required(),
      },
    }),
    auth("pages"),
    mw(async (req, res) => {
      const { title, content, status } = req.data.body

      const page = await PagesModel.query().insertAndFetch({
        title,
        content,
        slug: title
          .toLowerCase()
          .trim()
          .replace(/[^\w ]+/g, "")
          .replace(/ +/g, "-"),
        authorId: parseInt(req.session.user.id),
        editorId: parseInt(req.session.user.id),
        status,
      })

      res.send({ result: sanitizePage(page) })
    })
  )

  app.get(
    "/pages",
    validate({
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    auth("pages"),
    mw(async (req, res) => {
      const {
        limit = config.pagination.limit.default,
        offset = config.pagination.offset.default,
        sort = "id",
      } = req.data.query

      const pages = await PagesModel.query()
        .orderBy(sort)
        .limit(limit)
        .offset(offset)
        .modify("sanitize")

      if (!pages) {
        throw new Error("No page found")
      }

      res.send({ result: sanitizePage(pages) })
    })
  )

  app.get(
    "/page/:id",
    validate({
      params: { id: idValidator.required() },
    }),
    mw(async (req, res) => {
      const { id } = req.params
      const page = await PagesModel.query()
        .findById(id)
        .modify("sanitize")
        .first()

      if (!auth("pages")) {
        page.where("status", "published")
      }

      if (!page) {
        throw new Error("Page not Found")
      }

      res.send({ result: sanitizePage(page) })
    })
  )

  app.patch(
    "/page/:id",
    validate({
      params: { id: idValidator.required() },
      body: {
        title: titleValidator.required(),
        content: contentValidator.required(),
        status: statusValidator.required(),
      },
    }),
    auth("pages"),
    mw(async (req, res) => {
      const {
        data: {
          body: { title, content, status },
          params: { id },
        },
      } = req

      const page = await PagesModel.query().findById(id)

      if (!page) {
        throw new Error("Page not Found")
      }

      const editorId = parseInt(req.session.user.id)

      const updatedPage = await PagesModel.query().updateAndFetchById(id, {
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
        ...(editorId ? { editorId } : {}),
        ...(status ? { status } : {}),
      })

      res.send({ data: sanitizePage(updatedPage) })
    })
  )

  app.delete(
    "/page/:id",
    validate({
      params: { id: idValidator.required() },
    }),
    auth("pages"),
    mw(async (req, res) => {
      const { id } = req.data.params
      const page = await PagesModel.query().findById(id)

      if (!page) {
        throw new Error("Page not Found")
      }

      await PagesModel.query().deleteById(id)

      res.send({ result: sanitizePage(page) })
    })
  )
}

export default makeRoutesPage
