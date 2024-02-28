import {render} from "./renderer.ts";
import {generateSecretKey, getPublicKey} from "nostr-tools/pure";
import {bytesToHex, hexToBytes} from "@noble/hashes/utils";
import {initModal} from "./modalService.ts";
import {socketService, send} from "./socketService.ts";
import {NostrEvent} from "nostr-tools/core";
import {makeKind1} from "./eventMaker.ts";

export function appController(root: HTMLDivElement) {

    const PUB_CHAT_TAG = "$$$GFA"
    const RELAYS = ["wss://relay.nostr.band", "wss://hipstr.cz", "wss://nos.lol"];

    let account: any;
    let pubKey = "";
    let privKey = "";
    const eventIds = new Set();
    const events = [];


    const login = async () => {
        const page = await render(root, "login");

        const modal = page.querySelector<HTMLDialogElement>("dialog")!;
        const createAccountButton = page.querySelector("#createAccount")!;
        const loginButton = page.querySelector("#loginButton")!;

        loginButton.addEventListener("click", () => {
            privKey = page.querySelector<HTMLInputElement>("#privatekey")!.value;
            pubKey = (getPublicKey(hexToBytes(privKey)));
            publicChat();
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
    const publicChat = async () => {
        const page = await render(root, "chat");

        const main = page.querySelector("main");
        const messageTemp = page.querySelector("template");

        const submitButton = page.querySelector(".submitButton")
        const messageContent = page.querySelector("#messageInput")!;
        const messageForm = page.querySelector("form");

        messageForm!.onsubmit = (event) => {
            event.preventDefault();
            sendEvent(messageContent.value)
        };

        submitButton!.addEventListener("click", () => sendEvent(messageContent.value));


        function handleEvent(event: NostrEvent) {
            if (!eventIds.has(event.id)) {
                events.push(event)

                const newMessage = messageTemp!.content.cloneNode(true) as Element;

                newMessage.querySelector("h2")!.innerText = event.pubkey;
                newMessage.querySelector("h3")!.innerText = new Date(event.created_at * 1000).toDateString();
                newMessage.querySelector("p")!.innerText = event.content;

                main.appendChild(newMessage)
            }
        }

        function sendEvent(content:string) {
            send(RELAYS, makeKind1(content, privKey, ["t", PUB_CHAT_TAG]))
        }

        socketService(RELAYS, handleEvent, {"#t": [PUB_CHAT_TAG]});
    }
    // const privateChat = () => pool.publish(relays, newEvent{
    // }


    return {
        login,
        profile
    }
}