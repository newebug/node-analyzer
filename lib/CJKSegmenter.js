
var Dictionary = require('./Dictionary');
var Lexeme = require('./Lexeme'),
  consts = require('./consts'),
  LexemeType = consts.LexemeType,
  CharType = consts.CharType,
  HitService = require('./HitService'),
  AnalyzeService = require('./AnalyzeService'),
  SortedSetService = AnalyzeService.SortedSetService;
var SEGMENTER_NAME = "CJK_SEGMENTER"; //子分词器标签

/**
 *  中文-日韩文子分词器
 */
var CJKSegmenter = function() {
//  this.name = SEGMENTER_NAME;
  //待处理的分词hit队列
	this.tmpHits = [];
};

module.exports = CJKSegmenter;

/* (non-Javadoc)
 * @see org.wltea.analyzer.core.ISegmenter#analyze(org.wltea.analyzer.core.AnalyzeContext)
 */
CJKSegmenter.prototype.analyze = function(context) {
	if (CharType.CHAR_USELESS !== context.getCurrentCharType()){
		//优先处理tmpHits中的hit
		if (this.tmpHits.length > 0){
			//处理词段队列
			var hit, tmpArray = [];
			for (var i=0;i<this.tmpHits.length;i++){
			  hit = this.tmpHits[i];
				hit = Dictionary.matchWithHit(context.segmentBuff, context.cursor, hit);
				if (HitService.isMatch(hit)){
					//输出当前的词
					var newLexeme = new Lexeme(context.buffOffset, hit.begin, context.cursor - hit.begin + 1, LexemeType.TYPE_CNWORD);
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
			this.tmpHits = tmpArray;
		}
		//*********************************
		//再对当前指针位置的字符进行单字匹配
		var singleCharHit = Dictionary.matchInMainDict(context.segmentBuff, context.cursor, 1);
		
		if (HitService.isMatch(singleCharHit)){//首字成词
			//输出当前的词
			var newLexeme = new Lexeme(context.buffOffset, context.cursor, 1, LexemeType.TYPE_CNWORD);
			SortedSetService.addLexeme(context.orgLexemes, newLexeme);
			//同时也是词前缀
			if (HitService.isPrefix(singleCharHit)){
				//前缀匹配则放入hit列表
				this.tmpHits.push(singleCharHit);
			}
		}
		else if (HitService.isPrefix(singleCharHit)){//首字为词前缀
			//前缀匹配则放入hit列表
			this.tmpHits.push(singleCharHit);
		}
	}
	else{
		//遇到CHAR_USELESS字符
		//清空队列
		this.tmpHits = [];
	}

	//判断缓冲区是否已经读完
/*	if (context.isBufferConsumed()){
		//清空队列
		this.tmpHits = [];
	}*/

	//判断是否锁定缓冲区
	if (this.tmpHits.length === 0){
		context.unlockBuffer(SEGMENTER_NAME);
	}
	else{
		context.lockBuffer(SEGMENTER_NAME);
	}
};

CJKSegmenter.prototype.reset = function() {
	this.tmpHits = [];
};

