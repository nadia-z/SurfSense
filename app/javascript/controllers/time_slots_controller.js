import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["timeSlot"]

  connect() {
    console.log("TimeSlots controller connected")
    console.log("Element with time-slots controller:", this.element)
    this.currentForecastData = null // Store the current forecast data

    // Only set up listeners once
    if (!this.listenersSetup) {
      this.setupSaveForecastListener()
      this.listenersSetup = true
    }
  }

  disconnect() {
    console.log("TimeSlots controller disconnected")
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
    console.log(`time slot "${event.currentTarget}" selected`)
    console.log(`time slot "${clickedSlot}" selected`);
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
      swellHeight: parseFloat(clickedSlot.querySelector('[data-weather="swell-height"]')?.textContent || "0"),
      swellPeriod: parseFloat(clickedSlot.querySelector('[data-weather="swell-period"]')?.textContent || "0"),
      swellDirection: clickedSlot.querySelector('[data-weather="swell-direction"]')?.textContent || "",
      waveHeight: parseFloat(clickedSlot.querySelector('[data-weather="wave-height"]')?.textContent || "0"),
      wavePeriod: parseFloat(clickedSlot.querySelector('[data-weather="wave-period"]')?.textContent || "0"),
      waveDirection: clickedSlot.querySelector('[data-weather="wave-direction"]')?.textContent || "",
      windSpeed: parseFloat(clickedSlot.querySelector('[data-weather="wind-speed"]')?.textContent || "0"),
      windDirection: clickedSlot.querySelector('[data-weather="wind-direction"]')?.textContent || "",
      temperature: parseFloat(clickedSlot.querySelector('[data-weather="temperature"]')?.textContent || "0"),
      tide: clickedSlot.querySelector('[data-weather="tide-current"]')?.textContent || ""
    };

    // Debug the tide value specifically
    const tideElement = clickedSlot.querySelector('[data-weather="tide-current"]')
    console.log("Tide element found:", tideElement)
    console.log("Tide text content:", tideElement?.textContent)
    console.log("Tide value in data object:", data.tide)

    // Let's also check for alternative tide selectors
    const altTideSelectors = [
      '[data-weather="tide-current"]',
      '[data-weather="tide"]',
      '[data-tide]',
      '.tide',
      '[data-weather-type="tide"]'
    ]

    console.log("Checking alternative tide selectors:")
    altTideSelectors.forEach(selector => {
      const element = clickedSlot.querySelector(selector)
      console.log(`${selector}:`, element, element?.textContent)
    })

    // List all data-weather attributes in this slot
    const allWeatherElements = clickedSlot.querySelectorAll('[data-weather]')
    console.log("All data-weather elements in this slot:")
    allWeatherElements.forEach(el => {
      console.log(`data-weather="${el.dataset.weather}":`, el.textContent)
    })

    console.log("Full data object:", data)

    // const swellEl = clickedSlot.querySelector('[data-weather="swell-height"]');
    // const swellHeight = parseFloat(swellEl?.dataset.swellHeight || "0");

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
      console.log("Forecast data ready for saving:", this.currentForecastData)
    }

    // Listen for the custom event to update our stored data (ONLY ONCE)
    document.addEventListener("timeSlot:selected", this.timeSlotHandler)

    // Listen for custom save forecast events from the SVG button
    this.saveForecastHandler = (event) => {
      console.log("Custom saveForecast event triggered!", event)
      console.log("Event detail:", event.detail)
      console.log("Current forecast data available:", !!this.currentForecastData)

      if (!this.currentForecastData) {
        console.warn("No forecast data available. Please select a time slot first.")
        alert("Please select a time slot first to populate forecast data, then try saving again.")
        return
      }

      this.saveForecast()
    }

    console.log("Setting up saveForecast:clicked event listener")
    document.addEventListener("saveForecast:clicked", this.saveForecastHandler)

    // Create a bound handler to avoid multiple listeners
    this.saveHandler = (event) => {
      console.log("Click detected on:", event.target)
      console.log("Target ID:", event.target.id)
      console.log("Target classes:", event.target.className)
      console.log("Target tag:", event.target.tagName)

      // Check for multiple possible button selectors
      const isSaveButton = event.target.id === 'btn-sav-forecast' ||
                          event.target.id === 'btn-save-forecast' ||
                          event.target.matches('[data-action="save-forecast"]') ||
                          event.target.textContent?.includes('Save forecast') ||
                          event.target.closest('[id="btn-sav-forecast"]') ||
                          event.target.closest('[id="btn-save-forecast"]') ||
                          event.target.closest('[data-action="save-forecast"]')

      if (isSaveButton) {
        console.log("Save forecast button clicked!")
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
      console.log("No forecast data to save")
      return
    }

    // Prevent multiple rapid saves
    if (this.isSaving) {
      console.log("Save already in progress, skipping...")
      return
    }

    this.isSaving = true

    console.log("Saving forecast with data:", this.currentForecastData)
    console.log("Tide value being saved:", this.currentForecastData.tide)

    // Get location data from the page (using new structure)
    const locationData = this.getCurrentLocationData()

    if (!locationData.region || !locationData.country || !locationData.break) {
      console.error("Missing location data:", locationData)
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

    // Debug form data
    console.log("Form data being sent:")
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
    }

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
        console.log("Forecast saved successfully!")
        // Optionally show success message or update UI
        this.showSaveSuccess()
      } else {
        console.error("Error saving forecast:", response.statusText)
        this.showSaveError()
      }
    })
    .catch(error => {
      this.isSaving = false // Reset saving flag
      console.error("Error saving forecast:", error)
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
    console.log("=== DEBUGGING LOCATION DATA EXTRACTION (time_slots_controller) ===")

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
          console.log("✅ SUCCESS: Found location data from dropdown buttons:", { region, country, break: breakName })
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
          console.log("✅ SUCCESS: Found location data from break card:", { region, country, break: breakName })
          return { region, country, break: breakName }
        }
      }
    }

    console.error("❌ FAILED: Location data not found in any source")
    return { region: null, country: null, break: null }
  }

}
