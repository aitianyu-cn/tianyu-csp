# CSP Database Table Define Template

This doc will describe some default database table structure which should not be changed. All the definitions are based on `MySQL` database, for other database, please take the corresponding documents as reference.

<h4><u>
*** Please follow the data types definition from the template file. The name of field can use your cutomized name by describing in `database` configuration javascript file.
</u></h4>

## System Part

In this part, all sections are working for system default setting.

### Logger Table

Logger table is used to record all the log from project running. All the records of this table are continue increased and not able to modify. There is a possible to clear logs by admin privilege. The table definition please follow the following structure.

```

    `user` CHAR(45) not null,
    `level` TINYINT(3) not null default '0',
    `time` CHAR(45) not null,
    `msg` TEXT

```

<i>NOTE: length of <u>msg</u> field should not less than 65535 chars, different database will use different name of type, please follow the actual database setting.</i>

### Trace Table

Trace table is used to record all the trace data for project running. All the records of this table are continue increased and not able to modify. There is a possible to clear records by admin privilege. The table definition please follow the following structure.

```

    `user` CHAR(45) not null,
    `id` CHAR(45) not null,
    `time` CHAR(45) not null,
    `msg` TEXT,
    `error` TEXT not null default '',
    `area` CHAR(5) not null default 'edge',

    primary key (`id`) using HASH,

```

<i>NOTE: length of <u>msg, error</u> field should not less than 65535 chars, different database will use different name of type, please follow the actual database setting. Recommend using `HASH` instead of `BTREE` to increase the performance.</i>

### Usage Table

Usage table is used to record all the user actions and data accesses from project running. All the records of this table are continue increased and not able to modify. There is a possible to clear logs by admin privilege. The table definition please follow the following structure.

```

    `user` CHAR(45) not null,
    `func` VARCHAR(255) not null,
    `action` CHAR(10) not null,
    `time` CHAR(45) not null,
    `msg` TEXT

```

<i>NOTE: length of <u>msg</u> field should not less than 65535 chars, different database will use different name of type, please follow the actual database setting.</i>

### Feature Table

Feature table is used to record all the feature activity status. It can be used for control a functionality whether can be used or disabled temporarily. The table definition please follow the following structure.

```

    `id` CHAR(255) not null,
    `enable` TINYINT(3) not null default '0',
    `desc` TEXT,
    `deps` TEXT,

    primary key (`id`) using BTREE,

```

<i>NOTE: length of <u>desc</u> and <u>deps</u> field should not less than 65535 chars, different database will use different name of type, please follow the actual database setting.</i>

### Monitor Table

Monitor table is used to record the feature running status. Through Monitor manager, to record a status change ever interval time. The table definition please follow the following structure.

```

    `feature` CHAR(255) not null,
    `time` BIGINT not null,
    `data` TEXT not null,

```

<i>NOTE: length of <u>data</u> field should not less than 65535 chars, different database will use different name of type. <u>time</u> field will be used for time range searching, there needs to be number type to quick search. please follow the actual database setting.</i>

## Authorization Part

In this part, all sections are working for authorizing and permittion.

### Session Table

Session table is used to record user requests. For each login user, will have a session info to indicate the connection. The table definition please follow the following structure.

```

    `id` CHAR(45) not null,
    `user` CHAR(255) not null,
    `time` CHAR(45) not null,

    primary key (`id`, `user`) using BTREE,

```

### Licenses Table

Licenses table is used to record all licenses basic information. The table definition please follow the following structure.

```

    `id` CHAR(45) not null,
    `name` CHAR(255) not null,
    `desc` TEXT,
    `admin` TINYINT(3) not null default '1',

    primary key (`name`) using BTREE,

```

<i>NOTE: length of <u>desc</u> field should not less than 65535 chars, different database will use different name of type, please follow the actual database setting.</i>

### Role Table

Role table is a detail description of licenses to describe privileges of each functionality. The table definition please follow the following structure.

```

    `lid` CHAR(45) not null,
    `name` CHAR(255) not null,
    `read` TINYINT(3) not null default '0',
    `write` TINYINT(3) not null default '0',
    `delete` TINYINT(3) not null default '0',
    `change` TINYINT(3) not null default '0',
    `execute` TINYINT(3) not null default '0',

    primary key (`lid`, `name`) using HASH,
    index key (`lid`) using HASH

```

<i>NOTE: the combination primary key of <u>id</u> and <u>name</u> is used for data searching.</i>

### Teams Table

Teams table is used to record teams basic information. The table definition please follow the following structure.

```

    `id` CHAR(45) not null,
    `name` CHAR(255) not null,
    `desc` TEXT,

    primary key (`name`) using BTREE,

```

<i>NOTE: length of <u>desc</u> field should not less than 65535 chars, different database will use different name of type, please follow the actual database setting.</i>

### User Table

User table records main user authorization data, contains user public info and authorize info. The table definition please follow the following structure.

```

    `id` CHAR(45) not null,
    `email` CHAR(255) not null,
    `skey` CHAR(384) not null,
    `name` CHAR(255) not null,
    `license` CHAR(45) not null default '',
    `team` TEXT,

    primary key (`id`) using BTREE,
    index key (`email`) using BTREE
    index key (`name`) using BTREE

```
