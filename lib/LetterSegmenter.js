
var Lexeme = require('./Lexeme'),
  consts = require('./consts'),
  LexemeType = consts.LexemeType,
  CharType = consts.CharType,
  SortedSetService = require('./AnalyzeService').SortedSetService;

var SEGMENTER_NAME = "LETTER_SEGMENTER", //子分词器标签
    Letter_Connector = ['#', '&', '+', '-', '.', '@', '_'].sort(), //链接符号
    Num_Connector = [',', '.'].sort();  //数字符号
    
/**
 * 
 * 英文字符及阿拉伯数字子分词器
 */
var LetterSegmenter = function() {
//  this.name = SEGMENTER_NAME;
	/*
	 * 词元的开始位置，
	 * 同时作为子分词器状态标识
	 * 当start > -1 时，标识当前的分词器正在处理字符
	 */
	this.start = -1;
	/*
	 * 记录词元结束位置
	 * end记录的是在词元中最后一个出现的Letter但非Sign_Connector的字符的位置
	 */
	this.end = -1;
	
	/*
	 * 字母起始位置
	 */
	this.englishStart = -1;

	/*
	 * 字母结束位置
	 */
	this.englishEnd = -1;
	
	/*
	 * 阿拉伯数字起始位置
	 */
	this.arabicStart = -1;
	
	/*
	 * 阿拉伯数字结束位置
	 */
	this.arabicEnd = -1;
};

module.exports = LetterSegmenter;

/* (non-Javadoc)
 * @see org.wltea.analyzer.core.ISegmenter#analyze(org.wltea.analyzer.core.AnalyzeContext)
 */
LetterSegmenter.prototype.analyze = function(context) {
	var bufferLockFlag = false;
	//处理英文字母
	bufferLockFlag = this.processEnglishLetter(context) || bufferLockFlag;
	//处理阿拉伯字母
	bufferLockFlag = this.processArabicLetter(context) || bufferLockFlag;
	//处理混合字母(这个要放最后处理，可以通过QuickSortSet排除重复)
	bufferLockFlag = this.processMixLetter(context) || bufferLockFlag;
	
	//判断是否锁定缓冲区
	if (bufferLockFlag){
		context.lockBuffer(SEGMENTER_NAME);
	}
	else{
		//对缓冲区解锁
		context.unlockBuffer(SEGMENTER_NAME);
	}
};

/* (non-Javadoc)
 * @see org.wltea.analyzer.core.ISegmenter#reset()
 */
LetterSegmenter.prototype.reset = function() {
	this.start = -1;
	this.end = -1;
	this.englishStart = -1;
	this.englishEnd = -1;
	this.arabicStart = -1;
	this.arabicEnd = -1;
};

/**
 * 处理数字字母混合输出
 * 如：windos2000 | linliangyi2005@gmail.com
//	 * @param input
 * @param context
 * @return
 */
LetterSegmenter.prototype.processMixLetter = function(context){
	var needLock = false, charType = context.getCurrentCharType();
	
	if (this.start === -1){//当前的分词器尚未开始处理字符
		if (CharType.CHAR_ARABIC === charType ||
		  CharType.CHAR_ENGLISH === charType){
			//记录起始指针的位置,标明分词器进入处理状态
			this.start = context.cursor;
			this.end = this.start;
		}
	}
	else {//当前的分词器正在处理字符			
		if (CharType.CHAR_ARABIC === charType ||
		    CharType.CHAR_ENGLISH === charType){
			//记录下可能的结束位置
			this.end = context.cursor;
		}
		else if (CharType.CHAR_USELESS === charType && 
		    this.isLetterConnector(context.getCurrentChar())){
			//记录下可能的结束位置
			this.end = context.cursor;
		}
		else{
			//遇到非Letter字符，输出词元
			var newLexeme = new Lexeme(context.buffOffset, this.start, this.end - this.start + 1, LexemeType.TYPE_LETTER);
			SortedSetService.addLexeme(context.orgLexemes, newLexeme);
			this.start = -1;
			this.end = -1;
		}			
	}
	
	//判断缓冲区是否已经读完
/*	if (context.isBufferConsumed()){
		if (this.start !== -1 && this.end !== -1){
			//缓冲以读完，输出词元
			var newLexeme = new Lexeme(context.buffOffset, this.start, this.end - this.start + 1, LexemeType.TYPE_LETTER);
			SortedSetService.addLexeme(context.orgLexemes, newLexeme);
			this.start = -1;
			this.end = -1;
		}
	}*/
	
	//判断是否锁定缓冲区
	if (this.start === -1 && this.end === -1){
		//对缓冲区解锁
		needLock = false;
	}else{
		needLock = true;
	}
	return needLock;
};

