const db = require('../../models/db')
const mysql = require('mysql')
const moment = require('moment')

exports.list = async (req, res, next) => {
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
      select * from books order by CAST(id as SIGNED) desc limit ${start},${_limit}
    `
    const sqlListCountStr = 'select count(*) as count from books'
    // 获取搜索分页列表数据
    const sqlSearchStr = `
      select * from books where ${_search.item} like '${_search.value}' order by CAST(id as SIGNED) desc limit ${start},${_limit}
    `
    const sqlSearchCountStr = `
      select count(*) as count from books where ${_search.item} like '${_search.value}' order by CAST(id as SIGNED) desc limit ${start},${_limit}
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

    const books = await db.query(sqlStr)

    // 查询得到总记录数
    const [{ count }] = await db.query(sqlCountStr)
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

exports.create = async (req, res, next) => {
  try {
    // 如果用户未登录，则不允许创建话题
    const { user } = req.session
    if (!user) {
      return res.status(401).json({
        err: 'Unauthorized'
      })
    }

    let body = JSON.stringify(req.body)
    body = JSON.parse(body)
    body.userId = user.id
    const publishTime = moment(body.publishTime.toString()).format('YYYY')
    const sqlStr = `
        insert into books (managerId,bookName,bookImg,author,publishers,publishTime,pages,price,bindings,ISBN,contentIntroduction,authorIntroduction,catalogue,star) 
        values (
            ${mysql.escape(body.managerId)},
            ${mysql.escape(body.bookName)},
            ${mysql.escape(body.bookImg)},
            ${mysql.escape(body.author)},
            ${mysql.escape(body.publishers)},
            ${mysql.escape(publishTime)},
            ${mysql.escape(body.pages)},
            ${mysql.escape(body.price)},
            ${mysql.escape(body.bindings)},
            ${mysql.escape(body.ISBN)},
            ${mysql.escape(body.contentIntroduction)},
            ${mysql.escape(body.authorIntroduction)},
            ${mysql.escape(body.catalogue)},
            ${mysql.escape(Number(0))}
          )
        `
    const ret = await db.query(sqlStr)
    const [book] = await db.query(`select * from books where id=${mysql.escape(ret.insertId)}`)
    res.status(201).json(book)
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    let body = JSON.stringify(req.body)
    body = JSON.parse(body)
    const { id } = req.params
    const publishTime = moment(body.publishTime.toString()).format('YYYY')
    const sqlStr = `
            update books set 
            managerId=${mysql.escape(body.managerId)},
            bookName=${mysql.escape(body.bookName)},
            bookImg=${mysql.escape(body.bookImg)},
            author=${mysql.escape(body.author)},
            publishers=${mysql.escape(body.publishers)},
            publishTime=${mysql.escape(publishTime)},
            pages=${mysql.escape(body.pages)},
            price=${mysql.escape(body.price)},
            bindings=${mysql.escape(body.bindings)},
            ISBN=${mysql.escape(body.ISBN)},
            contentIntroduction=${mysql.escape(body.contentIntroduction)},
            authorIntroduction=${mysql.escape(body.authorIntroduction)},
            catalogue=${mysql.escape(body.catalogue)},
            star=${mysql.escape(Number(body.star))}
            where id=${mysql.escape(id)};
        `
    await db.query(sqlStr)
    console.log(req.params)
    const ress = await db.query(`select * from books where id=${mysql.escape(id)}`)
    res.status(201).json(ress)
  } catch (error) {
    next(error)
  }
}

exports.destroy = async (req, res, next) => {
  // get 查询字符串 req.query
  // post post 请求体 req.body
  // 动态路径参数 req.params
  try {
    const { id } = req.params

    // 执行删除操作
    await db.query(`delete from books where id=${mysql.escape(id)};`)

    // 响应成功
    res.status(201).json({})
  } catch (error) {
    next(error)
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
