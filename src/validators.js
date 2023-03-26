import * as yup from "yup"
import config from "./config.js"

export const textValidator = yup.string()

export const idValidator = yup.number().integer().min(1)

export const passwordValidator = yup
  .string()
  .matches(
    /^(?=.*[^\p{L}0-9])(?=.*[0-9])(?=.*\p{Lu})(?=.*\p{Ll}).{8,}$/u,
    "Password must be at least 8 chars & contain at least one of each: lower case, upper case, digit, special char."
  )

export const emailValidator = yup.string().email()

export const nameValidator = yup
  .string()
  .matches(/^[\p{L} -]+$/u, "Name is invalid")

export const queryLimitValidator = yup
  .number()
  .integer()
  .min(config.pagination.limit.min)
  .max(config.pagination.limit.max)
  .default(config.pagination.limit.default)

export const queryOffsetValidator = yup
  .number()
  .integer()
  .min(config.pagination.offset.min)
  .max(config.pagination.offset.max)
  .default(config.pagination.offset.default)

export const statusValidator = yup.string().oneOf(["published", "draft"])

export const titleValidator = textValidator

export const contentValidator = textValidator

export const pagesValidator = yup.array().of(idValidator)
