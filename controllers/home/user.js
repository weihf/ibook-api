const md5 = require('blueimp-md5')
const db = require('../../models/db')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const config = require('../../config/index')

exports.one = async (req, res, next) => {
  try {
    const { id } = req.params
    const sqlStr = `SELECT * FROM users WHERE id=${mysql.escape(id)}`
    const [user] = await db.query(sqlStr)
    res.status(200).json(user)
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    let body = JSON.stringify(req.body)
    body = JSON.parse(body)
    const sqlStr =
      `update users set ${body.field}="${body.value}" where id="${body.id}";
            `
    await db.query(sqlStr)
    const [user] = await db.query(`SELECT * FROM users WHERE id='${body.id}'`)
    res.status(201).json(user)
  } catch (err) {
    next(err)
  }
}

// 登陆/注册
// 接收表单数据
// 操作数据库处理登陆请求
// 发送响应
exports.create = async (req, res, next) => {
  try {
    let body = JSON.stringify(req.body)
    body = JSON.parse(body)
    body.password = md5(md5(body.password))
    let id = null

    const sqlStr = `select * from users where userName=
      '${body.userName}';`
    const [user] = await db.query(sqlStr)
    if (user) {
      const sqlStr = `select * from users where userName=
      '${body.userName}' and password='${body.password}';`
      const [user] = await db.query(sqlStr)
      if (!user) {
        return res.status(404).json({
          error: 'Invalid userName or password!'
        })
      }
      id = user.id
    } else {
      const sqlStr =
        `insert into users (userName,password,gender,avator,createTime,modifyTime) 
        values(
            '${body.userName}',
            '${body.password}',
            1,
            'http://127.0.0.1:4000/static/img/default-avater.png',
            CURDATE(),
            CURDATE()
            );
            `
      const ret = await db.query(sqlStr)
      const [user] = await db.query(`SELECT * FROM users WHERE id='${ret.insertId}'`)
      id = user.id
    }
    // 登录成功，记录 Session
    req.session.user = user
    // 生成 token
    const token = jwt.sign(
      {
        userName: body.userName,
        userId: id
      },
      config.jwt_secret,
      {
        expiresIn: '24h'
      }
    )

    res.status(201).json({
      message: '登陆成功',
      token
    })
  } catch (err) {
    next(err)
  }
}

// 注销登陆
exports.destroy = async (req, res, next) => {
  delete req.session.user
  res.status(201).json({})
}
