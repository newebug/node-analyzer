/*
 * 实现Java的TreeSet类
        给Set集合中的元素进行元素compareTo指定方式的排序。
        保证元素唯一性的方式：通过元素compareTo比较是否相同.
        底层数据结构是：二叉树。
 */
var AnalyzeService = require('./AnalyzeService'),
  LexemePathService = AnalyzeService.LexemePathService;
  
var TreeSet = function() {
	this.arr = [];
};

module.exports = TreeSet;

TreeSet.prototype.add = function(lexemePath){
/*  this.arr.push(elem);
  this.arr = this.arr.sort(function(x, y){
    return x.compareTo(y);
  });*/
  if (this.arr.length === 0){
    this.arr.push(lexemePath);
    return null;
  }
  var headList = [], head, compRes;
  head = this.arr.shift();
  compRes = LexemePathService.compare(lexemePath, head);
  if (compRes === 0){   // 与头部相同，不放入集合
    this.arr.unshift(head);
    return null;
  }
  else if (compRes < 0){  // 插入头部
    this.arr.unshift(head);
    this.arr.unshift(lexemePath);
    return null;
  }
  else{                 //从头部往下插
    headList.push(head);
    var arr = this.add(lexemePath);
    if (!arr) {
      this.arr = headList.concat(this.arr);
      return null;
    }
    else{
      headList.concat(arr);
      return headList;
    }
  }
};

TreeSet.prototype.first = function(){
  if (this.arr.length > 0){
    return this.arr[0];
  }
  else{
    return null;
  }
};

