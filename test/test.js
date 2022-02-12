/// <reference path = "../dist/ver.d.ts" />
console.log(verifies({
    type: 'object',
    attr: {
        num: {
            must: true,
            mustMsg: 'num不存在',
            type: 'number',
            typeMsg: 'num类型不是number'
        }
    }
}, {
    num: ''
})); 