type VarSchemaType = 'number' | 'string' | 'array' | 'object' | 'function' | 'boolean' | 'undefined'

interface VerSchemaAny {
    [k: string]: any
    type?: VarSchemaType,
    attr?: VerSchemaAttr,
    item?: VerSchemaAny,
    must?: boolean
}

interface VerSchemaAttr {
    [k: string]: VerSchemaAny
}

class VerError extends Error {
    constructor(msg: string) {
        super(msg)
    }
    static isVerError(error: Error) {
        return error instanceof VerError
    }
}
const VerMethods = {
    /**与 */
    and(v: any, p: VerSchemaAny) {
        for (const k in p) {
            // @ts-ignore
            const m = VerMethods[k]
            if (m) {
                const mv: any = m(v, p[k], p[k + 'Msg'])
                if (mv !== true) return mv
            }
        }
        return true
    },
    /**或 */
    or(v: any, p: VerSchemaAny, msg?: string) {
        for (const k in p) {
            // @ts-ignore
            const m = VerMethods[k]
            if (m && m(v, p[k]) === true) return true
        }
        return msg
    },
    /**非 */
    no(v: any, p: VerSchemaAny, msg?: string) {
        for (const k in p) {
            // @ts-ignore
            const m = VerMethods[k]
            if (m && m(v, p[k]) === true) return msg
        }
        return true
    },
    /**属性 */
    attr(v: any, p: VerSchemaAttr, msg?: string) {
        for (const k in p) {
            // @ts-ignore
            const m = p[k]
            if(!m) {
                continue
            }
            const s = v[k]
            if (s === undefined) {
                if (m.must) return m.mustMsg || msg
                return true
            }
            const mv = VerMethods.and(s, m)
            if (mv !== true) return mv || msg
        }
        return true
    },
    /**类型 */
    type(v: any, p: VarSchemaType, msg?: string) {
        return typeof v === p || msg
    },
    /**最大 */
    max(v: any, p: Number, msg?: string) {
        return v <= p || msg
    },
    /**最小 */
    min(v: any, p: Number, msg?: string) {
        return v >= p || msg
    },
    /**大于 */
    gt(v: any, p: Number, msg?: string) {
        return v > p || msg
    },
    /**小于 */
    lt(v: any, p: Number, msg?: string) {
        return v > p || msg
    },
    /**之间 */
    between(v: any, p: [Number, Number], msg?: string) {
        return v >= p[0] && v < p[1] || msg
    },
    /**匹配正则 */
    regEx(v: any, p: RegExp, msg?: string) {
        return p.test(v) || msg
    },
    /**不匹配正则 */
    noRegEx(v: any, p: RegExp, msg?: string) {
        return !p.test(v) || msg
    },
    /**自定义 */
    custom(v: any, p: Function, msg?: string) {
        return p(v) || msg
    },
    /**条件计数 */
    count(v: any, p: VerSchemaAny, msg?: string) {
        let count = 0
        for (const k in p) {
            // @ts-ignore
            const m = VerMethods[k]
            if (m && m(v, p[k])) count++
        }
        if (p.countEqual && count !== p.countEqual) return msg
        if (p.countMax && count > p.countMax) return msg
        if (p.countMin && count < p.countMin) return msg
        if (p.between && (count < p.between[0] || count >= p.between[1])) return msg
        return true
    }
}
/**验证 */
class Ver {
    schema: any
    constructor(schema: VerSchemaAny) {
        this.schema = schema
    }
    verifies(data: any) {
        return VerMethods.and(data, this.schema)
    }
}

new Ver({
    type: "string"
})

function verifies(schema: VerSchemaAny, data: any) {
    return VerMethods.and(data, schema)
}