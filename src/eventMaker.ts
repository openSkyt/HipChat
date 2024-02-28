import {finalizeEvent, verifyEvent} from "nostr-tools/pure";
import {hexToBytes} from "@noble/hashes/utils";


export function makeKind1(content: string, privKey: string, tags: string[]) {
    const event = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [tags],
        content: content,
    }, hexToBytes(privKey))

    const isGood = verifyEvent(event);

    if (isGood) {
        return event;
    } else {
        throw new Error("bad event");
    }
}

export function makeKind0(name: string, bio: string, privKey: string) {
    const event = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [tags],
        content: content,
    }, hexToBytes(privKey))

    const isGood = verifyEvent(event);

    if (isGood) {
        return event;
    }
}