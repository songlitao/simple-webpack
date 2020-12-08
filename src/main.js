const createH1 = require('./js/home.js');

require('./css/home.less');

createH1(() => {
    const msg = '加载完成...';
    console.log(msg);
});
