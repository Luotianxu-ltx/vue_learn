const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // 标签名称
const qnameCapture = `((?:${ncname}\\:)?${ncname})` //<span:xx>
const startTagOpen = new RegExp(`^<${qnameCapture}`) //标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*`) // 匹配标签结尾的</div>
const attribute =
    /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const startTagClose = /^\s*(\/?)>/ // 匹配标签结束的
const edfaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // {{}}

// 解析html
// 创建ast语法树
function createAstElement(tag, attrs) {
    return {
        tag,
        attrs,
        children: [],
        type: 1,
        parent: null,
    }
}
// 根元素
let root
// 当前元素的父亲
let createParent
// 数据结构 栈
let stack = []
// 开始标签
function start(tag, attrs) {
    let element = createAstElement(tag, attrs)
    if (!root) {
        root = element
    }
    createParent = element
    stack.push(element)
}
// 获取文本
function charts(text) {
    text = text.replace(/s/g, '')
    if (text) {
        createParent.children.push({
            type: 3,
            text,
        })
    }
}
// 结束标签
function end(tag) {
    let element = stack.pop()
    createParent = stack[stack.length - 1]
    if (createParent) {
        element.parent = createParent.tag
        createParent.children.push(element)
    }
}
function parseHTML(html) {
    // html为空结束
    while (html) {
        // 判断标签
        let textEnd = html.indexOf('<')
        // 标签
        if (textEnd === 0) {
            // (1)开始标签
            const startTagMach = parseStartTag() // 开始标签内容
            if (startTagMach) {
                start(startTagMach.tagName, startTagMach.attrs)
                continue
            }
            // (2)结束标签
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue
            }
        }
        // 文本
        let text
        if (textEnd > 0) {
            // 获取文本内容
            text = html.substring(0, textEnd)
        }
        if (text) {
            advance(text.length)
            charts(text)
        }
    }

    function parseStartTag() {
        const start = html.match(startTagOpen) // 1返回结果 2false
        if (start) {
            // 创建ast语法树
            let match = {
                tagName: start[1],
                attrs: [],
            }
            // 删除开始标签
            advance(start[0].length)
            // 属性 遍历
            let attr
            let end
            while (
                !(end = html.match(startTagClose)) &&
                (attr = html.match(attribute))
            ) {
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5],
                })
                advance(attr[0].length)
            }
            if (end) {
                advance(end[0].length)
                return match
            }
        }
    }

    function advance(n) {
        html = html.substring(n)
    }

    console.log(root)
    return root
}

export function compileToFunction(el) {
    let ast = parseHTML(el)
}
