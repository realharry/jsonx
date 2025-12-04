const path = require('path');

/**
 * Next.js example: add a webpack rule to process `.jsonx` files using the loader shipped in `examples/webpack/jsonx-loader.js`.
 * Put `examples/webpack/jsonx-loader.js` into your Next.js project and update the path below.
 */
module.exports = {
    webpack(config, options) {
        config.module.rules.push({
            test: /\.jsonx$/,
            use: [
                {
                    loader: path.resolve(__dirname, '..', 'webpack', 'jsonx-loader.js')
                }
            ]
        });
        return config;
    }
};
