import { ArrayMethods } from './arr'
import Dep from './dep'

export function observer(data) {
    // 判断数据
    if (typeof data != 'object' || data == null) {
        return
    }
    //  1 对象
    return new Observer(data)
}

class Observer {
    constructor(value) {
        // 给每个对象都增加收集功能
        this.dep = new Dep()
        // 给value定义一个属性
        Object.defineProperty(value, '__ob__', {
            enumerable: false,
            value: this,
        })
        if (Array.isArray(value)) {
            value.__proto__ = ArrayMethods
            // 如果是数组对象
            this.observeArray(value)
        } else {
            this.walk(value) // 遍历
        }
    }
    walk(data) {
        let keys = Object.keys(data)
        for (let i = 0; i < keys.length; i++) {
            // 对每个属性进行劫持
            let key = keys[i]
            let value = data[key]
            defineReactive(data, key, value)
        }
    }
    observeArray(value) {
        for (let i = 0; i < value.length; i++) {
            observer(value[i])
        }
    }
}

// 深层次嵌套会递归，递归多了性能查，不存在属性监控不到
function dependArray(value) {
    for (let i = 0; i < value.length; i++) {
        let current = value[i]
        current.__ob__ && current.__ob__.dep.depend()
        if (Array.isArray(current)) {
            dependArray(current)
        }
    }
}

// 对对象中的属性进行劫持
function defineReactive(data, key, value) {
    let childOb = observer(value) // 深度劫持
    let dep = new Dep() // 每一个属性都有一个dep
    Object.defineProperty(data, key, {
        get() {
            if (Dep.target) {
                dep.depend() // 让这个属性的收集器记住当前的watcher
                if (childOb) {
                    childOb.dep.depend() // 让数组和对象本身页实现依赖收集
                    if (Array.isArray(value)) {
                        dependArray(value)
                    }
                }
            }
            return value
        },
        set(newValue) {
            if (newValue == value) return
            observer(newValue) // 如果用户设置的值是对象
            value = newValue
            dep.notify()
        },
    })
}
