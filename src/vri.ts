type ST = 'number' | 'string' | 'array' | 'object' | 'boolean'
type SchemaType = ST | ST[]

interface SchemaParam<T> {
  param: T
  error: string
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

const Modifications = new Set([
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

const verifiers = {
  /**与 */
  and(values: any, schemas: Schema, context: Context): VriReturn {
    for (const k in schemas) {
      if (Modifications.has(k)) continue
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
      const rtn = verifiers.and(value, schema, {
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
}

/**Vri验证 */
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
    return verifiers.and(data, this.schema, { param, method: 'and' })
  }
}
/**立即验证 */
export function verifies(schema: Schema, data: any, param: any) {
  return verifiers.and(data, schema, param)
}
