# CSP XCall received parameters

### What is XCall ?

Tianyu CSP XCall is an external implementation for database operations of system infra side functionalities. Based on the `XCall`, CSP supports different developers to implement the infra database in different ways, and only need to abide by the parameters and return rule.

With the `XCall`, CSP platform can be more flaxible.

### XCall Parameters & Returns

This section is a list of `XCall` parameters and returns. The parameters are given from infra code and returns should be returned from external. Please ensure the return values are following the rule shown below for each function. If the shown values returned in a wrong type, an unknown error might occur.

The return values can contain other value items not shown in the below list.

- logger.log

  - parameters

    ```
    {
        user: string;       // the user id of current session or job
        level: string;      // the message level to string formatting
        time: string;       // the time of message occurs
        message: string;    // the message main body
    }
    ```

  - returns `void // no return value, any returned value will be discarded`

- usage.record

  - parameters

    ```
    {
        user: string;       // the user id of current session or job
        endpoint: string;   // the function is used by the user (format with: {project name}#{target function name})
        action: string;     // the data operation type of the used function
        time: string;       // the time of the function triggered
        message: string;    // the message main body
    }
    ```

  - returns `void // no return value, any returned value will be discarded`

- trace.trace

  - parameters

    ```

    {
        user: string;       // when error occurs, the user id of current session or job
        traceId: string;    // the error trace id for the error analysis
        time: string;       // the time of message occurs
        message: string;    // the message of error
        details: string;    // the error details message
        area: string        // the error belonging indicates the error is in core or not
    }
    ```

  - returns `void // no return value, any returned value will be discarded`

- feature.is-active

  - parameters

    ```
    {
        id: string;     // the feature name
    }
    ```

  - returns `boolean // receive a boolean value, any other returns will be converted to boolean type`

- session.get

  - parameters

    ```
    {
        id: string; // the required session id
    }
    ```

  - returns

    ```
    valid: {
        userId: string;     // the user id of provided session
        time: string;       // the session online time that used to check session overtime
    }

    invalid: null           // if the session is invalid, null value can be returned
    ```

- user.get

  - parameters

    ```
    {
        id: string;     // the user id
    }
    ```

  - returns

    ```
    valid: {
        name: string;     // the user display name of provided session
        license: string;  // the user license to get the privilege
    }

    invalid: null           // if the user is invalid, null value can be returned
    ```

- license.get

  - parameters

    ```
    {
        id: string;     // the license id
    }
    ```

  - returns

    ```
    valid: {
        admin: boolean;     // indicates the license is in admin mode or not
                               only boolean value can be received, any other
                               returns will cause an exception.
    }
    ```

- role.get

  - parameters

    ```
    {
        id: string;     // the license id
    }
    ```

  - returns

    ```
    [
        {
            name: string;       // the function name of privilege
            read: any;          // indicates the user has the read privilege of this function,
                                   default value should be boolean, value will be converted to
                                   boolean automatically if giving other types value.
            write: any;         // indicates the user has the write privilege of this function,
                                   default value should be boolean, value will be converted to
                                   boolean automatically if giving other types value.
            delete: any;        // indicates the user has the delete privilege of this function,
                                   default value should be boolean, value will be converted to
                                   boolean automatically if giving other types value.
            change: any;        // indicates the user has the change privilege of this function,
                                   default value should be boolean, value will be converted to
                                   boolean automatically if giving other types value.
            execute: any;       // indicates the user has the execute privilege of this function,
                                   default value should be boolean, value will be converted to
                                   boolean automatically if giving other types value.
        }
    ]
    ```

- monitor.record

  - parameters

    ```

    ```

  - returns

    ```

    ```
