/**
 * IK分词器专用的Lexem快速排序集合
 */


var QuickSortSet = function(){
	this.lexemeList = [];
};

/**
 * 向链表集合添加词元
 * @param lexeme
 */
/*QuickSortSet.prototype.addLexeme = function(lexeme){
  if (this.lexemeList.length === 0){
    this.lexemeList.push(lexeme);
    return null;
  }
  var tailList = [], tail, compRes;
  tail = SortedSetService.pollLast(this); // 比 this.lexemeList.pop(); 快
  compRes = LexemeService.compare(tail, lexeme);
  if (compRes === 0){   // 词元与尾部词元相同，不放入集合
    this.lexemeList.push(tail);
    return null;
  }
  else if (compRes < 0){  // 词元接入链表尾部
    this.lexemeList.push(tail);
    this.lexemeList.push(lexeme);
    return null;
  }
  else{                 //从尾部上逆
    tailList.unshift(tail);
    var arr = this.addLexeme(lexeme);
    if (!arr) {
      this.lexemeList.concat(tailList);
      return null;
    }
    else{
      tailList = arr.concat(tailList);
      return tailList;
    }
  }
};*/

/**
 * 返回链表头部元素
 * @return
 */
QuickSortSet.prototype.peekFirst = function(){
	if (this.lexemeList.length > 0){
		return this.lexemeList[0];
	}
	return null;
};
	
/**
 * 取出链表集合的第一个元素
 * @return Lexeme
 */
QuickSortSet.prototype.pollFirst = function(){
	if (this.lexemeList.length > 0){
		return this.lexemeList.shift();
	}
	return null;
};

/**
 * 返回链表尾部元素
 * @return
 */
QuickSortSet.prototype.peekLast = function(){
  var idx = this.lexemeList.length - 1;
	if (idx >= 0){
		return this.lexemeList[idx];
	}
	return null;
};

/**
 * 取出链表集合的最后一个元素
 * @return Lexeme
 */
QuickSortSet.prototype.pollLast = function(){
  return this.lexemeList.pop();
};

module.exports = QuickSortSet;