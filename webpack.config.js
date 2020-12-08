const path = require('path');

const CleanDistPlugin = require('./plugins/clean-dist-plugin.js');

module.exports = {
    entry: './src/main.js',
    output: {
        path: path.join(__dirname, './dist'),
        filename: 'bundle.js'
    },
    // resolveLoader : {
    //     modules : ['node_modules', path.join(__dirname, 'loaders')]
    // },
    module: {
        rules: [
            // 处理样式的 loader
            {
                test: /\.less$/,
                use: [
                    path.join(__dirname, 'loaders', 'style-loader.js'),
                    path.join(__dirname, 'loaders', 'less-loader.js')
                ]
            },
            // 处理脚本的 loader（需要使用webpack进行打包测死）
            // {
            //     test: /\.js$/,
            //     use: {
            //         loader: 'babel-loader',
            //         options: {
            //             presets: [
            //                 '@babel/preset-env'
            //             ]
            //         }
            //     }
            // }
        ]
    },
    plugins: [
        new CleanDistPlugin()
    ]
};