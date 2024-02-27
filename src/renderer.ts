export const render = async (root: HTMLElement, view: string) => {
    const loginPage: string = await fetch(`/views/${view}.html`).then(res => res.text());

    const page = document.createElement("section");
    page.classList.add(view);

    page.innerHTML = loginPage;

    root.innerHTML = "";
    root.appendChild(page);

    return page;
}