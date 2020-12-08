const babel = require('@babel/core');
const loaderUtils = require('loader-utils');

/**
 * less-loader
 * @param { String } source 
 */
const loader = function(source){
    let options = loaderUtils.getOptions(this);
    let cb = this.async();
    babel.transform(source, {
        ...options,
        sourceMap : true,
        filename : this.resourcePath.split('/').pop(),
    }, (err, result) => {
        // 错误, 返回的值, sourceMap的内容
        cb(err, result.code, result.map)
    });
}

module.exports = loader;