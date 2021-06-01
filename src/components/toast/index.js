import style from "./_toast.scss";
const toastOptionDefaults = { timeout: 5000, tag: (Date.now().toString()), errorMessage: false, successMessage: false }
export default class Toast {
    /**
     * @param {string} msg 
     * @param {{
     *  timeout?: number;
     *  tag?: string;
    *   errorMessage?: boolean;
    *   successMessage?: boolean;
     * }} options 
     */
    static create(msg, options) {

        const { timeout = 3000, tag = (Date.now().toString()), errorMessage = false, successMessage = false } = { ...toastOptionDefaults, ...options };

        let toastContainer = document.querySelector(`${style.toastContainer}`);
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.classList.add(style.toastContainer);
            document.body.appendChild(toastContainer);
        }
        const toastList = toastContainer.querySelectorAll(`.${style.toast}[data-tag="${tag}"]`);

        Array.from(toastList)
            .forEach((t) => {
                t.parentNode?.removeChild(t);
            });

        // Make a toast...
        const toast = document.createElement('div');
        const toastContent = document.createElement('div');
        toast.classList.add(style.toast);
        toastContent.classList.add(style.toast__content);

        if (errorMessage) {
            toastContent.classList.add(style.errorMessage);
        }
        if (successMessage) {
            toastContent.classList.add(style.successMessage);
        }
        toastContent.textContent = msg;
        toast.appendChild(toastContent);
        toast.dataset.tag = tag;
        toastContainer.appendChild(toast);

        // Wait a few seconds, then fade it...

        setTimeout(() => {
            toast.classList.add(style['toast--dismissed']);
        }, timeout);

        // After which, remove it altogether.
        toast.addEventListener('transitionend', (evt) => {
            const target = evt.target;
            target.parentNode?.removeChild(target);
        });
    }
}