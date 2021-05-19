const db = require('../../models/db')
const mysql = require('mysql')

exports.list = async (req, res, next) => {
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
    const sqlStr = `
            select * from books order by CAST(id as SIGNED) desc limit ${start},${_limit}
        `
    const books = await db.query(sqlStr)
    // 查询得到总记录数
    const [{ count }] = await db.query('select count(*) as count from books')

    res.status(200).json({ books, count })
  } catch (err) {
    next(err)
  }
}

exports.one = async (req, res, next) => {
  try {
    const { id } = req.params
    const sqlStr = `SELECT * FROM books WHERE id=${mysql.escape(id)}`
    const [book] = await db.query(sqlStr)
    res.status(200).json(book)
  } catch (err) {
    next(err)
  }
}

// 搜索书籍
exports.search = async (req, res, next) => {
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
    let body = JSON.stringify(req.body)
    body = JSON.parse(body)
    const { query } = body
    const sqlStr = `
    select * from books where bookName like '%${query}%' order by CAST(id as SIGNED) desc limit ${start},${_limit}
        `
    const books = await db.query(sqlStr)

    // 查询得到总记录数
    const [{ count }] = await db.query(`select count(*) as count from books where bookName like '%${query}%'`)
    res.status(200).json({ books, count })
  } catch (err) {
    next(err)
  }
}
