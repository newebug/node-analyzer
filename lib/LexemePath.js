var util = require('util');
var QuickSortSet = require('./QuickSortSet');
  
/**
 * Lexeme链（路径）
 */
var LexemePath = function(){
  QuickSortSet.call(this);
	this.pathBegin = -1;    //起始位置
	this.pathEnd = -1;      //结束
	this.payloadLength = 0; //词元链的有效字符长度
};

util.inherits(LexemePath, QuickSortSet);

module.exports = LexemePath;
