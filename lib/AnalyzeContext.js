var Dictionary = require('./Dictionary'),
  QuickSortSet = require('./QuickSortSet'),
  AnalyzeService = require('./AnalyzeService'),
  SortedSetService = AnalyzeService.SortedSetService,
  LexemeService = AnalyzeService.LexemeService;
var Lexeme = require('./Lexeme'),
  consts = require('./consts'),
  utils = require('./utils'),
  CharType = consts.CharType,
  LexemeType = consts.LexemeType;
var CharacterUtil = require('./CharacterUtil');

var BUFF_EXHAUST_CRITICAL = 100;

var AnalyzeContext = function(opts){
	this.segmentBuff = '';
	this.charTypes = [];
	this.buffLocker = {};
	this.orgLexemes = new QuickSortSet();
	this.pathMap = {};
	this.results = [];
	this.totalReadCount = 0; // 总共读取了多少字符
};

module.exports = AnalyzeContext;

AnalyzeContext.prototype.getCurrentChar = function(){
	return this.segmentBuff[this.cursor];
};

AnalyzeContext.prototype.getCurrentCharType = function(){
	return this.charTypes[this.cursor];
};

/**
 * 根据context的上下文情况，填充segmentBuff 
 * @param reader
 * @return 返回待分析的（有效的）字串长度
 */
AnalyzeContext.prototype.fillBuffer = function(txt){
  this.segmentBuff = txt;
  this.cursor = 0;
  this.available = this.segmentBuff.length;
  return this.available;
};

/**
 * 初始化buff指针，处理第一个字符
 */
AnalyzeContext.prototype.initCursor = function(){
	this.cursor = 0;
	//this.segmentBuff[this.cursor] = CharacterUtil.regularize(this.segmentBuff[this.cursor]);
	//this.charTypes[this.cursor] = CharacterUtil.identifyCharType(this.segmentBuff[this.cursor]);
	var chr = CharacterUtil.regularize(this.segmentBuff[this.cursor]);
	this.charTypes[this.cursor] = CharacterUtil.identifyCharType(chr);
	
};

/**
 * 指针+1
 * 成功返回 true； 指针已经到了buff尾部，不能前进，返回false
 * 并处理当前字符
 */
AnalyzeContext.prototype.moveCursor = function(){
  if (this.cursor < this.available - 1){
		this.cursor += 1;
		
    //this.segmentBuff[this.cursor] = CharacterUtil.regularize(this.segmentBuff[this.cursor]);
    //this.charTypes[this.cursor] = CharacterUtil.identifyCharType(this.segmentBuff[this.cursor]);
    var chr = CharacterUtil.regularize(this.segmentBuff[this.cursor]);
	  this.charTypes[this.cursor] = CharacterUtil.identifyCharType(chr);
		return true;
	}
	else{
		return false;
	}
};

/**
 * 设置当前segmentBuff为锁定状态
 * 加入占用segmentBuff的子分词器名称，表示占用segmentBuff
 * @param segmenterName
 */
AnalyzeContext.prototype.lockBuffer = function(segmenterName){
	this.buffLocker[segmenterName] = 1;
};

/**
 * 移除指定的子分词器名，释放对segmentBuff的占用
 * @param segmenterName
 */
AnalyzeContext.prototype.unlockBuffer = function(segmenterName){
	this.buffLocker[segmenterName] = 0;
};

/**
 * 只要buffLocker中存在segmenterName
 * 则buffer被锁定
 * @return boolean 缓冲去是否被锁定
 */
AnalyzeContext.prototype.isBufferLocked = function(){
  for(var k in this.buffLocker){
    if (this.buffLocker[k]) {
      return true;
    }
	}
	return false;
};

/**
 * 判断当前segmentBuff是否已经用完
 * 当前执针cursor移至segmentBuff末端this.available - 1
 * @return
 */
/*AnalyzeContext.prototype.isBufferConsumed = function(){
	return this.cursor === this.available - 1;
};*/

/**
 * 判断segmentBuff是否需要读取新数据
 * 
 * 满足以下条件时，
 * 1.available == BUFF_SIZE 表示buffer满载
 * 2.buffIndex < available - 1 && buffIndex > available - BUFF_EXHAUST_CRITICAL表示当前指针处于临界区内
 * 3.!context.isBufferLocked()表示没有segmenter在占用buffer
 * 要中断当前循环（buffer要进行移位，并再读取数据的操作）
 * @return
 */
/*AnalyzeContext.prototype.needRefillBuffer = function(){
	return (this.cursor < this.available - 1 && 
	  this.cursor  > this.available - BUFF_EXHAUST_CRITICAL	&& 
	  !this.isBufferLocked());
};*/

/**
	 * 累计当前的segmentBuff相对于reader起始位置的位移
	 */
