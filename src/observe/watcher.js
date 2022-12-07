import Dep from './dep'

let id = 0

// 1 创建渲染watcher的时候我们会把当前的渲染watcher放到Dep.target上
// 2 调用_render()会取值 走到get上
class Watcher {
    // 不同组件有不同的watcher
    constructor(vm, fn, options) {
        this.id = id++
        this.renderWatcher = options
        this.getter = fn // getter意味着调用这个函数可以发生取值操作
        this.get()
    }
    get() {
        Dep.target = this
        this.getter()
        Dep.target = null
    }
}

// 需要给每个属性增加一个dep，目的是收集watcher

export default Watcher
