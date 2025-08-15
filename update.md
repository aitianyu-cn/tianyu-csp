# Tianyu CSP Version Updates

## version 0.3.10

1. bug fix
2. re-structure some internal files to enchange the project structure.
3. deprecate `TianyuCSP` namespace and create new namespace `CSP` for feature `BCP` project.
4. add basic libs for base data type and crypto.
5. add auth modules and support TOTP calculation.
6. enhance job execution payload.

## version 0.3.0

1. bug fix.
2. support global module to be used out of TIANYU environment.
3. support all types of default loader: file-loader, html-loader, proxy-loader and auto-loader(auto search file and html).
4. support ignore pattern for default loader. ignored patterns will return 403 http status when required.

## version 0.2.1

1. bug fix.
2. support global lifecycle manager.
3. remove database connections, please use `npm install @aitianyu.cn/tianyu-csp-tools` to use new external modules.
4. add audit manager to records all operation. logger should not be used normally.

## version 0.2.0

1. multiple parameters in same id for url searching
   > decode.  
   > encode.  
   > array type in url search structure.
2. support tcp/udp service and client
3. file service
   > file operation helper.  
   > internal based dir.  
   > global based dir.  
   > binary file reader/writer object.

## version 0.1.0

1. documentary for configurations and database.
2. basic modules implementation like trace, logger.
   > supported HTTP client.
3. quick start api to run an application
   > only for sql database.
4. html loader
5. refine rest path processor and support condition mapping
6. notes of all export modules
7. support javascript in configuration file.
8. support postgre or tidb or redis(at least a kv database)
   > supported 'redis'.
9. support remote procedure call
   > http for development mode only.  
   > https & http2 supporting.
10. support external object call
11. installation api to quick deployment.
    > mysql deployment tool to create database.
    > mysql data importer to initialize database data.
12. http2.0 supporting.
    > http2.0 service.
    > http2.0 client.
    > http2.0 service cert & key hot-loading.
13. http proxy
    > http proxy for development mode only
    > https proxy.
    > http2 proxy.

## version 0.0.2

1. bug fix.

## version 0.0.1

1. basic structure.
2. http service common interfaces and utils.
3. job and job manager.
