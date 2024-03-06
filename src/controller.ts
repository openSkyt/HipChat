import {render} from "./renderer.ts";
import {generateSecretKey, getPublicKey} from "nostr-tools/pure";
import {bytesToHex, hexToBytes} from "@noble/hashes/utils";
import {initModal} from "./modalService.ts";
import {socketService, send, subscribe} from "./socketService.ts";
import {NostrEvent} from "nostr-tools/core";
import {makeKind1, makeKind0} from "./eventMaker.ts";

export function appController(root: HTMLDivElement) {

    const PUB_CHAT_TAG = "$GFA"
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
            publicChat(false);
        })

        createAccountButton.addEventListener("click", () => {

            if (account === undefined) {
                account = generateSecretKey();
                pubKey = getPublicKey(account);
                privKey = bytesToHex(account);
                page.querySelector("#privKeyModal")!.textContent = privKey;
                page.querySelector("#pubKeyModal")!.textContent = pubKey;
                page.querySelector(".close")!.addEventListener("click", () => {
                    publicChat(true);
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
    const publicChat = async (showProfileModal:boolean) => {
        const page = await render(root, "chat");

        const eventsEl = page.querySelector(".events");
        const messageTemp = page.querySelector("template");
        const messageContent = page.querySelector<HTMLInputElement>("#messageInput")!;
        const messageForm = page.querySelector<HTMLFormElement>(".messageForm");
        const userSettingsForm = page.querySelector<HTMLFormElement>(".userSettingsForm")
        const modal = page.querySelector("dialog")!;
        const usernameInput = page.querySelector<HTMLInputElement>("#userName")!;
        const aboutInput = page.querySelector<HTMLInputElement>("#aboutSection")!;
        const pfpURLInput = page.querySelector<HTMLInputElement>("#profilePicURL")!;
        const settingsButton = page.querySelector<HTMLButtonElement>(".profileSettings")!;

        if (showProfileModal) {
            modal.showModal();
        } else {
            fetchUserData();
        }

        settingsButton?.addEventListener("click", () => {modal.showModal()})

        userSettingsForm!.onsubmit = (event) => {
            event.preventDefault();
            sendEvent(0);
            modal.close();
        }

        messageForm!.onsubmit = (event) => {
            event.preventDefault();
            sendEvent(1);
            messageContent.value = "";
        };

        function handleEose() {
            eoseReached = true;
            fetchMetadata();
        }

        function handleEvent(event: NostrEvent) {

            if (event.kind === 0 && event.pubkey === pubKey) {
                const metadata = JSON.parse(event.content);

                usernameInput.value = metadata.name;
                aboutInput.value = metadata.about;
                pfpURLInput.value = metadata.picture;
            }

            if (event.kind === 0) {
                // {kind: 0, pubkey: pubkey, content: content}]
                const metadata = JSON.parse(event.content);
                userData.set(event.pubkey, metadata);

                if (ongoingUserRequests.has(event.pubkey)) {
                    ongoingUserRequests.get(event.pubkey).forEach((el: HTMLElement) => {
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
                    eventsEl!.prepend(newMessage)
                } else {
                    eventsEl!.appendChild(newMessage)
                }
            }
        }

        function sendEvent(kind:number) {
            if (kind === 1) {
                send(RELAYS, makeKind1(messageContent.value, privKey, ["t", PUB_CHAT_TAG]))
            }
            if (kind === 0) {
                send(RELAYS, makeKind0(usernameInput.value, aboutInput.value, pfpURLInput.value, privKey))
            }
        }

        function getUserInfo(pubKey:string, el:HTMLElement){
            if (ongoingUserRequests.has(pubKey)) {
                ongoingUserRequests.get(pubKey).push(el);
            } else {
                ongoingUserRequests.set(pubKey, [el]);

                if (eoseReached) {
                    fetchMetadata();
                }
            }
        }

        function fetchMetadata() {
            if (ongoingUserRequests.size > 0) {
                subscribe(RELAYS, {"authors": [...ongoingUserRequests.keys()], "kinds": [0]}, handleEvent, () => {})
            }
        }

        function fetchUserData(){
            subscribe(RELAYS, {"authors": [pubKey], "kinds": [0]}, handleEvent, () => {})
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