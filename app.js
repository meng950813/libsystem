var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var flash = require('connect-flash');



var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var routes=require('./routes/index');
var insert=require('./routes/insert');
var borrow=require('./routes/borrow');
var list=require('./routes/bookList');
var reader=require('./routes/reader');

var sendmail = require("./routes/sendEmail")

var app = express();

// 模板引擎设置
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
  defaultLayout:'layout',
  partialsDir:[//设置partialsdir
    'views/partials/'
  ]
}));
app.set('view engine', 'handlebars');

// 设置网站的图标
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//配置session,passpord必要的中间件
app.use(session({
    secret: 'secret',//加密字符串
    resave: true,
    saveUninitialized: true
}));

// Passport init 身份验证模块passport初始化
app.use(passport.initialize());
app.use(passport.session());

//网站信息寄存器
app.use(flash());

app.use(function(req,res,next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.user || null;
  next();
});

app.use('/',routes);
app.use('/insert',insert);
app.use('/borrow',borrow);
app.use('/list',list);
app.use('/reader',reader);

// 捕获404并定向到错误处理
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 错误的统一处理

// 开发环境的错误处理
// 会打印出堆栈信息
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// 生产环境下的错误处理
// 不会向用户输出堆栈信息
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

// 定时器插件，引入定时任务
var schedule = require('node-schedule');

(function(){
  /*
  * * * * * *
  ┬ ┬ ┬ ┬ ┬ ┬
  │ │ │ │ │ |
  │ │ │ │ │ └ day of week (0 - 7) (0 or 7 is Sun)
  │ │ │ │ └───── month (1 - 12)
  │ │ │ └────────── day of month (1 - 31)
  │ │ └─────────────── hour (0 - 23)
  │ └──────────────────── minute (0 - 59)
  └───────────────────────── second (0 - 59, OPTIONAL)

  每分钟的第30秒触发： '30 * * * * *'

  每小时的1分30秒触发 ：'30 1 * * * *'

  每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'

  每月的1日1点1分30秒触发 ：'30 1 1 1 * *'

  2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'

  每周1的1点1分30秒触发 ：'30 1 1 * * 1'
  */

  // 设置为每天 10 点执行
  schedule.scheduleJob('0 0 12 * * *', function(){

    console.log("checkout send email")

    // 检查需要给哪些人发邮件
    sendmail.checkout()
  }); 
}())