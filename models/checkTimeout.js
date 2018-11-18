var db=require('./dbhelper')

var TIME = require("../config.js").TIME

//查询需要发送邮件的人员名单
var Checkout = {}

Checkout.check=function(callback) {
    // console.log(TIME)
    // 获取 警告时间 前借书的信息
    var warningDays = new Date().getTime() - TIME.WARINGLINE * TIME.ONEDAY;
    var sql = `SELECT title as book_title,reader_name,email,outDate,inDate 
            from borrow_history
            LEFT JOIN reader
            ON borrow_history.readerID=reader.reader_id
            LEFT JOIN book_list 
            ON borrow_history.bookID=book_list.book_id 
            LEFT JOIN book_info
            on  book_list.ISBN=book_info.isbn
            WHERE (borrow_history.status = 0 and borrow_history.outDate<?) 
            or(borrow_history.status = 2 and borrow_history.inDate<?) 
    `;

    db.exec(sql,[warningDays,warningDays],function(err,rows){
        if (err) {
            console.log(err)
            return callback(err)
        }
        callback(err,rows)
    })
};

module.exports = Checkout;