import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import Watcher, { nextTick } from './observe/watcher'

function Vue(options) {
    // 初始化
    this._init(options)
}

Vue.prototype.$nextTick = nextTick
initMixin(Vue)
initLifeCycle(Vue)

Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
    console.log(exprOrFn, cb, options)
    new Watcher(this, exprOrFn, { user: true }, cb)
}

export default Vue
