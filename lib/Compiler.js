const path = require('path');
const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const t = require('@babel/types');
// 通过EJS生成模板
const ejs = require('ejs');

// 用于实现 emit 钩子
const { AsyncSeriesHook } = require("tapable");

// 传递给hooks钩子的参数，包含配置信息，编译的文件信息等
const Compilation = require("./Compilation");

// @babel/parser -> 把源码生成AST
// @babel/traverse -> 遍历AST的结点
// @babel/types -> 替换AST的内容
// @babel/generator -> 根据AST生成新的源码

class Compiler {
    constructor(options) {
        this.options = options;
        this.modules = {};
        this.entryPath = '';
        this.root = process.cwd();
        this.hooks = Object.freeze({
            // 生成资源到 output 目录之前，这里实现自定义清理 dist 目录的插件 CleanDistPlugin
            emit: new AsyncSeriesHook(["compilation"])
        });
    }
    getSource(modulePath) {
        // loader是在读取文件的时候进行操作
        try {
            let rules = this.options.module.rules;
            let content = fs.readFileSync(modulePath, 'utf-8');
            for (let i = 0; i < rules.length; i ++) {
                let { test, use } = rules[i];
                let len = use.length - 1;
                if (test.test(modulePath)) {
                    // 递归处理所有loader
                    function loopLoader () {
                        let loader = require(use[len--]);
                        content = loader(content);
                        if (len >= 0) {
                            loopLoader();
                        }
                    }
                    loopLoader();
                }
            }
            return content;
        } catch (e) {
            throw new Error(`获取数据错误 : ${modulePath}`);
        }
    }
    // 根据模块的源码进行解析
    parse(source, dirname) {
        // 1.生成AST
        let ast = parser.parse(source);
        let dependencies = []; //模块依赖项列表
        // 2.遍历AST结点
        traverse(ast, {
            // 当有函数调用的语句类似require()/ document.createElement()/ document.body.appendChild(), 会有一个CallExpression的属性保存这些信息：
            CallExpression: (p) => {
                const node = p.node;
                // 1.代码中需要改的函数调用是require, 所以要做一层判断
                if (node.callee.name === 'require') {
                    // 函数名替换
                    node.callee.name = '__webpack_require__';
                    // 路径替换
                    let modulePath = node.arguments[0].value;
                    if (!path.extname(modulePath)) {
                        // require('./js/moduleA')
                        throw new Error(`没有找到文件 : ${modulePath} , 检查是否加上正确的文件后缀`);
                    }
                    // 2.引用的模块路径加上主模块path的目录名
                    modulePath = './' + path.join(dirname, modulePath).replace(/\\/g, '/');
                    node.arguments = [t.stringLiteral(modulePath)];
                    // 保存模块依赖项
                    dependencies.push(modulePath);
                }
            }
        });
        // 3.生成新的代码
        let sourceCode = generator(ast).code;
        return {
            sourceCode, dependencies
        };
    }
    // 构建模块，并进行广度遍历模块所依赖的子模块
    buildModule(modulePath, isEntry) {
        // 模块的源代码
        let source = this.getSource(modulePath)
        // 模块的路径
        let moduleName = './' + path.relative(this.root, modulePath).replace(/\\/g, '/')

        if (isEntry) {
            this.entryPath = moduleName;
        }
        // 从主入口出发, 分别获取模块的路径以及对应的代码块, 并把代码块中的require方法改为__webpack_require__方法
        let { sourceCode, dependencies } = this.parse(source, path.dirname(moduleName));

        // 保存模块
        this.modules[moduleName] = JSON.stringify(sourceCode);

        // 递归获取所有的模块依赖, 并保存所有的路径与依赖的模块
        dependencies.forEach(d => {
            this.buildModule(path.join(this.root, d));
        }, false);
    }
    // 把数据插入模板并输出到output.path中
    mkdirp(outputPath, filePath) {
        const { modules, entryPath } = this;
        //创建文件夹
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }
        ejs.renderFile(path.join(__dirname, 'Template.ejs'), { modules, entryPath }).then(code => {
            fs.writeFileSync(filePath, code);
        });
    }
    // 根据 entry 入口编译文件，然后通过 emit 输出
    run() {
        const { entry } = this.options;
        this.buildModule(path.resolve(this.root, entry), true);

        const compilation = new Compilation(this);
        // 执行 emit 钩子
        this.hooks.emit.callAsync(compilation, err => {
            // console.log('hooks emit...');
			if (err) {
                throw new Error('emit钩子执行出错');
            }else{
                const outputPath = path.resolve(this.root, this.options.output.path);
                const filePath = path.resolve(outputPath, this.options.output.filename);
                // 输出文件
                this.mkdirp(outputPath, filePath);
            }
		});
    }
}

module.exports = Compiler;