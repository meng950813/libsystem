var express = require('express');
var router = express.Router();
// var User=require('../models/user');
var Book=require('../models/book');
var Borrow=require('../models/borrow');


/*//发送预约请求
router.post('/order',function(req,res,next){
	var readerId=req.body.readerId;// 学号
	var book_list = req.body.isbn;//书号


	Order.save(readerId,book_list,function(err,result = 0){
		if (err) {
			return next(err);
		}

		var msg = ["预约失败：查无此人", "预约成功","有书，约个篮子","重复预约"]
		res.render('result',{
			title:'预约结果',
			arr : [{sch:'',lib:'',abt:'active',new:'',imp:''}],
			msg : msg[result]
		});
	});
});

// 取消预约
router.post('/cancel',function(req,res,next){
	// console.log("this is post cancel aim")
	var res_id = req.body.id; // 预约编号

	Order.cancel(res_id,function(err){
		if (err) {
			return next(err);
		}
		res.render("result",{
			title : "取消预约",
			arr : [{sch:'',lib:'',abt:'active',new:'',imp:''}],
			msg : "取消成功"
		});
	});
});
*/
module.exports = router;
