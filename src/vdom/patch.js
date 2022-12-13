import { isSameVnode } from './index'

// 创建节点
export function createElm(vnode) {
    let { tag, data, children, text } = vnode
    if (typeof tag === 'string') {
        vnode.el = document.createElement(tag) // 将真是节点和虚拟节点对应起来
        patchProps(vnode.el, {}, data)
        children.forEach((child) => {
            vnode.el.appendChild(createElm(child))
        })
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

// 属性
export function patchProps(el, oldProps = {}, props = {}) {
    // 老的属性中有，要删除老的
    let oldStyles = oldProps.style
    let newStyles = props.style
    for (let key in oldStyles) {
        if (!newStyles[key]) {
            el.style[key] = ''
        }
    }
    for (let key in oldProps) {
        if (!props[key]) {
            el.removeAttribute(key)
        }
    }

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

export function patch(oldVNode, vnode) {
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
        // 1.两个节点不是同一个节点,直接删除老的换上新的(没有对比)
        // 2.两个节点是同一个节点(判断节点的tag和key) 比较两个节点的属性是否有差异(复用老的节点将差异的节点更新)
        // 3.两个节点比较完后就需要比较两人的儿子
        return patchVnode(oldVNode, vnode)
    }
}

function patchVnode(oldVNode, vnode) {
    if (!isSameVnode(oldVNode, vnode)) {
        // 用老节点的父亲进行替换
        let el = createElm(vnode)
        oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
        return el
    }
    // 文本的情况
    let el = (vnode.el = oldVNode.el) // 复用老节点的元素
    if (!oldVNode.tag) {
        if (oldVNode.text !== vnode.text) {
            el.textContent = vnode.text // 用新的文本覆盖掉老的
        }
    }
    // 是标签,比对标签的属性
    patchProps(el, oldVNode.data, vnode.data)

    // 比较儿子节点
    let oldChildren = oldVNode.children || []
    let newChildren = vnode.children || []
    if (oldChildren.length > 0 && newChildren.length > 0) {
        // 完整的diff算法
        updateChildren(el, oldChildren, newChildren)
    } else if (newChildren.length > 0) {
        // 没有老的有新的
        mountChildren(el, newChildren)
    } else if (oldChildren.length > 0) {
        // 新的没有，老的有
        el.innerHTML = ''
    }
    return el
}

function mountChildren(el, newChildren) {
    for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i]
        el.appendChild(createElm(child))
    }
}

function updateChildren(el, oldChildren, newChildren) {
    // 我们操作列表经常会有push shift pop unshift reverse sort这些方法（针对这些情况做一个优化）
    // vue2中采用双指针的方式比较两个节点
    let oldStartIndex = 0
    let newStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newEndIndex = newChildren.length - 1

    let oldStartVnode = oldChildren[0]
    let newStartVnode = newChildren[0]

    let oldEndVnode = oldChildren[oldEndIndex]
    let newEndVnode = newChildren[newEndIndex]

    function makerIndexByKey(children) {
        let map = {}
        children.forEach((child, index) => {
            map[child.key] = index
        })
        return map
    }
    let map = makerIndexByKey(oldChildren)

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 双方有一方头指针，大于尾部指针则停止循环
        if (!oldStartVnode) {
            oldEndVnode = oldChildren[++oldStartIndex]
        } else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex]
        } else if (isSameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode) // 如果是相同节点，则递归比较子节点
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode) // 如果是相同节点 则递归比较子节点
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else if (isSameVnode(oldEndVnode, newStartVnode)) {
            // 交叉比对
            patchVnode(oldEndVnode, newStartVnode)
            el.insertBefore(oldEndVnode.el, oldStartVnode.el) // 将老的尾巴移到老的前面去
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
            patchVnode(oldStartVnode, newEndVnode)
            el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling) // 将老的尾巴移到老的前面去
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else {
            // 根据老的列表做一个映射关系，用新的去找，找到则移动，找不到添加,最后多余删除
            let moveIndex = map[newStartVnode.key] // 如果拿到则说明是我要移动的索引
            if (moveIndex !== undefined) {
                let moveVnode = oldChildren[moveIndex]
                el.insertBefore(moveVnode.el, oldStartVnode.el)
                oldChildren[moveIndex] = undefined
                patchVnode(moveVnode, newStartVnode)
            } else {
                el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
            }
            newStartVnode = newChildren[++newStartIndex]
        }
    }
    // 多余的插入进去
    if (newStartIndex <= newEndIndex) {
        // 新的多了 多余的就插入进去
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            let childEl = createElm(newChildren[i])
            // 这里可能是像后追加 ，还有可能是向前追加
            let anchor = newChildren[newEndIndex + 1]
                ? newChildren[newEndIndex + 1].el
                : null // 获取下一个元素
            // el.appendChild(childEl);
            el.insertBefore(childEl, anchor) // anchor 为null的时候则会认为是appendChild
        }
    }
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            if (oldChildren[i]) {
                let childEl = oldChildren[i].el
                el.removeChild(childEl)
            }
        }
    }
}
