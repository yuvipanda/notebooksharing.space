const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const options = {
    rules: [
        {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: ["babel-loader"],
        },
    ],
};
module.exports = [
    {
        entry: './src/view.js',
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'view.css'
            })
        ],
        module: options,
        output: {
            filename: 'view.js',
            path: path.resolve(__dirname, 'static'),
        },
    },
    {
        entry: './src/front.js',
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'front.css'
            })
        ],
        module: options,
        output: {
            filename: 'front.js',
            path: path.resolve(__dirname, 'static'),
        },
    },
    {
        entry: './src/notebook.js',
        module: options,
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'notebook.css'
            })
        ],
        output: {
            filename: 'notebook.js',
            path: path.resolve(__dirname, 'static'),
        },
    },
];
