var Dictionary = require('./Dictionary');

var Lexeme = require('./Lexeme'),
  consts = require('./consts'),
  LexemeType = consts.LexemeType,
  CharType = consts.CharType,
  HitService = require('./HitService'),
  SortedSetService = require('./AnalyzeService').SortedSetService;

var SEGMENTER_NAME = "QUAN_SEGMENTER", //子分词器标签
    Chn_Num = "０１２３４５６７８９〇一二两三四五六七八九十零壹贰叁肆伍陆柒捌玖拾百佰千仟万萬亿億拾佰仟萬亿億兆卅廿"; //中文数词

/**
 * 
 * 中文数量词子分词器
 */
var CN_QuantifierSegmenter = function() {
//  this.name = SEGMENTER_NAME;
//	this.ChnNumberChars = Chn_Num;
	
	/*
	 * 词元的开始位置，
	 * 同时作为子分词器状态标识
	 * 当start > -1 时，标识当前的分词器正在处理字符
	 */
	this.nStart = -1;
	/*
	 * 记录词元结束位置
	 * end记录的是在词元中最后一个出现的合理的数词结束
	 */
	this.nEnd = -1;
	
	//待处理的量词hit队列
	this.countHits = [];
};

module.exports = CN_QuantifierSegmenter;

/**
 * 分词
 */
CN_QuantifierSegmenter.prototype.analyze = function(context) {
	//处理中文数词
	this.processCNumber(context);
	//处理中文量词
	this.processCount(context);
	
	//判断是否锁定缓冲区
	if (this.nStart === -1 && this.nEnd === -1	&& this.countHits.length === 0){
		//对缓冲区解锁
		context.unlockBuffer(SEGMENTER_NAME);
	}
	else{
		context.lockBuffer(SEGMENTER_NAME);
	}
};

/**
 * 重置子分词器状态
 */
CN_QuantifierSegmenter.prototype.reset = function() {
	this.nStart = -1;
	this.nEnd = -1;
	this.countHits = [];
};

/**
 * 处理数词
 */
CN_QuantifierSegmenter.prototype.processCNumber = function(context){
  var charType = context.getCurrentCharType();
	if (this.nStart === -1 && this.nEnd === -1){//初始状态
		if ((CharType.CHAR_CHINESE === charType || CharType.CHAR_ARABIC === charType) &&
		  Chn_Num.indexOf(context.getCurrentChar()) >= 0){
			//记录数词的起始、结束位置
			this.nStart = context.cursor;
			this.nEnd = context.cursor;
		}
	}
	else{//正在处理状态
		if ((CharType.CHAR_CHINESE === charType || CharType.CHAR_ARABIC === charType) &&
		    Chn_Num.indexOf(context.getCurrentChar()) >= 0){
			//记录数词的结束位置
			this.nEnd = context.cursor;
		}
		else{
			//输出数词
			this.outputNumLexeme(context);
			//重置头尾指针
			this.nStart = -1;
			this.nEnd = -1;
		}
	}
	
	//缓冲区已经用完，还有尚未输出的数词
/*	if (context.isBufferConsumed()){
		if (this.nStart !== -1 && this.nEnd !== -1){
			//输出数词
			this.outputNumLexeme(context);
			//重置头尾指针
			this.nStart = -1;
			this.nEnd = -1;
		}
	}	*/
};

/**
 * 处理中文量词
 * @param context
 */
CN_QuantifierSegmenter.prototype.processCount = function(context){
	// 判断是否需要启动量词扫描
	if (!this.needCountScan(context)){
	  var l = context.orgLexemes.peekLast();
		return;
	}
	
	if (CharType.CHAR_CHINESE === context.getCurrentCharType()){
		//优先处理countHits中的hit
		var hit, tmpArray = [];
		for(var i=0;i<this.countHits.length;i++){
		  hit = this.countHits[i];
			//处理词段队列

			hit = Dictionary.matchWithHit(context.segmentBuff, context.cursor, hit);
			if (HitService.isMatch(hit)){
				//输出当前的词
				var newLexeme = new Lexeme(context.buffOffset, hit.begin, context.cursor - hit.begin + 1, LexemeType.TYPE_COUNT);
				SortedSetService.addLexeme(context.orgLexemes, newLexeme);

				if (HitService.isPrefix(hit)){//是词前缀，留着
					tmpArray.push(hit);
				}
			}
			else if (!HitService.isUnmatch(hit)){
				//hit是词，留着
				tmpArray.push(hit);
			}
		}
		this.countHits = tmpArray;

		//*********************************
		//对当前指针位置的字符进行单字匹配
		var singleCharHit = Dictionary.matchInQuantifierDict(context.segmentBuff, context.cursor, 1);
		if (HitService.isMatch(singleCharHit)){//首字成量词词
			//输出当前的词
			var newLexeme = new Lexeme(context.buffOffset, context.cursor, 1, LexemeType.TYPE_COUNT);
			SortedSetService.addLexeme(context.orgLexemes, newLexeme);
			//同时也是词前缀
			if (HitService.isPrefix(singleCharHit)){
				//前缀匹配则放入hit列表
				this.countHits.push(singleCharHit);
			}
		}
		else if (HitService.isPrefix(singleCharHit)){//首字为量词前缀
			//前缀匹配则放入hit列表
			this.countHits.push(singleCharHit);
		}
	}
	else{
		//输入的不是中文字符
		//清空未成形的量词
		this.countHits = [];
	}
	
	//缓冲区数据已经读完，还有尚未输出的量词
/*	if (context.isBufferConsumed()){
		//清空未成形的量词
		this.countHits = [];
	}*/
};

/**
 * 判断是否需要扫描量词
 * @return
 */
CN_QuantifierSegmenter.prototype.needCountScan = function(context){
  var l = context.orgLexemes.peekLast();
	if ((this.nStart !== -1 && this.nEnd !== -1) || this.countHits.length > 0){
		//正在处理中文数词,或者正在处理量词
		return true;
	}
	else{
		//找到一个相邻的数词
		if (context.orgLexemes.lexemeList.length > 0){
			var l = context.orgLexemes.peekLast();
			if (l && (LexemeType.TYPE_CNUM === l.lexemeType || LexemeType.TYPE_ARABIC === l.lexemeType)){
				if (l.begin + l.len === context.cursor){
					return true;
				}
			}
		}
	}
	return false;
};

/**
 * 添加数词词元到结果集
 * @param context
 */
CN_QuantifierSegmenter.prototype.outputNumLexeme = function(context){
	if (this.nStart > -1 && this.nEnd > -1){
		//输出数词
		var newLexeme = new Lexeme(context.buffOffset, this.nStart, this.nEnd - this.nStart + 1, LexemeType.TYPE_CNUM);
		SortedSetService.addLexeme(context.orgLexemes, newLexeme);
	}
};
