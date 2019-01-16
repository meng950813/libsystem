var db=require('./dbhelper');

//book类
var Book = {}


//根据书名信息查找
Book.findBooksByTitle=function(book_title,callback){
	var sql = `SELECT * FROM book_info WHERE title LIKE '%${book_title}%' `;

	db.exec(sql,[],function(err,rows){
		if(err){
			return callback(err);
		}

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
		
		// console.log("book findBooks: start : ",start);
		// console.log(rows);

		//rows是一个对象数组
		callback(err,rows);
	});
};

//根据 book_id 查找书籍
Book.findBookByID = function(id,callback){
	var sql = "SELECT book_info.* FROM book_info,book_list WHERE book_id = ? and book_list.ISBN = book_info.isbn";
	db.exec(sql,[id],function(err,rows){
		if(err){
			return callback(err);
		}
		
		//rows是一个对象数组
		return callback(err,rows);
	});
};

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

// 获取图书数量
Book.getTotal = function(callback){
	//图书总量
	var sql = "SELECT count(*) as total from book_list"
	db.exec(sql,[],function(err,row){
		if (err) {
			console.log("book.js getTotal : ",err)
			return callback(err)
		}
		// console.log(row,row[0])
		sql = "SELECT count(*) as typeTotal from book_info"
		db.exec(sql,[],function(err,rows){
			if (err) {
				console.log("book.js getTotal : ",err)
				return callback(err)
			}
			var back = {total:row[0].total,typeTotal:rows[0].typeTotal}

			return callback(err,back)
		})
	})
}


// 插入新书--数据库中没有
Book.addBookInfo = function(info,callback){
	console.log("in addBookInfo")
	var sql = "insert into book_info(isbn,title,subtitle,author,publisher,cover_img,summary,pubdate) value(?,?,?,?,?,?,?,?)";
		
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

// 添加新书 -- 数据库中已有,修改数量
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