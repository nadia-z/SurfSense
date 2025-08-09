import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="offcanvas"
export default class extends Controller {
  connect() {
  }

  openOffcanvas() {
    var offcanvasElement = document.getElementById('staticBackdrop');
    // Use Bootstrap's offcanvas instance instead of manually setting classes
    var bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
    bsOffcanvas.show();
  }
}
