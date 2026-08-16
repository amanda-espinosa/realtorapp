function init() {
  function getQueryParam(param) {
      let urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
  }

  let houseString = getQueryParam("house");
  let house = JSON.parse(houseString);

  function showNotification(type, message) {
    let alert = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close">
            </button>
        </div>
    `;

    $("#formNotification").html(alert);
  }

  $("#contactForm").on("submit", function (event) {
    event.preventDefault();
    
    $.ajax({
      url: "../../backend/php/main.php?action=sendForm",
      method: "POST",
      data: $(this).serialize(),
      dataType: "json",
  
      success: function(response) {
        if (response.success) {
          showNotification(
            "success",
            "Thank you! Your message was sent successfully."
          );
          $("#contactForm")[0].reset();
        } else {
          showNotification(
            "danger",
            response.error ||"Your message could not be sent."
          );
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", error);
        console.error("Server response:", xhr.responseText);

        showNotification(
          "danger",
          "Something went wrong. Please try again later."
        );
      }
    });
  });

    fetch(`../../backend/php/main.php?action=getPropertyImages&id=${house.id}`)
        .then(response => response.json())
        .then(images => {

            if (images.length > 0) {
                const mainPhotoContainer = document.getElementById("mainPhotoContainer");
                const galleryRight = document.getElementById("galleryRight");

                mainPhotoContainer.innerHTML = "";
                galleryRight.innerHTML = "";

                const mainPhoto = document.createElement("a");
                mainPhoto.id = "mainPhoto";
                mainPhoto.setAttribute("href", images[0]);
                mainPhoto.setAttribute("data-fancybox", "gallery");
                mainPhoto.setAttribute("data-caption", "Main House Image");

                const mainImg = document.createElement("img");
                mainImg.src = images[0];
                mainImg.alt = "Main Image";
                mainPhoto.appendChild(mainImg);
                mainPhotoContainer.appendChild(mainPhoto);

                images.forEach((src, index) => {
                    const anchor = document.createElement("a");
                    anchor.setAttribute("href", src);
                    anchor.setAttribute("data-fancybox", "gallery");

                    const img = document.createElement("img");
                    img.setAttribute("src", src);
                    img.setAttribute("alt", "");
                    anchor.appendChild(img);

                    if (index < 4) {
                        const rightPicsDiv = document.createElement("div");
                        rightPicsDiv.className = index === 3 ? "homePicsMore" : "homePics";

                        if (index === 3 && images.length > 4) {
                            const overlay = document.createElement("div");
                            overlay.className = "overlay";
                            overlay.textContent = `+${images.length - 4}`;
                            anchor.appendChild(overlay);
                        }

                        rightPicsDiv.appendChild(anchor);
                        galleryRight.appendChild(rightPicsDiv);
                    } else {
                        anchor.style.display = "none";
                        document.body.appendChild(anchor);
                    }
                });
            }
        });

    if (house) {
        let propertiesHouseObject = Object.getOwnPropertyNames(house);

        for (let i = 0; i < propertiesHouseObject.length; i++) {
            let property = propertiesHouseObject[i];
            let value = house[property];
            let propertyElement = document.getElementById(property);
            if (propertyElement !== null) {
                propertyElement.innerHTML = value;
            }
        }

        $.post("../../backend/php/main.php?action=incrementViews", {
            id: house.id
        }).then(response => {
            console.log("View count incremented:", response);
        }).catch(error => {
            console.error("Failed to update views:", error);
        });

        const stateIndex = parseInt(house.property_state);
        const stateText = realtorapp.propertyStatusString[stateIndex] ?? "Unknown";
        document.getElementById("property_state").innerText = stateText;
    }

    setTimeout(async () => {
        let map = await realtorapp.map.initPropertyMap(house);

        setTimeout(() => {
            map.invalidateSize();
        }, 200);
    }, 200);
}




window.addEventListener("DOMContentLoaded", init);
