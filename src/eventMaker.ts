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

export function makeKind0(name: string, bio: string, picture:string, privKey: string) {
    let content = {
        "name": name,
        "about": bio,
        "picture": picture
    }

    const event = finalizeEvent({
        "content": JSON.stringify(content),
        "created_at": Math.floor(Date.now() / 1000),
        "kind": 0,
        "tags": [],
    }, hexToBytes(privKey))

    const isGood = verifyEvent(event);

    if (isGood) {
        return event;
    } else {
        throw new Error("bad event");
    }
}