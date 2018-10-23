var db=require('./dbhelper');

//book类
var Book = {}


//根据搜索信息查找书
Book.findBooks=function(parm,callback){
	var sql = "SELECT *,count(isbn) as oneTotal FROM book WHERE 1 ";
	// 搜索方式，默认按书名搜索
	var search = " title ";
	// 按作者搜索
	if(parm.searchType == 1) {
		search = " author ";
	}
	// 按出版社搜索
	else if(parm.searchType == 2){
		search = " press "
	}

	if(parm.bookType && parm.bookType != 0){
		sql += (" and type=" + parm.bookType )
	}
	if(parm.content) {
		sql += (" and " + search + " LIKE '%" + parm.content + "%' ");
	}
	sql += " group by isbn;"
	
	console.log("there is book.js Book.findBooks ")
	// console.log(sql)

	db.exec(sql,[],function(err,rows){
		if(err){
			return callback(err);
		}
		// console.log("findBooksByTitle:  ");
		// console.log(rows);

		//rows是一个对象数组
		callback(err,rows);
	});
};


//根据ISBN查找书籍
Book.findBooksByISBN = function(isbn,callback){
	var sql = "SELECT * FROM book_info WHERE isbn = ?";
	db.exec(sql,[isbn],function(err,rows){
		if(err){
			return callback(err);
		}
		
		console.log("book findBooksByList: ");
		// console.log("in book.js",rows);

		//rows是一个对象数组
		return callback(err,rows);
	});
};



// 查找所有书
Book.findAllBooks = function(start,callback){
	var sql = "SELECT * FROM book_info limit ?,60";
	db.exec(sql,[start],function(err,rows){
		if(err){
			return callback(err);
		}
		
		console.log("book findBooks: start : ",start);
		// console.log(rows);

		//rows是一个对象数组
		callback(err,rows);
	});
};


// 获取图书数量
Book.getTotal = function(callback){
	//图书总量
	var sql = "SELECT count(*) as total from book_list"
	db.exec(sql,[],function(err,row){
		if (err) {
			console.log("book.js getTotal : ",err)
			return callback(err)
		}
		return callback(err,row)
	})
}


// 获取所有图书id，以计算可用id
Book.getBookID = function(callback){
	//所有图书id
	var sql = "SELECT book_id as id from book_list"
	db.exec(sql,[],function(err,rows){
		if (err) {
			console.log("book.js getBookID : ",err)
			return callback(err)
		}
		return callback(err,rows)
	})
}


// 插入新书--原本没有
Book.addBookInfo = function(info,callback){
	console.log("in addBookInfo")
	var sql = "insert into book_info(isbn,title,subtitle,author,publisher,cover_img,summary,pubdate) value(?,?,?,?,?,?,?,?)";
	
	// var authors = info.author.join()

	// console.log("addBookInfo , sql is  : ",sql)
	
	var parm = [info.isbn,info.title,info.sub_title,info.author,info.publisher,info.cover_img,info.summary,info.pubdate]
	db.exec(sql,parm,function(err,rows){
		if (err) {
			console.log("book.js addBooks insert error : ",err)
			return callback(err,false)
		}
		// console.log(rows)
		// 插入
		Book.addBookList(info.isbn,info.book_id,function(succ){
			return callback(err,succ)
		})
	})
}

// 添加新书 -- 原本有,修改数量
Book.updateBookInfo = function(info,callback){
	
	// 输入参数: isbn ,book_id
	var sql = "call add_exist_book(?,?)"
	// console.log(sql,info.isbn,info.book_id)
	db.exec(sql,[info.isbn,info.book_id],function(err,rows){
		if(err){
			console.log("book.js updateBookInfo ")
			return callback(err)
		}
		return callback(err,rows)
	})
}	


// 添加isbn与book_id的对应关系，返回 true or false
Book.addBookList = function(isbn,book_id,callback){
	// 若book_id 为 '',0, 或 undefined 等
	if (!book_id) {
		book_id = null
	}
	var sql = "insert into book_list value(?,?,'1')"
	db.exec(sql,[book_id,isbn],function(err,row){
		// return callback(rows)
		if(err){
			console.log("book.js addBookList insert ",err)
			// throw err
			return callback(false)
		}
		// 插入成功
		if (row.affectedRows != 0) 
			return callback(true)
		return callback(false)
	})
}

// 根据book_id 查找书籍，返回 true or false
Book.findBookID = function(book_id,callback){
	if (!book_id) {
		return callback(false)
	}
	var sql = "SELECT * FROM book_list WHERE book_id=?"
	db.exec(sql,[book_id],function(err,row){
		if (err) {
			console.log("book.js findBookID ")
			throw err
		}
		// console.log("findBookID: ", row.length)
		// 有该书
		if (row.length > 0) 
			return callback(true)
		// 查无此书
		return callback(false)
	})
}

// 根据isbn获取该书的借出情况
Book.findBookStatus = function(isbn,callback){
	console.log("in findBookStatus")
	sql = "SELECT * from book_list WHERE ISBN=?";
	db.exec(sql,[isbn],function(err,rows){
		if (err) {
			console.log("error in book.js findBookStatus ")
			return callback(err)
		}
		return callback(err,rows)
	})
}

module.exports=Book;