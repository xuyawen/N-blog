const User = require('../lib/mongo').User

module.exports = {
  create: function(user) {
    // 添加一个用户
    return User.insertOne(user).exec()
  },
  getUserByName: function(name) {
    // 通过用户名获取用户信息
    return User
    .findOne({ name })
    .addCreatedAt()
    .exec()
  }
}
