var utils = {
  arrayFind: function(arr, key, val){
    var found = null;
    for(var i=0;i<arr.length;i++){
      if (arr[i][key] === val){
        found = arr[i];
        break;
      }
    }
    return found;
  },
  clone: function(origin){
    if(!origin){
      return;
    }
  
    if (Array.isArray(origin)){
      return origin.concat();
    }
    
    var obj = {};
    for(var f in origin){
      //if(origin.hasOwnProperty(f)){
      if (typeof origin[f] !== 'undefined'){
        obj[f] = origin[f];
      }
    }
    return obj;
  }
};

module.exports = utils;
