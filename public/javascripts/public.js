// 手工操作
$(document).ready(function() {
	$("#manual-input").click(function(){
		$("input").removeAttr("readonly")
		$("textarea").removeAttr("readonly")
	})
})


/*
原理： 
扫码枪扫描到的条形码每一位会触发一次onkeydown事件 
比如扫描条码位‘1234567890’的条形码，会连续执行10次onkeydown事件
条码扫描到最后一位，会直接触发Enter

思路：

1.注册onkeydown事件，捕获数字键的按下事件

2.计算按下数字键的时间间隔，若间隔小于30毫秒，则为扫码枪输入

3.捕获Enter案件的按下事件，判断捕获的扫码枪输入数值是否为空，不为空，
对相应的文本框赋值，同时触发按找条形码查找商品的方法
*/
window.onload = function(e){
    var code = "";
    var lastTime,nextTime;
    var lastCode,nextCode;

    document.onkeypress = function(e) {
        nextCode = e.which;
        nextTime = new Date().getTime();

        if(lastCode != null && lastTime != null && nextTime - lastTime <= 30) {
            code += String.fromCharCode(lastCode);
        } else if(lastCode != null && lastTime != null && nextTime - lastTime > 100){
            code = "";
        }

        lastCode = nextCode;
        lastTime = nextTime;

    }

    this.onkeypress = function(e){
        if(e.which == 13){
            // console.log("onkeypress : ",code);
            $("#isbn").val(code)
            var info = getUrl()
            getBookInfoBYISBN(code,info.url,info.type)
        }
    }


    // 隐藏弹出窗
	$("#quit").on("click",function(){
		// console.log("quit")
		$("#myModal").hide()
	})

}

/* 扫码获取书籍信息， 
tyep :
1： 新书入库 	=> url : /insert/bookInfo
2： 借书 		=> url : /borrow/bookInfo
3： 还书 		=> url : /borrow/historyInfo
4:  获取图书信息 => url : /list/getInfo
*/
function getBookInfoBYISBN(isbn,url,type){
	$.ajax({
		type:"post",
		url:url,
		data:{isbn:isbn},
		success:function(data,status){
			// console.log("success got data : ",data)
			// 新书入库数据的处理
			if (1 == type) {
				addBook(data)
			}
			// 借书数据的处理
			else if(2 == type){
				borrowBook(data)		
			}
			// 借阅历史数据的处理
			else if (3 == type) {
				fillHistoryInfo(data)
			}
			// 获取图书信息
			else if (4 == type) {
				fillBookList(data)
			}
		},
		error:function(err){
			console.log("ajax error : ",err)
		}
	})
}


function getUrl(){
	// 新书入库
	if ($("#check_bookID").length != 0) {
		// console.log("check_bookID")
		return {type:1,url:"/insert/bookInfo"}
	}
	// 借书
	else if ($("#bookID_list").length != 0) {
		// console.log("bookID_list")
		return {type:2,url:'/borrow/bookInfo'}
	}
	// 还书
	else if($("#list-table").length != 0){
		// console.log("history list-table")
		return {type:3,url:"/borrow/historyInfo"}
	}
	// 查书
	else if($("#book-list").length != 0){
		// console.log("list  book-list")
		return {type:4,url:"/list/getInfo"}
	}
}

function addBook(data){
	// console.log("addBook")
	// 数据为空
	if ("{}" == JSON.stringify(data.info)) {
		showModal("查无此书,请检查isbn")
	}
	else{
		fillBookInfo(data.info)
	}
	console.log("set from to ", data.from)
	$("#datafrom").val(data.from)
}

function borrowBook(data){
	console.log("borrowBook")
	// 查询结果为空 -->{} 
	data.book_info = JSON.parse(data.book_info)
	if (0 == data.book_info.length) {
		showModal("查无此书,请检查isbn")
	}
	else{
		fillBookInfo(data.book_info[0])
		fillBookList(JSON.parse(data.book_list))
	}	
}



// 显示弹出窗
function showModal(msg){
	$("#myModalLabel").html(msg)
	$("#myModal").show()
}

/* 填充书籍信息 */
function fillBookInfo(book_info){
	console.log("fillBookInfo")
	// page of borrow
	if ($("#isbn_by_query").length) {
		$("#book_title").html(book_info.title);

		if (book_info.subtitle.length > 0) {
			$("#sub_title").html(book_info.subtitle);
		}
		else{
			$("#sub_title").hide()
		}

		$("#author").html(book_info.author)
		$("#publisher").html(book_info.publisher)
		$("#pubdate").html(book_info.pubdate)
		if (book_info.summary && book_info.summary.length != 0) {
			book_info.summary = book_info.summary.replace(/\\n/,"<br>")
		}
		$("#summary").html(book_info.summary)
	}
	// page of insert book
	else{
		$("#book_title").val(book_info.title);

		if (book_info.subtitle.length > 0) {
			$("#sub_title").val(book_info.subtitle);
		}
		else{
			$("#sub_title").hide()
		}

		$("#author").val(book_info.author)
		$("#publisher").val(book_info.publisher)
		$("#pubdate").val(book_info.pubdate)
		if (book_info.summary && book_info.summary.length != 0) {
			book_info.summary = book_info.summary.replace(/\\n/,"<br>")
		}
		$("#summary").val(book_info.summary)
	}
	// console.log(book_info,book_info.author,book_info['cover_img'])
	setTimeout(function(){
		$("#cover_img").attr('src',"images/"+book_info.cover_img)	
	}, 500);
}

/**

	给定一个时间戳，计算 当前时间 的时长，以天为单位
	返回显示颜色的 类名： 
		超过还书时间  	==>		btn-danger (red);
		还书期限前三天  	==>		btn-warning (yellow):
		return 			==> 	""
*/

// 还书期限： 三周
var deadline = 3 * 7 * 24 * 60 * 60 * 1000;
// 警告期限： 3天
var waringline = deadline - 3 * 24 * 60 * 60 * 1000;

function getTimeDuration(time){
	if (!time) {
		return ""
	}
	var now = (new Date()).getTime()
	var last = (new Date(time)).getTime()
	var diff = now - last
	// 大于三周 
	if (diff > deadline){

		return "btn-danger"
	}
	// 还书期限前三天
	else if(diff > waringline)
		return 'btn-warning'
	else
		return ''
}
