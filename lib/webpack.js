const path = require('path');
const Compiler = require('./compiler.js');

// 原理： https://www.jianshu.com/p/8dd5885bfb66
// 实现1：https://blog.csdn.net/weixin_34124939/article/details/91386853
// 实现2：https://segmentfault.com/a/1190000020266246

// 1.获取打包配置
const config = require(path.resolve('webpack.config.js'));

// 2.实例化一个Compiler类
const compiler = new Compiler(config);

// 3.通过run去开启编译
compiler.run();