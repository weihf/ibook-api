const express = require('express')
const router = express.Router()

const userController = require('../controllers/admin/user')
const bookController = require('../controllers/admin/book')
const uploadController = require('../controllers/admin/upload')
const verify = require('../middlewares/index')

// webapp

// 用户资源
router
  // 获取普通用户列表
  .get('/users', verify.checkToken, userController.usersList)

  // 获取管理员列表
  .get('/managers', verify.checkToken, userController.managersList)

  // 登录/注册
  .post('/user', userController.create)

  // 注销登陆
  .delete('/user/:id', verify.checkToken, userController.destroy)

// 书资源
router
  .get('/books', verify.checkToken, bookController.list)
  .get('/books/:id', verify.checkToken, bookController.one)
  .post('/books', verify.checkToken, bookController.create)
  .patch('/books/:id', verify.checkToken, bookController.update)
  .delete('/books/:id', verify.checkToken, bookController.destroy)

// 书籍封面上传
router.post('/upload', verify.checkToken, uploadController.uploadBookImg.single('file'), uploadController.uploadImg)

module.exports = router
