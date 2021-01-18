const express = require('express')
const sha1 = require('sha1')
const router = express.Router()

const getUserByName = require('../models/users').getUserByName
const checkNotLogin = require('../middlewares/checkLogined').checkNotLogin

// GET /signin 登录页
router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signin', {
    active: 'signin',
    title: '登录'
  })
})

// POST /signin 用户登录
router.post('/', checkNotLogin, function (req, res, next) {
  const name = req.fields.name
  const password = req.fields.password

  try {
    if (!name) throw new Error('请填写用户名')
    if (!password) throw new Error('请填写密码')
  } catch(err) {
    req.flash('error', err.message)
    return res.redirect('back')
  }

  getUserByName(name)
  .then(function(user) {
    if (!user) {
      req.flash('error', '用户不存在')
      return res.redirect('back')
    }
    if (sha1(password) !== user.password) {
      req.flash('error', '用户名或密码错误')
      return res.redirect('back')
    }
    req.flash('success', '登录成功')
    delete user.password
    req.session.user = user
    res.redirect('/posts')
  })
  .catch(next)
})

module.exports = router
