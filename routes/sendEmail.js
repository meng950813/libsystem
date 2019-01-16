var nodemailer = require('nodemailer');

var fs = require("fs")

var config = require("../config.js")

var TIME = config.TIME
var EMAIL = config.EMAIL

var CheckTimeout = require("../models/checkTimeout")

//邮件发送类
var MailSender = {

    /**
        发送者信息
    */
    transporter : nodemailer.createTransport({
        host: 'smtp.exmail.qq.com',
        secure: true,
        port: 465,
        auth: {
            user: EMAIL.SENDER,
            /**
                不是邮箱密码，是允许开启 STMP 服务的密码
            */
            pass: EMAIL.STMP_PWD
        }
    }),

    /**
        邮件头部信息，包括 发送者邮箱，接收者邮箱，主题，内容
    */
    mailOptions : {
        from: EMAIL.SENDER, // sender address
        to: '1752397568@qq.com', // list of receivers
        subject: '东大软院（苏州）图书馆还书期限提醒', // Subject line
        text: '东大软院（苏州）图书馆还书期限提醒', // plaintext body
        html: '<b>Hello world ✔</b>' // html body
    }

}

/**
    info : {email,msg}
    name : 用户名
*/ 
MailSender.sendMail = function(info,name){

    // 配置 接收者及接收内容 ，若无 返回 false
    if(!this.setReceiver(info,name)){
        return;
    }

    // 发送邮件
    this.transporter.sendMail(this.mailOptions, function(error, back_info){

        var mailStatus = fmtDate();
        
        if(error){
            console.log(error);
            mailStatus = `Failed     ${mailStatus}    ${name}    ${info.msg}\r\n`;
        }else{
            console.log(`Message sent to ${name} : ` + back_info.response);
            
            mailStatus = `Success    ${mailStatus}    ${name}    ${info.msg}\r\n`;
        }

        writeSendLog(mailStatus)

    }.bind(this));

}


/**
    设置接收人信息，以及发送内容

    info : {email,msg}
    name : 用户名
*/ 
MailSender.setReceiver = function(info,name){
    // console.log(info)

    if (!info.email) {
        return false;
    }

    this.mailOptions.to = info.email;

    text = `
        ${name} 同学：
        <br><br>
        ${info.msg}

        请尽快到三江院二楼图书馆 还书/续借。
        <br><br>
        <i>注：每次借书周期为3周，可续借一次</i><br><br>
        <b>另：不要回复！不要回复！不要回复！</b><br><br>
        
        <p style="text-align:right"> <b>谢谢!</b></p>

    `;

    this.mailOptions.html = text;

    return true;
}

// 睡眠 xx ms
function sleepSync(ms) {
    return new Promise(done => {
        setTimeout(done, ms)
    })
}


/* 获取需要发送邮件的人的信息 */
MailSender.checkout = function() {

    // 使用 async 与 await 关键字 是为了实现 发送间隔 ， 有兴趣可自行百度用法
    CheckTimeout.check(async function(err,rows){
        if (err) {
            console.log("check recode out deadline have something wrong！", err)
            return;
        }

        // 无人需要发邮件
        if (rows.length < 1) 
            return;

        // 合并同一人的信息,键值对
        var data = this.mergeReader(rows)
        
        // 获取对象长度 ==> 需要发送邮件的人数
        // Object.keys(data).length

        for(var name in data) {

            this.sendMail(data[name], name)

            await sleepSync(1000)
        }

    }.bind(this))
};
    

/*
    合并查询结果中同一人的信息
    return ： 关联数组 ==> 类似于键值对
*/
MailSender.mergeReader = function(info_list){
    
    // 已人名为键，值为要发送的消息 ==> TODO 有重名
    var hashArr = new Array();
    var time,name;
    
    for(i in info_list){
        // 有续借时间以续借时间为准, 否则以出借时间为准
        time = info_list[i].inDate == null?info_list[i].outDate:info_list[i].inDate;

        name = info_list[i].reader_name;

        // 数组中没有
        if (hashArr[name] == undefined) {
            hashArr[name] = {
                email : info_list[i].email,
                // 设置发送邮件的部分内容
                msg : "你"+this.setMsg(info_list[i].book_title,time)
            }
        }
        else{
            hashArr[name].msg += this.setMsg(info_list[i].book_title,time)
        }
    }
    return hashArr;
}


/**
    返回形如 ： 于 xx年xx月xx日 (续)借的 《xxx》 还有 x 天到期 <br><br>
*/
MailSender.setMsg = function(book_title,time) {
    // 计算借书最长期限(3周) 与已借时长的 时间差，单位 天 向下取整
    var diff = TIME.DEADLINE - Math.floor((new Date().getTime() - time)/TIME.ONEDAY);

    time = fmtDate(time);

    var msg = `于 ${time} (续)借的 《${book_title}》 `;
    if(diff >=0 && diff <= 1){
        msg += `<span style='color:yellow'>还有 <strong> ${diff} 天</strong>到期 </span><br><br>`;
    }
    else{
        msg +=  `<span style='color:red'>已逾期 <strong> ${diff * -1} 天</strong></span><br><br>`;
    }
    return msg;
}


module.exports = MailSender;


/**
    给定一个时间戳，返回 xx年xx月xx日
*/
function fmtDate(obj){
    if (!obj){
        return null;
    }
    var date =  new Date(obj);
    var y = 1900+date.getYear();
    var m = "0"+(date.getMonth()+1);
    var d = "0"+date.getDate();
    return y+"年"+m.substring(m.length-2,m.length)+"月"+d.substring(d.length-2,d.length)+"日";
}


function writeSendLog(data){
    fs.appendFile("../maillog.txt",data,function(err){
        if (err) {
            console.log(fmtDate() + "  写文件失败  ")
            console.log(err)
        }
        console.log("邮件发送记录已添加")
    })
}