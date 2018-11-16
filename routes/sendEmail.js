var nodemailer = require('nodemailer');

var config = require("../config.js")

var TIME = config.TIME
var EMAIL = config.EMAIL

var CheckTimeout = require("../models/checkTimeout")

//邮件发送类
var MailSender = {

    /**
        记录发送失败的邮件信息，待所有邮件发送完成后，
        将该信息发送给 管理员
    */
    errorMsg: "",

    /**
        发送者信息
    */
    transporter : nodemailer.createTransport({
        service: '163',
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
        发送信息
    */
    mailOptions : {
        from: EMAIL.SENDER, // sender address
        to: 'i2lmeng@163.com', // list of receivers
        subject: '东大软院（苏州）图书馆还书期限提醒', // Subject line
        text: 'Hello world ✔', // plaintext body
        html: '<b>Hello world ✔</b>' // html body
    }

}

/**
    info : {email,msg}
    name : 用户名
*/ 
    MailSender.sendMail = function(){

        this.transporter.sendMail(this.mailOptions, function(error, info){
            if(error){
                console.log(error);

                this.errorMsg += `
                    于${fmtDate(new Date().getTime())} 发送给${name}的邮件失败;内容 ：${info}
                    错误信息如下 ： ${error}<br><br>
                `
            }else{
                console.log('Message sent: ' + info.response);
                
                // 每次发送完成之后间隔 10s，防止被封
                setTimeout(function(){},10000)
            }
        }.bind(this));

    }



/**
    设置接收人信息，以及发送内容

    info : {email,msg}
    name : 用户名
*/ 
MailSender.setReceiver = function(info,name){
    console.log(info)

    if (!info.email) {
        return false;
    }

    this.mailOptions.to = info.email;
    
    // this.mailOptions.to = "i2lmeng@163.com"

    text = `
        ${name} 同学：
        <br><br>
        ${info.msg}

        请尽快到三江院二楼图书馆 还书/续借。
        <br>
        <i>注：每次借书周期为3周，可续借一次</i><br>
        <b>另：不要回复！不要回复！不要回复！</b><br>
        
        <p style="text-align:right"> <b>谢谢!</b></p>

    `;

    // this.mailOptions.text = text;
    this.mailOptions.html = text;
}


/* 获取需要发送邮件的人的信息 */
MailSender.checkout = function() {

    CheckTimeout.check(function(err,rows){
        if (err) {
            console.log("check recode out deadline have something wrong！", err)
            return;
        }

        // 无人需要发邮件
        if (rows.length < 1) 
            return;

        // 合并同一人的信息,键值对
        var data = this.mergeReader(rows)

        // 凌晨 3 点 检查出结果，目标早上9点发送邮件 ==> 延迟6小时
        setTimeout(function(){
            for (var name in data) {

                // 配置发送内容 : 
                if (this.setReceiver(data[name],name)){
                    // 发送邮件
                    this.sendMail();
                }
            }

            /** 有发送失败的消息 */
            if (this.errorMsg.length > 10) {
                this.mailOptions.to = EMAIL.MANAGER_MAIL;
                this.mailOptions.text = this.errorMsg;
                
                this.sendMail()

                /**
                    TODO ： 若发给管理员的邮件也失败了。。。。
                */
                this.errorMsg = "";
            }

        }.bind(this),TIME.ONEDAY/4);

    }.bind(this))
};
    

/*
    合并查询结果中同一人的信息
    return ： 关联数组 ==> 类似于键值对
*/
MailSender.mergeReader = function(info_list){
    
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
    if(diff >= 0){
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