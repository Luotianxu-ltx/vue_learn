import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { initStateMixin } from './initState'
import { compileToFunction } from './compile/index'
import { createElm, patch } from './vdom/patch'
import { initGlobalAPI } from './gloablAPI'

function Vue(options) {
    // 初始化
    this._init(options)
}

initMixin(Vue)
initLifeCycle(Vue) //vm_update vm._render
initGlobalAPI(Vue)
initStateMixin(Vue) // 实现nextTick,$watch

// let render1 = compileToFunction(`<ul style="color: blue">
// <li key="a">a</li>
// <li key="b">b</li>
// <li key="c">c</li>
// </ul>`)
// let vm1 = new Vue({ data: { name: 'zf' } })
// let prevVnode = render1.call(vm1)

// let el = createElm(prevVnode)
// document.body.appendChild(el)

// let render2 = compileToFunction(`<ul style="color:red;background:blue">
// <li key="b">b</li>
// <li key="m">m</li>
// <li key="a">a</li>
// <li key="p">p</li>
// <li key="c">c</li>
// <li key="q">q</li>
// </ul>`)
// let vm2 = new Vue({ data: { name: 'zf' } })
// let nextNode = render2.call(vm2)

// setTimeout(() => {
//     patch(prevVnode, nextNode)
//     // let newEl = createElm(nextNode)
//     // el.parentNode.replaceChild(newEl, el)
// }, 1000)

export default Vue
