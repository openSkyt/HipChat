import { render } from "./renderer.ts";
import {generateSecretKey, getPublicKey} from "nostr-tools/pure";
import {bytesToHex} from "@noble/hashes/utils";

export function appController(root: HTMLDivElement) {

    const login = async () => {
        const page = await render(root, "login");

        page.querySelector("button")!.onclick = profile;
        const privKey = generateSecretKey();
        const pubKey = getPublicKey(privKey)
        console.log(bytesToHex(privKey));
        page.querySelector("input")!.value = pubKey;
    }
    const profile = async () => {
        const page = await render(root, "profile");

        page.querySelector("button")!.onclick = login;
    }
    // const conversations = () => {
    // }
    // const publicChat = () => {
    // }
    // const privateChat = () => {
    // }

    return {
        login,
        profile
    }
}