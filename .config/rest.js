/** @format */

module.exports = {
    "/test/valid": {
        handler: {
            package: "a",
            module: "b",
            method: "c",
        },
    },
    "/test/invalid": {
        handler: {
            package: "",
            module: "",
            method: "",
        },
    },
    "/test/no_prefix": {
        handler: {
            package: "a",
            module: "b",
            method: "c",
        },
    },
    "/test": { handler: { package: "a", module: "b", method: "c" } },

    "/feature": {
        handler: {
            package: "run.infra",
            module: "Feature",
            method: "execute",
        },
    },
    "/": {
        handler: {
            package: "$",
            module: "default-loader",
            method: "html",
        },
    },
    "/welcome": {
        handler: {
            package: "$",
            module: "default-loader",
            method: "html",
        },
    },
    "/welcome/{data}": {
        handler: {
            package: "data.welcome",
            module: "{data}",
            method: "",
        },
    },

    "/empty": {
        handler: {
            package: "a",
            module: "b",
            method: "",
        },
    },

    "/method-get": {
        handlers: {
            GET: {
                package: "a",
                module: "b",
                method: "",
            },
        },
    },

    "/method-path": {
        handlers: {
            POST: {
                package: "a",
                module: "b",
                method: "",
            },
        },
    },

    "/method-all": {
        handlers: {
            GET: {
                package: "ag",
                module: "bg",
                method: "",
            },
            POST: {
                package: "ap",
                module: "bp",
                method: "",
            },
        },
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
