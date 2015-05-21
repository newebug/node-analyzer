# node-analyzer
基于 IKAnalyzer 字典分词器的 node.js 实现

# 安装
暂时没有发布到 npm，可打包下载解压到 node_modules 目录下使用

# 用法
test.js

      var Segmenter = require('node-analyzer');
      var segmenter = new Segmenter();
      
      var txt = '１９９５年１０月，他根据“船长”的建议与中方探讨了在海运、造船方面合作的可能与途径。';
      console.log('txt: ', txt);
      
      var result = segmenter.analyze(txt);
      console.log('result: ', result);
      
      // result:  １９９５年 １０月 ， 他 根据 “ 船长 ” 的 建议 与 中方 探讨 了 在 海运 、 造船 方面 合作 的 可能 与 途径 。
