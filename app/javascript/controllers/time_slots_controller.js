import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["timeSlot"]

  connect() {
    console.log("TimeSlots controller connected")
  }

  selectTimeSlot(event) {
    const clickedSlot = event.currentTarget
    console.log(`time slot "${event.currentTarget}" selected`)

    const allSlots = document.querySelectorAll('[data-time-slots-target="timeSlot"]');

    allSlots.forEach(slot => {
      if (slot === clickedSlot) {
        slot.style.display = "flex";
        slot.style.flex = "none"; // or ""
      } else {
        slot.style.display = "none";
      }
    });

  }
}
