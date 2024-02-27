import { render } from "./renderer.ts";

export function appController(root: HTMLDivElement) {

    const login = async () => {
        const page = await render(root, "login");

        page.querySelector("button")!.onclick = profile;
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