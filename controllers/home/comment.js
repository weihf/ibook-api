const moment = require('moment')
const db = require('../../models/db')

// 获取一本书的所有评论
exports.bookCommentslist = async (req, res, next) => {
  try {
    // _page:第几页
    // _limit:每页多少条记录
    let { _page = 1, _limit = 20 } = req.query

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

    const { id } = req.params

    // 获取分页列表数据
    const sqlStr = `
            select * from comments where bookId=${id} order by CAST(id as SIGNED) desc limit ${start},${_limit}
            
        `
    const result = await db.query(sqlStr)
    const list = []
    for (let i = 0; i < result.length; i++) {
      const [user] = await db.query(`select * from users where id='${result[i].userId}'`)
      if (!user) {
        continue
      }
      delete result[i].userId
      const obj = {}
      obj.result = result[i]
      obj.user = user
      list.push(obj)
    }
    // 查询得到总记录数
    const [{ count }] = await db.query('select count(*) as count from comments')
    res.status(200).json({ list, count })
  } catch (err) {
    next(err)
  }
}

// 获取一个用户的所有评论
exports.userCommentslist = async (req, res, next) => {
  try {
    // _page:第几页
    // _limit:每页多少条记录
    let { _page = 1, _limit = 20 } = req.query

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
    const { id } = req.params
    const sqlStr = `
            select * from comments where userId=${id} order by CAST(id as SIGNED) desc limit ${start},${_limit}
        `
    const results = await db.query(sqlStr)
    const list = []
    for (let i = 0; i < results.length; i++) {
      const [book] = await db.query(`select id,bookName,star from books where id='${results[i].bookId}'`)
      delete results[i].userId
      const obj = {}
      obj.self = results[i]
      delete obj.self.bookId
      obj.book = book
      list.push(obj)
    }

    // 查询得到总记录数
    const [{ count }] = await db.query(`select count(*) as count from comments where userId=${id}`)
    res.status(200).json({ list, count })
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    let body = JSON.stringify(req.body)
    body = JSON.parse(body)
    const { content = '', userId, bookId } = body
    const sqlStr = `
          insert into comments (content,userId,bookId,createTime) 
          values('${content}','${userId}','${bookId}','${moment().format('YYYY-MM-DD HH:MM:SS')}');
      `
    const { insertId } = await db.query(sqlStr)
    const [result] = await db.query(`select * from comments where id='${insertId}'`)
    const [user] = await db.query(`select * from users where id='${userId}'`)
    res.status(201).json({
      result,
      user
    })
  } catch (error) {
    next(error)
  }
}
