import { render } from "preact";

export default function closePopup() {
    const dialog = document.querySelector(".popupDialog");
    const dialogRender = document.querySelector(".trial");
    const mainDialog = document.querySelector(".main_-dialogContianer");
    dialogRender.setAttribute("style", "padding: 0 !important");
    mainDialog.removeAttribute("style");
    dialog.style.opacity = "0";
    dialog.style.pointerEvents = "none";
    dialog.style.transition = ".2s ease";
    dialog.style.visibility = "inherit";
    
    return render("", dialogRender);
} 