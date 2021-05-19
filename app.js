const express = require('express')
const mysql = require('mysql')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const bodyParser = require('body-parser')
const config = require('./config/index')
const cors = require('cors')

const admin = require('./routes/admin')
const home = require('./routes/home')

const app = express()
// 请求体解析中间件
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 配置mysql
const options = {
  port: 3306,
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'ibook'
}

// express-mysql-session 配置
const sessionConnection = mysql.createConnection(options)
const sessionStore = new MySQLStore({
  expiration: 10800000,
  createDatabaseTable: true, // 是否创建表
  schema: {
    tableName: 'session_tab', // 表名
    columnNames: { // 列选项
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, sessionConnection)

app.use(session({
  key: 'aid',
  secret: 'keyboard cat',
  store: sessionStore,
  resave: false,
  saveUninitialized: true,
  cookie: ('name', 'value', {
    maxAge: 5 * 60 * 1000,
    secure: false,
    name: 'seName',
    resave: false
  })
}))

app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:8081', 'http://127.0.0.1:8081'], // 指定接收的地址
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], // 指定接收的请求类型
  alloweHeaders: ['Content-Type', 'Authorization'], // 指定header
  credentials: true
}))

app.use('/uploads', express.static('./uploads'))
app.use('/static', express.static('./static'))

app.use('/', home)
app.use('/admin', admin)

app.listen(config.port, () => {
  console.log('server is running... ')
  console.log('http://127.0.0.1:4000')
})
