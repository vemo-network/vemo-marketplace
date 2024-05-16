import { assert, expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { OrderValidator } from "typechain";
import { ORDER_EXPECTED_TO_BE_VALID } from "./configErrorCodes";
import { MakerOrderWithSignature } from "./order-types";

const CRITERIA_GROUPS = 10; // sync with what is set in orderValidator contract

/**
 * position 7 and 9 in validation code array are detail information, not needed to validate
 */
const IGNORED_VALIDATION_CODE_INDEXES = [7, 9];

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

    /**
     * Create expected valid result
     */
    let validResult = new Array(CRITERIA_GROUPS).fill(BigNumber.from(ORDER_EXPECTED_TO_BE_VALID));

    for (let index = 0; index < IGNORED_VALIDATION_CODE_INDEXES.length; index++) {
        validResult[IGNORED_VALIDATION_CODE_INDEXES[index]] = res[IGNORED_VALIDATION_CODE_INDEXES[index]];
    }
    
    // check real vs expect
    expect(res).to.deep.equal(validResult);
}

/**
 * position 8 and 10 in validation code array are detail information, not needed to validate
 */
export async function assertMultipleOrdersValid(
    makerOrders: MakerOrderWithSignature[],
    orderValidator: OrderValidator
): Promise<void> {
    const res = [
        ...(await orderValidator.checkMultipleOrderValidities(makerOrders)),
    ];
    // res.pop();

    for (let i = 0; i < res.length; i++) {
        /**
         * Create expected valid result
         */
        let validResult = new Array(CRITERIA_GROUPS).fill(BigNumber.from(ORDER_EXPECTED_TO_BE_VALID));

        for (let index = 0; index < IGNORED_VALIDATION_CODE_INDEXES.length; index++) {
            validResult[IGNORED_VALIDATION_CODE_INDEXES[index]] = res[i][IGNORED_VALIDATION_CODE_INDEXES[index]];
        }
        expect(i).to.deep.equal(validResult);
    }
}
