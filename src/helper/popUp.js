import { render } from "preact";

export default function popup(Component, width, height, cssProperties) {

    const dialog = document.querySelector(".popupDialog");
    const dialogRender = document.querySelector(".trial");

    const mainDialog = document.querySelector(".main_-dialogContianer");
    dialogRender.setAttribute("style", "padding: 33px !important");
  
    if (width) {
        mainDialog.setAttribute("style", `min-width: ${width}px`);
    }
    if (height) {
        mainDialog.setAttribute("style", ` min-height: ${height}px`);
    }
    for (const property in cssProperties) {
        mainDialog.style[property] = cssProperties[property];
    }
    dialog.style.opacity = "1";
    dialog.style.pointerEvents = "visible";
    dialog.style.transition = ".2s ease";
    return render(Component, dialogRender);

}