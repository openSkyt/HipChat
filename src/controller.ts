import {render} from "./renderer.ts";
import {generateSecretKey, getPublicKey} from "nostr-tools/pure";
import {bytesToHex, hexToBytes} from "@noble/hashes/utils";
import {initModal} from "./modalService.ts";
import {socketService, send, subscribe} from "./socketService.ts";
import {NostrEvent} from "nostr-tools/core";
import {makeKind1} from "./eventMaker.ts";

export function appController(root: HTMLDivElement) {

    const PUB_CHAT_TAG = "$$$GFA"
    const RELAYS = ["wss://relay.nostr.band", "wss://hipstr.cz", "wss://nos.lol"];
    const userData = new Map();
    const ongoingUserRequests = new Map();

    let account: any;
    let pubKey = "";
    let privKey = "";
    const eventIds = new Set();
    const events = [];
    let eoseReached = false;


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
                page.querySelector(".close")!.addEventListener("click", () => {
                    publicChat();
                })
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

        const eventsEl = page.querySelector(".events");
        const messageTemp = page.querySelector("template");
        const messageContent = page.querySelector("#messageInput")!;
        const messageForm = page.querySelector("form");

        messageForm!.onsubmit = (event) => {
            event.preventDefault();
            sendEvent(messageContent.value);
            messageContent.value = "";
        };

        function handleEose() {
            eoseReached = true;
            fetchMetadata();
        }

        function handleEvent(event: NostrEvent) {

            if (event.kind === 0) {
                // {kind: 0, pubkey: pubkey, content: content}]
                const metadata = JSON.parse(event.content);
                userData.set(event.pubkey, metadata);

                if (ongoingUserRequests.has(event.pubkey)) {
                    ongoingUserRequests.get(event.pubkey).forEach(el => {
                        el.innerText = metadata.name;
                    });
                    ongoingUserRequests.delete(event.pubkey);
                }
            }

            if (!eventIds.has(event.id) && event.kind === 1) {
                events.push(event)

                const newMessage = messageTemp!.content.cloneNode(true) as Element;

                let messagePubkeyElement = newMessage.querySelector("h2")!;
                newMessage.querySelector("h3")!.innerText = new Date(event.created_at * 1000).toDateString();
                newMessage.querySelector("p")!.innerText = event.content;

                if (userData.has(event.pubkey)){
                    messagePubkeyElement.innerText = userData.get(event.pubkey).name
                } else {
                    messagePubkeyElement.innerText = event.pubkey;
                    getUserInfo(event.pubkey, messagePubkeyElement)
                }

                if (eoseReached) {
                    eventsEl.prepend(newMessage)
                } else {
                    eventsEl.appendChild(newMessage)
                }
            }
        }

        function sendEvent(content:string) {
            send(RELAYS, makeKind1(content, privKey, ["t", PUB_CHAT_TAG]))
        }

        function getUserInfo(pubKey:string, el:HTMLElement){
            if (ongoingUserRequests.has(pubKey)) {
                ongoingUserRequests.get(pubKey).push(el);
            } else {
                ongoingUserRequests.set(pubKey, [el]);
            }
        }

        function fetchMetadata() {
            subscribe(RELAYS, {"authors": [...ongoingUserRequests.keys()], "kinds": [0]}, handleEvent, handleEose)
            //console.log(filter);
        }

        socketService(RELAYS, {"#t": [PUB_CHAT_TAG]}, handleEvent, handleEose);
    }
    // const privateChat = () => pool.publish(relays, newEvent{
    // }


    return {
        login,
        profile
    }
}