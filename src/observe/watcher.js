import { popTarget, pushTarget } from './dep'

let id = 0

// 1 创建渲染watcher的时候我们会把当前的渲染watcher放到Dep.target上
// 2 调用_render()会取值 走到get上
class Watcher {
    // 不同组件有不同的watcher
    constructor(vm, exprOrFn, options, cb) {
        this.id = id++
        this.renderWatcher = options // 是一个渲染watcher
        if (typeof exprOrFn === 'string') {
            this.getter = function () {
                return vm[exprOrFn]
            }
        } else {
            this.getter = exprOrFn // getter意味着调用这个函数可以发生取值操作
        }
        this.deps = []
        this.depsId = new Set()
        this.lazy = options.lazy
        this.dirty = this.lazy
        this.vm = vm
        this.cb = cb
        this.user = options.user // 标识是否是用户自己的watcher
        this.value = this.lazy ? undefined : this.get()
    }
    // 一个组件对应多个属性，重复的属性不用记录
    addDep(dep) {
        let id = dep.id
        if (!this.depsId.has(id)) {
            this.deps.push(dep)
            this.depsId.add(id)
            dep.addSub(this)
        }
    }
    evaluate() {
        this.value = this.get() // 获取用户返回值并标识为脏
        this.dirty = false
    }
    get() {
        pushTarget(this)
        let value = this.getter.call(this.vm) // vm上取值
        popTarget()
        return value
    }
    depend() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend() // 让计算属性watcher也手机渲染watcher
        }
    }
    // 重新渲染
    update() {
        // this.get() 依赖的值变化了就表示计算属性是脏值
        if (this.lazy) {
            // 如果是计算属性
            this.dirty = true
        } else {
            queueWatcher(this) // 把当前的watcher暂存起来
        }
    }
    run() {
        let oldValue = this.value
        let newValue = this.get()
        if (this.user) {
            this.cb(newValue, oldValue)
        }
    }
}

let queue = []
let has = {}
let pending = false

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0)
    queue = []
    has = {}
    pending = false
    flushQueue.forEach((q) => q.run()) // 在刷新的过程中可能还有新的watcher，重新放到queue中
}

function queueWatcher(watcher) {
    const id = watcher.id
    if (!has[id]) {
        queue.push(watcher)
        has[id] = true
        // 不管update执行多少次，最终只执行一轮刷新操作
        if (!pending) {
            nextTick(flushSchedulerQueue, 0)
            pending = true
        }
    }
}

let calllbacks = []
let waiting = false
function flushCallbacks() {
    let cbs = calllbacks.slice(0)
    waiting = false
    calllbacks = []
    cbs.forEach((cb) => cb())
}

let timerFunc
if (Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallbacks)
    }
} else if (MutationObserver) {
    let observe = new MutationObserver(flushCallbacks)
    let textNode = document.createTextNode(1)
    observe.observe(textNode, {
        characterDataL: true,
    })
    timerFunc = () => {
        textNode.textContent = 2
    }
} else if (setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallbacks)
    }
} else {
    timerFunc = () => {
        setTimeout(flushCallbacks)
    }
}

export function nextTick(cb) {
    calllbacks.push(cb)
    if (!waiting) {
        timerFunc()
        waiting = true
    }
}

// 需要给每个属性增加一个dep，目的是收集watcher

export default Watcher
