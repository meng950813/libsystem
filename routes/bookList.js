var express = require('express');
var router = express.Router();
// var User=require('../models/user');
var Book=require('../models/book');
// var Borrow=require('../models/borrow');


// 获取取书图书信息
router.post("/getInfo",function(req,res){
	var parm = (req.body.page-1) * 60
	// 找所有书
	var fun = Book.findAllBooks;

	// 按isbn查询
	if (req.body.isbn) {
		fun = Book.findBooksByISBN
		parm = req.body.isbn
	}

	fun(parm,function(err,rows){
		if (err) {
			console.log("bookList.js getInfo : ",err)
			res.send({err:true})
		}

		res.send(rows)
	})
})


// 获取图书数额
router.post("/getTotal",function(req,res){
	Book.getTotal(function(err,row){
		if (err) {
			console.log("in bookList.js getTotal: ", err)
			res.send({total:null})
		}
		console.log("getTotal",row)
		res.send({total:row.total,typeTotal:row.typeTotal})
	})
})

module.exports = router;