/**
 * 处理纯英文字母输出
 * @param context
 * @return
 */
LetterSegmenter.prototype.processEnglishLetter = function(context){
	var needLock = false;
	
	if (this.englishStart === -1){//当前的分词器尚未开始处理英文字符	
		if (CharType.CHAR_ENGLISH === context.getCurrentCharType()){
			//记录起始指针的位置,标明分词器进入处理状态
			this.englishStart = context.cursor;
			this.englishEnd = this.englishStart;
		}
	}
	else {//当前的分词器正在处理英文字符	
		if (CharType.CHAR_ENGLISH === context.getCurrentCharType()){
			//记录当前指针位置为结束位置
			this.englishEnd =  context.cursor;
		}
		else{
			//遇到非English字符,输出词元
			var newLexeme = new Lexeme(context.buffOffset, this.englishStart, this.englishEnd - this.englishStart + 1, LexemeType.TYPE_ENGLISH);
			SortedSetService.addLexeme(context.orgLexemes, newLexeme);
			this.englishStart = -1;
			this.englishEnd= -1;
		}
	}
	
	//判断缓冲区是否已经读完
/*	if (context.isBufferConsumed()){
		if (this.englishStart !== -1 && this.englishEnd !== -1){
			//缓冲以读完，输出词元
			var newLexeme = new Lexeme(context.buffOffset, this.englishStart, this.englishEnd - this.englishStart + 1, LexemeType.TYPE_ENGLISH);
			SortedSetService.addLexeme(context.orgLexemes, newLexeme);

			this.englishStart = -1;
			this.englishEnd= -1;
		}
	}	*/
	
	//判断是否锁定缓冲区
	if (this.englishStart === -1 && this.englishEnd === -1){
		//对缓冲区解锁
		needLock = false;
	}
	else{
		needLock = true;
	}
	return needLock;			
};

/**
 * 处理阿拉伯数字输出
 * @param context
 * @return
 */
LetterSegmenter.prototype.processArabicLetter = function(context){
	var needLock = false;
	
	if (this.arabicStart === -1){//当前的分词器尚未开始处理数字字符	
		if (CharType.CHAR_ARABIC === context.getCurrentCharType()){
			//记录起始指针的位置,标明分词器进入处理状态
			this.arabicStart = context.cursor;
			this.arabicEnd = this.arabicStart;
		}
	}
	else {//当前的分词器正在处理数字字符	
		if (CharType.CHAR_ARABIC === context.getCurrentCharType()){
			//记录当前指针位置为结束位置
			this.arabicEnd = context.cursor;
		}
		else if (CharType.CHAR_USELESS === context.getCurrentCharType() &&
		  this.isNumConnector(context.getCurrentChar())){
			//不输出数字，但不标记结束
		}
		else{
			////遇到非Arabic字符,输出词元
			var newLexeme = new Lexeme(context.buffOffset, this.arabicStart, this.arabicEnd - this.arabicStart + 1, LexemeType.TYPE_ARABIC);
			SortedSetService.addLexeme(context.orgLexemes, newLexeme);
			this.arabicStart = -1;
			this.arabicEnd = -1;
		}
	}
	
	//判断缓冲区是否已经读完
/*	if (context.isBufferConsumed()){
		if (this.arabicStart !== -1 && this.arabicEnd !== -1){
			//生成已切分的词元
			var newLexeme = new Lexeme(context.buffOffset,  this.arabicStart, this.arabicEnd - this.arabicStart + 1, LexemeType.TYPE_ARABIC);
			SortedSetService.addLexeme(context.orgLexemes, newLexeme);
			this.arabicStart = -1;
			this.arabicEnd = -1;
		}
	}*/
	
	//判断是否锁定缓冲区
	if (this.arabicStart === -1 && this.arabicEnd === -1){
		//对缓冲区解锁
		needLock = false;
	}
	else{
		needLock = true;
	}
	return needLock;		
};

/**
 * 判断是否是字母连接符号
 * @param input
 * @return
 */
LetterSegmenter.prototype.isLetterConnector = function(input){
	var index = Letter_Connector.indexOf(input);
	return index >= 0;
};

/**
 * 判断是否是数字连接符号
 * @param input
 * @return
 */
LetterSegmenter.prototype.isNumConnector = function(input){
	var index = Num_Connector.indexOf(input);
	return index >= 0;
};

