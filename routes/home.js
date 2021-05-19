const express = require('express')
const router = express.Router()

const userController = require('../controllers/home/user')
const bookController = require('../controllers/home/book')
const commentController = require('../controllers/home/comment')
const starsController = require('../controllers/home/stars')
const uploadController = require('../controllers/home/upload')
const verify = require('../middlewares/index')

// 用户资源
router
  // 根据 ID 获取用户信息
  .get('/users/:id', verify.checkToken, userController.one)

  // 根据 ID 修改用户信息
  .patch('/users/:id', verify.checkToken, userController.update)

  // 注册
  .post('/users', userController.create)

  // 登录/注册
  .post('/user', userController.create)

  // 注销登陆
  .delete('/user/:id', verify.checkToken, userController.destroy)

// 书资源
router
  .get('/books', bookController.list)
  .get('/books/:id', bookController.one)
  .post('/search', bookController.search)

// 评论资源
router
  .get('/bookComments/:id', commentController.bookCommentslist)
  .get('/userComments/:id', verify.checkToken, commentController.userCommentslist)
  .post('/comments', verify.checkToken, commentController.create)

// 星级评分
router
  .get('/bookStars/:id', starsController.bookStarslist)
  .get('/userStars/:id', verify.checkToken, starsController.userStarslist)
  .post('/stars', verify.checkToken, starsController.create)
  .get('/isRating/:userId/:bookId', verify.checkToken, starsController.isRating)

// 用户头像上传
router.post('/uploadPhoto', verify.checkToken, uploadController.uploadAvator.single('file'), uploadController.uploadImg)

module.exports = router
