var db = require('./dbhelper');

var Reader = {};
module.exports = Reader;

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