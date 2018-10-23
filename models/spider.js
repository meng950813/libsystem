/* 根据图书isbn爬取图书信息 */
var request = require('request');
var fs = require('fs')
var path = require('path')
var Spider_tsinghua = require('./spider_tsinghua')



var Spider = {}
module.exports = Spider;


Spider.downloadImg = function(isbn,info,callback){
	// info.isbn = isbn
	// info.cover_img = "default.jpg"
	// return callback(info)
	
	console.log("downloadImg :", info.image)
	// xxx.jpg
	var imgName = isbn+".jpg"
	var dir = "public/images/"

	fs.exists(dir,function(exists){
		// 文件夹不存在 -->  创建文件夹
		if (!exists) {
			fs.mkdir(dir)
		}

		img_path = dir + imgName
		info.isbn = isbn
		info.cover_img = imgName
		request(info.image).pipe(fs.createWriteStream(img_path))
		
		// console.log("after downloadImg : ",info)
		return  callback(info)
	});
}


/* 通过isbn到豆瓣图书搜索，获取图书内容包括：书名，作者，出版社，副标题，封面图片 */
Spider.search = function(isbn,callback){
	// console.log("in Spider search")
	search_url = "https://api.douban.com/v2/book/isbn/"+isbn
	// 通过 GET 请求来读取内容
	request(search_url, function (error, response, body) {

	  	if (!error && response.statusCode == 200) {
	    	console.log("success spider data");

	    	var info = JSON.parse(body)

			Spider.downloadImg(isbn,info,function(info){
				return callback(info)
			})

	  	}
	  	else{
	  		console.log("spider.js search")
	  		// console.error(error)

	  		Spider_tsinghua.search(isbn,function(info){
	  			return callback(info)
	  		})
	  	}
	});
}


// Spider.search("9787111607083")


// {"subtitle":"时代三部曲","author":["王小波"],
// "pubdate":"1999-3",
// "image":"https://img3.doubanio.com\/view\/subject\/m\/public\/s1076372.jpg",

// "publisher":"花城出版社",
// "title":"黄金时代",
// "summary":"《黄金时代》是《时代三部曲》之一。  这是以文革时期为背景的系列作品构成的长篇。发生“文化大革命”的二十世纪六七十年代，正是我们国家和民族的灾难年代。那时，知识分子群体无能为力而极“左”政治泛滥横行。作为倍受歧视的知识分子，往往丧失了自我意志和个人尊严。在这组系列作品里面，名叫“王二”的男主人公处于恐怖和荒谬的环境，遭到各种不公正待遇，但他却摆脱了传统文化人的悲愤心态，创造出一种反抗和超越的方式：既然不能证明自己无辜，便倾向于证明自己不无辜。于是他以性爱作为对抗外部世界的最后据点，将性爱表现得既放浪形骸又纯",
