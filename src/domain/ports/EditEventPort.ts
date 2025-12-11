import { IOPort } from "./IO";

export interface EditEventPort {
    shouldHandle(): boolean;
    getIOAdapter(): IOPort;
}