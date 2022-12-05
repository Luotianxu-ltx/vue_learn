import { observer } from './observe/index'

export function initState(vm) {
    let opts = vm.$options
    // 判断
    if (opts.props) {
        initProps()
    }
    if (opts.data) {
        initData(vm)
    }
    if (opts.watch) {
        initWatch()
    }
    if (opts.computed) {
        initComputed()
    }
    if (opts.methods) {
        initMethods()
    }
}
function initComputed() {}
function initMethods() {}
function initProps() {}
function initWatch() {}

// 对data初始化 （1）对象 （2）函数
function initData(vm) {
    let data = vm.$options.data
    data = vm._data = typeof data === 'function' ? data.call(vm) : data //this指向
    // 将data上所有属性代理到实例上
    for (let key in data) {
        proxy(vm, '_data', key)
    }
    // data数据劫持
    observer(data)
}

function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[source][key]
        },
        set(newValue) {
            vm[source][key] = newValue
        },
    })
}
