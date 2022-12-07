import { parseHTML } from './parse'

function genProps(attrs) {
    let str = '' // {name,value}
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if (attr.name === 'style') {
            // color:red => {color: 'red'}
            let obj = {}
            attr.value.split(';').forEach((item) => {
                let [key, value] = item.split(':')
                obj[key] = value
            })
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},` // a:b,c:d
    }
    return `{${str.slice(0, -1)}}`
}

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // {{}}
function gen(node) {
    if (node.type === 1) {
        return codegen(node)
    } else {
        let text = node.text
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`
        } else {
            let tokens = []
            let match
            defaultTagRE.lastIndex = 0
            let lastIndex = 0
            while ((match = defaultTagRE.exec(text))) {
                let index = match.index // 匹配的位置
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }
            if (lastIndex < text.length) {
                tokens.push(text.slice(lastIndex, index))
            }
            return `_v(${tokens.join('+')})`
        }
    }
}

function getChildren(children) {
    return children.map((child) => gen(child)).join(',')
}

function codegen(ast) {
    let children = getChildren(ast.children)
    let code = `_c('${ast.tag}',${
        ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
    }${ast.children.length ? `,${children}` : ''})`
    return code
}

export function compileToFunction(el) {
    // 1 将模板转化为ast语法树
    let ast = parseHTML(el)
    // 2 生成render方法(render方法执行后的返回结果就是虚拟DOM)
    let code = codegen(ast)
    code = `with(this){return ${code}}`.toString()
    let render = new Function(code) // 根据代码生成render函数
    return render
}
