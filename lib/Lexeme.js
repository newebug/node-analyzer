
var Lexeme = function(offset, begin, len, lexemeType){
  this.offset = offset;
	this.begin = begin;
	if (len < 0){
		throw new Error("Lexeme len < 0");
	}
	this.len = len;
	this.lexemeType = lexemeType;
};

module.exports = Lexeme;

/**
 * 获取词元的文本内容
 * @return String
 */
/*Lexeme.prototype.getLexemeText = function() {
	return this.lexemeText || '';
};
*/
/*Lexeme.prototype.setLexemeText = function(lexemeText) {
	if (!lexemeText){
		this.lexemeText = "";
		this.len = 0;
	}
	else{
		this.lexemeText = lexemeText;
		this.len = lexemeText.length;
	}
};*/

/**
 * 合并两个相邻的词元
 * @param l
 * @param lexemeType
 * @return boolean 词元是否成功合并
 */
/*Lexeme.prototype.append = function(l, lexemeType){
	if (l && this.getEndPosition() === l.getBeginPosition()){
		this.len += l.len;
		this.lexemeType = lexemeType;
		return true;
	}
	else {
		return false;
	}
};*/
