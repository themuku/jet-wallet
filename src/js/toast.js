export function toast(isError = false, message = "") {
  const html = `
    <div class="toast" onclick="removeToast(${isError})">
      <i class="fa-solid fa-circle-${
        !isError ? "check success" : "xmark error"
      }"></i>
      <span>${
        message.length > 0 ? message : !isError ? "Success" : "Error"
      }</span>
    </div>
    `;

  return html;
}
