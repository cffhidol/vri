type ST = 'number' | 'string' | 'array' | 'object' | 'boolean'
type SchemaType = ST | ST[]

interface SchemaParam<T> {
  param: T
  error: string
}

export interface Schema {
  [k: string]: any
  /**异 */
  no?: Schema
  /**或 */
  or?: Schema
  /**与 */
  and?: Schema
  /**数据类型 */
  type?: SchemaType | SchemaParam<SchemaType>
  /**子属性 */
  attr?: AttrSchema
  /**元素 */
  // item?: Schema
  /**必选的属性 */
  must?: boolean | string
  /**最大 */
  max?: number | SchemaParam<number>
  /**最小 */
  min?: number | SchemaParam<number>
  /**条件计数 */
  // count?: SchemaCount
  /**大于 */
  gt?: number | SchemaParam<number>
  /**小于 */
  lt?: number | SchemaParam<number>
  /**等于 */
  equal?: SchemaType | SchemaParam<SchemaType>
  /**匹配正则 */
  regEx?: RegExp | SchemaParam<RegExp>
  /**不匹配正则 */
  noRegEx?: RegExp | SchemaParam<RegExp>
  /**自定义 */
  custom?:
    | ((value: any, context: Context) => boolean)
    | SchemaParam<(value: any, context: Context) => boolean>
  /**默认值 */
  default: SchemaType | ((key: string, context: Context) => SchemaType)
  /**保留属性 */
  retain: (key: string, context: Context) => boolean
  /**缺省报错信息 */
  error: string
}

interface SchemaCount extends Schema {
  countEqual?: number
  countMax?: number
  countMin?: number
  countBetween?: number
}

export interface Context {
  parentSchemas?: AttrSchema
  method: string
  key?: string
  param?: Param
}

export interface AttrContext {
  parentSchemas: Schema
  method: string
  key: string
  param: Param
}

export interface Param {}

export interface AttrSchema {
  [k: string]: Schema
}

interface VriReturn {
  /**是否通过验证 */
  adopt: boolean
  /**接受验证的值 */
  value: string
  /**接受验证的方法 */
  method?: string
  /**出错的属性 */
  key?: string
  /**错误信息 */
  error?: string
}

export class VriError extends Error {
  constructor(msg: string) {
    super(msg)
  }
  static isVerError(error: Error) {
    return error instanceof VriError
  }
}

class ErrorMessage {
  weight: Boolean = false
  constructor(msg: string, context: Context) {}
}

const E = new Set(['and', 'or', 'no', 'attr'])
const T = new Set(['number', 'string', 'array', 'object', 'boolean'])

const Modification = new Set([
  // 'optional',
  'default',
  // 'countEqual',
  // 'countMax',
  // 'countMin',
  // 'countBetween',
  'must',
  'error',
  'retain',
])

function xm(values: any, schemas: any, context: Context): VriReturn {
  const { method, key } = context
  // 在StrucMethod中寻找校验方法
  //@ts-ignore
  const me = StrucMethod[method]
  if (me) return me(values, schemas[method], context)
  // 在VriMethods中寻找校验方法
  const met = VriMethods[method]
  // 找不到校验方法
  if (met === undefined)
    throw new VriError(
      `There is no ${method} verification Methods, Check method spelling or add this method to verification methods list.`
    )
  /**错误信息 */
  let error
  let schema = schemas[method]
  if (schema.param) {
    if (schema.error) error = schema.error
    schema = schema.param
  }
  const ctn = met(values, schema, context)
  if (ctn) {
    return {
      adopt: true,
      value: values,
    }
  }
  return {
    adopt: false,
    value: values,
    method,
    key,
    error,
  }
}

