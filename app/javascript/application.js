// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails


import "@hotwired/turbo-rails"
import "controllers"
import "@popperjs/core"
import "bootstrap"

//import "./flowchart"

// this below makes sure that the offcanvas page is loaded just once per session

document.addEventListener("DOMContentLoaded", function() {
  if (!localStorage.getItem("offcanvasShown")) {
    var offcanvasElement = document.getElementById('staticBackdrop');
    if (offcanvasElement && window.bootstrap && window.bootstrap.Offcanvas) {
      var offcanvas = new window.bootstrap.Offcanvas(offcanvasElement);
      offcanvas.show();
      localStorage.setItem("offcanvasShown", "true");
    }
  }
});
