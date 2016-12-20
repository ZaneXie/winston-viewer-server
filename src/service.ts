/**
 * Created by xiezongjun on 2016-12-20.
 */

import winston = require("winston");
import Bluebird = require("bluebird");
import lodash = require('lodash');
import {FileTransportInstance} from "winston";
import glob = require("glob");
import path = require('path');
import KoaRouter = require('koa-router');
import {IRouterContext} from "koa-router";

declare module  '~koa/lib/request' {
    export interface Request {
        body: any;
    }
}

interface IOption {
    prefix?: string,
    winston?,
    log_files?,
}

interface IQueryOption {
    name?: string,
    options?: winston.QueryOptions,
}


function createQuery(opts: {transports: {}}) {
    function x(query, options) {
        return new Bluebird((resolve, reject) => {
            query.query(options, (err, results) => {
                if (err) {
                    reject(err);
                }
                else {
                    // console.log({options, results});
                    resolve(results);
                }
            })
        });
    }

    return (options: IQueryOption) => {
        if (options.name && opts.transports[options.name]) {
            let name: string = options.name;
            console.log(options.options);
            return x(opts.transports[options.name], options.options).then((result) => {
                let ret = {};
                ret[name] = result;
                return ret;
            })
        } else {
            let jobs: Bluebird<any>[] = [];
            for (let name in opts.transports) {
                jobs.push(x(opts.transports[name], options.options).then((result) => {
                    return {name, result}
                }));
            }
            return Bluebird.all(jobs).then((results) => {
                let ret = {};
                lodash.each(results, (result) => {
                    ret[result['name']] = result.result;
                })
                return ret;
            });
        }

    }
}

export function Service(option: IOption) {
    let transports: {[id: string]: FileTransportInstance} = {};
    if (option.winston) {
        transports = option.winston.default.transports;
    } else {
        let files = glob.sync(option.log_files);
        for (let file of files) {
            transports[path.basename(file)] = (new (winston.transports.File)({
                filename: path.resolve(option.log_files, file),
                name: file
            }))
        }
    }
    let query = createQuery({transports});

    let routerOption = {};
    if (option.prefix) {
        routerOption['prefix'] = option.prefix
    }
    let router = new KoaRouter(routerOption);

    router.get('/loggers', function*(this: IRouterContext, next) {
        this.body = JSON.stringify(Object.keys(transports));
        yield next;
    })

    router.get('/query', function*(this: IRouterContext, next) {
        let q = this.request.query;
        if (q['fields'] && !Array.isArray(q['fields'])) {
            q['fields'] = [q['fields']]
        }
        let option: IQueryOption = {
            name: q.name,
            options: q
        }
        this.body = JSON.stringify(yield query(option));
        yield next;
    });

    return router.routes();
}