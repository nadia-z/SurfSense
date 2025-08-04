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

    const data = {
      time: clickedSlot.querySelector('[data-weather="time"]')?.textContent || "",
      swellHeight: parseFloat(clickedSlot.querySelector('[data-weather="swell-height"]')?.textContent || "0"),
      swellPeriod: parseFloat(clickedSlot.querySelector('[data-weather="swell-period"]')?.textContent || "0"),
      swellDirection: clickedSlot.querySelector('[data-weather="swell-direction"]')?.textContent || "",
      waveHeight: parseFloat(clickedSlot.querySelector('[data-weather="wave-height"]')?.textContent || "0"),
      wavePeriod: parseFloat(clickedSlot.querySelector('[data-weather="wave-period"]')?.textContent || "0"),
      waveDirection: clickedSlot.querySelector('[data-weather="wave-direction"]')?.textContent || "",
      windSpeed: parseFloat(clickedSlot.querySelector('[data-weather="wind-speed"]')?.textContent || "0"),
      windDirection: clickedSlot.querySelector('[data-weather="wind-direction"]')?.textContent || "",
      temperature: parseFloat(clickedSlot.querySelector('[data-weather="temperature"]')?.textContent || "0"),
      tide: clickedSlot.querySelector('[data-weather="tide"]')?.textContent || ""
    };

    // const swellEl = clickedSlot.querySelector('[data-weather="swell-height"]');
    // const swellHeight = parseFloat(swellEl?.dataset.swellHeight || "0");

    document.dispatchEvent(new CustomEvent("timeSlot:selected", {
      detail: data
    }));
}
}
