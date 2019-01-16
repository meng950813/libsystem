var express = require('express');
var router = express.Router();
// var User=require('../models/user');
var Book=require('../models/book');
// var Borrow=require('../models/borrow');


// 获取取书图书信息
router.post("/getInfo",function(req,res){
	/**
	 * 查询参数:
	 * 		当查询全部书时，表示起始的数量
	 * 		按 关键字查询时，表示 isbn/书名
	 */  
	var parm = (req.body.page-1) * 60;
	
	// 找所有书
	var fun = Book.findAllBooks;

	// 按关键字查询
	if (req.body.isbn) {
		parm = req.body.isbn;
		// 按 isbn  查询
		if( /^(\d{10})|(\d{13})$/.test(parm) ){
			fun = Book.findBooksByISBN;
		}
		// 按 book_id 查询
		else if( /^\d{1,4}$/.test(parm) ){
			fun = Book.findBookByID;
		}
		// 按书名查询
		else{
			fun = Book.findBooksByTitle;
		}
	}

	fun(parm,function(err,rows){
		if (err) {
			console.log("bookList.js getInfo : ",err);
			res.send({err:true});
		}

		res.send(rows);
	})
})


// 获取图书数额
router.post("/getTotal",function(req,res){
	Book.getTotal(function(err,row){
		if (err) {
			console.log("in bookList.js getTotal: ", err);
			res.send({total:null});
		}
		console.log("getTotal",row);
		res.send({total:row.total,typeTotal:row.typeTotal});
	})
})

module.exports = router;