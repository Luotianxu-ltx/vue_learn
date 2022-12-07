import { initState } from './initState'
import { compileToFunction } from './compile/index'
import { mountComponent } from './lifecycle'

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        let vm = this
        vm.$options = options
        // 初始化状态
        initState(vm)
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
