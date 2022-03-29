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
]);
function xm(values, schemas, parentSchemas = null, key) {
    // 在StrucMethod中寻找校验方法
    //@ts-ignore
    const me = StrucMethod[key];
    if (me)
        return me(values, schemas[key], parentSchemas, key);
    // 在VriMethods中寻找校验方法
    const met = VriMethods[key];
    // 找不到校验方法
    if (met === undefined)
        throw new VriError(`There is no ${key} verification Methods, Check method spelling or add this method to verification methods list.`);
    /**错误信息 */
    let error;
    let schema = schemas[key];
    if (schema.param) {
        if (schema.error)
            error = schema.error;
        schema = schema.param;
    }
    const ctn = met(values, schema);
    if (ctn) {
        return {
            adopt: true,
            value: values,
            key,
        };
    }
    return {
        adopt: false,
        key,
        error,
        value: values,
    };
}
/**结构方法 */
const StrucMethod = {
    /**与 */
    and(values, schemas, parentSchemas) {
        for (const k in schemas) {
            if (Modification.has(k))
                continue;
            const rtn = xm(values, schemas, parentSchemas, k);
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
    or(values, schemas, parentSchemas) {
        let b;
        for (const key in schemas) {
            if (!Modification.has(key))
                continue;
            const rtn = xm(values, schemas, parentSchemas, key);
        }
        return b;
    },
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
    attr(values, schemas, parentSchemas, key) {
        let optional;
        if (parentSchemas && parentSchemas.optional)
            optional = parentSchemas.optional;
        let nvs = {};
        for (const k in schemas) {
            const value = values[k];
            const schema = schemas[k];
            if (typeof schema !== 'object')
                throw new VriError(`The schema of property ${k} is not an object`);
            // 处理值不存在
            if (value === undefined) {
                if (schema.must)
                    return {
                        adopt: false,
                        key: k,
                        error: schema.must,
                        value,
                    };
                else if (schema.default) {
                    if (typeof schema.default === 'function') {
                        nvs[k] = schema.default(k, values);
                    }
                    else {
                        nvs[k] = schema.default;
                    }
                    continue;
                }
                else
                    continue;
            }
            const rtn = StrucMethod.and(value, schema, schemas);
            if (!rtn.adopt)
                return rtn;
            nvs[k] = value;
            if (values[k] !== rtn.value)
                values[k] = rtn.value;
        }
        return {
            adopt: true,
            value: nvs,
            key,
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
    custom(v, p) {
        return p(v);
    },
};
/**验证类 */
class Vri {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    verifies(data) {
        return StrucMethod.and(data, this.schema);
    }
}
exports.Vri = Vri;
/**立即验证 */
function verifies(schema, data) {
    return StrucMethod.and(data, schema);
}
exports.verifies = verifies;
//# sourceMappingURL=vri.js.map