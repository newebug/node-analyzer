module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
  	pkg: grunt.file.readJSON('package.json'),

    jshint: {
      // define the files to lint
      //files: ['**/*.js', '!node_modules/**/*'],
      files: [
        './*.js',
        '!node_modules/**/*'
      ],
      // configure JSHint (documented at http://www.jshint.com/docs/)
      options: {
        force: true,
        reporter: 'checkstyle',
        reporterOutput: 'jshint.xml',
        // more options here if you want to override JSHint defaults
        globals: {
          jQuery: true,
          console: false,
          node: true,
          module: true,
          define: true,
          require: true,
          createjs: true,
         
          exports: true,
          $: true,
          window: true,
          pomelo: true,
          setImmediate: true,
          __filename: true,
          __dirname: true,
          setTimeout: true,
          setInterval: true,
          clearInterval: true,
          process: true,
          Buffer: true,
          actor: true,      // pomelo-robot
        },
        asi: false,
        // 如果是真，JSHint会无视没有加分号的行尾， 自动补全分号一直是Javascript很有争议的一个语法特性。默认，JSHint会要求你在每个语句后面加上分号，但是如果你认为自己理解了asi(automatic semicolon insertion)，你可以抛弃JSHint对分号的检查。

        bitwise: false,
        //如果为真，JSHint会禁用位运算符 Javascript允许位运算，但是他却没有整型，位运算符要把参与运算的数字从浮点数变为整数，并在运算后再转换回来。这样他们的效率就不如在别的语言中那么高。

        boss: false,
        //很霸气的选项，如果为真，那么JSHint会允许在if，for，while里面编写赋值语句。 一般来说，我们会在循环、判断等语句中加入值的比较来做语句的运行条件，有时候会把==错写成赋值的=，通常，JSHint会把这个认定为一个错误，但是开启这个选项的化，JSHint就不会检查判断条件中的赋值 ，你是boss，你说的算:)。

        camelcase: false,
        // 强迫驼峰风格

        curly: true,
        //如果为真，JSHint会要求你在使用if和while等结构语句时加上{}来明确代码块。 Javascript允许在if等结构语句体只有一句的情况下不加括号。不过这样做可能会让你的代码读起来有些晦涩。

        debug: false,
        //如果为真，JSHint会允许代码中出现debugger的语句。不过建议你最好在检测代码前去掉debug的语句。

        eqeqeq: true,
        //如果为真，JSHint会看你在代码中是否都用了===或者是!==，而不是使用==和!=。 我们建议你在比较0，''(空字符)，undefined，null，false和true的时候使用===和!===。

        eqnull: false,
        //如果为真，JSHint会允许使用"== null"作比较。 == null 通常用来判断一个变量是undefined或者是null（当时用==，null和undefined都会转化为false）。

        evil: false,
        //如果为真，JSHint会允许使用eval eval提供了访问Javascript编译器的途径，这有时很有用，但是同时也对你的代码形成了注入攻击的危险，并且会对debug造成一些困难。 记住，Function构造函数也是另一个‘eval’，另外，当传入的参数是字符串的时候，setTimeout和setInterval也会类似于eval。

        forin: false,
        //如果为真，那么，JSHint允许在for in 循环里面不出现hasOwnProperty， for in循环一般用来遍历一个对象的属性，这其中也包括他继承自原型链的属性，而hasOwnProperty可以来判断一个属性是否是对象本身的属性而不是继承得来的。

        immed: true,
        //如果为真，JSHint要求匿名函数的调用如下：

        //(function(){ // }());
        //而不是

        //(function(){ //bla bla })();

//        indent: 2,

        latedef: true,
        // This option prohibits the use of a variable before it was defined. JavaScript has function scope only and, in addition to that, all variables are always moved—or hoisted— to the top of the function. This behavior can lead to some very nasty bugs and that's why it is safer to always use variable only after they have been explicitly defined.
        //      Setting this option to "nofunc" will allow function declarations to be ignored.

        laxbreak: false,
        //如果为真，JSHint则不会检查换行。 Javascript会通过自动补充分号来修正一些错误，因此这个选项可以检查一些潜在的问题。

        maxerr: 10,
        ///设定错误的阈值，超过这个阈值jshint不再向下检查，提示错误太多。

        newcap: true,
        //如果为真，JSHint会要求每一个构造函数名都要大写字母开头。 构造器是一种使用new运算符来创建对象的一种函数，new操作符会创建新的对象，并建立这个对象自己的this，一个构造函数如果不用new运算符来运行，那么他的this会指向全局对象而导致一些问题的发生。

        noarg: true,
        //如果为真，JSHint会禁止arguments.caller和arguments.callee的使用 arguments对象是一个类数组的对象，它具有一个索引值。arguments.callee指向当前执行的函数（这个在ES5的严格模式中被禁用了），而arguments.caller指向调用当前函数的函数（如果有的话），并且，他并不是在所有的Javascript实现里面都有。

        noempty: true,
        //如果为真，JSHint会禁止出现空的代码块（没有语句的代码块）。 如果为真，JSHint会禁用构造器，以避免一些问题。 在JSLint中会主动禁用构造器的方式以避免一些潜在问题，但其实很多构造器的使用并非有害，例如如下的调用

        //new JsUIWindow(); //注意这个调用是没有把构造器的结果赋值给变量的
        //因此，我们需要使用构造器的时候可以禁用这个选项。

        nomen: false,
        //如果为真，JSHint会禁用下划线的变量名。 很多人使用_name的方式来命名他们的变量，以说明这是一个私有变量，但实际上，并不是，下划线只是做了一个标识。 如果要使用私有变量，可以使用闭包来实现。

        onevar: true,
        //如果为真，JSHint期望函数只被var的形式声明一遍。

        passfail: false,
        //如果为真，JSHint会在发现首个错误后停止检查。

        plusplus: false,
        //如果为真，JSHint会禁用自增运算和自减运算 ++和--可能会带来一些代码的阅读上的困惑。

        regexp: true,
        //如果为真，JSHint会不允许使用.和[^...]的正则， 因为这样的正则往往会匹配到你不期望的内容，并可能会应用造成一些危害。

        undef: true,
        //如果为真，JSHint会要求所有的非全局变量，在使用前都被声明。 如果你不在一个本地作用域内使用var的方式来声明变量，Javascript会把它放到全局作用域下面。这样会很容易引起错误。
        
        unused: true,

        sub: true,
        //如果为真，JSHint会允许各种形式的下标来访问对象。 通常，JSHint希望你只是用点运算符来读取对象的属性（除非这个属性名是一个保留字），如果你不希望这样可以关闭这个选项。

        strict: false,
        //如果为真，JSHint会要求你使用use strict;语法。 Strict 模式是ES5里面的一个新特性，他允许你把一个程序或者函数放在一个“严格”的作用域中。可见Resig写的一篇关于严格模式的blog 严格模式做了几件事情:

        //1、他可以捕获一些错误和异常

        //2、当我们进行一下“不安全”的操作时，他会抛异常，例如访问全局变量。

        //3、他会禁止你使用一些奇淫技巧，或者不良的代码编写。

        white: false,
        //如果为true，JSHint会依据严格的空白规范检查你的代码。
        
        funcscope: true,
        laxcomma: true,
        loopfunc: true, // 警告在循环内部定义函数
        multistr: true, // 警告多行字符串
        notypeof: true, // 警告不正确的错误类型，如 'function' 写成 'functin'
        shadow: true,   // 警告多重定义变量
        smarttabs: true,
        validthis: true   // 关于 this 的警告
      }

    }

  });

  // Load the plugin that provides the "uglify" task.

  grunt.loadNpmTasks('grunt-contrib-jshint');
  
  // Default task(s).
  grunt.registerTask('default', ['jshint']);

};


