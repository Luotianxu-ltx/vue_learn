let id = 0
class Dep {
    constructor() {
        this.id = id++
        this.subs = [] // 这里存放这当前属性对应的watcher有哪些
    }
    depend() {
        // this.subs.push(Dep.target)
        Dep.target.addDep(this)
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        // 更新watcher
        this.subs.forEach((watcher) => {
            watcher.update()
        })
    }
}
Dep.target = null

let stack = []
export function pushTarget(watcher) {
    stack.push(watcher)
    Dep.target = watcher
}

export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length - 1]
}

export default Dep
