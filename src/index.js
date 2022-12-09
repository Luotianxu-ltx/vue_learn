import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { initStateMixin } from './initState'

function Vue(options) {
    // 初始化
    this._init(options)
}

initMixin(Vue)
initLifeCycle(Vue) //vm_update vm._render
initStateMixin(Vue) // 实现nextTick,$watch

export default Vue
