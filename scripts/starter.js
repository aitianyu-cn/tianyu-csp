/** @format */

const { TianyuCSP } = require("../dist/lib/index");

try {
    TianyuCSP.Infra.load();

    const contributor = TianyuCSP.Infra.creator.contributor();

    const dispatcher = new TianyuCSP.Infra.DispatchHandler(undefined, contributor);
    const requester = new TianyuCSP.Infra.RequestHandler(contributor);

    dispatcher.initialize();
    requester.initialize();

    const http1 = new TianyuCSP.Infra.HttpService(
        {
            host: "0.0.0.0",
            port: "4000",
            enablefallback: true,
            advanceRest: true,
        },
        contributor,
    );

    http1.listen(() => {
        console.log("---- start");
    });
} catch (e) {
    console.log(e);
}
