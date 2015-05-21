var Lexeme = require('./Lexeme');

var LexemeService = {
  /**
	 * 合并两个相邻的词元
	 * @param l
	 * @param lexemeType
	 * @return boolean 词元是否成功合并
	 */
	append: function(prev, next, lexemeType){
		if (next && this.getEndPosition(prev) === this.getBeginPosition(next)){
			prev.len += next.len;
			prev.lexemeType = lexemeType;
			return true;
		}else {
			return false;
		}
	},
  /*
   * 判断词元相等算法
   * 起始位置偏移、起始位置、终止位置相同
   */
  equals: function(l, o){
  	if (!o){
  		return false;
  	}
  	
  	if (l === o){
  		return true;
  	}
  	
  	if (o instanceof Lexeme){
  		if (l.offset === o.offset && 
  		  l.begin === o.begin && 
  		  l.len === o.len){
  			return true;			
  		}
  		else{
  			return false;
  		}
  	}
  	else{		
  		return false;
  	}
  },
  /*
   * 词元在排序集合中的比较算法
   */
  compare: function(x, y){
    //起始位置优先
    if (x.begin < y.begin){
      return -1;
    }
    else if(x.begin === y.begin){
    	//词元长度优先
    	if(x.len > y.len){
    		return -1;
    	}
    	else if (x.len === y.len){
    		return 0;
    	}
    	else {//x.len < y.getLength()
    		return 1;
    	}
    }
    else {//x.begin > y.begin
    	return 1;
    }
  },
  /**
   * 获取词元在文本中的起始位置
   * @return int
   */
  getBeginPosition: function(lexeme){
  	return lexeme.offset + lexeme.begin;
  },
  /**
   * 获取词元在文本中的结束位置
   * @return int
   */
  getEndPosition: function(lexeme){
  	return lexeme.offset + lexeme.begin + lexeme.len;
  }
};

var SortedSetService = {
  /**
   * 向链表集合添加词元
   * @param lexeme
   */
  addLexeme: function(sortedSet, lexeme){
    if (sortedSet.lexemeList.length === 0){
      sortedSet.lexemeList.push(lexeme);
      return null;
    }
    var tailList = [], tail, compRes;
    tail = sortedSet.pollLast(); // 比 this.lexemeList.pop(); 快
    compRes = LexemeService.compare(tail, lexeme);
    if (compRes === 0){   // 词元与尾部词元相同，不放入集合
      sortedSet.lexemeList.push(tail);
      return null;
    }
    else if (compRes < 0){  // 词元接入链表尾部
      sortedSet.lexemeList.push(tail);
      sortedSet.lexemeList.push(lexeme);
      return null;
    }
    else{                 //从尾部上逆
      tailList.unshift(tail);
      var arr = this.addLexeme(sortedSet, lexeme);
      if (!arr) {
        sortedSet.lexemeList.concat(tailList);
        return null;
      }
      else{
        tailList = arr.concat(tailList);
        return tailList;
      }
    }
  },
  /**
   * 返回链表头部元素
   * @return
   */
  peekFirst: function(sortedSet){
  	if (sortedSet.lexemeList.length > 0){
  		return sortedSet.lexemeList[0];
  	}
  	return null;
  },
  /**
   * 取出链表集合的第一个元素
   * @return Lexeme
   */
  pollFirst: function(sortedSet){
  	if (sortedSet.lexemeList.length > 0){
  		return sortedSet.lexemeList.shift();
  	}
  	return null;
  },
  /**
   * 取出链表集合的最后一个元素
   * @return Lexeme
   */
  pollLast: function(sortedSet){
    return sortedSet.lexemeList.pop();
  },
  /**
   * 返回链表尾部元素
   * @return
   */
  peekLast: function(sortedSet){
    var idx = sortedSet.lexemeList.length - 1;
  	if (idx >= 0){
  		return sortedSet.lexemeList[idx];
  	}
  	return null;
  }
};

