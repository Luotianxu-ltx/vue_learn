import Watcher from './observe/watcher'
import { createElementVNode, createTextVNode } from './vdom/index'

function createElm(vnode) {
    let { tag, data, children, text } = vnode
    if (typeof tag === 'string') {
        vnode.el = document.createElement(tag) // 将真是节点和虚拟节点对应起来
        patchProps(vnode.el, data)
        children.forEach((child) => {
            vnode.el.appendChild(createElm(child))
        })
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

function patchProps(el, props) {
    for (let key in props) {
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
}

function patch(oldVNode, vnode) {
    // 初渲染流程
    const isRealElement = oldVNode.nodeType
    if (isRealElement) {
        const elm = oldVNode // 获取真实元素
        const parentElm = elm.parentNode // 拿到父元素
        let newElm = createElm(vnode)
        parentElm.insertBefore(newElm, elm.nextSibling)
        parentElm.removeChild(elm) // 删除老节点
        return newElm
    } else {
        // diff
    }
}

export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this
        const el = vm.$el
        // 既有初始化功能，又有更新功能
        vm.$el = patch(el, vnode)
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
    new Watcher(vm, updateComponent, true) // true用于表示是一个渲染watcher
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
