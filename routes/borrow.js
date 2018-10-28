var express = require('express');
var router = express.Router();
// var User=require('../models/user');
var Book=require('../models/book');
var Borrow=require('../models/borrow');


//提交借书请求
router.post('/',function(req,res){
	var readerId=req.body.readerId;// 学号
	var book_id = req.body.book_id;//书号

	console.log("post borrow :  "+readerId+"   "+book_id);
	Borrow.save(readerId,book_id,function(err,row){
		if (err) { 
			console.log("in router borrow.js ,save has wrong : ",err)
			// console.log()
			res.send({msg:"借书失败 "+err,code:0})
		}
		var msg = "借书成功",code = 1
		// 影响行数为0 => 插入失败
		if (row.affectedRows == 0) {
			msg = "借书失败"
			code = 0
		}
		res.send({msg:msg,code:code})
	});
});

// 获取书籍数据
router.post("/bookInfo",function(req,res){
	var isbn = req.body.isbn

	Book.findBooksByISBN(isbn,function(err,rows){
		if (err) {
			console.log("in router borrow.js get bookInfo ")
			console.log(err)
			res.send({book_info:{},book_list:{}})
		}
		// console.log("rows : ",rows)
		Book.findBookStatus(isbn,function(err,result){
			if (err) {
				console.log("err in router borrow.js, findBookStatus ")
				res.send({book_info:{},book_list:{}})
			}
			res.send({book_info:JSON.stringify(rows),book_list:JSON.stringify(result)})
		})
	})
})



// 提交还书请求
router.post("/return",function(req,res){
	// console.log("this is return_borrow ")
	// console.log(req.body)
	var book_id = req.body.id;

	Borrow.returnBook(book_id,function(err,rows){
		if (err) {
			console.log("index.js return_borrow  " , err)
			res.send({msg:"something wrong when return : "+ err})
		}
		var msg = "还书成功";
		if (0 == rows.affectedRows) {
			msg = "还书失败，原因未知"
		}

		res.send({msg:msg})
	})
});

// 提交续借请求
router.post("/renew",function(req,res){
	
	var bor_id = req.body.id;
	
	// console.log("this is 提交续借请求 , bor_id = "+bor_id)

	Borrow.renew(bor_id,function(err,rows){
		if (err) {
			console.log("index.js  renew_borrow  " + err)
			res.send({msg:"something wrong when renew , "+ err}) 
		}
		var msg = "续借成功"
		if ( 0 == rows.affectedRows) {
			msg = "续借失败"
		}
		res.send({msg:msg})
	})
})



// 获取数据
router.post("/historyInfo",function(req,res){
	/*
		类型： 0:未还;  1： 已还; 2: 续借一次; 3：遗失
		默认 : 0
	*/
	var parm = req.body.type;
	var fun = Borrow.findHistoryByType;
	// 若有isbn传入 ： 表示以isbn查找
	if (req.body.isbn) {
		parm = req.body.isbn;
		// 若长度小于10  ==> 传入book_id
		if (parm.toString().length < 10) {
			fun = Borrow.findHistoryByBookID
		}
		else{
			fun = Borrow.findHistoryByISBN;
		}
	}

	fun(parm,function(err,info){
		if (err) {
			console.log("in borbook.js post historyInfo : ", err)
			return
		}

		info.forEach(function(item){
			item.outDate = fmtDate(item.outDate);
			item.inDate = fmtDate(item.inDate);
		})

		// console.log("historyInfo : ",info)
		res.send(info)
	})
})

module.exports = router;


function fmtDate(obj){
	if (!obj) 
		return null
    var date =  new Date(obj);
    var y = 1900+date.getYear();
    var m = "0"+(date.getMonth()+1);
    var d = "0"+date.getDate();
    return y+"-"+m.substring(m.length-2,m.length)+"-"+d.substring(d.length-2,d.length);
}