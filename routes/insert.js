var express = require('express');
var router = express.Router();
var Spider = require("../models/spider")
var Book = require("../models/book")



// 获取书籍数据
router.post("/bookInfo",function(req,res){
	var isbn = req.body.isbn

	Book.findBooksByISBN(isbn,function(err,row){
		if (err) {
			console.log(err)			
			return
		}
		// row 是一个对象数组。若无查找结果, 返回 空数组 []
		// 系统中没有该数据,调用爬虫
		if (row.length == 0) {
			console.log("try to find info from internet")
			Spider.search(isbn,function(info){
				// from 字段。表示来自网络，需要写数据库
				res.send({info:info,from:0})
			})
			// console.log("spider info:",info)
			// res.send({info:Spider.search(isbn)})
		}else{
			console.log("find book in DB")
			res.send({info:row[0],from:1})
		}
	})
})


// 入库操作
router.post("/",function(req,res){
	var info = req.body;

	console.log("入库数据 ： ",info)
	// 数据来自数据库
	if (info.from == 1) {
		// 若book_id 为 '' 或 undefined 等不合法参数
		if(!info.book_id){
			info.book_id = 0
		}
		Book.updateBookInfo(info,function(err,rows){
			if (err || rows.affectedRows == 0) {
				console.log("updateBookInfo result: ",err,rows)
				res.send({code:0,msg:"入库失败"})
			}
			else{
				res.send({code:1,msg:"入库成功"})
			}
		})
	}
	// 数据来自网络，数据库中不存在，需要插入
	else{
		Book.addBookInfo(info,function(err,succ){
			if (succ) {
				res.send({code:1,msg:"入库成功"})
			}else{
				res.send({code:0,msg:"入库失败"})
			}
		});
	}
})



/* 检测是否有该书 */
router.post("/checkBookID",function(req,res){
	// 传来的书号
	var id = req.body.book_id;
	// console.log("in checkBookID , id  :" , id)

	// 返回该书是否存在
	Book.findBookID(id,function(exist){
		res.send({exist:exist})
	})
})


/* 获取当前所有可用 book_id */
router.post("/bookIDList",function(req,res){
	Book.getBookID(function(err,rows){
		if (err) {
			console.log("bookIDList err : ",err)
			res.send({err:true})
		}
		res.send(rows)
	})
})

module.exports = router;