import {render} from "./renderer.ts";
import {generateSecretKey, getPublicKey} from "nostr-tools/pure";
import {bytesToHex, hexToBytes} from "@noble/hashes/utils";
import {initModal} from "./modalService.ts";


export function appController(root: HTMLDivElement) {

    let account: any;
    let pubKey = "";
    let privKey = "";


    const login = async () => {
        const page = await render(root, "login");

        const modal = page.querySelector<HTMLDialogElement>("dialog")!;
        const createAccountButton = page.querySelector("#createAccount")!;
        const loginButton = page.querySelector("#loginButton")!;

        loginButton.addEventListener("click", () => {
            privKey = page.querySelector<HTMLInputElement>("#privatekey")!.value;
            pubKey = (getPublicKey(hexToBytes(privKey)));
        })

        createAccountButton.addEventListener("click", () => {

            if (account === undefined) {
                account = generateSecretKey();
                pubKey = getPublicKey(account);
                privKey = bytesToHex(account);
                page.querySelector("#privKeyModal")!.textContent = "Your private key is: " + privKey;
                page.querySelector("#pubKeyModal")!.textContent = "Your public key is: " + pubKey;
            }

            modal.showModal();
        });

        initModal(modal);
    };

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