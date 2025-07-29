import { Controller } from "@hotwired/stimulus"
import * as d3 from "d3"

export default class extends Controller {
  static targets = ["timeSlot"]

  connect() {
    console.log("TimeSlots controller connected")
  }

  selectTimeSlot(event) {
    const clickedSlot = event.currentTarget

    // Hide all other time-slot-grid divs except clicked one
    this.timeSlotTargets.forEach(slot => {
      if (slot === clickedSlot) {
        slot.style.display = "flex"  // or "" to reset
      } else {
        slot.style.display = "none"
      }
    })

  }
}
