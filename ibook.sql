-- 小书评
CREATE DATABASE IF NOT EXISTS ibook CHARACTER SET GBK;

USE ibook;

-- 书籍
create table if not exists books(
     id INT NOT NULL AUTO_INCREMENT,
     managerId  INT NOT NULL ,
     bookName VARCHAR(100) NOT NULL, -- 书名
     bookImg VARCHAR(300) NOT NULL, -- 封面
     author VARCHAR(100) NOT NULL, -- 作者
     publishers VARCHAR(100) NOT NULL, -- 出版社
     publishTime VARCHAR(40) NOT NULL, -- 出版年
     pages INT NOT NULL, -- 页数
     price decimal(2,1) NOT NULL, -- 定价
     bindings VARCHAR(40) NOT NULL, -- 装帧
     ISBN VARCHAR(100) NOT NULL, -- ISBN
     contentIntroduction longtext NOT NULL, -- 内容简介
     authorIntroduction longtext NOT NULL, -- 作者简介
     catalogue longtext NOT NULL, -- 目录
     star decimal(2,1) NOT NULL, -- 星级
     PRIMARY KEY ( id ) 
);

-- 普通用户
create table if not exists users(
     id INT NOT NULL AUTO_INCREMENT,
     userName VARCHAR(100) NOT NULL,
     password VARCHAR(100) NOT NULL,
	 gender int(2) NULL,
     avator VARCHAR(100) NOT NULL DEFAULT '',
     createTime VARCHAR(100) NOT NULL DEFAULT '',
     modifyTime VARCHAR(100) NOT NULL DEFAULT '',
     PRIMARY KEY ( id )
);

-- 后台管理员
create table if not exists managers(
     id INT NOT NULL AUTO_INCREMENT,
     userName VARCHAR(100) NOT NULL,
     password VARCHAR(100) NOT NULL,
	 gender int(2) NULL,
     avator VARCHAR(100) NOT NULL DEFAULT '',
     createTime VARCHAR(100) NOT NULL DEFAULT '',
     modifyTime VARCHAR(100) NOT NULL DEFAULT '',
     PRIMARY KEY ( id )
);

-- 评论
create table if not exists comments(
    id INT NOT NULL AUTO_INCREMENT,
    content longtext NOT NULL,
    bookId  INT NOT NULL ,
    userId  INT NOT NULL ,
    createTime VARCHAR(100) NOT NULL DEFAULT '',
    PRIMARY KEY ( id )
);

-- 星级评分
create table if not exists stars(
    id INT NOT NULL AUTO_INCREMENT,
    star decimal(2,1) NOT NULL, -- 星级
    userId VARCHAR(40) NOT NULL,
    bookId VARCHAR(40) NOT NULL,
    createTime VARCHAR(40) NOT NULL DEFAULT '',
    PRIMARY KEY ( id )
);
