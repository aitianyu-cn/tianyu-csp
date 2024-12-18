/** @format */

import { MapOfString } from "@aitianyu.cn/types";
import { RedisCommander } from "ioredis";

export type RedisCommanderForString = Pick<
    RedisCommander,
    | "set"
    | "get"
    | "mget"
    | "mset"
    | "incr"
    | "incrby"
    | "decr"
    | "decrby"
    | "incrbyfloat"
    | "append"
    | "strlen"
    | "setrange"
    | "getrange"
>;
// type RedisCommanderForHash = Pick<
//     RedisCommander,
//     | "hset"
//     | "hget"
//     | "hdel"
//     | "hlen"
//     | "hgetall"
//     | "hmget"
//     | "hmset"
//     | "hexists"
//     | "hkeys"
//     | "hvals"
//     | "hsetnx"
//     | "hincrby"
//     | "hincrbyfloat"
//     | "hstrlen"
// >;
export type RedisCommanderForList = Pick<
    RedisCommander,
    "rpush" | "lpush" | "linsert" | "lrange" | "lindex" | "llen" | "lpop" | "rpop" | "lrem" | "ltrim" | "lset" | "blpop" | "brpop"
>;
// type RedisCommanderForSet = Pick<
//     RedisCommander,
//     "sadd" | "srem" | "scard" | "sismember" | "spop" | "smembers" | "sinter" | "sunion" | "sdiff"
// >;

export type RedisSupportedCommander = RedisCommanderForString & RedisCommanderForList;
// RedisCommanderForHash & RedisCommanderForSet;

export interface RedisDatabaseQuery extends MapOfString {
    db: string;
    cmd: keyof RedisSupportedCommander | "unknown";
    table: string;
    value: string;
}

export type RedisValueType = "string" | "list";

export type RedisValueDataBaseStruct = {};

export type RedisValueDataStruct = RedisValueDataBaseStruct & { data: MapOfString };