//module.exports = function(grunt) {
//
//  grunt.initConfig({
//    pkg: grunt.file.readJSON('package.json'),
//    concat: {
//      options: {
//        separator: ';'
//      },
//      dist: {
//        src: ['src/**/*.js'],
//        dest: 'dist/<%= pkg.name %>.js'
//      }
//    },
//    uglify: {
//      options: {
//        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
//      },
//      dist: {
//        files: {
//          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
//        }
//      }
//    },
//    qunit: {
//      files: ['test/**/*.html']
//    },
//    jshint: {
//      files: ['gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
//      options: {
//        // options here to override JSHint defaults
//        globals: {
//          jQuery: true,
//          console: true,
//          module: true,
//          document: true
//        }
//      }
//    },
//    watch: {
//      files: ['<%= jshint.files %>'],
//      tasks: ['jshint', 'qunit']
//    }
//  });
//
//  grunt.loadNpmTasks('grunt-contrib-uglify');
//  grunt.loadNpmTasks('grunt-contrib-jshint');
//  grunt.loadNpmTasks('grunt-contrib-qunit');
//  grunt.loadNpmTasks('grunt-contrib-watch');
//  grunt.loadNpmTasks('grunt-contrib-concat');
//
//  grunt.registerTask('test', ['jshint', 'qunit']);
//
//  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
//
//};
