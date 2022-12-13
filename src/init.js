import { initState } from './initState'
import { compileToFunction } from './compile/index'
import { callHook, mountComponent } from './lifecycle'
import { mergeOptions } from './utils'

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        let vm = this
        vm.$options = options
        vm.$options = mergeOptions(this.constructor.options, options)
        callHook(vm, 'beforeCreate')
        // 初始化状态
        initState(vm)
        callHook(vm, 'created')
        // 渲染模板
        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }

    // 创建$mount
    Vue.prototype.$mount = function (el) {
        // el template render
        let vm = this
        el = document.querySelector(el)
        let ops = vm.$options
        if (!ops.render) {
            let template
            if (!ops.template && el) {
                template = el.outerHTML
            } else {
                if (el) {
                    template = ops.template
                }
            }
            if (template && el) {
                const render = compileToFunction(template)
                ops.render = render
            }
        }
        mountComponent(vm, el)
    }
}
