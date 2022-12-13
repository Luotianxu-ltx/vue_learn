import Watcher from './observe/watcher'
import { createElementVNode, createTextVNode } from './vdom/index'
import { patch } from './vdom/patch'

export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this
        const el = vm.$el
        // 既有初始化功能，又有更新功能
        const prevVnode = vm._vnode
        vm._vnode = vnode // 把组件第一次产生的虚拟节点保存到_vnode上
        if (prevVnode) {
            // 之前渲染过了
            vm.$el = patch(prevVnode, vnode)
        } else {
            vm.$el = patch(el, vnode)
        }
    }
    // _c('div',{},...children)
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments)
    }
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments)
    }
    Vue.prototype._s = function (value) {
        if (typeof value !== 'object') return value
        return JSON.stringify(value)
    }

    Vue.prototype._render = function () {
        return this.$options.render.call(this)
    }
}

export function mountComponent(vm, el) {
    vm.$el = el
    const updateComponent = () => {
        vm._update(vm._render()) // vm.$options.render() 返回虚拟节点
    }
    const watcher = new Watcher(vm, updateComponent, true) // true用于表示是一个渲染watcher
    // 1 调用render方法产生虚拟dom
    // 2 根据虚拟dom产生真是dom
    // 3 插入到el元素中
}

/**
 * vue核心流程
 * 1 创造响应式数据
 * 2 模板转换成ast语法树
 * 3 将ast语法树转换了render函数
 * 4 后续每次数据可以只执行render函数， 无需再次执行ast转化过程
 */
