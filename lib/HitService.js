
var UNMATCH = 0,
  MATCH = 1,
  PREFIX = 2;

module.exports = {

  isMatch: function(hit){
    return hit.hitState & MATCH > 0;
  },

  setMatch: function(hit){
    hit.hitState = hit.hitState | MATCH;
  },

  isPrefix: function(hit){
    return (hit.hitState & PREFIX) > 0;
  },

  setPrefix: function(hit){
    hit.hitState = hit.hitState | PREFIX;
  },

  isUnmatch: function(hit){
    return hit.hitState === UNMATCH;
  },

  setUnmatch: function(hit){
    hit.hitState = UNMATCH;
  }
};