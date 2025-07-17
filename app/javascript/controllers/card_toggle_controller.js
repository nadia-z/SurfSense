import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="card-toggle"
export default class extends Controller {
  static targets = ["toggleableElement"]
  fire() {
    this.toggleableElementTarget.classList.toggle("hidden")
  }
}