var LexemePathService = {
  newLexemePath: function(){
    
  },
  compare: function(x, y){
    //比较有效文本长度
  	if (x.payloadLength > y.payloadLength){
  		return -1;
  	}
  	else if (x.payloadLength < y.payloadLength){
  		return 1;
  	}
  	else{
  		//比较词元个数，越少越好
  		if (x.lexemeList.length < y.lexemeList.length){
  			return -1;
  		}
  		else if (x.lexemeList.length > y.lexemeList.length){
  			return 1;
  		}
  		else{
  			//路径跨度越大越好
  			if (LexemePathService.getPathLength(x) >  LexemePathService.getPathLength(y)){
  				return -1;
  			}
  			else if (LexemePathService.getPathLength(x) <  LexemePathService.getPathLength(y)){
  				return 1;
  			}
  			else {
  				//根据统计学结论，逆向切分概率高于正向切分，因此位置越靠后的优先
  				if (x.pathEnd > y.pathEnd){
  					return -1;
  				}
  				else if (x.pathEnd < y.pathEnd){
  					return 1;
  				}
  				else{
  					//词长越平均越好
  					if (LexemePathService.getXWeight(x) > LexemePathService.getXWeight(y)){
  						return -1;
  					}
  					else if (LexemePathService.getXWeight(x) < LexemePathService.getXWeight(y)){
  						return 1;
  					}
  					else {
  						//词元位置权重比较
  						if (LexemePathService.getPWeight(x) > LexemePathService.getPWeight(y)){
  							return -1;
  						}
  						else if (LexemePathService.getPWeight(x) < LexemePathService.getPWeight(y)){
  							return 1;
  						}
  					}
  				}
  			}
  		}
  	}
  	return 0;
  },
  /**
   * 获取LexemePath的路径长度
   * @return
   */
  getPathLength: function(lexemePath){
  	return lexemePath.pathEnd - lexemePath.pathBegin;
  },
  getNextLexeme: function(lexemePath, currLexeme){
    var idx = lexemePath.lexemeList.indexOf(currLexeme);
    if (idx >= 0 && lexemePath.lexemeList.length > idx){
      return lexemePath.lexemeList[idx+1];
    }
    return null;
  },
  /**
   * 检测词元位置交叉（有歧义的切分），有交叉时返回 true
   * @param lexeme
   * @return
   */
  checkCross: function(lexemePath, lexeme){
  	return (lexeme.begin >= lexemePath.pathBegin && lexeme.begin < lexemePath.pathEnd) ||
  	  (lexemePath.pathBegin >= lexeme.begin && lexemePath.pathBegin < lexeme.begin+ lexeme.len);
  },
  /**
   * 移除尾部的Lexeme
   * @return
   */
  removeTail: function(lexemePath){
  	var tail = lexemePath.pollLast();
  	if (lexemePath.lexemeList.length === 0){
  		lexemePath.pathBegin = -1;
  		lexemePath.pathEnd = -1;
  		lexemePath.payloadLength = 0;			
  	}
  	else{		
  		lexemePath.payloadLength -= tail.len;
  		var newTail = lexemePath.peekLast();
  		lexemePath.pathEnd = newTail.begin + newTail.len;
  	}
  	return tail;
  },
  /**
   * 向LexemePath追加相交的Lexeme
   * @param lexeme
   * @return 
   */
  addCrossLexeme: function(lexemePath, lexeme){
  	if (lexemePath.lexemeList.length === 0){
  		SortedSetService.addLexeme(lexemePath, lexeme);
  		lexemePath.pathBegin = lexeme.begin;
  		lexemePath.pathEnd = lexeme.begin + lexeme.len;
  		lexemePath.payloadLength += lexeme.len;
  		return true;
  	}
  	else if (LexemePathService.checkCross(lexemePath, lexeme)){
  		SortedSetService.addLexeme(lexemePath, lexeme);
  		if (lexeme.begin + lexeme.len > lexemePath.pathEnd){
  			lexemePath.pathEnd = lexeme.begin + lexeme.len;
  		}
  		lexemePath.payloadLength = lexemePath.pathEnd - lexemePath.pathBegin;
  		return true;
  	}
  	else{
  		return false;
  	}
  },
  /**
   * 向LexemePath追加不相交的Lexeme
   * @param lexeme
   * @return 
   */
  addNotCrossLexeme: function(lexemePath, lexeme){
  	if (lexemePath.lexemeList.length === 0){
  		SortedSetService.addLexeme(lexemePath, lexeme);
  		lexemePath.pathBegin = lexeme.begin;
  		lexemePath.pathEnd = lexeme.begin + lexeme.len;
  		lexemePath.payloadLength += lexeme.len;
  		return true;
  		
  	}
  	else if (LexemePathService.checkCross(lexemePath, lexeme)){
  		return false;
  	}
  	else{
  		SortedSetService.addLexeme(lexemePath, lexeme);
  		lexemePath.payloadLength += lexeme.len;
  		var head = lexemePath.peekFirst();
  		lexemePath.pathBegin = head.begin;
  		var tail = lexemePath.peekLast();
  		lexemePath.pathEnd = tail.begin + tail.len;
  		return true;
  	}
  },
  /**
   * X权重（词元长度积）
   * @return
   */
  getXWeight: function(lexemePath){
  	var product = 1;
  	var c = lexemePath.peekFirst();
  	while(c){
  		product *= c.len;
  		c = LexemePathService.getNextLexeme(lexemePath, c);
  	}
  	return product;
  },
  /**
   * 词元位置权重
   * @return
   */
  getPWeight: function(lexemePath){
  	var pWeight = 0;
  	var p = 0;
  	var c = lexemePath.peekFirst();
  	while(c){
  		p++;
  		pWeight += p * c.len;
  		c = LexemePathService.getNextLexeme(lexemePath, c);
  	}
  	return pWeight;		
  }
};



module.exports = {
  LexemeService: LexemeService,
  LexemePathService: LexemePathService,
  SortedSetService: SortedSetService
};