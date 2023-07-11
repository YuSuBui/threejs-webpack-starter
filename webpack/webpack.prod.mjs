import {merge} from 'webpack-merge'

import {common} from './webpack.common.mjs'

export default (env, args) => {
    return merge(common, {
        mode: 'production',
        output: {
            clean: true
        }
    })
}
