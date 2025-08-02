import { Controller } from "@hotwired/stimulus"
import * as d3 from "d3"

export default class extends Controller {
  static targets = ["timeSlot"]

  connect() {
    console.log("TimeSlots controller connected")
  }

<<<<<<< Updated upstream
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
=======
// Hide all slots also the card except the clicked one, append time-slot-grid element to
// the DOM, inside a wrapper that is created in order to display it properly styled on the left side of the screen
selectTimeSlot(event) {
  const clickedSlot = event.currentTarget;
  console.log(`time slot "${clickedSlot}" selected`);

  const allSlots = document.querySelectorAll('[data-time-slots-target="timeSlot"]');

  // Hide all slots except the clicked one
  allSlots.forEach(slot => {
    slot.style.display = (slot === clickedSlot) ? "flex" : "none";
    if (slot === clickedSlot) {
      slot.style.flex = "none"; // or ""
    }
  });
>>>>>>> Stashed changes

  // Find the parent break cards container
  const breakCardContainer = clickedSlot.closest('#break-cards-container');

  if (breakCardContainer) {
    // Hide the whole container (including other break  cards)
    breakCardContainer.style.display = 'none';

   // Create or get the time-slot-wrapper
    let wrapper = document.getElementById('time-slot-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.id = 'time-slot-wrapper';
      document.body.appendChild(wrapper);
    }

    // Clear previous content and append the clicked slot
    wrapper.innerHTML = '';
    wrapper.appendChild(clickedSlot);

    clickedSlot.style.display = 'flex';
    clickedSlot.style.flex = 'none'; // or 'auto'
    clickedSlot.style.width = '100%'; // fill wrapper width but not more
  }

  // Dispatch event with swellHeight info to be used in forecast controller method in switchToFlowChartFromTimeSlot
  const swellEl = clickedSlot.querySelector('[data-weather="swell-height"]');
  const swellHeight = parseFloat(swellEl?.dataset.swellHeight || "0");

  document.dispatchEvent(new CustomEvent("timeSlot:selected", {
    detail: { swellHeight }
  }));
}
}
