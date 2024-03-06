import {initModal} from "../modalService.ts";
import {NostrEvent} from "nostr-tools/core";

export function chatModel(page: HTMLElement, sendEvent: Function) {
    const eventsEl = page.querySelector(".events");
    const messageTemp = page.querySelector("template");
    const messageContent = page.querySelector<HTMLInputElement>("#messageInput")!;
    const messageForm = page.querySelector<HTMLFormElement>(".messageForm");
    const userSettingsForm = page.querySelector<HTMLFormElement>(".userSettingsForm")
    const usernameInput = page.querySelector<HTMLInputElement>("#userName")!;
    const aboutInput = page.querySelector<HTMLInputElement>("#aboutSection")!;
    const pfpURLInput = page.querySelector<HTMLInputElement>("#profilePicURL")!;
    const settingsButton = page.querySelector<HTMLButtonElement>(".profileSettings")!;
    const modal = page.querySelector("dialog")!;


    initModal(modal);

    settingsButton.addEventListener("click", () => {
        modal.showModal()
    })

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

    function renderEvent(event: NostrEvent) {

    }



    return {
        eventsEl,
        messageTemp,
        messageContent,
        messageForm,
        userSettingsForm,
        usernameInput,
        aboutInput,
        pfpURLInput,
        settingsButton,
        modal,
        renderEvent
    };
}