/**结构方法 */
const StrucMethod = {
  /**与 */
  and(values: any, schemas: Schema, context: Context): VriReturn {
    for (const k in schemas) {
      if (Modification.has(k)) continue
      const rtn = xm(values, schemas, { ...context, method: k, parentSchemas: schemas })
      if (!rtn.adopt) {
        if (rtn.error === undefined) rtn.error = schemas.error
        return rtn
      }
      if (values !== rtn.value) values = rtn.value
    }
    return {
      adopt: true,
      value: values,
    }
  },
  /**或 */
  // or(values: any, schemas: Schema, context: Context) {
  //   let b: any
  //   for (const key in schemas) {
  //     if (!Modification.has(key)) continue
  //     const rtn = xm(values, schemas, context)
  //   }
  //   return b
  // },
  // /**非 */
  // no(values: any, schemas: Schema) {
  //     const ks = Object.keys(schemas)
  //     for (let i = 0; i < ks.length; i++) {
  //         const methods = ks[i],
  //             method = VriMethods[methods],
  //             value = values[methods],
  //             schema = schemas[methods]
  //         if (method) {
  //             const b: any = method(values, schema)
  //             if (b === true) return schemas[methods + 'Msg']
  //         }
  //     }
  //     return true
  // },
  /**属性 */
  attr(values: any, schemas: AttrSchema, context: Context) {
    let nvs: any = {}
    for (const key in schemas) {
      const value = values[key]
      const schema = schemas[key]
      if (typeof schema !== 'object')
        throw new VriError(`The schema of property ${key} is not an object`)
      // 处理值不存在
      if (value === undefined || value === '') {
        if (schema.must) {
          return {
            adopt: false,
            key,
            error: schema.must,
            value,
          }
        } else if (schema.default) {
          if (typeof schema.default === 'function') {
            nvs[key] = schema.default(key, context)
          } else {
            nvs[key] = schema.default
          }
          continue
        } else continue
      }
      const rtn = StrucMethod.and(value, schema, {
        ...context,
        parentSchemas: schemas,
        method: 'attr',
        key,
      })
      if (!rtn.adopt) return rtn
      nvs[key] = value
      if (values[key] !== rtn.value) nvs[key] = rtn.value
    }
    if (context.parentSchemas && context.parentSchemas.retain) {
      const { retain } = context.parentSchemas
      for (const key in values) {
        if (schemas[key]) continue
        //@ts-ignore
        const isr = retain(key, context)
        if (isr) nvs[key] = values[key]
      }
    }
    return {
      adopt: true,
      value: nvs,
      key: context.key,
    }
  },
  // /**条件计数 */
  // count(v: any, p: Schema) {
  //     let count = 0
  //     const ks = Object.keys(v)
  //     for (const k in p) {
  //         // @ts-ignore
  //         const m = VriMethods[k]
  //         if (m && m(v, p[k])) count++
  //     }
  //     if (p.countEqual && count !== p.countEqual) return p.countEqualMsg
  //     if (p.countMax && count > p.countMax) return p.countMaxMsg
  //     if (p.countMin && count < p.countMin) return p.countMinMsg
  //     if (p.countBetween && (count < p.countBetween[0] || count >= p.countBetween[1]))
  //         return p.betweenMsg
  //     return true
  // },
}

const VriMethods: {
  [x: string]: (schemas: any, values: any, context: Context) => boolean
} = {
  /**类型 */
  type(v: any, p: SchemaType) {
    //@ts-ignore
    if (p instanceof Array) return p.includes(typeof v)
    return typeof v === p
  },
  /**最大 */
  max(v: any, p: Number) {
    if (typeof v === 'number') return v <= p
    return v.length <= p
  },
  /**最小 */
  min(v: any, p: Number) {
    if (typeof v === 'number') return v >= p
    return v.length >= p
  },
  /**大于 */
  gt(v: any, p: Number) {
    return v > p
  },
  /**小于 */
  lt(v: any, p: Number) {
    return v < p
  },
  /**等于 */
  equal(v: any, p: any) {
    return v == p
  },
  /**不等于 */
  noEqual(v: any, p: any) {
    return v != p
  },
  /**匹配正则 */
  regEx(v: any, p: RegExp) {
    return p.test(v)
  },
  /**不匹配正则 */
  noRegEx(v: any, p: RegExp) {
    return !p.test(v)
  },
  /**自定义 */
  custom(v: any, p: Function, context) {
    return p(v, context)
  },
}

/**验证类 */
export class Vri {
  schema: any
  constructor(schema: Schema) {
    this.schema = schema
  }
  /**
   *
   * @param data 验证的数据
   * @param param 传递的参数
   * @returns {VriReturn}
   */
  verifies(data: any, param: any): VriReturn {
    return StrucMethod.and(data, this.schema, { param, method: 'and' })
  }
}
/**立即验证 */
export function verifies(schema: Schema, data: any, param: any) {
  return StrucMethod.and(data, schema, param)
}
