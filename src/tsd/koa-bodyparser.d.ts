/**
 * Created by xiezongjun on 2016-12-12.
 */

declare module 'koa-bodyparser' {

    import * as Koa from "koa";

    function bodyParser(opts?: {
        /**
         * requested encoding. Default is utf-8 by co-body
         */
        encode?: string;

        /**
         * limit of the urlencoded body. If the body ends up being larger than this limit
         * a 413 error code is returned. Default is 56kb
         */
        formLimit?: string;

        /**
         * limit of the json body. Default is 1mb
         */
        jsonLimit?: string;

        /**
         * when set to true, JSON parser will only accept arrays and objects. Default is true
         */
        strict?: boolean;

        /**
         * custom json request detect function. Default is null
         */
        detectJSON?: (ctx: Koa.Context) => boolean;

        /**
         * support extend types
         */
        extendTypes?: {
            json?: string[];
            form?: string[];
        }

        /**
         * support custom error handle
         */
        onerror?: (err: Error, ctx: Koa.Context) => void;
    }): { (ctx: Koa.Context, next?: () => any): any };

    namespace bodyParser {
    }
    export = bodyParser;
}