AnalyzeContext.prototype.markBufferOffset = function(){
	this.buffOffset += this.cursor;
};

/**
	 * 向分词结果集添加词元
	 * @param lexeme
	 */
/*AnalyzeContext.prototype.addLexeme = function(lexeme){
	this.orgLexemes.addLexeme(lexeme);
};*/

/**
	 * 添加分词结果路径
	 * 路径起始位置 ---> 路径 映射表
	 * @param path
	 */
AnalyzeContext.prototype.addLexemePath = function(crossPath){
	if (crossPath){
		this.pathMap[crossPath.pathBegin] = crossPath;
	}
};

/**
 * 推送分词结果到结果集合
 * 1.从buff头部遍历到this.cursor已处理位置
 * 2.将map中存在的分词结果推入results
 * 3.将map中不存在的CJDK字符以单字方式推入results
 */
AnalyzeContext.prototype.outputToResult = function(){
  var lexeme;
	for(var index = 0;index <= this.cursor;){
	  
		//跳过非CJK字符
		if (CharType.CHAR_USELESS === this.charTypes[index]){
			index ++;
			continue;
		}
		//从pathMap找出对应index位置的LexemePath
		var crosspath = this.pathMap[index];
		if (crosspath){
			//输出LexemePath中的lexeme到results集合
			lexeme = crosspath.pollFirst();
			while (lexeme){
				this.results.push(lexeme);
				//将index移至lexeme后
				index = lexeme.begin + lexeme.len;

				lexeme = crosspath.pollFirst();

				if (lexeme){
					//输出path内部，词元间遗漏的单字
					for(;index < lexeme.begin; index++){
						this.outputSingleCJK(index);
					}
				}
			}
		}
		else{//pathMap中找不到index对应的LexemePath
			//单字输出
			this.outputSingleCJK(index);
			index++;
		}
	}
	//清空当前的Map
	this.pathMap = {};
	
  var result = [];
  lexeme = this.results.shift();
  while(lexeme){
    this.compound(lexeme);
    result.push(this.segmentBuff.substr(lexeme.begin, lexeme.len));
    
    lexeme = this.results.shift();
  }
/*  this.results.forEach(function(v){
    result.push(segmentBuff.substr(v.begin, v.len));
  });*/
  
  return result.join(' ');
};

/**
 * 对CJK字符进行单字输出
 * @param index
 */
AnalyzeContext.prototype.outputSingleCJK = function(index){
	if (CharType.CHAR_CHINESE === this.charTypes[index]){
		var singleCharLexeme = new Lexeme(this.buffOffset, index, 1, LexemeType.TYPE_CNCHAR);
		this.results.push(singleCharLexeme);
	}
	else if(CharType.CHAR_OTHER_CJK === this.charTypes[index]){
		var singleCharLexeme = new Lexeme(this.buffOffset , index , 1 , LexemeType.TYPE_OTHER_CJK);
		this.results.push(singleCharLexeme);
	}
};

/**
 * 重置分词上下文状态
 */
AnalyzeContext.prototype.reset = function(){		
	this.buffLocker = {};
  this.orgLexemes = new QuickSortSet();
  this.available =0;
  this.buffOffset = 0;
	this.charTypes = [];
	this.cursor = 0;
	this.results = [];
	this.segmentBuff = [];
	this.pathMap = {};
};

/**
 * 组合词元
 */
AnalyzeContext.prototype.compound = function(lexeme){
 	//数量词合并处理
 	var nextLexeme, appendOk = true;
	while (appendOk && this.results.length > 0){
	  appendOk = false;
		if (LexemeType.TYPE_ARABIC === lexeme.lexemeType){
			nextLexeme = this.results[0];
			if (LexemeType.TYPE_CNUM === nextLexeme.lexemeType){
				//合并英文数词+中文数词
				appendOk = LexemeService.append(lexeme, nextLexeme, LexemeType.TYPE_CNUM);
			}
			else if (LexemeType.TYPE_COUNT === nextLexeme.lexemeType){
				//合并英文数词+中文量词
				appendOk = LexemeService.append(lexeme, nextLexeme, LexemeType.TYPE_CQUAN);
			}
			if (appendOk){
				//弹出
				this.results.shift();
			}
		}
		
		//可能存在第二轮合并
		if (LexemeType.TYPE_CNUM === lexeme.lexemeType && this.results.length > 0){
			nextLexeme = this.results[0];
		  appendOk = false;
			if (LexemeType.TYPE_COUNT == nextLexeme.lexemeType){
				//合并中文数词+中文量词
				appendOk = LexemeService.append(lexeme, nextLexeme, LexemeType.TYPE_CQUAN);
			}  
			if (appendOk){
				//弹出
				this.results.shift();   				
			}
		}
	}
};
