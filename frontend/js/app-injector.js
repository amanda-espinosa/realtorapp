let appContainer = document.getElementById("realtor-app-container");

if (!appContainer) {
    throw new Error("Element with ID 'realtor-app-container' not found.");
}

// Create the iframe element
let iframe = document.createElement("iframe");

// Set attributes
iframe.src = "/realtorapp/frontend/html/properties_preview.html";
iframe.style.position = "relative";
iframe.style.width = "100%";
iframe.style.minHeight = "100vh";

// Optionally remove the border
iframe.frameBorder = "0";

appContainer.appendChild(iframe);

