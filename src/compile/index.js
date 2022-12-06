const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // 标签名称
const qnameCapture = `((?:${ncname}\\:)?${ncname})` //<span:xx>
const startTagOpen = new RegExp(`^<${qnameCapture}`) //标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配标签结尾的</div>
const attribute =
    /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const startTagClose = /^\s*(\/?)>/ // 匹配标签结束的
const edfaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // {{}}

// 对模板进行编译处理
function parseHTML(html) {
    const ELEMENT_TYPE = 1
    const TEXT_TYPE = 3
    const stack = [] // 用于存放元素
    let currentParent // 指向的是栈中的最后一个
    let root

    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null,
        }
    }

    function start(tag, attrs) {
        let node = createASTElement(tag, attrs) // 创造一个ast节点
        if (!root) {
            // 看一下是否空树,如果是空则当前是树的根节点
            root = node
        }
        if (currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }
        stack.push(node)
        currentParent = node
    }

    function chars(text) {
        console.log(text)
        text = text.replace(/\s/g, '')
        // 文本直接放到当前指向的节点中
        text &&
            currentParent.children.push({
                type: TEXT_TYPE,
                text,
                parent: currentParent,
            })
    }

    function end() {
        stack.pop()
        currentParent = stack[stack.length - 1]
    }

    function advance(n) {
        html = html.substring(n)
    }

    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1], // 标签名
                attrs: [],
            }
            advance(start[0].length)
            // 如果不是开始标签的结束就一直匹配
            let attr, end
            while (
                !(end = html.match(startTagClose)) &&
                (attr = html.match(attribute))
            ) {
                advance(attr[0].length)
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5] || true,
                })
            }
            if (end) {
                advance(end[0].length)
            }
            return match
        }
        return false
    }

    while (html) {
        // 如果indexOf中的索引为0，则说明是个标签
        // 如果indexOf>0说明是文本的结束位置
        let textEnd = html.indexOf('<')
        if (textEnd == 0) {
            const startTagMatch = parseStartTag() // 开始标签的匹配结果
            if (startTagMatch) {
                // 解析到的开始标签
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue
            }
        }
        if (textEnd > 0) {
            let text = html.substring(0, textEnd) // 解析到的文本
            if (text) {
                chars(text)
                advance(text.length)
            }
        }
    }
    console.log(root)
}

export function compileToFunction(el) {
    let ast = parseHTML(el)
}
