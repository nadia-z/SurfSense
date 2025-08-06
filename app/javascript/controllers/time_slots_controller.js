import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["timeSlot"]

  connect() {
    this.currentForecastData = null // Store the current forecast data

    // Only set up listeners once
    if (!this.listenersSetup) {
      this.setupSaveForecastListener()
      this.listenersSetup = true
    }
  }

  disconnect() {
    // Clean up event listeners
    if (this.saveHandler) {
      document.removeEventListener("click", this.saveHandler)
    }
    if (this.timeSlotHandler) {
      document.removeEventListener("timeSlot:selected", this.timeSlotHandler)
    }
    if (this.saveForecastHandler) {
      document.removeEventListener("saveForecast:clicked", this.saveForecastHandler)
    }
    this.listenersSetup = false
  }

  selectTimeSlot(event) {
    const clickedSlot = event.currentTarget
    const allSlots = document.querySelectorAll('[data-time-slots-target="timeSlot"]');

    allSlots.forEach(slot => {
      if (slot === clickedSlot) {
        slot.style.display = "flex";
        slot.style.flex = "none"; // or ""
      } else {
        slot.style.display = "none";
      }
    });


    const data = {
      time: clickedSlot.querySelector('[data-weather="time"]')?.textContent || "",
      swellHeight: parseFloat(clickedSlot.querySelector('[data-weather="swell-height"]')?.textContent || "n.a"),
      swellPeriod: parseFloat(clickedSlot.querySelector('[data-weather="swell-period"]')?.textContent || "n.a"),
      swellDirection: clickedSlot.querySelector('[data-weather="swell-direction"]')?.textContent || "n.a",
      waveHeight: parseFloat(clickedSlot.querySelector('[data-weather="wave-height"]')?.textContent || "n.a"),
      wavePeriod: parseFloat(clickedSlot.querySelector('[data-weather="wave-period"]')?.textContent || "n.a"),
      waveDirection: clickedSlot.querySelector('[data-weather="wave-direction"]')?.textContent || "n.a",
      windSpeed: parseFloat(clickedSlot.querySelector('[data-weather="wind-speed"]')?.textContent || "n.a"),
      windDirection: clickedSlot.querySelector('[data-weather="wind-direction"]')?.textContent || "n.a",
      temperature: parseFloat(clickedSlot.querySelector('[data-weather="temperature"]')?.textContent || "n.a"),
      tide: clickedSlot.querySelector('[data-weather="tide-current"]')?.textContent || "n.a"
    };

    // Debug the tide value specifically
    const tideElement = clickedSlot.querySelector('[data-weather="tide-current"]')
    document.dispatchEvent(new CustomEvent("timeSlot:selected", {
      detail: data
    }));

    // Store the data for potential saving
    this.currentForecastData = data
  }

  setupSaveForecastListener() {
    // Remove any existing listeners first
    if (this.saveHandler) {
      document.removeEventListener("click", this.saveHandler)
    }
    if (this.timeSlotHandler) {
      document.removeEventListener("timeSlot:selected", this.timeSlotHandler)
    }
    if (this.saveForecastHandler) {
      document.removeEventListener("saveForecast:clicked", this.saveForecastHandler)
    }

    // Create bound handlers to avoid multiple listeners
    this.timeSlotHandler = (event) => {
      this.currentForecastData = event.detail
    }

    // Listen for the custom event to update our stored data (ONLY ONCE)
    document.addEventListener("timeSlot:selected", this.timeSlotHandler)

    // Listen for custom save forecast events from the SVG button
    this.saveForecastHandler = (event) => {
      if (!this.currentForecastData) {
        console.warn("No forecast data available. Please select a time slot first.")
        alert("Please select a time slot first to populate forecast data, then try saving again.")
        return
      }

      this.saveForecast()
    }

    document.addEventListener("saveForecast:clicked", this.saveForecastHandler)

    // Create a bound handler to avoid multiple listeners
    this.saveHandler = (event) => {
      // Check for multiple possible button selectors
      const isSaveButton = event.target.id === 'btn-sav-forecast' ||
                          event.target.id === 'btn-save-forecast' ||
                          event.target.matches('[data-action="save-forecast"]') ||
                          event.target.textContent?.includes('Save forecast') ||
                          event.target.closest('[id="btn-sav-forecast"]') ||
                          event.target.closest('[id="btn-save-forecast"]') ||
                          event.target.closest('[data-action="save-forecast"]')

      if (isSaveButton) {
        event.preventDefault()
        event.stopPropagation() // Prevent event bubbling
        this.saveForecast()
      }
    }

    // Listen for save forecast button clicks (using event delegation)
    document.addEventListener("click", this.saveHandler)
  }

  saveForecast() {
    if (!this.currentForecastData) {
      return
    }

    // Prevent multiple rapid saves
    if (this.isSaving) {
      return
    }

    this.isSaving = true

    // Get location data from the page (using new structure)
    const locationData = this.getCurrentLocationData()

    if (!locationData.region || !locationData.country || !locationData.break) {
      this.showSaveError()
      return
    }

    // Create form data with correct column names (user_id is set by current_user in controller)
    const formData = new FormData()
    formData.append("selected_forecast[region]", locationData.region)
    formData.append("selected_forecast[country]", locationData.country)
    formData.append("selected_forecast[break]", locationData.break)
    formData.append("selected_forecast[time_slot]", this.currentForecastData.time)
    formData.append("selected_forecast[swellHeight]", this.currentForecastData.swellHeight)
    formData.append("selected_forecast[swellPeriod]", this.currentForecastData.swellPeriod)
    formData.append("selected_forecast[swellDirection]", this.currentForecastData.swellDirection)
    formData.append("selected_forecast[waveHeight]", this.currentForecastData.waveHeight)
    formData.append("selected_forecast[wavePeriod]", this.currentForecastData.wavePeriod)
    formData.append("selected_forecast[waveDirection]", this.currentForecastData.waveDirection)
    formData.append("selected_forecast[wind_speed]", this.currentForecastData.windSpeed)
    formData.append("selected_forecast[wind_direction]", this.currentForecastData.windDirection)
    formData.append("selected_forecast[temperature]", this.currentForecastData.temperature)
    formData.append("selected_forecast[tide]", document.querySelector('[data-weather="tide"]')?.textContent || "")
    formData.append("selected_forecast[saved]", true)

    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    if (csrfToken) {
      formData.append("authenticity_token", csrfToken)
    }

    // Submit the form asynchronously
    fetch('/selected_forecasts', {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => {
      this.isSaving = false // Reset saving flag
      if (response.ok) {
        this.showSaveSuccess()
      } else {
        this.showSaveError()
      }
    })
    .catch(error => {
      this.isSaving = false // Reset saving flag
      this.showSaveError()
    })
  }

  getCurrentUserId() {
    // Option 1: Get from data attribute on body or main container
    const userId = document.body.dataset.userId ||
                   document.querySelector('[data-user-id]')?.dataset.userId ||
                   // Option 2: Get from a hidden input or meta tag
                   document.querySelector('meta[name="current-user-id"]')?.getAttribute('content')

    if (!userId) {
      console.error("User ID not found. Make sure to add data-user-id to body or a meta tag.")
    }

    return userId
  }

  getCurrentLocationId() {
    // Option 1: Get from URL params (if location ID is in the URL)
    const urlParams = new URLSearchParams(window.location.search)
    let locationId = urlParams.get('location_id')

    if (locationId) return locationId

    // Option 2: Get from data attribute
    locationId = document.querySelector('[data-location-id]')?.dataset.locationId
    if (locationId) return locationId

    // Option 3: Get from a global variable or session
    if (window.currentLocationId) return window.currentLocationId

    // Option 4: Try to get from locations JSON data (if available)
    try {
      const locationsData = document.querySelector('[data-save-location-locations-value]')?.dataset.saveLocationLocationsValue
      if (locationsData) {
        const locations = JSON.parse(locationsData)
        if (locations && locations.length > 0) {
          // Use the first location if multiple exist, or find the current one
          locationId = locations[0].id
          console.log("Using location ID from JSON data:", locationId)
          return locationId
        }
      }
    } catch (error) {
      console.log("Error parsing locations JSON:", error)
    }

    // Option 5: Get from hidden input fields
    const latInput = document.getElementById('location_latitude')
    const lonInput = document.getElementById('location_longitude')
    if (latInput && lonInput && latInput.value && lonInput.value) {
      // If we have lat/lon, we might need to create a location first
      console.log("Found lat/lon but no location ID. Consider creating location first.")
    }

    console.error("Location ID not found. Available options:", {
      urlParams: urlParams.get('location_id'),
      dataAttribute: document.querySelector('[data-location-id]')?.dataset.locationId,
      globalVar: window.currentLocationId,
      hasLocationsData: !!document.querySelector('[data-save-location-locations-value]'),
      hasLatLon: !!(document.getElementById('location_latitude')?.value)
    })

    return null
  }

  showSaveSuccess() {
    // You can customize this to show a toast, modal, or other UI feedback
    const saveBtn = document.getElementById('btn-sav-forecast') ||
                    document.getElementById('btn-save-forecast')
    if (saveBtn) {
      const originalText = saveBtn.textContent
      saveBtn.textContent = "Saved!"
      saveBtn.style.backgroundColor = "#28a745"

      setTimeout(() => {
        saveBtn.textContent = originalText
        saveBtn.style.backgroundColor = ""
      }, 2000)
    }
  }

  showSaveError() {
    // You can customize this to show error feedback
    const saveBtn = document.getElementById('btn-sav-forecast') ||
                    document.getElementById('btn-save-forecast')
    if (saveBtn) {
      const originalText = saveBtn.textContent
      saveBtn.textContent = "Error!"
      saveBtn.style.backgroundColor = "#dc3545"

      setTimeout(() => {
        saveBtn.textContent = originalText
        saveBtn.style.backgroundColor = ""
      }, 2000)
    }
  }

  getCurrentLocationData() {
    // PRIMARY METHOD: Get from dropdown button texts (most reliable)
    const countryDropdown = document.querySelector('[data-dropdown-type-value="country"]')
    const regionDropdown = document.querySelector('[data-dropdown-type-value="region"]')
    const breakDropdown = document.querySelector('[data-dropdown-type-value="break"]')

    if (countryDropdown && regionDropdown && breakDropdown) {
      const countryButton = countryDropdown.querySelector('[data-dropdown-target="button"]')
      const regionButton = regionDropdown.querySelector('[data-dropdown-target="button"]')
      const breakButton = breakDropdown.querySelector('[data-dropdown-target="button"]')

      if (countryButton && regionButton && breakButton) {
        const country = countryButton.textContent?.trim()
        const region = regionButton.textContent?.trim()
        const breakName = breakButton.textContent?.trim()

        // Check if all dropdowns have been selected (not showing default text)
        if (country && region && breakName &&
            country !== 'Country' &&
            region !== 'Region' &&
            breakName !== 'Break') {
          return { region, country, break: breakName }
        }
      }
    }

    // SECONDARY METHOD: Try to get location data from the current break card
    const currentBreakCard = document.querySelector('.break-card')
    if (currentBreakCard) {
      const breakNameEl = currentBreakCard.querySelector('[data-card="break-name"]')
      const regionEl = currentBreakCard.querySelector('[data-card="region"]')
      const countryEl = currentBreakCard.querySelector('[data-card="country"]')

      if (breakNameEl && regionEl && countryEl) {
        const breakName = breakNameEl.textContent?.trim()
        const region = regionEl.textContent?.trim()
        const country = countryEl.textContent?.trim()

        if (breakName && region && country &&
            breakName !== 'Loading...' &&
            region !== '--' &&
            country !== '--') {
          return { region, country, break: breakName }
        }
      }
    }

    return { region: null, country: null, break: null }
  }

}
