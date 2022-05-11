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

const { Vri } = require('../dist/vri')

// const vri = new Vri({
//   type: 'object',
//   retain(key) {
//     console.log(key);
//     return key !== 'aaa'
//   },
//   attr: {
//     name: {
//       type: ['string', 'number'],
//       error: 'name校验失败',
//     },
//     sex: {
//       type: 'string',
//       default: (key, { param }) => key + ' 的默认值' + param,
//     },
//   },
// })

// const rtn = vri.verifies(
//   {
//     name: 'fly',
//     // sex: '男',
//     www: '1',
//     aaa: '2',
//   },
//   'param'
// )

const vri = new Vri({
  type: 'object',
  attr: {
    // uid,
    table: {
      type: 'string',
      must: '缺少表名',
      // max,
    },
    id: {
      type: ['string', 'number'],
      must: '缺少id',
    },
    data: {
      type: 'object',
      must: '缺少数据',
      attr: {},
      retain(key) {
        const is = ['uid', 'id', 'createdAt', 'updateAt'].includes(key)
        return !is
      },
    },
  },
})

const rtn = vri.verifies({
  table: '1',
  id: 1,
  data: {
    a: 'a',
    uid: 'uid',
    id: 'id',
    'updateAt': 'updateAt',
    b: 'b'
  }
})

console.log(rtn)
