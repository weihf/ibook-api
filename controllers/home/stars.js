const moment = require('moment')
const db = require('../../models/db')
const mysql = require('mysql')

// 获取一本书的所有评分
exports.bookStarslist = async (req, res, next) => {
  try {
    const { id } = req.params
    const sqlStr = `SELECT * FROM stars WHERE bookId=${mysql.escape(id)}`
    const stars = await db.query(sqlStr)
    const averageStarsSqlStr = `SELECT * FROM books WHERE id=${mysql.escape(id)}`
    const [book] = await db.query(averageStarsSqlStr)
    const averageStars = book.star
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
    const books = await db.query(sqlStr)
    const list = []
    for (let i = 0; i < books.length; i++) {
      const [book] = await db.query(`select id,bookName,star from books where id='${books[i].bookId}'`)
      delete books[i].userId
      const obj = {}
      obj.self = books[i]
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
    const result = await db.query(searchSqlStr)
    res.status(200).json({
      isRating: !result.length,
      star: result.length ? Number(result[0].star) : 0,
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
          values('${star}','${userId}','${bookId}','${moment().format('YYYY-MM-DD HH:MM:SS')}');
      `
    const { insertId } = await db.query(sqlStr)
    const starInfo = await db.query(`select * from stars where id='${insertId}'`)

    const avarageStarSqlStr = `
    select * from stars where bookId=${mysql.escape(bookId)}
`
    const avarageStarResult = await db.query(avarageStarSqlStr)

    let avarageStar = 0
    if (avarageStarResult.length > 0) {
      let total = 0
      for (let i = 0; i < avarageStarResult.length; i++) {
        total += (avarageStarResult[i].star)
      }
      avarageStar = (total / avarageStarResult.length).toFixed(1)
      avarageStar = Number(avarageStar)
    }
    const updateStar =
      `update books set star="${avarageStar}" where id="${bookId}";
        `
    await db.query(updateStar)
    res.status(201).json({
      code: 1,
      message: 'Ok',
      starInfo
    })
  } catch (error) {
    next(error)
  }
}
