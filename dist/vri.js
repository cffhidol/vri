"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifies = exports.Vri = exports.VriError = void 0;
class VriError extends Error {
    constructor(msg) {
        super(msg);
    }
    static isVerError(error) {
        return error instanceof VriError;
    }
}
exports.VriError = VriError;
const E = new Set(['and', 'or', 'no', 'attr']);
const T = new Set(['number', 'string', 'array', 'object', 'boolean']);
const Modification = new Set([
    // 'optional',
    'default',
    // 'countEqual',
    // 'countMax',
    // 'countMin',
    // 'countBetween',
    'must',
    'error',
    'retain'
]);
function xm(values, schemas, context) {
    const { method, key } = context;
    // 在StrucMethod中寻找校验方法
    //@ts-ignore
    const me = StrucMethod[method];
    if (me)
        return me(values, schemas[method], context);
    // 在VriMethods中寻找校验方法
    const met = VriMethods[method];
    // 找不到校验方法
    if (met === undefined)
        throw new VriError(`There is no ${method} verification Methods, Check method spelling or add this method to verification methods list.`);
    /**错误信息 */
    let error;
    let schema = schemas[method];
    if (schema.param) {
        if (schema.error)
            error = schema.error;
        schema = schema.param;
    }
    const ctn = met(values, schema, context);
    if (ctn) {
        return {
            adopt: true,
            value: values,
        };
    }
    return {
        adopt: false,
        value: values,
        method,
        key,
        error,
    };
}
/**结构方法 */
const StrucMethod = {
    /**与 */
    and(values, schemas, context) {
        for (const k in schemas) {
            if (Modification.has(k))
                continue;
            const rtn = xm(values, schemas, { ...context, method: k, parentSchemas: schemas });
            if (!rtn.adopt) {
                if (rtn.error === undefined)
                    rtn.error = schemas.error;
                return rtn;
            }
            if (values !== rtn.value)
                values = rtn.value;
        }
        return {
            adopt: true,
            value: values,
        };
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
    attr(values, schemas, context) {
        const { parentSchemas } = context;
        const optional = parentSchemas && parentSchemas.optional ? parentSchemas.optional : false;
        let nvs = {};
        for (const key in schemas) {
            const value = values[key];
            const schema = schemas[key];
            if (typeof schema !== 'object')
                throw new VriError(`The schema of property ${key} is not an object`);
            // 处理值不存在
            if (value === undefined || value === '') {
                if (schema.must) {
                    return {
                        adopt: false,
                        key,
                        error: schema.must,
                        value,
                    };
                }
                else if (schema.default) {
                    if (typeof schema.default === 'function') {
                        nvs[key] = schema.default(key, context);
                    }
                    else {
                        nvs[key] = schema.default;
                    }
                    continue;
                }
                else
                    continue;
            }
            const rtn = StrucMethod.and(value, schema, {
                ...context,
                parentSchemas: schemas,
                method: 'attr',
                key,
            });
            if (!rtn.adopt)
                return rtn;
            nvs[key] = value;
            if (values[key] !== rtn.value)
                nvs[key] = rtn.value;
        }
        if (context.parentSchemas && context.parentSchemas.retain) {
            const { retain } = context.parentSchemas;
            for (const key in values) {
                if (schemas[key])
                    continue;
                //@ts-ignore
                const isr = retain(key, context);
                if (isr)
                    nvs[key] = values[key];
            }
        }
        return {
            adopt: true,
            value: nvs,
            key: context.key,
        };
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
};
const VriMethods = {
    /**类型 */
    type(v, p) {
        //@ts-ignore
        if (p instanceof Array)
            return p.includes(typeof v);
        return typeof v === p;
    },
    /**最大 */
    max(v, p) {
        if (typeof v === 'number')
            return v <= p;
        return v.length <= p;
    },
    /**最小 */
    min(v, p) {
        if (typeof v === 'number')
            return v >= p;
        return v.length >= p;
    },
    /**大于 */
    gt(v, p) {
        return v > p;
    },
    /**小于 */
    lt(v, p) {
        return v < p;
    },
    /**等于 */
    equal(v, p) {
        return v == p;
    },
    /**不等于 */
    noEqual(v, p) {
        return v != p;
    },
    /**匹配正则 */
    regEx(v, p) {
        return p.test(v);
    },
    /**不匹配正则 */
    noRegEx(v, p) {
        return !p.test(v);
    },
    /**自定义 */
    custom(v, p, context) {
        return p(v, context);
    },
};
/**验证类 */
class Vri {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    /**
     *
     * @param data 验证的数据
     * @param param 传递的参数
     * @returns {VriReturn}
     */
    verifies(data, param) {
        return StrucMethod.and(data, this.schema, { param, method: 'and' });
    }
}
exports.Vri = Vri;
/**立即验证 */
function verifies(schema, data, param) {
    return StrucMethod.and(data, schema, param);
}
exports.verifies = verifies;
