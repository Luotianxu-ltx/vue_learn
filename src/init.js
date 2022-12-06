import { initState } from './initState'
import { compileToFunction } from './compile/index'

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
        let options = vm.$options
        if (!options.render) {
            let template = options.template
            if (!template && el) {
                // 获取html
                el = el.outerHTML
                let ast = compileToFunction(el)
            }
        }
    }
}
