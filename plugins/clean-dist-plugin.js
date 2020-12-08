const fs = require('fs');
const path = require('path');

// 异步并行
function removeFilesAsyncParalle(dir, cb) {
    if (fs.existsSync(dir)) {
        fs.stat(dir, (err, stats) => {
            if(stats.isDirectory()) {
                fs.readdir(dir, (err, dirs) => {
                    if (dirs.length === 0) {
                        fs.rmdir(dir, cb);
                        return;
                    }
                    dirs.map((d) =>{
                        let current = path.join(dir, d);
                        removeFilesAsyncParalle(current, done);
                    })
                    let index = 0;
                    function done() {
                        index++;
                        if(index === dirs.length) {
                            fs.rmdir(dir, cb);
                        }
                    }
                });
            }else{
                fs.unlink(dir, cb);
            }
        });
    }
}

function removeFiles(dir, callback) {
    removeFilesAsyncParalle(dir, function() {
        // 重新创建目录
        fs.mkdirSync(dir);
        callback();
    });
}

class CleanDistPlugin{
    constructor(){
        // console.log('CleanDistPlugin初始化了...');
    }
    apply(compiler){
        compiler.hooks.emit.tapAsync('clean-dist-plugin', (compilation, callback) => {
            console.log('CleanDistPlugin执行了...');
            // 获取路径
            const compiler = compilation.compiler;
            const outputPath = path.resolve(compiler.root, compiler.options.output.path);
            removeFiles(outputPath, () => {
                console.log('output.path目录清理完成...');
                // 定力目录后执行回调，让 webpack 继续执行
                callback();
            });
        });
    }
}

module.exports = CleanDistPlugin;