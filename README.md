# TIANYU - Common Service Platform

A Common Service Platform of Tianyu includes Data API, Network API, Schedule Job and Status Monitor.

[HOW TO USE](.doc/how-to-use.md)

## MOTIVATION

Most of backend services, need to handle `Database Access`, `Network Connection`, `Job Management`, etc. And need to have a common `Status Monitor` to get current service status.

Currently, _**Tianyu**_ has a generic module `Server-Base` to provide some database and network APIs which can make the program be simple. But there is also a problem that the module only provides APIs, does not have a full status and jobs management.

For the further service development of `Smart Home`, we need a solution to contain full basic components and provide better ability to extension, also should have a state statistics mechanism.

## REQUIREMENTS

- **Abstracted Data Operation Interface**

  Data operation includes **_Data Base Access_**, **_Local Storage Access_**, **_Cache & Store Management_**.

  - **_Data Base Access_**

    DB access interface, should provide some common operation API like `add`, `insert`, `delete`, `update` and etc. And also should have a sql execution API that accepts user to run a custom operation.

  - **_Local Storage Access_**

    Local Storage Access should provide some disk operation API, file & directory operation API. Allow user to access and operate local file, dir and disk.

  - **_Cache & Store Management_**

    Cache and Store are the runtime storage. The difference of the two components is that **Cache** is a simple `Key - Value` pair to provide data save and read. **Store** is a status tools, not only to save the data and read, but also can record the data change. Base on Store, the service can support data rollback and revert-rollback.

- **Abstracted Network Communication Interface**

  Network communication includes **_HTTP_**, **_Socket_** and low-level **_TCP_** and **_UDP_** operation APIs. For supporting multi-medias, it also should provide **_FTP_**, **_RTMP_**, **_RTSP_**.

- **Common Object Management Interface**

  Object management is a core functionality contains `Authorization`, `Resources Control`, `Operations Audit` and `Schedule`.

  - **_Authorization_**

    Authorization is the security core for the whole platform. It contains <u>User Management</u> to verify the user access and <u>Privileges Management</u> to control the user activities.

    User Authorization includes `User`, `Licenses` and `Teams` three parts.

    1. Licenses: this is a privilege controller contains all functions permission description. There will be a `role` table as additional description to record each privilege status.

    2. Teams: this is an additional records to create a group for users.

    3. User: this is a user main part for <u>logon authorization</u>, <u>operation permission control</u> and <u>relationship management</u>.

  - **_Resources Control_**

    Resources Control is the virtual data center to allow user to save data into program internal space. (The data of internal space will be persist in local storage or data base.) According to the data type and configuration, the data will be persist in different target entity and managed in a common place

  - **_Operations Audit_**

    Operations Audit is used to record all of the user activities, contains <u>Data Change</u>, <u>Configuration Change</u> and any other operations even they do not have impaction to data.

  - **_Schedule_**

    Schedule is a calendar manager to support execute timer task.

- **Common Job Execution Platform**

  Job Execution Platform is a multi-threads worker to execute some scripts and 3rd-application (like native command, internal JS scripts).

  - **_Multi-Threads Worker_**

    Worker is an execution engine to execute _local JS scripts_, _native command applications_ and _remote host functions_.

  - **_Worker Management_**

    Worker Management is a manager to control workers lifecycle, record worker status and to save the execution result temporarily.

  - **_Job Management_**

    Job Management is a manager to provide job list to receive jobs, and job dispatch functionality to send job to worker management. After the Job execution done, Job Management should call the callback function to notify job creator or just save the result in store and waiting for reading.

- **Common Status Monitor Platform**

  Status Monitor Platform is used for collecting all the data before mentioned, and to generate a report to user.

## MODULES

### Infrastructure

Infrastructure contains basic API and some default resources (international strings, exported json data, etc..).

All of components under this folder, based on the database accessment. In this part, will define an inner database API implementation.

- **_Database & Code_**

  There are some infra database API definitions. To provide infra part needed database operation interfaces and database interaction implementations.

  Database API is exported in `TIANYU.db`.

- **_Managers_**

  Managers of infra are the main API for `Tianyu-CSP`. There are some default and basic operation interface and will be post only by `TIANYU.${function name}`. Contains `import`, `logger`, `request`, `session`, `trace`, `usage`, `fwk` and `environment`.

  1. **import**: this is a packaged API for import module and files from specified path. It also provides `html` method which receive a path string to import a html file as string, and `MODULE` object to export all internal Objects which are out of infra. <u> _(NOTE: All internal objects will not be able to use by importing and require. All objects can only used by `TIANYU.${function name}` and `TIANYU.import.MODULE`.)_</u>

  2. **logger**: this is a logger tool to record runtime logs and to do persistence.

  3. **request**: this is a request context and work for request and sub-job. For each thread, it will have its independent request instance with the network info.

  4. **session**: this is same like **request**, to provide user info, privilege checking. For each request or sub-job, it will have a session instance belongs to itself.

  5. **trace**: to provide a recorder API to record error trace data. there is only a write API.

  6. **usage**: to provide a recorder API to record function usage data. there is only a write API.

  7. **fwk**: this is a framework instance for each request or sub-job. the purpose of it to decouple the dependencies. in `Tianyu-CSP`, there are some predefined API for internally using. <u>**PLEASE DO NOT USE THE PRE-DEFINED API IN YOUR CODE.**</u>

  8. **environment**: this is a constant object to provide some application data, includes `version`, `developmentMode`, `application name` and etc...

- **_Handler & Service_**

  **Handler**

  provides data pre-processing, data dispatching and exception handling. By using `TIANYU.fwk`, they are totally decoupled. Data transferring uses internal pip.

  **Service**

  provides all external network interaction implementations, include `http-service`, `socket-service` and etc...

### Job

Job contains the implementation of Node.JS multi-thread. By JobManager, the jobs will be managed to control the jobs' lifecycle. Job manager has a max-workers option, to control the maximum threads count, if the threads count is over maximum, the new jobs will be stored and to be executed when has thread released.

### Modules

This is some exported tools class. All the objects in modules should only be used by `TIANYU.import.MODULE`.

### Utils

This is some public tools to process data, convert data type and other data generation.
