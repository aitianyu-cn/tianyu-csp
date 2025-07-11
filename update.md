# Tianyu CSP Version Updates

## version 0.0.1

1. basic structure.
2. http service common interfaces and utils.
3. job and job manager.

## version 0.0.2

1. bug fix.

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
