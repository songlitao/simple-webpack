// import msg from './msg.js';
const msg = require('./msg.js');

function createH1(callback){
    const h1 = document.createElement('h1')
    h1.innerHTML = 'Hello ' + msg.text;
    document.body.appendChild(h1);

    callback();
}

module.exports = createH1;