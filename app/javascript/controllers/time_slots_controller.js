import { Controller } from "@hotwired/stimulus"
import * as d3 from "d3"

export default class extends Controller {
  static targets = ["timeSlot"]

  connect() {
    console.log("TimeSlots controller connected")
  }

  selectTimeSlot(event) {
    const clickedSlot = event.currentTarget

    console.log(`time slot "${clickedSlot}" selected`);

    const swellEl = clickedSlot.querySelector('[data-weather="swell-height"]');
    const swellHeight = parseFloat(swellEl?.dataset.swellHeight || "0");

    document.dispatchEvent(new CustomEvent("timeSlot:selected", {
      detail: { swellHeight }
    }));
}
}
