var fs = require('fs'),
    config = require('./config'),
    Hit = require('./Hit'),
    HitService = require('./HitService');
    
var DictSegment = require('./DictSegment');

var PATH_DIC_MAIN      = __dirname + "/dict/main.dic",
   PATH_DIC_SURNAME    = __dirname + "/dict/surname.dic",
   PATH_DIC_QUANTIFIER = __dirname + "/dict/quantifier.dic",
   PATH_DIC_SUFFIX     = __dirname + "/dict/suffix.dic",
   PATH_DIC_PREP       = __dirname + "/dict/preposition.dic",
   PATH_DIC_STOP       = __dirname + "/dict/stopword.dic";

var Dictionary = {
  inited: false,
  initial: function(opts){
    this.inited = true;
    this.config = opts.Config || config;
    
    if (!this.config.ext_dict) { this.config.ext_dict = config.ext_dict;}
    if (!this.config.ext_stopwords) { this.config.ext_stopwords = config.ext_stopwords;}
    
    this.loadMainDict(opts.MainDictPath);
    
    this.loadSurnameDict(opts.SurnameDictPath);
    this.loadQuantifierDict(opts.QuantifierDictPath);
    this.loadSuffixDict(opts.SuffixDictPath);
    this.loadPrepDict(opts.PrepDictPath);
    this.loadStopWordDict(opts.StopWordDictPath);
    
    // todo 缓存字典
    //fs.writeFileSync('./dict/main.dic.json', JSON.stringify(this._MainDict, null, '\t'));
  },
  loadExtDict: function(filepath){
		//读取扩展词典文件
    var file = fs.readFileSync(filepath, {encoding: 'utf8'});
    file = file.replace(/ |\r/g, '');
    file = file.split('\n');
    
    var theWord;
    for(var i=0;i<file.length;i++){
      theWord = file[i];
      if (theWord && theWord !== ''){
        this.fillSegment(this._MainDict, theWord);
      }
    }
  },
  loadMainDict: function(dictPath){
		//建立一个主词典实例
		this._MainDict = new DictSegment();

		//读取主词典文件
    var file = fs.readFileSync(dictPath || PATH_DIC_MAIN, {encoding: 'utf8'});
    file = file.replace(/ |\r/g, '');
    file = file.split('\n');

    var theWord;
    for(var i=0;i<file.length;i++){
      theWord = file[i];
      if (theWord && theWord !== ''){
        this.fillSegment(this._MainDict, theWord);
      }
    }
    
		//加载配置的扩展词典
		var extDictFiles  = this.config.ext_dict;
		if (extDictFiles){
		  for(var i=0;i<extDictFiles.length;i++){
		    this.loadExtDict(extDictFiles[i]);
		  }
		}
		//console.log('主字典+扩展字典条数：', this._MainDict.storeSize);
	},
	loadSurnameDict: function(dictPath){
		//建立 词典实例
		this._SurnameDict = new DictSegment();

		//读取 词典文件
    var file = fs.readFileSync(dictPath || PATH_DIC_SURNAME, {encoding: 'utf8'});
    file = file.replace(/ |\r/g, '');
    file = file.split('\n');
    
    var theWord;
    for(var i=0;i<file.length;i++){
      theWord = file[i];
      if (theWord && theWord !== ''){
        this.fillSegment(this._SurnameDict, theWord);
      }
    }
	},
	loadQuantifierDict: function(dictPath){
		//建立一个量词典实例
		this._QuantifierDict = new DictSegment();

		//读取量词词典文件
    var file = fs.readFileSync(dictPath || PATH_DIC_QUANTIFIER, {encoding: 'utf8'});
    file = file.replace(/ |\r/g, '');
    file = file.split('\n');
    
    var theWord;
    for(var i=0;i<file.length;i++){
      theWord = file[i];
      if (theWord && theWord !== ''){
        this.fillSegment(this._QuantifierDict, theWord);
      }
    }
	},
	loadSuffixDict: function(dictPath){
		//建立 词典实例
		this._SuffixDict = new DictSegment();

		//读取 词典文件
    var file = fs.readFileSync(dictPath || PATH_DIC_SUFFIX, {encoding: 'utf8'});
    file = file.replace(/ |\r/g, '');
    file = file.split('\n');
    
    var theWord;
    for(var i=0;i<file.length;i++){
      theWord = file[i];
      if (theWord && theWord !== ''){
        this.fillSegment(this._SuffixDict, theWord);
      }
    }
	},
	loadPrepDict: function(dictPath){
		//建立 词典实例
		this._PrepDict = new DictSegment();

		//读取 词典文件
    var file = fs.readFileSync(dictPath || PATH_DIC_PREP, {encoding: 'utf8'});
    file = file.replace(/ |\r/g, '');
    file = file.split('\n');
    
    var theWord;
    for(var i=0;i<file.length;i++){
      theWord = file[i];
      if (theWord && theWord !== ''){
        this.fillSegment(this._PrepDict, theWord);
      }
    }
	},
	loadStopWordDict: function(dictPath){
		//建立停词词典实例
		this._StopWords = new DictSegment();

		//读取停词词典文件
    var file = fs.readFileSync(dictPath || PATH_DIC_STOP, {encoding: 'utf8'});
    file = file.replace(/ |\r/g, '');
    file = file.split('\n');
    
    var theWord;
    for(var i=0;i<file.length;i++){
      theWord = file[i];
      if (theWord && theWord !== ''){
        this.fillSegment(this._StopWords, theWord);
      }
    }
    
    //加载配置的扩展词典
		var extStopDictFiles  = this.config.ext_stopwords;
		if (extStopDictFiles){
		  for(var i=0;i<extStopDictFiles.length;i++){
		    this.loadExtStopWordDict(extStopDictFiles[i]);
		  }
		}
	},
	loadExtStopWordDict: function(filepath){
		this._StopWords = new DictSegment();

    var file = fs.readFileSync(filepath, {encoding: 'utf8'});
    file = file.replace(/ |\r/g, '');
    file = file.split('\n');
    
    var theWord;
    for(var i=0;i<file.length;i++){
      theWord = file[i];
      if (theWord && theWord !== ''){
        this.fillSegment(this._StopWords, theWord);
      }
    }
  },
  addWords: function(words){
		if (words){
		  var word;
			for(var i=0;i<words.length;i++){
			  word = words[i];
				if (word) {
				  word = word.trim();
					//批量加载词条到主内存词典中
					this.fillSegment(this._MainDict, word);
				}
			}
		}
	},
	disableWords: function(words){
		if (words){
			var word;
			for(var i=0;i<words.length;i++){
			  word = words[i].trim();
				if (word) {
				  word = word.trim();
					//批量屏蔽词条
					//this._MainDict.disableSegment(word);
					this.fillSegment(this._MainDict, word, 0, word.length, 0);
				}
			}
		}
	},
	matchInMainDict: function(charArray, begin, len){
		return this.matchInDictSegment(this._MainDict, charArray, begin, len);
	},
	matchInQuantifierDict: function(charArray, begin, len){
		return this.matchInDictSegment(this._QuantifierDict, charArray, begin, len);
	},
	matchWithHit: function(charArray, currentIndex, matchedHit){
		var ds = matchedHit.matchedDictSegment;
		return this.matchInDictSegment(ds, charArray, currentIndex, 1 , matchedHit);
	},
	isStopWord: function(charArray, begin, len){			
		return HitService.isMatch(this.matchInDictSegment(this._StopWords, charArray, begin, len));
	},
	fillSegment: function(dictSeg, charArray, begin, len, enabled){
    begin = begin || 0;
    len = len || charArray.length;
    if (enabled !== 0) { enabled = 1; }
    
    //获取字典表中的汉字对象
  	var beginChar = charArray[begin];
  	var keyChar = beginChar;// = dictSeg.charMap[beginChar];
  
  	//字典中没有该字，则将其添加入字典
  	//if(!dictSeg.charMap[beginChar]){
  	//if (!dictSeg.childrenMap[beginChar]){
  		//dictSeg.charMap[beginChar] = beginChar;
  		//dictSeg.childrenMap[beginChar] = {};
  		//keyChar = beginChar;
  	//}
  
  	//搜索当前节点的存储，查询对应keyChar的keyChar，如果没有则创建
  	var ds = Dictionary.lookforSegment(dictSeg, keyChar, enabled);
  	if (ds){
  		//处理keyChar对应的segment
  		if(len > 1){
  			//词元还没有完全加入词典树
  			Dictionary.fillSegment(ds, charArray, begin + 1, len - 1 , enabled);
  		}
  		else if (len === 1){
  			//已经是词元的最后一个char,设置当前节点状态为enabled，
  			//enabled=1表明一个完整的词，enabled=0表示从词典中屏蔽当前词
  			ds.nodeState = enabled;
  		}
  	}
  },
  matchInDictSegment: function(dictSeg, charArray, begin, len, searchHit) {
  	if (!searchHit){
  		//如果hit为空，新建
  		searchHit = new Hit();
  		//设置hit的起始文本位置
  		searchHit.begin = begin;
  	}
  	else{
  		//否则要将HIT状态重置
  		HitService.setUnmatch(searchHit);
  	}
  	//设置hit的当前处理位置
  	searchHit.end = begin;
  
    var keyChar = charArray[begin];
  	//在map中查找
  	var ds = dictSeg.childrenMap[keyChar];
  
  	//STEP2 找到DictSegment，判断词的匹配状态，是否继续递归，还是返回结果
  	if (ds){
  		if (len > 1){
  			//词未匹配完，继续往下搜索
  			return Dictionary.match(ds, charArray, begin + 1 , len - 1 , searchHit);
  		}
  		else if (len === 1){
  			//搜索最后一个char
  			if(ds.nodeState === 1){
  				//添加HIT状态为完全匹配
  				HitService.setMatch(searchHit);
  			}
  			if(ds.storeSize > 0){
  				//添加HIT状态为前缀匹配
  				HitService.setPrefix(searchHit);
  				//记录当前位置的DictSegment
  				searchHit.matchedDictSegment = ds;
  			}
  			return searchHit;
  		}
  	}
  	//STEP3 没有找到DictSegment， 将HIT设置为不匹配
  	return searchHit;
  },
  lookforSegment: function(dictSeg, keyChar, create){
  	//搜索Map
  	var ds = dictSeg.childrenMap[keyChar];
  	if (!ds && create){
  		//构造新的segment
  		ds = new DictSegment();
  		dictSeg.childrenMap[keyChar] = ds;
  		//当前节点存储segment数目+1
  		dictSeg.storeSize += 1;
  	}
  
  	return ds;
  }

};

module.exports = Dictionary;
