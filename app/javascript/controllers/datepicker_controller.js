import { Controller } from "@hotwired/stimulus"
import "controllers"
import "flatpickr/dist/flatpickr.css"
// Connects to data-controller="datepicker"
export default class extends Controller {
  connect() {
    const flatpickr = require("flatpickr")
    flatpickr(this.element, { inline: true})
  }
}
