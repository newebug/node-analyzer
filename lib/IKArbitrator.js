var LexemePath = require('./LexemePath'),
  TreeSet = require('./TreeSet'),
  AnalyzeService = require('./AnalyzeService'),
  SortedSetService = AnalyzeService.SortedSetService,
  LexemePathService = AnalyzeService.LexemePathService;

var utils = require('./utils');

/**
 * IK分词歧义裁决器
 */
var IKArbitrator = function() {
  
};

module.exports = IKArbitrator;

/**
 * 分词歧义处理
//	 * @param orgLexemes
 * @param useSmart
 */
IKArbitrator.prototype.process = function(context){
	var orgLexemes = context.orgLexemes;
	var orgLexeme = orgLexemes.pollFirst();

	var crossPath = new LexemePath();
	while (orgLexeme){
	  var isAdded = LexemePathService.addCrossLexeme(crossPath, orgLexeme);
		if (!isAdded){
			//找到与crossPath不相交的下一个crossPath(当前分词无交叉)
			if (crossPath.lexemeList.length === 1){
				//crossPath没有歧义 或者 不做歧义处理
				//直接输出当前crossPath
				context.addLexemePath(crossPath);
			}
			else{
				//对当前的crossPath进行歧义处理
				var lexeme = crossPath.peekFirst();
				var judgeResult = this.judge(crossPath, lexeme/*, crossPath.getPathLength()*/);
				//输出歧义处理结果judgeResult
				context.addLexemePath(judgeResult);
			}

			//把orgLexeme加入新的crossPath中
			crossPath = new LexemePath();
			LexemePathService.addCrossLexeme(crossPath, orgLexeme);
		}
		orgLexeme = orgLexemes.pollFirst();
	}

	//处理最后的path
	if (crossPath.lexemeList.length === 1){
		//crossPath没有歧义 或者 不做歧义处理
		//直接输出当前crossPath
		context.addLexemePath(crossPath);
	}
	else{
		//对当前的crossPath进行歧义处理
		var lexeme = crossPath.peekFirst();
		var judgeResult = this.judge(crossPath, lexeme/*, crossPath.getPathLength()*/);
		//输出歧义处理结果judgeResult
		context.addLexemePath(judgeResult);
	}
};

/**
 * 歧义识别
 * @param lexeme 歧义路径链表头
 * @param fullTextLength 歧义路径文本长度
 * @return
 */
IKArbitrator.prototype.judge = function(crossPath, lexeme/*, fullTextLength*/){
	//候选路径集合
	var pathOptions = new TreeSet();
	//候选结果路径
	var option = new LexemePath();

	//对crossPath进行一次遍历,同时返回本次遍历中有冲突的Lexeme栈
	var lexemeStack = this.forwardPath(crossPath, lexeme, option);
	//当前词元链并非最理想的，加入候选路径集合
	pathOptions.add(option);

	//存在歧义词，处理
	var c = null;
	while (lexemeStack.length > 0){
		c = lexemeStack.pop();
		//回滚词元链
		this.backPath(crossPath, c/*, option*/);
		//从歧义词位置开始，递归，生成可选方案
		this.forwardPath(crossPath, c, option);
		pathOptions.add(option);
	}

	//返回集合中的最优方案
	return pathOptions.first();
};

/**
 * 向前遍历，添加词元，构造一个无歧义词元组合
//	 * @param LexemePath path
 * @return
 */
IKArbitrator.prototype.forwardPath = function(crossPath, lexeme, option){
	//发生冲突的Lexeme栈
	var conflictStack = [];
	var c = lexeme;
	//迭代遍历Lexeme链表
	while(c){
		if (!LexemePathService.addNotCrossLexeme(option, c)){
			//词元交叉，添加失败则加入lexemeStack栈
			conflictStack.push(c);
		}
		c = LexemePathService.getNextLexeme(crossPath, c);
	}
	return conflictStack;
};

/**
 * 回滚词元链，直到它能够接受指定的词元
//	 * @param lexeme
 * @param l
 */
IKArbitrator.prototype.backPath = function(crossPath, l/*, option*/){
	while(LexemePathService.checkCross(crossPath, l)){
		LexemePathService.removeTail(crossPath);
	}
};
