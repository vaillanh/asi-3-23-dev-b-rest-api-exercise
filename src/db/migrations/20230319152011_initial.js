export const up = async (knex) => {
  await knex.schema
    .createTable("role", (table) => {
      table.increments("id")
      table.text("name").notNullable()
      table.json("permissions").notNullable()
    })
    .then(function () {
      return knex("role").insert([
        {
          name: "admin",
          permissions: {
            users: {
              POST: true,
              GET: true,
              PATCH: true,
              DELETE: true,
            },
            pages: {
              POST: true,
              GET: true,
              PATCH: true,
              DELETE: true,
            },
            menu: {
              POST: true,
              GET: true,
              PATCH: true,
              DELETE: true,
            },
          },
        },
        {
          name: "manager",
          permissions: {
            users: {
              POST: false,
              GET: false,
              PATCH: false,
              DELETE: false,
            },
            pages: {
              POST: false,
              GET: true,
              PATCH: true,
              DELETE: false,
            },
            menu: {
              POST: false,
              GET: true,
              PATCH: false,
              DELETE: false,
            },
          },
        },
        {
          name: "editor",
          permissions: {
            users: {
              POST: false,
              GET: false,
              PATCH: false,
              DELETE: false,
            },
            pages: {
              POST: true,
              GET: true,
              PATCH: true,
              DELETE: true,
            },
            menu: {
              POST: true,
              GET: true,
              PATCH: true,
              DELETE: true,
            },
          },
        },
      ])
    })

  await knex.schema.createTable("user", (table) => {
    table.increments("id")
    table.text("email").notNullable()
    table.text("firstName").notNullable()
    table.text("lastName").notNullable()
    table.text("passwordHash").notNullable()
    table.text("passwordSalt").notNullable()
    table.integer("roleid").references("id").inTable("role").defaultTo(3)
  })

  await knex.schema.createTable("pages", (table) => {
    table.increments("id")
    table.text("title").notNullable()
    table.text("content").notNullable()
    table.text("slug").notNullable().unique()
    table.integer("authorId").references("id").inTable("user").notNullable()
    table.integer("editorId").references("id").inTable("user").notNullable()
    table.timestamps(true, true, true)
    table.string("status").defaultTo("draft")
  })

  await knex.schema.createTable("menu", (table) => {
    table.increments("id")
    table.text("name").notNullable()
    table.json("pagesId")
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("menu")
  await knex.schema.dropTable("pages")
  await knex.schema.dropTable("user")
  await knex.schema.dropTable("role")
}
