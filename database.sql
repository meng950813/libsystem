/*
Navicat MySQL Data Transfer

Source Server         : mysql
Source Server Version : 80012
Source Host           : localhost:3306
Source Database       : libsystem

Target Server Type    : MYSQL
Target Server Version : 80012
File Encoding         : 65001

Date: 2018-10-07 22:43:49
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for book
-- ----------------------------
DROP TABLE IF EXISTS `book`;
CREATE TABLE `book` (
  `book_id` int(11) unsigned NOT NULL COMMENT '书籍编号',
  `isbn` varchar(13) NOT NULL COMMENT '标记同一本书',
  `title` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '书名',
  `author` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '作者',
  `type` enum('其他类','操作系统/网络类','软件管理/面试类','框架/工具类','算法/数学类','编程语言类') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '编程语言类' COMMENT '书籍类型',
  `press` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '出版商',
  `entry_time` bigint(20) NOT NULL,
  `status` varchar(1) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '1' COMMENT '1：可借；0：借出; 2：遗失',
  PRIMARY KEY (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for borrow_history
-- ----------------------------
DROP TABLE IF EXISTS `borrow_history`;
CREATE TABLE `borrow_history` (
  `bor_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `bookID` int(11) NOT NULL COMMENT '书籍id',
  `readerID` int(11) NOT NULL COMMENT '借书人id',
  `outDate` bigint(20) DEFAULT NULL COMMENT '借出时间',
  `inDate` bigint(20) DEFAULT NULL COMMENT '还书时间',
  `status` varchar(1) NOT NULL DEFAULT '0' COMMENT '0:未还；  1： 已还； 2: 续借一次；3：遗失',
  PRIMARY KEY (`bor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for reader
-- ----------------------------
DROP TABLE IF EXISTS `reader`;
CREATE TABLE `reader` (
  `reader_id` int(11) NOT NULL,
  `reader_name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `college_name` enum('东蒙土建','东蒙计算机','软件学院(苏州)') CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '软件学院(苏州)' COMMENT '学院名',
  PRIMARY KEY (`reader_id`),
  UNIQUE KEY `readerId` (`reader_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for reservation
-- ----------------------------
DROP TABLE IF EXISTS `reservation`;
CREATE TABLE `reservation` (
  `res_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `res_reader_id` int(11) NOT NULL COMMENT '预约人',
  `res_isbn` varchar(13) NOT NULL COMMENT '预约书籍',
  `res_date` bigint(20) NOT NULL COMMENT '预约时间',
  `status` varchar(1) DEFAULT '1' COMMENT '1:预约成功; 2: 成功取书； 3 取消预约',
  PRIMARY KEY (`res_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Procedure structure for book_borrow
-- ----------------------------
DROP PROCEDURE IF EXISTS `book_borrow`;
DELIMITER ;;
CREATE DEFINER=`cm`@`localhost` PROCEDURE `book_borrow`(IN `b_id` int,IN `uid` int,IN `time` bigint, OUT `result` int)
BEGIN
	#Routine body goes here...
	SELECT reader_id INTO @exsit FROM reader WHERE reader_id = uid;
	IF NOT @exsit THEN
		# 查无此人
		set result = 0;
	ELSE
			SELECT isbn INTO @list FROM book WHERE b_id = book_id;

			IF (SELECT bor_id from borrow_history WHERE readerID=uid and `status`=0 AND borrow_history.bookID in (SELECT book_id from book WHERE isbn = @list)) THEN
				# 重复借书
				set result = 2;
			ELSE
				INSERT INTO borrow_history VALUE(NULL,b_id,uid,time,NULL,'0');
				UPDATE book SET status = '0' WHERE b_id = book_id;
				set result = 1;
			END IF;
	END IF;
	SELECT @result;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for book_rebo
-- ----------------------------
DROP PROCEDURE IF EXISTS `book_rebo`;
DELIMITER ;;
CREATE DEFINER=`cm`@`localhost` PROCEDURE `book_rebo`(IN `b_id` int,IN `time` bigint)
BEGIN
	# 续借 status=2,   还书 status=1
	SELECT `status` INTO @sta from borrow_history WHERE bor_id = b_id;
	if @sta = '0' THEN
		UPDATE borrow_history SET `status`='2',inDate=time WHERE bor_id = b_id;
		# 续借成
	END IF;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for book_reserve
-- ----------------------------
DROP PROCEDURE IF EXISTS `book_reserve`;
DELIMITER ;;
CREATE DEFINER=`cm`@`localhost` PROCEDURE `book_reserve`(IN `book_id` varchar(13),IN  `uid` int,IN `time` bigint,OUT `result` int)
BEGIN
	# 预约借书
	SELECT reader_id INTO @userid from reader WHERE reader_id=uid;
	IF @userid THEN
		IF (SELECT res_id FROM reservation WHERE res_reader_id = @userid and res_isbn = book_id and status = 1) THEN
			# 重复预约
			SET result = 3;
		ELSE
			INSERT INTO reservation(res_reader_id,res_isbn,res_date,status) VALUE(@userid,book_id,time,1);
			set result = 1;
		END IF;
	ELSE
		# 查无此人
		set result = 0;
	END IF;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for book_return
-- ----------------------------
DROP PROCEDURE IF EXISTS `book_return`;
DELIMITER ;;
CREATE DEFINER=`cm`@`localhost` PROCEDURE `book_return`(IN `b_id` int,IN `time` bigint)
BEGIN
	# 还书
	
	UPDATE borrow_history SET `status` = 1, inDate = time WHERE bookID = b_id and `status` != 1;
	UPDATE book set `status` = 1 WHERE book_id = b_id;

END
;;
DELIMITER ;
