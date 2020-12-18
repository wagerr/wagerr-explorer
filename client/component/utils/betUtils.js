import struct from "@aksel/structjs";

const BTX_HEX_PREFIX = "42"
const PB_OP_STRLEN = 16
const PPB_OP_STRMINLEN = 18
const plBetTxType = "\x03"
const plParlayBetTxType = "\x0c"
const BTX_FORMAT_VERSION = "\x01"

function toHexString(bytes) {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

export function singleToOpcode(event) {
    const s = struct("<i");
    const outcome = toHexString([event.outcome])
    const event_id = toHexString(new Uint8Array(s.pack(event.event_id)))
    const opcode = BTX_HEX_PREFIX + "0103" + event_id + outcome

    if (opcode.length !== PB_OP_STRLEN) {
        throw new Error("Invalid bet");
    }

    return opcode;
}

export function parlayToOpcode(event) {

}


