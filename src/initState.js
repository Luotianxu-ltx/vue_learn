import Dep from './observe/dep'
import { observer } from './observe/index'
import Watcher, { nextTick } from './observe/watcher'

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
        initWatch(vm)
    }
    if (opts.computed) {
        initComputed(vm)
    }
    if (opts.methods) {
        initMethods()
    }
}
function initComputed(vm) {
    const computed = vm.$options.computed
    const watchers = (vm._computedWatchers = {})
    for (const key in computed) {
        let userDef = computed[key]

        let fn = typeof userDef === 'function' ? userDef : userDef.get

        watchers[key] = new Watcher(vm, fn, { lazy: true })

        defineComputed(vm, key, userDef)
    }
}

function initWatch(vm) {
    let watch = vm.$options.watch
    for (let key in watch) {
        const handler = watch[key]
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler)
            }
        } else {
            createWatcher(vm, key, handler)
        }
    }
}

function createWatcher(vm, key, handler) {
    if (typeof handler === 'string') {
        handler = vm[handler]
    }
    return vm.$watch(key, handler)
}

function initMethods() {}
function initProps() {}

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

function defineComputed(target, key, userDef) {
    const setter = userDef.set || (() => {})
    // 可以通过实例拿到对应的属性
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter,
    })
}

// 计算实行根本不会收集依赖，只会让自己的依赖属性去收集依赖
function createComputedGetter(key) {
    // 检测是否实行这个getter
    return function () {
        const watcher = this._computedWatchers[key]
        if (watcher.dirty) {
            // 如果是脏的就去执行用户传入的函数
            watcher.evaluate()
        }
        // 如果计算属性出栈后，还要渲染watcher，让计算属性watcher里面的属性也去手机上一层watcher
        if (Dep.target) {
            watcher.depend()
        }
        return watcher.value
    }
}

export function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick
    Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
        new Watcher(this, exprOrFn, { user: true }, cb)
    }
}
