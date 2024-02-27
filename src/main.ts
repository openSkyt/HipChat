import './style.css'
import { appController } from './controller.ts'

const appDiv: HTMLDivElement | null = document.querySelector("#app");

if (appDiv === null) {
    throw new Error("missing root element to render to")
}

const app = appController(appDiv);

app.login();
