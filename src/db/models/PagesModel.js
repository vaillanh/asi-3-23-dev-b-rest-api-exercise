import BaseModel from "./BaseModel.js"

class PagesModel extends BaseModel {
  static tableName = "pages"

  static get modifiers() {
    return {
      sanitize(builder) {
        builder.select("id", "title", "content", "status")
      },
    }
  }
}

export default PagesModel
