# Tianyu-CSP Main Configuration

### File

Tianyu-CSP configs are in a global configuration file.

- Path: `<project_root>/csp.config.json` or `<project_root>/csp.config.js`

NOTES: CSP config file should be stored in the root path of project.

### Configs

Base structure in `csp.config.json` file:

```
    {
        "config": {
            "name": "",             // your application name
            "version": "",          // application version
            "environment": "",      // application running mode(1)
            "src": "",              // application execution files root path
            "language": "",         // default language(2)
            "roles": "",            // application license roles config file path(7)
            "audit": {              // audit setting(9)
                "remote": "",       // audit remote server
                "path"?: "",        // audit remote access path (http only)
                "header"?: "",      // audit remote http headers (http only)
                "port"?: 514,       // audit remote server port
                "family"?: "IPv4",  // audit remote server IP family
                "protocal"?: "udp", // audit remote server supported protocal
                "log": true,        // audit info record in log
                "buffer": 1,        // audit records save cache
                "plugin": []        // list of custom audit processor
            }
        },
        "rest": {
            "file": "",         // file of rest setting(3)
            "request-map": {},  // definition of request item map(4)
            "loader": ""        // path of url direction router(5)
            "fallback": {       // default rest target, is used for rest path is not found(6)
                "package": "",
                "module": "",
                "method": ""
            }
        },
        "xcall": {              // external call define(8)
            "logger": { "log": {"package": "", "module": "", "method": ""} };
            "usage": { "record": {"package": "", "module": "", "method": ""} };
            "trace": { "trace": {"package": "", "module": "", "method": ""} };
            "feature": { "is-active": {"package": "", "module": "", "method": ""} };
            "session": { "get": {"package": "", "module": "", "method": ""} };
            "user": { "get": {"package": "", "module": "", "method": ""} };
            "license": { "get": {"package": "", "module": "", "method": ""} };
            "role": { "get": {"package": "", "module": "", "method": ""} };
        }
    }
```

If javascript (`csp.config.js`) is used in your application instead of json file, please following the below code to export config:

```
    module.exports = {
        config: {
            ...
        },
        ...
    }
```

<u>NOTE: config items are totally samed in javascript file and json file. config items details please take a reference to json configuration.</u>

1. enviroment provides two values `development` and `production` (Please follow the case in this doc). `development` indicates the application will generate more info when running for debugging. If this item is not provides, "development" mode will be set as default.

2. language setting please following `@aitianyu.cn/types` design. Tianyu-CSP accepts only '\_' connect char, '-' connect char will cause invalid language type.

3. rest file configuration please see <span id="1"> [Rest Config](./rest-config.md).

4. request-map is a map for giving some customized name mapping of `cookie` and `params` (params is a value map given by url searching). request-map items accept two types of struct (`string` and `object`). when `string` value is assigned to an item, that means cookie and params use same name. if an object is assigned, you **MUST** to give names for each type.

   ```
   "request-map": {
       "language": {
           "cookie": "",
           "search": ""
       },
       "session": ""
   }
   ```

   currently, we supports `language`, `session` items of request-map as default. you can also add some customized items and you can use `Tianyu-CSP` utils to read data from cookie and params quickly.

5. loader is working for some static resources only, like `html` file, and this is a root path of static files. you can define the static source in some dicionary structure and consume this by setting a system loader in [`Rest Config`](#1).

6. fallback config is used for when the url is not mapped any path in rest file, to return a default call. fallback config please take a reference from [rest config file](./rest-config.md).

7. license roles define for csp application. the details configuration please see [`privilege config`](./privilege-config.md).

8. csp external call is named `XCall` in code. this provides an external module to handle infra database access logic to make flexible application implementation. to see the detailed information, please to [`XCall`](./XCall.md)

9. csp audit is a local server to support records log and operation data. `remote` server support IPv6 and IPv4 address and customized port and protocal. default IP `family` is "**IPv4**", suport "**IPv6**" value for IPv6 server. default `port` is "**514**". default `protocal` is "**UDP**", support "**tcp**" and "**http**"(contains http, http2.0). `log` is a boolean field with "true" value indicates the audit should print to log or not. `path` is only used for **HTTP** protocal to indicate the request target router. `header` is used for **HTTP** only. `plugin` is a list of audit data processing functions.
