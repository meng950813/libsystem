var express = require('express');
var router = express.Router();

var Reader=require('../models/reader');


router.post("/getReader",function(req,res){
	// console.log("in getReader")
	var readerId = req.body.reader_id
	// console.log(readerId)
	Reader.findReader(readerId,function(err,row){
		if (err) {
			console.log("index.js getReader error ",err)
			res.send({msg:"something worng in check"})
		}else{
			var msg,code = 1;
			// 查找到数据
			if (row[0]) {
				msg = row[0].reader_name
			}
			else{
				msg = "学号有误，查无此人"
				code = 0
			}
			res.send({msg:msg,code:code})
		}
	})
})

module.exports = router;
