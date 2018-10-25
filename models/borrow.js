var db = require('./dbhelper');

var Borrow = {};
module.exports = Borrow;

//保存借书记录
Borrow.save = function(readerId, book_id, callback) {

	var sql = "call book_borrow(?,?,?)";
	var time = (new Date()).getTime();
	// console.log("借书时间 ： "+time);
	db.exec(sql,[book_id,readerId,time],function(err,rows){
		if(err){
			return callback(err);
		}
		return callback(err,rows)
	})
};


// 查询借阅情况
// type:  1：已还  其他 : 未还
Borrow.findHistoryByType=function(type,callback){
	// var sql = "SELECT *,borrow_history.status,reader_id as uid from borrow_history,book,reader WHERE bookID = book_id and readerID = reader_id ";
	var sql = "SELECT borrow_history.*,reader_name,book_info.isbn,title from borrow_history,reader,book_info,book_list WHERE bookID=book_id and book_info.isbn=book_list.ISBN and readerID=reader_id";
	// 有类型参数输入 -> 非全部数据
	if(type!= undefined && type != -1){
		// console.log("borrow.js findHistory type = "+type)
		// 已还之书
		if (1 == type) {
			sql += " and borrow_history.status = 1  ORDER BY inDate DESC";
		}
		// 未还之书
		else{
			sql += " and borrow_history.status != 1  ORDER BY outDate DESC, inDate DESC";
		}
	}else{
		sql += " ORDER BY borrow_history.status,outDate DESC";
	}

	console.log("this is borrow.js  Borrow.findHistory")
	// console.log(sql)
	// console.log(parm)

	db.exec(sql,[],function(err,rows){
		if(err){
			console.log("borrow.js   findHistoryByType ", err)
			return callback(err);
		}
		return callback(err,rows);
	});
}

Borrow.findHistoryByISBN=function(isbn,callback){
	var sql = `SELECT borrow_history.*,reader_name,book_info.isbn,title 
				from borrow_history,reader,book_info,book_list 
				WHERE bookID=book_id and book_info.isbn=book_list.ISBN and readerID=reader_id 
				and borrow_history.status != '1' and book_list.ISBN=?`;
	db.exec(sql,[isbn],function(err,rows){
		if (err) {
			console.log("borrow.js findHistoryByISBN : ",err)
			return callback(err)
		}
		return callback(err,rows)
	})
}

//还书
Borrow.returnBook=function(book_id,callback){
	// 参数： book_id,time
	var sql = "call book_return(?,?)";

	db.exec(sql,[book_id,(new Date()).valueOf()],function(err,rows){
		// console.log("this is return book query,and sql = "+sql)
		if(err){
			console.log("borrow.js  Borrow.returnBook query error")
			return callback(err);
		}
		return callback(err,rows);
	});
};

//续借
Borrow.renew=function(bor_id,callback){
	
	// bor_id,time
	var sql = "call book_rebo(?,?)";
	db.exec(sql,[bor_id,new Date().valueOf()],function(err,rows){
		if(err){
			console.log("borrow.js  renew query error")
			return callback(err);
		}
		return callback(err,rows);
	});	
};


