var express = require('express');
var router = express.Router();

var MailSender=require('./sendemail');

//跳转借书页
router.get('/',function(req,res){
	// res.redirect('/index');
	res.redirect('/borrow');
});

router.get('/index',function(req,res){
	

	res.redirect('/borrow');
});

//进入借书页面
router.get('/borrow',function(req,res,next){
	MailSender.checkout()
	var isbn = req.query.isbn
	// 若无isbn传入
	if(!isbn) {
		isbn = 0
	}
	res.render('borrow',{
		title:'图书借阅',
		arr:[{borrow:'active',history:'',reserve:'',lib:'',new:'',imp:''}],
		isbn:isbn
 	});
});

//进入借阅历史页面
router.get('/history',function(req,res,next){
	res.render('history',{
		title:'借阅历史',
		arr:[{borrow:'',history:'active',reserve:'',lib:'',new:'',imp:''}]
 	});
});



//跳转预约界面
router.get('/reserve',function(req,res,next){
	
	res.render('reserve',{
		title:'预约列表',
		arr:[{borrow:'',history:'',reserve:'active',lib:'',new:'',imp:''}],
		
	});
});


/* 图书列表 */
router.get("/list",function(req,res){
	res.render("bookList",{
		title:"图书列表",
		arr:[{borrow:'',history:'',reserve:'',lib:'active',new:'',imp:''}],
	})
})


// 新书入库
router.get("/insert",function(req,res) {
	res.render("addBook",{
		title:"新书入库",
		arr:[{borrow:'',history:'',reserve:'',lib:'',new:'active',imp:''}],
	})
})


// 读者管理
router.get("/reader",function(req,res){
	// res.render("",{
		// title:"读者管理",
		// arr:[{borrow:'',history:'',reserve:'',lib:'',new:'',imp:'active'}],
	// })
})


module.exports = router;

