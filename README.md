[![Build Status](https://travis-ci.org/newebug/node-analyzer.png)](https://travis-ci.org/newebug/node-analyzer)
[![npm version](https://badge.fury.io/js/node-analyzer.svg)](http://badge.fury.io/js/node-analyzer)
[![NPM Downloads](https://img.shields.io/npm/dm/node-analyzer.svg)](https://npmjs.org/package/node-analyzer)
# node-analyzer
基于 IKAnalyzer 字典分词器的 node.js 实现

# 安装
      
      npm i node-analyzer

# 用法
test.js

      var Segmenter = require('node-analyzer');
      var segmenter = new Segmenter();
      
      var txt = '１９９５年１０月，他与中方探讨了在海运、造船方面合作的可能与途径。';
      console.log('txt: ', txt);
      
      var result = segmenter.analyze(txt);
      console.log('result: ', result);
      
      // result:  １９９５年 １０月 ， 他 与 中方 探讨 了 在 海运 、 造船 方面 合作 的 可能 与 途径 。

# 效果
对 Backoff 2005 的测试语料 pku_test.utf8，msr_test.utf8 结果如下：

msr_test.utf8：

    标准词数：106873 个，正确词数：79516 个，错误词数：20638 个
    标准行数：3985，正确行数：302 ，错误行数：3683
    Recall: 74.4023279968%
    Precision: 79.3937336502%
    F MEASURE: 76.817033527%
    ERR RATE: 0.193107707279%
  
pku_test.utf8：

    标准词数：104372 个，正确词数：75045 个，错误词数：18985 个
    标准行数：1944，正确行数：206 ，错误行数：1738
    Recall: 71.9014678266%
    Precision: 79.8096352228%
    F MEASURE: 75.6494390178%
    ERR RATE: 0.181897443759%
  
评分代码：
    
    http://blog.csdn.net/mg1616/article/details/45545919
    
虽然准确率不高，但是考虑测试语料的标准分词也有不合理的地方，并且网络的快速发展，近年也出现不少新鲜词汇，所以这个效果应该是比较令人满意的。

# 性能

     初始化耗时：1094ms
     分词速度：358778.63 字/秒, 900763.36 字节/秒, 字数：1880000，耗时：5240ms
     
用最新版本的 io.js 2.02 测试时，耗时减少到50%，分词速度达到 50w字/秒
