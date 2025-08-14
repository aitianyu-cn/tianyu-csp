/** @format */

import { program } from "commander";

export interface IStarterConfigure {
    homedir: string;
}

const programmer = program
    .option("-h, --home <type>", "Homedir of CSP project root path")
    .allowUnknownOption()
    .allowExcessArguments();

export function commander(argv?: string[]): IStarterConfigure {
    const parse = programmer.parse(argv || process.argv);
    return {
        homedir: parse.getOptionValue("home") || "",
    };
}
