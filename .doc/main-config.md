# Tianyu-CSP Main Configuration

### File

Tianyu-CSP configs are in a global configuration file.

- Path: `<project_root>/csp.config.json`

NOTES: CSP config file should be stored in the root path of project.

### Configs

Base structure

```
    {
        "config": {
            "name": "",         // your application name
            "version": "",      // application version
            "environment": "",  // application running mode(1)
            "src": "",          // application execution files root path
            "language": ""      // default language(2)
        },
        "rest": {
            "file": "",         // file of rest setting(3)
            "request-map": {},  // definition of request item map(4)
            "loader": ""        // path of url direction router(5)
        },
        "database": {
            "file": "",         // file of database configuration
            "rename": {
                "types": "",    // custom name of database types in config file(6)
                "configs": "",  // custom name of db connection config in config file(7)
                "sys": ""       // custom name of db system rename map in config file(8)
            }
        },
        "user": {
            "login": 10,        // indicates a number to set the user login overtime (day granularity)
            "session_life": 30  // indicates a number to set the session overtime (minute granularity)
        }
    }
```

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

6. database types indicates the remote dasebase type of each database. this will be used for creating a currect db connection automatically. supporting value: `mysql`

7. database connection config indicates the user, password, and other connection information for each database. data structure please check the type of `IDatabaseConnectionConfig` in code.

8. due to `Tianyu-CSP` needs to consume some database table internally, and also to make a generic database implementation. database system rename map is to indicate the database name, table name and field names for system IMPORTANT tables. template please refer [`system database rename map`](./sys-db-rename-map.js)
