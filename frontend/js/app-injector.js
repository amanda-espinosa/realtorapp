let appContainer = document.getElementById("realtor-app-container");

if (!appContainer) {
    throw new Error("Element with ID 'realtor-app-container' not found.");
}

let iframe = document.createElement("iframe");

iframe.src = "realtorapp/frontend/html/properties_preview.html";
iframe.style.position = "relative";
iframe.style.width = "100%";
iframe.style.minHeight = "100vh";

iframe.frameBorder = "0";

appContainer.appendChild(iframe);
