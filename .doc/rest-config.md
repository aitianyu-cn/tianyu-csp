# Tianyu-CSP Rest Config

Rest file is used for network request url mapping. For different url path, there will be match a most nearly path and to execute the given method.

### DEFINE

The basic structure of rest config:

```
    {
        "/": {
            "handler": {
                "package": "$",
                "module": "default-loader",
                "method": "html"
            },
            "handlers": {
                "GET": { "package": "$", "module": "default-loader", "method": "html" },
                "POST": { "package": "$", "module": "default-loader", "method": "html" }
            },
            "cache": {
                "type": "url" | "full" | "custom",
                "session": true,
                "cookie": [],
                "header": [],
                "params": [],
                "timeout": 0,
            },
            "proxy": {
                "host": "",
                "rewrite": {},
                "protocol": "http" | "https" | "http2"
            }
        }
    }
```

If javascript is used in your application to export the rest config, please use the export way following exampled:

```
    module.exports = {
         "/": {
            handler: {
                package: "$",
                module: "default-loader",
                method: "html"
            },
            handlers: {
                GET: { package: "$", module: "default-loader", method: "html" },
                POST: { package: "$", module: "default-loader", method: "html" }
            },
            cache: {
                type: "url" | "full" | "custom",
                session: true,
                cookie: [],
                header: [],
                params: [],
                timeout: 0
            },
            proxy: {
                host: "",
                rewrite: {},
                protocol: "http" | "https" | "http2"
            }
        }
    }
```

### HANDLER & HANDLERS

`HANDLER` is a general handler for all types of http request method.

`HANDLERS` give you possible to handle different http method in different script.

- "/"

  this is the path of url. you can define multiple paths to handle different url.

  - general match

    '/\*' value can be used for a generic matching.

    e.g. the following path: this will let rest handler to match all files under path1.

    ```
        "/path1/*"
    ```

  - parameter match

    '{x}' value can be used for a parameter matching.

    e.g. the following path: this will let the {path1} and {path2} as two parameters can be used in the `package`, `module` and `method`.

    ```
        "/root/{path1}/{path2}"
    ```

  - full match

    if the url given without above matching case, the url will be fully matched for url.

- package

  this is the `path` of execution function. but different to original path using `/` to split dictionaries, package uses `.` to split dictionaries.

  - internal modules

    if you would like to using a CSP internal defined object, you should use `$` as the starting of path. for example:

    ```
        $.path1.path2
    ```

  - external modules

    if you would like to using a module from your application path, please use `#` as prefix or no-prefix of path. for example:

    ```
        #.path1.path2 <=> path1.path2
    ```

  - use parameter

    you can use the parameter which are defined in url matching. rest handle will replace the value automatically, for example:

    ```
        url: "/root/{a}/{b}"

        package: "path/{a}"

        actual url: "/root/path1/path2" => rest matched package: "path/path1"
    ```

- module

  this is the module name of which you want to use. module name can use without suffix, framework will mapping the module with current suffix.

  - the parameter can be used in module, for the more info, please see `package -> use parameter`.

- method

  this is the execution function of imported module. for request execution function, there needs to be `async` function, no parameter and return type `NetworkServiceResponseData` type data.

  - the parameter can be used in method, for the more info, please see `package -> use parameter`.

  #### NOTES: if method is not provided or provided with empty string, the `default` value will be applied.

  for example:

  - ts

  ```
    /* Normally define */

    export async function <name>(): Promise<NetworkServiceResponseData> {
        // your implementation
    }

    /* Default define */

    export default async function (): Promise<NetworkServiceResponseData> {
        // your implementation
    }
  ```

  - js

  ```
    /* Normally define */

    module.exports.<name> = async function() {
        // your implementation
    }

    /* Default define */

    module.exports.default = async function() {
        // your implementation
    }
  ```

### CACHE

`cache` field is used for enable http service cache to improve the response performance.

- type

  this indicates the cache matching rule.

  - url: only match the url, the same url will return the same data.

  - full: this will check all http request data, includes `url`, `header`, `params`. **please do not use full rule in BROWSER environment due to unstable cookie and header**

  - custom: this will give you more advaned checking, you can indicate `cookie`, `header`, `params` list. cache will only check the given list data, only when the listed data are samed, the cached data will be returned.

- session

  indicates the cache should be saved for different session.

- cookie

  name list should be matched in cookie.

- header

  name list should be matched in header.

- params

  name list should be matched in params.

- timeout (millionsecond)

  set the timeout time for cache, the cache will be deleted when over the time. default time is 300000 millonseconds.

### PROXY

this field is set for if the url is a back-end proxy.

- use case: when the http request cause a `Cross-Origin` issue, you need to add a proxy to the target system, and use the local path to access the target resources.

- defines

  - host: this is a main field must be set. this indicates the proxy target system url. **PLEASE DO NOT ADD PROTOCAL PRE-FIX**

  - rewrite: if you want to convert the source url to a new url to match the target system reqirement, you can set this map to do the url convertion.

    ```
        rewrite: {
            "/remote": "/",
            "/remote-2/a/b": "/target"
        }

        required url: /remote/a/b/c
        converted url: "/a/b/c"

        required url: /remote-2/a/b/test
        converted url: "/target/test"

    ```

  - protocal

    this indicates the http protocal which is used in target system. the default protocal `http2` will be used when this field is not provided.
