// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails


import "@hotwired/turbo-rails"
import "controllers"
import "@popperjs/core"
import "bootstrap"
import "@popperjs/core"
//import "./flowchart"

// this below makes sure that the offcanvas page is loaded just once per session

document.addEventListener("DOMContentLoaded", function() {
  console.log("DOMContentLoaded event fired");
  if (!localStorage.getItem("offcanvasShown")) {
    var offcanvasElement = document.getElementById('staticBackdrop');
    console.log("offcanvasElement:", offcanvasElement);
    console.log("window.bootstrap:", window.bootstrap);
    if (offcanvasElement && window.bootstrap && window.bootstrap.Offcanvas) {
      var offcanvas = new window.bootstrap.Offcanvas(offcanvasElement);
      offcanvas.show();
      localStorage.setItem("offcanvasShown", "true");
      console.log("Offcanvas shown and flag set");
    } else {
      console.log("Offcanvas or Bootstrap not available");
    }
  } else {
    console.log("Offcanvas already shown, skipping");
  }
});
