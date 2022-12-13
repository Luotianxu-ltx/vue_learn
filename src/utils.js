// 静态方法
const strats = {}
const LIFECYCLE = ['beforeCreate', 'created']
LIFECYCLE.forEach((hook) => {
    strats[hook] = function (p, c) {
        if (c) {
            if (p) {
                return p.concat(c)
            } else {
                return [c]
            }
        } else {
            return p
        }
    }
})

export function mergeOptions(parent, child) {
    const options = {}
    // 循环老的
    for (let key in parent) {
        mergeField(key)
    }
    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }
    function mergeField(key) {
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key])
        } else {
            options[key] = child[key] || parent[key] // 优先采用儿子，再采用父亲
        }
    }
    return options
}