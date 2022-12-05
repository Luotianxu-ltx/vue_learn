import { ArrayMethods } from './arr'

export function observer(data) {
    // 判断数据
    if (typeof data != 'object' || data == null) {
        return data
    }
    //  1 对象
    return new Observer(data)
}

class Observer {
    constructor(value) {
        // 给value定义一个属性
        Object.defineProperty(value, '__ob__', {
            enumerable: false,
            value: this,
        })
        if (Array.isArray(value)) {
            value.__proto__ = ArrayMethods
            console.log('数组')
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

// 对对象中的属性进行劫持
function defineReactive(data, key, value) {
    observer(value) // 深度劫持
    Object.defineProperty(data, key, {
        get() {
            console.log('获取')
            return value
        },
        set(newValue) {
            if (newValue == value) return
            console.log('设置')
            observer(newValue) // 如果用户设置的值是对象
            value = newValue
        },
    })
}
