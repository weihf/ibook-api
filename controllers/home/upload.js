const db = require('../../models/db')
const mysql = require('mysql')

const multer = require('multer')

exports.uploadAvator = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/avator')
    },
    filename: function (req, file, cb) {
      const changedName = (new Date().getTime()) + '-' + file.originalname
      cb(null, changedName)
    }
  })
})

exports.uploadImg = async (req, res, next) => {
  try {
    let body = JSON.stringify(req.body)
    body = JSON.parse(body)
    const sqlStr = `
            update users set
            avator=${mysql.escape('http://127.0.0.1:4000/' + req.file.path)}
            where id=${mysql.escape(body.id)};
        `
    await db.query(sqlStr)
    const [updatedUser] = await db.query(`select * from users where id=${mysql.escape(body.id)}`)
    res.json({
      code: 201,
      message: '上传图片成功！',
      data: {
        originalname: req.file.originalname,
        path: updatedUser.avator
      }
    })
  } catch (error) {
    console.log(error)
  }
}
