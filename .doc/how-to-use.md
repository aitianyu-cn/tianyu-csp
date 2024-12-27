# How to use Tianyu-CSP

### INSTALL

- install `Tianyu-CSP` node modules

  ```
      npm install @aitianyu.cn/tianyu-csp
  ```

- config `Typescript` if you want to use typescript to dev. _(TS configuration will not be provided in current doc.)_

- config project setting

  - main config: [`csp.config.json`](./main-config.md)

  - rest config: [`<name>.json or <name>.js`](./rest-config.md)

  - [`infra xcall`](./XCall.md)

  - [`privilege config`](./privilege-config.md)

  - [`monitor config`](./monitor-config.md)

### START

- import `Tianyu-CSP` package

  ```
      import { TianyuCSP } from "@aitianyu.cn/tianyu-csp";
  ```

- loading infra modules

  ```
      TianyuCSP.Infra.load();
  ```

- create `handler` and `service` instance to start

### EXAMPLE

- typescript

  ```
    import { TianyuCSP } from "@aitianyu.cn/tianyu-csp";

    TianyuCSP.Infra.load();

    const dispatcher = new TianyuCSP.Infra.DispatchHandler(); // create dispatch handler instance
    dispatcher.initialize(); // initialize dispatcher handler to register TIANYU.fwk and create job manager


    const requestHandler = new TianyuCSP.Infra.RequestHandler(); // create request handler instance
    requestHandler.initialize(); // initialize request handler to register TIANYU.fwk

    const http1 = new TianyuCSP.Infra.HttpService({ // create a HTTP 1.1 service, binding host "0.0.0.0" and port 8080
        host: "0.0.0.0",
        port: 8080,
    });
    http1.listen();  // to start listening

  ```

- javascript

  ```

    const { TianyuCSP } = require("@aitianyu.cn/tianyu-csp");

    TianyuCSP.Infra.load();

    const dispatcher = new TianyuCSP.Infra.DispatchHandler();
    dispatcher.initialize();

    const requestHandler = new TianyuCSP.Infra.RequestHandler();
    requestHandler.initialize();

    const http1 = new TianyuCSP.Infra.HttpService({
        host: "0.0.0.0",
        port: 8080,
    });
    http1.listen();

  ```
