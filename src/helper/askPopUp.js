import { h, render } from "preact";
import AskPopUpComp from "../components/ask-popUp";

export default function askMessage(message) {
    const dialog = document.querySelector(".upsetDialioge");
    dialog.style.opacity = "1";
    dialog.style.pointerEvents = "visible";
    dialog.style.transition = ".1s ease";
    const dialogRender = document.querySelector(".upsetContainer");
    let response;
    render(<AskPopUpComp response={res => response = res} message={message} />, dialogRender);
    return response;
}