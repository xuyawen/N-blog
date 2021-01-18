const express = require('express')
const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const router = express.Router()

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/checkLogined').checkNotLogin

// GET /signup 注册页
router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signup', {
    active: 'signup',
    title: '注册'
  })
})

// POST /signup 用户注册
router.post('/', checkNotLogin, function (req, res, next) {
  const name = req.fields.name
  const gender = req.fields.gender
  const bio = req.fields.bio
  const avatar = req.files.avatar.path.split(path.sep).pop()
  const password = req.fields.password
  const repassword = req.fields.repassword
  const shaPassword = sha1(password)

  // 校验
  try {
    if (!(name.length >= 1 && name.length <= 10)) throw new Error('名字请限制在 1-10 个字符')
    if (['m', 'f', 'x'].indexOf(gender) === -1) throw new Error('性别只能是 m、f 或 x')
    if (!(bio.length >= 1 && bio.length <= 30)) throw new Error('个人简介请限制在 1-30 个字符')
    if (!req.files.avatar.name) throw new Error('缺少头像')
    if (password.length < 6) throw new Error('密码至少 6 个字符')
    if (password !== repassword) throw new Error('两次输入密码不一致')
  } catch(err) {
    fs.unlink(req.files.avatar.path, function(_) {})
    req.flash('error', err.message)
    return res.redirect('/signup')
  }

  let user = {
    name,
    gender,
    bio,
    avatar,
    password: shaPassword,
  }

  UserModel.create(user)
  .then(function(result) {
    console.log(result)
    user = result.ops[0]
    delete user.password
    req.session.user = user
    req.flash('success', '注册成功')
    res.redirect('/posts')
  })
  .catch(function(err) {
    fs.unlink(req.files.avatar.path, function(_) {})
    if (err.message.match('duplicate key')) {
      req.flash('error', '用户名已被占用')
      return res.redirect('/signup')
    }
    next(err)
  })
})

module.exports = router
