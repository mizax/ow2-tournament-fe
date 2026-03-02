/* @ts-self-types="./owbalancer.d.ts" */

import * as wasm from "./owbalancer_bg.wasm";
import { __wbg_set_wasm } from "./owbalancer_bg.js";
__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    balance, balance_final, balance_half, main_js
} from "./owbalancer_bg.js";
