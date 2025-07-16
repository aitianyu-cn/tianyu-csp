/** @format */

import { AbstractSocketService } from "#core/service/AbstractSocketService";
import { CallbackAction } from "@aitianyu.cn/types";

class SocketServiceImpl extends AbstractSocketService {
    public close(callback?: (err?: Error) => void): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public listen(callback?: CallbackAction): void {
        throw new Error("Method not implemented.");
    }
}

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.service.AbstractSocketService", () => {
    it("default address", () => {
        const service = new SocketServiceImpl(
            {
                close: () => undefined,
            },
            "tcp",
        );

        expect(service["_address"].address).toEqual("0.0.0.0");
        expect(service["_address"].port).not.toEqual(0);
        expect(service["_address"].port).toBeGreaterThan(1023);
        expect(service["_address"].port).toBeLessThan(65536);
    });
});
