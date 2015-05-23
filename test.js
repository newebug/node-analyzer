var Segmenter = require('./lib/Segmenter');
var segmenter = new Segmenter();

var txt = '１９９５年１０月，他与中方探讨了在海运、造船方面合作的可能与途径。';
console.log('txt: ', txt);

var result = segmenter.analyze(txt);
console.log('result: ', result);