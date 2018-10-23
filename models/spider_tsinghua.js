/* 根据图书isbn爬取图书信息 */
var request = require('request');
var fs = require('fs')
var path = require('path')

// 从清华出版社获取数据

var Spider_tsinghua = {}
module.exports = Spider_tsinghua;


Spider_tsinghua.downloadImg = function(isbn,info,callback){

	// console.log("downloadImg :", info.image)
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

		console.log("image path ",info.image)
		
		request(info.image).pipe(fs.createWriteStream(img_path))
			
		// console.log("after downloadImg : ",info)
		return  callback(info)
	});
}


/* 通过isbn到清华出版社搜索，获取图书内容包括：书名，作者，出版社，副标题，封面图片 */
Spider_tsinghua.search = function(isbn,callback){
	console.log("in Spider_tsinghua search")

	search_url = `http://www.tup.tsinghua.edu.cn/booksCenter/books_index.html`;

	// 通过 GET 请求首页内容
	request(search_url, function (error, response, body) {
	  	if (!error && response.statusCode == 200) {
	    	// console.log("success Spider_tsinghua data");

	    	// 获取搜索所需参数
	    	body.replace(/&keytm=([\d\w]{14,20})?/i,function(){
	    		// console.log(arguments.length)
	    		console.log(arguments[0]) // like : &keytm=87393C24918C956D
				search_url = `http://www.tup.tsinghua.edu.cn/booksCenter/booklist.html?keyword=${isbn}${arguments[0]}`;
	    		console.log(search_url)
	    		// 进入搜索页 
	    		request(search_url,function(err,response,body){
	    			var notNull = /<ul id="csproduct" class="b_list"><li>/.test(body)
	    			console.log(notNull)
	    			if (!error && response.statusCode == 200 && notNull) {
	    				var info = {subtitle:'',summary:'',publisher:'清华大学出版社',pubdate:''}

	    				// 获取搜索的第一条数据
	    				var book = body.match(/<ul id="csproduct" class="b_list"><li>.*?<\/li>/)[0]
	    				// console.log(book)
	    				
	    				//  得到结果形如 ： src="../xxxxx"
	    				var src = book.match(/src="[^"]*"/)[0]
	    				// 获得图片路径 "../xxx./sdd.jpg
	    				src = src.match(/"[^"]*/)[0]
	    				// 获取完整路径 ： /http://www.tup.tsinghua.edu.cn/upload/smallbookimg/xxx.jpg
	    				info.image = "http://www.tup.tsinghua.edu.cn"+src.substr(3)
	    				// console.log("src :  ",src)
	    				//  得到结果形如 ： title="xxxxx"
	    				var title = book.match(/title="([^"]*)"/)[0]
	    				// 得到  书名 "xxx"
	    				info.title = title.match(/"[^"]*"/)[0]
	    				// console.log("title :  ",title)

	    				// 获取作者名 ，形如 ： "<p>某某某"
	    				var author = book.match(/<p>[^<]*/)[0]
	    				// 去除 p 标签
	    				info.author = author.substr(3)

	    				// console.log("author : ",author)

	    				return Spider_tsinghua.downloadImg(isbn,info,callback)
	    			}
	    			else{
	    				console.log(err)
	    				return callback({})
	    			}
	    		})
	    	})
	  	}
	  	else{
	  		console.log("Spider_tsinghua.js search")
	  		console.error(error)
	  		return callback({})
	  	}
	});
}


// Spider_tsinghua.search("9787302253280")


// {"subtitle":"时代三部曲","author":["王小波"],
// "pubdate":"1999-3",
// "image":"https://img3.doubanio.com\/view\/subject\/m\/public\/s1076372.jpg",

// "publisher":"花城出版社",
// "title":"黄金时代",
// "summary":"《黄金时代》是《时代三部曲》之一。  这是以文革时期为背景的系列作品构成的长篇。发生“文化大革命”的二十世纪六七十年代，正是我们国家和民族的灾难年代。那时，知识分子群体无能为力而极“左”政治泛滥横行。作为倍受歧视的知识分子，往往丧失了自我意志和个人尊严。在这组系列作品里面，名叫“王二”的男主人公处于恐怖和荒谬的环境，遭到各种不公正待遇，但他却摆脱了传统文化人的悲愤心态，创造出一种反抗和超越的方式：既然不能证明自己无辜，便倾向于证明自己不无辜。于是他以性爱作为对抗外部世界的最后据点，将性爱表现得既放浪形骸又纯",
