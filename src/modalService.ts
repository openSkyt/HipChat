export function initModal(modal: HTMLDialogElement) {
    const closeModalButton = modal.querySelector(".close");

    if (closeModalButton) {
        closeModalButton.addEventListener("click", () => {
            modal.close();
        });
    }

    modal.addEventListener("click", (e) => {
        const dialogDimensions = modal.getBoundingClientRect();
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            modal.close();
        }
    });
}