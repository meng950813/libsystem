Libsystem
===
图书馆管理系统 
---
### 写在前面
* 本系统为东大软件研究院微型图书馆服务，过程简陋，写法粗糙，效率低下，可优化空间很大，然而懒。。。
* 为防止日后学弟/学妹不知从何优化(其实个人建议重做![](http://ww1.sinaimg.cn/large/0065ewYjgy1fv82dt127ij300s00smx0)),故留下一些[功能说明文档](./function.md)。

### 技术栈
* Express-Node.js Web 应用程序框架
* Mysql-最受欢迎的开源数据库
* Handlebars-高效率的语义化模板
* Bootstrap-简洁、直观、强悍的前端开发框架

### 运行前准备
    Node.js 8.12.0
    npm 6.4.1
    mysql 8.0.12
  安装好了`Mysql`后，创建数据库，导入项目中的数据库文件，然后在config.js配置好数据库。

### 运行
1. 通过npm安装本地服务第三方依赖模块(需要已安装Node.js,且有package.json文件)
 ```bash
 npm install
 ```

2. 启动Mysql服务

3. 启动node（http://localhost:8080）
 ```bash
 npm start
 ```

