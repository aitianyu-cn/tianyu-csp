/** @format */

module.exports = {
    "/test/valid": {
        package: "a",
        module: "b",
        method: "c",
    },
    "/test/invalid": {
        package: "",
        module: "",
        method: "",
    },
    "/test/no_prefix": {
        package: "a",
        module: "b",
        method: "c",
    },
    "/test": { package: "a", module: "b", method: "c" },

    "/feature": {
        package: "run.infra",
        module: "Feature",
        method: "execute",
    },
    "/": {
        package: "$",
        module: "default-loader",
        method: "html",
    },
    "/welcome": {
        package: "$",
        module: "default-loader",
        method: "html",
    },
    "/welcome/{data}": {
        package: "data.welcome",
        module: "{data}",
        method: "",
    },

    "/empty": {
        package: "a",
        module: "b",
        method: "",
    },

    "/remote-proxy/test/*": {
        proxy: {
            host: "resource.aitianyu.cn",
            protocol: "https",
            rewrite: {
                "/remote-proxy/test": "/",
                "/remote-proxy/test/": "/",
            },
        },
    },

    "/remote-proxy/test2/*": {
        proxy: {
            host: "localhost:8082",
            protocol: "http",
            rewrite: {
                "/remote-proxy/test2": "/",
                "/remote-proxy/test2/": "/",
            },
        },
    },
};
