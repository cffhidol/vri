declare type SchemaType = 'number' | 'string' | 'array' | 'object' | 'boolean';
interface Param<T> {
    param: T;
    error: string;
}
export interface Schema {
    [k: string]: any;
    /**异 */
    no?: Schema;
    /**或 */
    or?: Schema;
    /**与 */
    and?: Schema;
    /**数据类型 */
    type?: SchemaType | Param<SchemaType>;
    /**子属性 */
    attr?: SchemaAttr;
    /**可选属性 */
    optional: string[] | RegExp | ((value: any, key: string) => boolean);
    /**元素 */
    /**必选的属性 */
    must?: boolean | string;
    /**最大 */
    max?: number | Param<number>;
    /**最小 */
    min?: number | Param<number>;
    /**条件计数 */
    /**大于 */
    gt?: number | Param<number>;
    /**小于 */
    lt?: number | Param<number>;
    /**等于 */
    equal?: SchemaType | Param<SchemaType>;
    /**匹配正则 */
    regEx?: RegExp | Param<RegExp>;
    /**不匹配正则 */
    noRegEx?: RegExp | Param<RegExp>;
    /**自定义 */
    custom?: Function | Param<Function>;
    /**默认值 */
    default: SchemaType | ((key: string, parent: Object) => SchemaType);
    /**缺省报错信息 */
    error: string;
}
interface SchemaAttr {
    [k: string]: Schema;
}
interface VriReturn {
    /**是否通过验证 */
    adopt: boolean;
    /**接受验证的值 */
    value: string;
    /**接受验证的方法 */
    key?: string;
    /**错误信息 */
    error?: string;
}
export declare class VriError extends Error {
    constructor(msg: string);
    static isVerError(error: Error): boolean;
}
/**验证类 */
export declare class Vri {
    schema: any;
    constructor(schema: Schema);
    verifies(data: any): VriReturn | {
        adopt: boolean;
        value: any;
    };
}
/**立即验证 */
export declare function verifies(schema: Schema, data: any): VriReturn | {
    adopt: boolean;
    value: any;
};
export {};
