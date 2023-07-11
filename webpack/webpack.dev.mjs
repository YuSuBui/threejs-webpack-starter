import {merge} from 'webpack-merge'
import {getPort} from 'portfinder-sync'
import path from "path";
import {fileURLToPath} from 'url';

import {common} from './webpack.common.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (env, args) => {
    return merge(common, {
        mode: 'development',
        devtool: 'inline-source-map',
        devServer: {
            host: '0.0.0.0',
            port: getPort(8080),
            static: {
                directory: path.join(__dirname, 'dist')
            },
            open: true,
            https: false
        }
    })
}
