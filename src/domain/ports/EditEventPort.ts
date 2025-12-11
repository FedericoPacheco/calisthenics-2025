import { IOPort } from "./IOPort";

export interface EditEventPort {
    shouldHandle(): boolean;
    getIOAdapter(): IOPort;
}