const moment = require('moment')
const db = require('../../models/db')
const mysql = require('mysql')

// 获取一本书的所有评分
exports.bookStarslist = async (req, res, next) => {
  try {
    const { id } = req.params
    const sqlStr = `SELECT * FROM stars WHERE bookId=${mysql.escape(id)}`
    const stars = await db.query(sqlStr)
    let total = 0
    for (let i = 0; i < stars.length; i++) {
      total += parseInt(stars[i].star)
    }
    const averageStars = (stars.length > 4) ? (total / stars.length).toFixed(1) : 0.0
    res.status(200).json({
      stars,
      averageStars
    })
  } catch (err) {
    next(err)
  }
}

// 获取一个用户的所有评分
exports.userStarslist = async (req, res, next) => {
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
            select * from stars where userId=${id} order by CAST(id as SIGNED) desc limit ${start},${_limit}
        `
    const results = await db.query(sqlStr)
    const list = []
    for (let i = 0; i < results.length; i++) {
      const [book] = await db.query(`select id,bookImg,bookName from books where id='${results[i].bookId}'`)
      delete results[i].userId
      const obj = {}
      obj.self = results[i]
      delete obj.self.bookId
      obj.book = book
      list.push(obj)
    }

    // 查询得到总记录数
    const [{ count }] = await db.query(`select count(*) as count from stars where userId=${id}`)
    res.status(200).json({ list, count })
  } catch (err) {
    next(err)
  }
}

// 查询某个用户是否评价过某本书籍
exports.isRating = async (req, res, next) => {
  try {
    const { userId, bookId } = req.params
    const searchSqlStr = `SELECT * FROM stars WHERE
    userId=${mysql.escape(userId)} and bookId=${mysql.escape(bookId)}`
    const rating = await db.query(searchSqlStr)
    res.status(200).json({
      rating: rating,
      messsage: 'OK'
    })
  } catch (err) {
    next(err)
  }
}

// 发表评价
exports.create = async (req, res, next) => {
  try {
    let body = JSON.stringify(req.body)
    body = JSON.parse(body)
    const { star = '', userId, bookId } = body

    // 查询是否已经评价过
    const querySqlStr = `
    select * from stars where userId = ${userId} and bookId = ${bookId};
`
    const result = await db.query(querySqlStr)
    if (result.length > 1) {
      res.status(200).json({
        message: '不能重复评价！'
      })
      return
    }
    const sqlStr = `
          insert into stars (star,userId,bookId,createTime) 
          values('${star}','${userId}','${bookId}','${moment().format('YYYY-MM-DD hh:mm:ss')}');
      `
    const { insertId } = await db.query(sqlStr)
    const starInfo = await db.query(`select * from stars where id='${insertId}'`)
    res.status(201).json({
      code: 1,
      message: 'Ok',
      starInfo
    })
  } catch (error) {
    next(error)
  }
}
