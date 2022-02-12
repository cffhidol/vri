"use strict";
class VerError extends Error {
    constructor(msg) {
        super(msg);
    }
    static isVerError(error) {
        return error instanceof VerError;
    }
}
const VerMethods = {
    /**与 */
    and(v, p) {
        for (const k in p) {
            // @ts-ignore
            const m = VerMethods[k];
            if (m) {
                const mv = m(v, p[k], p[k + 'Msg']);
                if (mv !== true)
                    return mv;
            }
        }
        return true;
    },
    /**或 */
    or(v, p, msg) {
        for (const k in p) {
            // @ts-ignore
            const m = VerMethods[k];
            if (m && m(v, p[k]) === true)
                return true;
        }
        return msg;
    },
    /**非 */
    no(v, p, msg) {
        for (const k in p) {
            // @ts-ignore
            const m = VerMethods[k];
            if (m && m(v, p[k]) === true)
                return msg;
        }
        return true;
    },
    /**属性 */
    attr(v, p, msg) {
        for (const k in p) {
            // @ts-ignore
            const m = p[k];
            if (!m) {
                continue;
            }
            const s = v[k];
            if (s === undefined) {
                if (m.must)
                    return m.mustMsg || msg;
                return true;
            }
            const mv = VerMethods.and(s, m);
            if (mv !== true)
                return mv || msg;
        }
        return true;
    },
    /**类型 */
    type(v, p, msg) {
        return typeof v === p || msg;
    },
    /**最大 */
    max(v, p, msg) {
        return v <= p || msg;
    },
    /**最小 */
    min(v, p, msg) {
        return v >= p || msg;
    },
    /**大于 */
    gt(v, p, msg) {
        return v > p || msg;
    },
    /**小于 */
    lt(v, p, msg) {
        return v > p || msg;
    },
    /**之间 */
    between(v, p, msg) {
        return v >= p[0] && v < p[1] || msg;
    },
    /**匹配正则 */
    regEx(v, p, msg) {
        return p.test(v) || msg;
    },
    /**不匹配正则 */
    noRegEx(v, p, msg) {
        return !p.test(v) || msg;
    },
    /**自定义 */
    custom(v, p, msg) {
        return p(v) || msg;
    },
    /**条件计数 */
    count(v, p, msg) {
        let count = 0;
        for (const k in p) {
            // @ts-ignore
            const m = VerMethods[k];
            if (m && m(v, p[k]))
                count++;
        }
        if (p.countEqual && count !== p.countEqual)
            return msg;
        if (p.countMax && count > p.countMax)
            return msg;
        if (p.countMin && count < p.countMin)
            return msg;
        if (p.between && (count < p.between[0] || count >= p.between[1]))
            return msg;
        return true;
    }
};
/**验证 */
class Ver {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    verifies(data) {
        return VerMethods.and(data, this.schema);
    }
}
new Ver({
    type: "string"
});
function verifies(schema, data) {
    return VerMethods.and(data, schema);
}
