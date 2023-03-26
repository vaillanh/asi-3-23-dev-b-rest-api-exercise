import BaseModel from "./BaseModel.js"
import RoleModel from "./RoleModel.js"

class UserModel extends BaseModel {
  static tableName = "user"

  static get relationMappings() {
    return {
      roles: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: RoleModel,
        join: {
          from: "user.roleid",
          to: "role.id",
        },
      },
    }
  }
}

export default UserModel
