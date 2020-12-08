const path = require('path');
const Compiler = require('../lib/Compiler');

// webpack原理： https://www.jianshu.com/p/8dd5885bfb66
// 参考1：https://blog.csdn.net/weixin_34124939/article/details/91386853
// 参考2：https://segmentfault.com/a/1190000020266246
// 参考3：https://github.com/webpack/tapable

// 1.获取打包配置
const config = require(path.resolve('webpack.config.js'));

// 2.创建一个Compiler类（全局唯一）
const createCompiler = function(){
    // 创建Compiler实例
    const compiler = new Compiler(config);
    // 初始化钩子
    if (Array.isArray(config.plugins)) {
		for (const plugin of config.plugins) {
			if (typeof plugin === 'function') {
				plugin.call(compiler, compiler);
			} else {
				plugin.apply(compiler);
			}
		}
	}
    return compiler;
};
const compiler = createCompiler();

// 3.通过run去开启编译
compiler.run();