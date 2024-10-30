function showDialog(message, type = "info") {
  const overlay = document.createElement("div");
  overlay.className = "dialog-overlay animate-fadeIn";

  const dialog = document.createElement("div");
  dialog.className = "dialog-box animate-scaleIn";

  dialog.innerHTML = `
    <div class="dialog-content">
      <img src="https://cdn-icons-png.flaticon.com/512/1379/1379905.png" 
           alt="dialog icon" 
           class="dialog-icon">
      <h2 class="dialog-title">${type === "error" ? "Oops!" : "Notice"}</h2>
      <p class="dialog-message">${message}</p>
      <button class="dialog-button">OKAY</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const okButton = dialog.querySelector(".dialog-button");
  okButton.focus();

  const closeDialog = () => {
    dialog.classList.replace("animate-scaleIn", "animate-scaleOut");
    overlay.classList.replace("animate-fadeIn", "animate-fadeOut");
    setTimeout(() => overlay.remove(), 300);
  };

  okButton.addEventListener("click", closeDialog);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeDialog();
  });

  document.addEventListener("keydown", function handleEscape(e) {
    if (e.key === "Escape") {
      closeDialog();
      document.removeEventListener("keydown", handleEscape);
    }
  });
}

export { showDialog };
