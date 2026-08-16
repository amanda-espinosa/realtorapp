window.addEventListener("DOMContentLoaded", init);

function init(){
  const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
  
      const notification = document.getElementById("loginNotification");
  
      if (error === "invalid") {
          notification.innerHTML = `
              <div class="alert alert-danger" role="alert">
                  Incorrect email or password.
              </div>
          `;
      }
  
      if (error === "not-verified") {
          notification.innerHTML = `
              <div class="alert alert-warning" role="alert">
                  Please verify your email before logging in.
              </div>
          `;
      }
  
      if (error === "too-many-attempts") {
          notification.innerHTML = `
              <div class="alert alert-warning" role="alert">
                  Too many login attempts. Please try again later.
              </div>
          `;
      }
}
