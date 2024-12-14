# Tianyu-CSP Rest Config

Rest file is used for network request url mapping. For different url path, there will be match a most nearly path and to execute the given method.

The basic structure of rest config:

```
    {
        "/": {
            "package": "$",
            "module": "default-loader",
            "method": "html"
        }
    }
```

- "/"

  this is the path of url. you can define multiple paths to handle different url.

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
        #.path1.path2
        <=>
        path1.path2
    ```

- module

  this is the module name of which you want to use. module name can use without suffix, framework will mapping the module with current suffix.

- method

  this is the execution function of imported module. for request execution function, there needs to be `async` function, no parameter and return type `NetworkServiceResponseData` type data. for example:

  - ts

  ```
    export async function <name>(): Promise<NetworkServiceResponseData> {
        // your implementation
    }
  ```

  - js

  ```
    module.exports.<name> = async function() {
        // your implementation
    }
  ```
