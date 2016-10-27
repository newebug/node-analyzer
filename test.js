var Segmenter = require('./lib/Segmenter');


var opts = {
  MainDictPath: 'lib/dict/main.dic',
  SurnameDictPath: 'lib/dict/surname.dic',
  QuantifierDictPath: 'lib/dict/quantifier.dic',
  SuffixDictPath: 'lib/dict/suffix.dic',
  PrepDictPath: 'lib/dict/preposition.dic',
  StopWordDictPath: 'lib/dict/stopword.dic',
};

var segmenter = new Segmenter(opts);

var txt = '１９９５年１０月，他与中方探讨了在海运、造船方面合作的可能与途径。';
console.log('txt: ', txt);

var result = segmenter.analyze(txt);
console.log('result: ', result);

txt = '无耻啊无耻，西工大图书馆 标题要长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长';
console.log('txt: ', txt);

result = segmenter.analyze(txt);
console.log('result: ', result);

