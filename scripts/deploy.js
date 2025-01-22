/** @format */

const { Log } = require("@aitianyu.cn/types");
const { installDB } = require("../dist/lib/install");

installDB()
    .then((value) => {
        if (!value) {
            throw new Error();
        }

        Log.log("deploy success!");
    })
    .catch(() => {
        Log.error("deploy failed!");
    });
