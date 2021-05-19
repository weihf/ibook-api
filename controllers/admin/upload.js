const multer = require('multer')
const file = multer().single('file')

exports.uploadBookImg = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/bookImg')
    },
    filename: function (req, file, cb) {
      const changedName = (new Date().getTime()) + '-' + file.originalname
      cb(null, changedName)
    }
  })
})

exports.uploadImg = (req, res, next) => {
  file(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status.json({
        code: 1,
        message: '上传图片失败！'
      })
    } else if (err) {
      res.status.json({
        code: 1,
        message: '未知异常，上传图片失败！'
      })
    }
    res.status(201).json({
      code: 0,
      message: '上传图片成功！',
      data: {
        originalname: req.file.originalname,
        path: req.file.path
      }
    })
  })
}
