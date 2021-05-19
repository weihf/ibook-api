const md5 = require('blueimp-md5')
const db = require('../../models/db')
const jwt = require('jsonwebtoken')
const config = require('../../config/index')

// 普通用户
exports.usersList = async (req, res, next) => {
  try {
    // _page:第几页
    // _limit:每页多少条记录
    let { _page = 1, _limit = 20, _search } = req.query
    _search = JSON.parse(_search)

    if (_page < 1) {
      _page = 1
    }

    if (_limit < 1) {
      _limit = 1
    }

    if (_limit > 20) {
      _limit = 20
    }

    // 分页开始的位置
    const start = (_page - 1) * _limit

    // 获取分页列表数据
    const sqlListStr = `
            select * from managers order by CAST(id as SIGNED) desc limit ${start},${_limit}
        `
    const sqlListCountStr = 'select count(*) as count from managers'

    // 获取搜索分页列表数据
    const sqlSearchStr = `
    select * from users where ${_search.item} like '${_search.value}' order by CAST(id as SIGNED) desc limit ${start},${_limit}
  `
    const sqlSearchCountStr = `
    select count(*) as count from users where ${_search.item} like '${_search.value}' order by CAST(id as SIGNED) desc limit ${start},${_limit}
  `

    let sqlStr = null
    let sqlCountStr = null
    if (JSON.stringify(_search) === '{}') {
      sqlStr = sqlListStr
      sqlCountStr = sqlListCountStr
    } else {
      sqlStr = sqlSearchStr
      sqlCountStr = sqlSearchCountStr
    }

    const users = await db.query(sqlStr)

    // 查询得到总记录数
    const [{ count }] = await db.query(sqlCountStr)
    res.status(200).json({ users, count })
  } catch (err) {
    next(err)
  }
}

// 管理员
exports.managersList = async (req, res, next) => {
  try {
    // _page:第几页
    // _limit:每页多少条记录
    let { _page = 1, _limit = 20, _search } = req.query
    _search = JSON.parse(_search)

    if (_page < 1) {
      _page = 1
    }

    if (_limit < 1) {
      _limit = 1
    }

    if (_limit > 20) {
      _limit = 20
    }

    // 分页开始的位置
    const start = (_page - 1) * _limit

    // 获取分页列表数据
    const sqlListStr = `
            select * from managers order by CAST(id as SIGNED) desc limit ${start},${_limit}
        `
    const sqlListCountStr = 'select count(*) as count from managers'

    // 获取搜索分页列表数据
    const sqlSearchStr = `
    select * from managers where ${_search.item} like '${_search.value}' order by CAST(id as SIGNED) desc limit ${start},${_limit}
  `
    const sqlSearchCountStr = `
    select count(*) as count from managers where ${_search.item} like '${_search.value}' order by CAST(id as SIGNED) desc limit ${start},${_limit}
  `

    let sqlStr = null
    let sqlCountStr = null
    if (JSON.stringify(_search) === '{}') {
      sqlStr = sqlListStr
      sqlCountStr = sqlListCountStr
    } else {
      sqlStr = sqlSearchStr
      sqlCountStr = sqlSearchCountStr
    }

    const users = await db.query(sqlStr)

    // 查询得到总记录数
    const [{ count }] = await db.query(sqlCountStr)
    res.status(200).json({ users, count })
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

    const sqlStr = `select * from managers where userName=
      '${body.userName}';`
    const [user] = await db.query(sqlStr)
    if (user) {
      const sqlStr = `select * from managers where userName=
      '${body.userName}' and password='${body.password}';`
      const [user] = await db.query(sqlStr)
      if (!user) {
        res.status(401).json({
          code: 1,
          error: 'Invalid userName or password!'
        })
        return
      }
      id = user.id
    } else {
      const sqlStr =
        `insert into managers (userName,password,gender,avator,createTime,modifyTime) 
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
      const [user] = await db.query(`SELECT * FROM managers WHERE id='${ret.insertId}'`)
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
