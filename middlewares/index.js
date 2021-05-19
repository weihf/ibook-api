const jwt = require('jsonwebtoken')
const config = require('../config/index')
const db = require('../models/db')

module.exports = {
  checkLogin: (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        error: 'Unauthorized'
      })
    }
    next()
  },

  // 验证 token
  checkToken: (req, res, next) => {
    let token = req.body.token || req.query.token || req.headers.authorization
    if (!token) { // 没有拿到token 返回错误
      return res.status(401).send({
        code: 0,
        msg: '没有找到token'
      })
    }
    token = token.split(' ')[1]
    const verifyToken = new Promise((resolve, reject) => {
      jwt.verify(token, config.jwt_secret, (err, decoded) => {
        if (err) {
          return res.status(401).json({ code: 1, msg: '无效的token' })
        }
        next()
      })
    })
    verifyToken.then((data) => {
      res.status(401).json({
        code:0,
        data:data,
        message:'OK'
      })
      next()
    }).catch(err => {
      res.status(404).json({
        code:1,
        err:err,
        message:'无效的token'
      })
    })
  }
}
