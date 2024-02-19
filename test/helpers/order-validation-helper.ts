import { assert, expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { OrderValidator } from "typechain";
import { ORDER_EXPECTED_TO_BE_VALID } from "./configErrorCodes";
import { MakerOrderWithSignature } from "./order-types";

export async function assertErrorCode(
    makerOrder: MakerOrderWithSignature,
    ERROR_CODE: number,
    orderValidator: OrderValidator
): Promise<void> {
    const res = [...(await orderValidator.checkOrderValidity(makerOrder))];
    res.pop();

    let arraySlot: number;
    if (ERROR_CODE % 100 !== 0) {
        arraySlot = Math.floor(ERROR_CODE / 100) - 1;
    } else {
        arraySlot = ERROR_CODE / 100;
    }

    assert.equal(res[arraySlot], ERROR_CODE as unknown as BigNumber);
}

export async function assertOrderValid(
    makerOrder: MakerOrderWithSignature,
    orderValidator: OrderValidator
): Promise<void> {
    const res = [...(await orderValidator.checkOrderValidity(makerOrder))];
    res.pop();
    expect(res).to.deep.equal(
        new Array(7).fill(BigNumber.from(ORDER_EXPECTED_TO_BE_VALID))
    );
}

export async function assertMultipleOrdersValid(
    makerOrders: MakerOrderWithSignature[],
    orderValidator: OrderValidator
): Promise<void> {
    const res = [
        ...(await orderValidator.checkMultipleOrderValidities(makerOrders)),
    ];
    res.pop();

    for (let i = 0; i < res.length; i++) {
        expect(i).to.deep.equal(
            new Array(7).fill(BigNumber.from(ORDER_EXPECTED_TO_BE_VALID))
        );
    }
}
