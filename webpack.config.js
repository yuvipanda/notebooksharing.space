const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const optimization = {
    usedExports: true
}

const OUTPUTDIR = path.resolve(__dirname, 'nbss/static');

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
        {
            test: /\.svg$/,
            use: [
                {
                    loader: 'svg-url-loader',
                    options: {
                        limit: 10000,
                    },
                },
            ],
        },
        {
            test: /\.(png|jpe?g|gif)$/i,
            use: [
                {
                    loader: 'file-loader',
                },
            ],
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
            path: OUTPUTDIR
        },
        optimization: optimization
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
            path: OUTPUTDIR
        },
        optimization: optimization
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
            path: OUTPUTDIR
        },
        optimization: optimization
    },
];
