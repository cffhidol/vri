# 介绍

`Vri`是一个可用于ESModel和NodeJs的数据校验库，使用类似`schema json`配置对象的方式校验数据，并支持自定义每个校验方法的错误信息。

# 指南

**下载**

```
$ npm i vri
```

**基本示例**

```js
const { verifies } = require('Vri')

const { adopt } = verifies(
    {
        type: 'string',
    },
    0
)

console.log(adopt)
```

```
$  false
```

> - adopt
>
>   通过返回`true`，未通过返回`false`
>
> - type
>
>   表示验证数据类型

### 给验证不通过时指定一个错误信息

```js
const { adopt, error } = verifies(
    {
        type: 'string',
        error: '验证出错',
    },
    0
)
```

```
$  验证出错
```

> 如果验证通过，则`error`始终返回`undefined`

### 多个校验方法

```js
const { adopt, error } = verifies(
    {
        type: 'string',
        min: 4,
        error: '验证出错',
    },
    '123'
)
```

```
$ 验证出错
```

> - min
>
>   数据的长度必须大于等于参数

这种单一的错误信息不能满足对出错数据的排查

### 多错误

```js
const { adopt, error } = verifies(
    {
        type: {
            param: 'string',
            error: '数据类型必须为string'
        },
        min: {
            param: 4,
            error: '数据长度最低为4'
        },
        error: '验证出错',
    },
    '123'
)
```

```
$ 数据长度最低为4
```

如果参数缺少`error`属性，则会向外逐层寻找`error`

```js
const { adopt, error } = verifies(
    {
        type: {
            param: 'string',
            error: '数据类型必须为string'
        },
        min: {
            param: 4,
            error: '数据长度最低为4'
        },
        max: 6,
        error: '验证出错',
    },
    '1234567'
)
```

```
$ 验证出错
```

> - max
>
>   数据的长度必须小于等于参数

### 子属性

```js
const ctn = verifies(
    {
        type: 'object',
        attr: {
            name: {
                type: 'string',
                min: {
                    param: 3,
                    error: 'name的长度必须在3-9之间'
                },
                max: {
                    param: 9,
                    error: 'name的长度必须在3-9之间'
                },
                error: 'name校验失败'
            },
            age: {
                type: 'number',
                min: {
                    param: 16,
                    error: '太年轻了'
                },
                max: {
                    param: 60,
                    error: '太老了'
                },
                error: 'age校验失败'
            }
        }
    },
    {
        name: 'fly',
        age: 18,
        garbage: 'daji#odj%JI$#%K@%$KN'
    }
)
```

```js
{ adopt: true, value: { name: 'fly', age: 18 } }
```

1. 使用`attr`定义对象的子属性
2. 使用`value`获取校验后的数据，而不是之间使用源数据
3. 未在校验配置中定义的属性会被忽略，这样可以防止客户端发送垃圾属性。

我们把数据改一下，制造一些错误。

```js
var data = {
    name: 'fly',
    age: 15,
}
```

```js
{ adopt: false, key: 'min', error: '太年轻了', value: 15 }
```

> - key
>
>   出错时调用的校验方法名
>
> - value
>
>   出错的数据

默认在对象属性缺失时会直接忽略，使用`must`来标记必选的属性。

```js
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
                must: '缺少sex属性',
            },
        },
    },
    {
        name: 'fly',
    }
)
```

```js
{ adopt: false, key: 'sex', error: '缺少sex属性', value: undefined }
```

或者使用`default`来赋予默认值

```js
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
    }
)
```

```js
{ adopt: true, value: { name: 'fly', age: 16, sex: 'sex 的默认值' } }
```

> - default
>
>   用于赋予默认值，填入任意数据类型
>
>   如果为函数则接受两个参数
>
>   - key
>
>     属性名
>
>   - parent
>
>     父对象的引用
>
>   否则将直接被赋予到结果中，确保只在默认值为基本数据类型时使用这种写法，否则可能产生不可预料的错误。

# API

## Modification

- ### default

  用于赋予默认值，填入任意数据类型

  如果为函数则接受两个参数

  - key

    属性名

  - parent

    父对象的引用

  否则将直接被赋予到结果中，确保只在默认值为基本数据类型时使用这种写法，否则可能产生不可预料的错误。

- ### must

  标记为必选属性

  如果缺少该属性则将`must`的值作为`error`返回

- ### error

  定义当该属性校验失败时的错误信息

## StrucMethod

- ### and

  传入一个`Schema`结构的对象

  当所有校验方法都通过时校验通过。`verifies`方法在内部直接调用了`StrucMethod.and`

- ### or

  传入一个`Schema`结构的对象| { [校验方法]: 校验参数 }

  当任意一个校验方法通过时校验通过。

- ### attr

  传入一个`SchemaAttr`结构的对象| { [校验属性]: `Schema`结构对象 }

## VriMethods

- ### type

  传入一个字符串

  当数据的`typeof` 全等于参数时校验通过

- ### max

  传入一个数值

  当数据为`number`时比较数值大小，数据小于等于参数时校验通过

  否则当数据的`length`属性小于等于参数时校验通过

- ### min

  传入一个数值

  当数据为`number`时比较数值大小，数据大于等于参数时校验通过

  否则当数据的`length`属性大于等于参数时校验通过

- ### gt

  传入一个数值

  当数据大于参数时校验通过

- ### lt

  传入一个数值

  当数据小于参数时校验通过

- ### equal

  传入任意类型

  当数据等于(`==`)参数时校验通过

- ### noEqual

  传入任意类型

  当数据不等于(`!=`)参数时校验通过

- ### regEx

  传入一个正则表达式

  匹配正则时校验通过

- ### noRegEx

  传入一个正则表达式

  不匹配正则时校验通过

- ### custom

  传入一个回调函数

  当函数返回`true`时校验通过

  函数接受一个参数，即正在接受校验的数据

