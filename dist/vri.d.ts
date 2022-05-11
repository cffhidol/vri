declare type ST = 'number' | 'string' | 'array' | 'object' | 'boolean';
declare type SchemaType = ST | ST[];
interface SchemaParam<T> {
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
    type?: SchemaType | SchemaParam<SchemaType>;
    /**子属性 */
    attr?: SchemaAttr;
    /**可选属性 */
    optional: string[] | RegExp | ((value: any, key: string) => boolean);
    /**元素 */
    /**必选的属性 */
    must?: boolean | string;
    /**最大 */
    max?: number | SchemaParam<number>;
    /**最小 */
    min?: number | SchemaParam<number>;
    /**条件计数 */
    /**大于 */
    gt?: number | SchemaParam<number>;
    /**小于 */
    lt?: number | SchemaParam<number>;
    /**等于 */
    equal?: SchemaType | SchemaParam<SchemaType>;
    /**匹配正则 */
    regEx?: RegExp | SchemaParam<RegExp>;
    /**不匹配正则 */
    noRegEx?: RegExp | SchemaParam<RegExp>;
    /**自定义 */
    custom?: ((value: any, context: Context) => boolean) | SchemaParam<(value: any, context: Context) => boolean>;
    /**默认值 */
    default: SchemaType | ((key: string, context: Context) => SchemaType);
    /**保留属性 */
    retain: (key: string, context: Context) => boolean;
    /**缺省报错信息 */
    error: string;
}
interface Context {
    parentSchemas?: Schema | SchemaAttr;
    method: string;
    key?: string;
    param?: Param;
}
export interface Param {
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
    method?: string;
    /**出错的属性 */
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
    /**
     *
     * @param data 验证的数据
     * @param param 传递的参数
     * @returns {VriReturn}
     */
    verifies(data: any, param: any): VriReturn;
}
/**立即验证 */
export declare function verifies(schema: Schema, data: any, param: any): VriReturn;
export {};
