/**
 * style-loader
 * @param { String } source 
 */
const loader = function(source){
    let script = `
        let style = document.createElement('style');
        style.innerHTML = ${JSON.stringify(source)};
        document.body.appendChild(style);
    `;
    console.log('style-loader 执行了...');
    return script;
}

module.exports = loader;