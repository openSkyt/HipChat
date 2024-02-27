export function appController(root: HTMLDivElement) {

    const login = async () => {
        const loginPage: string = await fetch("/views/login.html").then(res => res.text());

        root.innerHTML = loginPage;
    }
    const profile = () => {
        root.innerHTML = "profile page"
    }
    const conversations = () => {
    }
    const publicChat = () => {
    }
    const privateChat = () => {
    }

    return {
        login,
        profile,
        conversations,
        publicChat,
        privateChat
    }
}