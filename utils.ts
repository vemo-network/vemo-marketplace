import { utils } from "ethers";
import moment from "moment";
import * as fs from "fs";

export const unlimitedAllowance =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const readConfig = async (ethers: any, configFile: string) => {
    await ethers.provider.ready;
    const chainId = ethers.provider.network.chainId;

    const rawConfig = fs.readFileSync(
        `${__dirname}/config/${configFile}/config.${chainId}.json`,
        { encoding: "utf-8" }
    );
    return JSON.parse(rawConfig);
};

export const writeConfig = async (
    ethers: any,
    configFile: string,
    config: any
) => {
    await ethers.provider.ready;
    const chainId = ethers.provider.network.chainId;

    fs.writeFileSync(
        `${__dirname}/config/${configFile}/config.${chainId}.json`,
        JSON.stringify(config, null, 2),
        { encoding: "utf-8" }
    );
};

export const parseEther = (amount: string) => {
    return utils.parseEther(amount);
};

export const convertDateTimeToUnix = (dateTime: string) => {
    return moment.utc(dateTime, "MM/DD/YYYY HH:mm:ss").unix();
};

export const chunk = (arr: any, chunkSize: any) => {
    if (chunkSize <= 0) throw "Invalid chunk size";
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += chunkSize)
        R.push(arr.slice(i, i + chunkSize));
    return R;
};
