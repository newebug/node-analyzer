
var UNMATCH = 0,
  MATCH = 1,
  PREFIX = 2;

var Hit = function(){
  this.hitState = 0;//UNMATCH;
  this.matchedDictSegment = null;
  this.begin = 0;
  this.end = 0;
//  this.endPosition = 0;
};

module.exports = Hit;

/*  移到 HitService 下
Hit.prototype.isMatch = function(){
  return this.hitState & MATCH > 0;
};

Hit.prototype.setMatch = function(){
  this.hitState = this.hitState | MATCH;
};

Hit.prototype.isPrefix = function(){
  return (this.hitState & PREFIX) > 0;
};

Hit.prototype.setPrefix = function(){
  this.hitState = this.hitState | PREFIX;
};

Hit.prototype.isUnmatch = function(){
  return this.hitState === UNMATCH;
};

Hit.prototype.setUnmatch = function(){
  this.hitState = UNMATCH;
};*/
