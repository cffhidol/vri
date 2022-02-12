declare type VarSchemaType = 'number' | 'string' | 'array' | 'object' | 'function' | 'boolean' | 'undefined';
interface VerSchemaAny {
    [k: string]: any;
    type?: VarSchemaType;
    attr?: VerSchemaAttr;
    item?: VerSchemaAny;
    must?: boolean;
}
interface VerSchemaAttr {
    [k: string]: VerSchemaAny;
}
declare class VerError extends Error {
    constructor(msg: string);
    static isVerError(error: Error): boolean;
}
declare const VerMethods: {
    /**与 */
    and(v: any, p: VerSchemaAny): any;
    /**或 */
    or(v: any, p: VerSchemaAny, msg?: string | undefined): string | true | undefined;
    /**非 */
    no(v: any, p: VerSchemaAny, msg?: string | undefined): string | true | undefined;
    /**属性 */
    attr(v: any, p: VerSchemaAttr, msg?: string | undefined): any;
    /**类型 */
    type(v: any, p: VarSchemaType, msg?: string | undefined): string | true | undefined;
    /**最大 */
    max(v: any, p: Number, msg?: string | undefined): string | true | undefined;
    /**最小 */
    min(v: any, p: Number, msg?: string | undefined): string | true | undefined;
    /**大于 */
    gt(v: any, p: Number, msg?: string | undefined): string | true | undefined;
    /**小于 */
    lt(v: any, p: Number, msg?: string | undefined): string | true | undefined;
    /**之间 */
    between(v: any, p: [Number, Number], msg?: string | undefined): string | true | undefined;
    /**匹配正则 */
    regEx(v: any, p: RegExp, msg?: string | undefined): string | true | undefined;
    /**不匹配正则 */
    noRegEx(v: any, p: RegExp, msg?: string | undefined): string | true | undefined;
    /**自定义 */
    custom(v: any, p: Function, msg?: string | undefined): any;
    /**条件计数 */
    count(v: any, p: VerSchemaAny, msg?: string | undefined): string | true | undefined;
};
/**验证 */
declare class Ver {
    schema: any;
    constructor(schema: VerSchemaAny);
    verifies(data: any): any;
}
declare function verifies(schema: VerSchemaAny, data: any): any;
