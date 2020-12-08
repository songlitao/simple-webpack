const less = require('less');

/**
 * less-loader
 * @param { String } source 
 */
const loader = function(source){
    let css = '';
    less.render(source, (err, output) => {
        if(err){
            throw new Error(err);
        }else{
            css = output.css;
        }
    });
    return css;
}

module.exports = loader;