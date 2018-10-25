var db = require('./dbhelper');

var Reader = {};
module.exports = Reader;


/* 添加读者信息 */
Reader.insertReader = function(info,callback){
	var sql = "insert into reader values "
	for (var i = 0; i < info.length; i++) {
		sql += `(${info[i].reader_id},${info[i].reader_name},${info[i].college_name},${info[i].year})`
		if (i+1 < info.length) {
			sql += ","
		}
	}

	db.exec(sql,[],function(err,rows){
		if (err) {
			console.log("DB reader.js insertReader")
			return callback(err)
		}
		return callback(rows)
	})

}

// 获取全部读者信息
Reader.findAllReader = function(year,callback){
	var sql = "SELECT * from reader"
	if (0 != year) {
		sql += " WHERE year = " + year
	}
	db.exec(sql,[],function(err,rows){
		if (err) {
			console.log("DB reader.js findAllReader")
			return callback(err)
		}
		return callback(err,rows)
	})
}

// 删除读者信息
// 不想写

// 修改读者信息
Reader.modifyReader = function(info,callback){
	var sql="update reader set reader_name=?,college_name=?,year=? WHERE reader_id=?"
	db.exec(sql,[info.reader_name,info.college_name,info.year,info.reader_id],function(err,row){
		if (err) {
			console.log("DB reader.js modifyReader")
			return callback(err)
		}
		return callback(err,row)
	})
}


/* 通过学号查询姓名 */
Reader.findReader = function(readerId,callback){
	var sql = "SELECT reader_name from reader WHERE reader_id =?"
	db.exec(sql,[readerId],function(err,row){
		if (err) {
			return callback(err)
		}
		return callback(err,row)
	})
}