# CSP Database Table Define Template

This doc will describe some default database table structure which should not be changed. All the definitions are based on `MySQL` database, for other database, please take the corresponding documents as reference.

### Logger Table

Logger table is used to record all the log from project running. All the records of this table are continue increased and not able to modify. There is a possible to clear logs by admin privilege. The table definition please follow the following structure.

```

    `level` TINYINT(3) not null default '0',
    `time` CHAR(45) not null,
    `msg` TEXT

```

<i>NOTE: length of <u>msg</u> field should not less than 65535 chars, different database will use different name of type, please follow the actual database setting.</i>

### Trace Table

Trace table is used to record all the trace data for project running. All the records of this table are continue increased and not able to modify. There is a possible to clear records by admin privilege. The table definition please follow the following structure.

```

    `id` CHAR(45) not null,
    `level` TINYINT(3) not null default '0',
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

    `project` VARCHAR(255) not null,
    `module` VARCHAR(255) not null,
    `action` CHAR(10) not null,
    `time` CHAR(45) not null,
    `msg` TEXT

```

<i>NOTE: length of <u>msg</u> field should not less than 65535 chars, different database will use different name of type, please follow the actual database setting.</i>
