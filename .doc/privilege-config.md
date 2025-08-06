# CSP Privilege Config

Privilege config is the global base privilege list to indicate:

1.  what function is defined in privilege.
2.  which privilege is required in the function.

### Config

CSP Privilege config supports `JSON` and `Javascript` two types of file.

- JSON

```
    {
        "function name": {
            "read": true | false,
            "write": true | false,
            "delete": true | false,
            "change": true | false,
            "execute": true | false,
        }
    }
```

- Javascript

```
    module.exports = {
        "function name": {
            read: true | false,
            write: true | false,
            delete: true | false,
            change: true | false,
            execute: true | false,
        }
    }
```

### Privilege Action

Privileges has 5 types of actions (read, write, delete, change and execute), a boolean value is assigned to each action.

- true: this action is used in the function, and the user privilege will has `allow` and `avoid` two statuses.

- false: this action is not valid for this function, the user privilege will always be `non`.
