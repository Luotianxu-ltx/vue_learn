import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
    input: './src/index.js', // 打包入口文件
    output: {
        file: 'dist/vue.js', // 出口文件
        format: 'umd', // 打包方式 在Windows上挂载Vue
        name: 'Vue',
        sourcemap: true,
    },
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
        serve({
            port: 3000,
            contentBase: '',
            openPage: '/index.html',
        }),
    ],
}
