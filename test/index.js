/// <reference path = "../dist/vri.d.ts" />

// const vs = {
//     username: 'fs',
//     password: '000',
//     a: '1',
// }

// const v = verifies(
//     {
//         type: 'object',
//         attr: {
//             username: {
//                 type: {
//                     param: 'string',
//                     error: '用户名的类型必须为字符串',
//                 },
//                 min: {
//                     param: 3,
//                     error: '用户名最短3个字符',
//                 },
//                 max: {
//                     param: 16,
//                     error: '用户名最长16个字符',
//                 },
//                 must: '用户名不能为空',
//                 error: '用户名校验失败',
//             },
//             password: {
//                 type: 'string',
//                 regEx: new RegExp('^[a-zA-Z0-9]{3,30}$'),
//                 must: true,
//             },
//             // passwordMsg: '密码验证失败'
//         },
//     },
//     vs
// )
// console.log(v)

const { verifies } = require('../dist/vri')

const ctn = verifies(
    {
        type: 'object',
        attr: {
            name: {
                type: 'string',
                error: 'name校验失败',
            },
            sex: {
                type: 'string',
                default: key => key + ' 的默认值',
            },
        },
    },
    {
        name: 'fly',
        sex: '男'
    }
)

console.log(ctn)
