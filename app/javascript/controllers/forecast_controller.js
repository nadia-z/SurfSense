import { Controller } from "@hotwired/stimulus"
import { createDefs, applyBlur, removeBlur, addPaddingRect } from "../flowchart_effects"
import { initializeNodeClickListeners } from "../flowchart_interactions"
import { findAnswerToSwellHeight, updateSwellHeightAnswer } from "../swell_height_answers";
// Connects to data-controller="forecast"
export default class extends Controller {
    static targets = ["card"]

    connect() {
      console.log("Forecast controller connected")
      this.currentForecastData = null // Store forecast data for saving

      document.addEventListener("timeSlot:selected", (event) => {
        this.currentForecastData = event.detail // Store the data
        console.log("Forecast data stored:", this.currentForecastData)
        this.showFlowchartWithUpdatedData(event.detail);
      })
    }

    selectCard(event) {
      event.preventDefault()
      const selectedCard = this.cardTarget
      // Placeholder for logic
    }

    toggleLongForecastInfo(event) {
      const forecastContainer = document.getElementById("forecast-container")
      forecastContainer.style.display = "grid"

      const currentForecastContainer = document.querySelector('.row')
      currentForecastContainer.style.display = 'none'
    }

    focusOnCard(event) {
      const cardsContainer = document.getElementById("break-cards-container")
      cardsContainer.innerHTML = ""
      cardsContainer.insertBefore(event.currentTarget.parentElement, null)
      this.toggleLongForecastInfo(event)
      this.deactivateClickFunctionalities(event)

      // Update the break dropdown button with the selected break name
      this.updateBreakButtonFromCard(event.currentTarget)
    }

    updateBreakButtonFromCard(cardElement) {
      // Get all location data from the clicked card
      const breakNameElement = cardElement.querySelector('[data-card="break-name"]')
      const regionElement = cardElement.querySelector('[data-card="region"]')
      const countryElement = cardElement.querySelector('[data-card="country"]')

      if (breakNameElement && regionElement && countryElement) {
        const breakName = breakNameElement.textContent?.trim()
        const region = regionElement.textContent?.trim()
        const country = countryElement.textContent?.trim()

        console.log('Card data extracted:', { breakName, region, country })

        // Update break dropdown if valid data
        if (breakName && breakName !== 'Loading...') {
          const breakDropdown = document.querySelector('[data-dropdown-type-value="break"]')
          if (breakDropdown) {
            const breakButton = breakDropdown.querySelector('[data-dropdown-target="button"]')
            if (breakButton) {
              breakButton.textContent = breakName
              console.log(`✅ Updated break button text to: ${breakName}`)
            }
          }
        }

        // Update region dropdown - use 'All Regions' if no region data
        let regionText = region
        if (!region || region === '--' || region === 'Loading...') {
          regionText = 'All Regions'
        }

        const regionDropdown = document.querySelector('[data-dropdown-type-value="region"]')
        if (regionDropdown) {
          const regionButton = regionDropdown.querySelector('[data-dropdown-target="button"]')
          if (regionButton) {
            regionButton.textContent = regionText
            console.log(`✅ Updated region button text to: ${regionText}`)
          }
        }

        // Update country dropdown if valid data
        if (country && country !== '--' && country !== 'Loading...') {
          const countryDropdown = document.querySelector('[data-dropdown-type-value="country"]')
          if (countryDropdown) {
            const countryButton = countryDropdown.querySelector('[data-dropdown-target="button"]')
            if (countryButton) {
              countryButton.textContent = country
              console.log(`✅ Updated country button text to: ${country}`)
            }
          }
        }
      }
    }

    deactivateClickFunctionalities() {
      //I want to deactivate the card click functionalities in order to click on other buttons in the card
      // without triggering the 'focusOnCard' function
      // Find ALL elements with this action and remove the data-action attribute
      const elementToDeactivate = document.querySelector('#card-template')
      elementToDeactivate.removeAttribute('data-action')

      console.log('DONE - Deactivated')
    }

    showFlowchartWithUpdatedData(data) {
  // Access all the weather values from the data object
    const time = data.time;
    const swellHeight = data.swellHeight;
    console.log("data.swellHeight")
    console.log(data.swellHeight)
    const swellPeriod = data.swellPeriod;
    const swellDirection = data.swellDirection;
    const waveHeight = data.waveHeight;
    const wavePeriod = data.wavePeriod;
    const waveDirection = data.waveDirection;
    const windSpeed = data.windSpeed;
    const windDirection = data.windDirection;
    const temperature = data.temperature;
    const tide = data.tide;

        const breakCardContainer = document.getElementById("break-cards-container");
        if (breakCardContainer) {
          breakCardContainer.innerHTML = ""; // clear cards
          breakCardContainer.style.display = "none";
        }


      fetch("/flowchart.svg")
        .then(res => res.text())
        .then(svgText => {
          console.log("fetching svg")
          const parser = new DOMParser()
          const svgDoc = parser.parseFromString(svgText, "image/svg+xml")
          const parsedSvg = svgDoc.documentElement

          const oldSvg = document.querySelector("svg#flowchart"); // use an ID or class to target it
          if (oldSvg) oldSvg.remove();

          parsedSvg.setAttribute("id", "flowchart");
          document.body.appendChild(parsedSvg);



          let swellGroup = parsedSvg.getElementById("swell-value");
          let waveGroup = parsedSvg.getElementById("wave-value");
          let windGroup = parsedSvg.getElementById("wind-value");
          let timeGroup = parsedSvg.getElementById("time-value");
          console.log("timeGroup")
          console.log(timeGroup)

          createDefs(parsedSvg)
          const edges = parsedSvg.querySelectorAll('[id^="e-"]')
          const nodes = parsedSvg.querySelectorAll('[id^="sn-"], [id^="qsn-"]')

          this.hideAllElements(edges, nodes)
          this.showNodesAndEdges(nodes, parsedSvg, [0, 1, 2, 3])
          this.blurNodes(nodes, [4, 8])
          initializeNodeClickListeners(nodes, edges, parsedSvg, { applyBlur, removeBlur })
          this.updateSwellGroupText(swellGroup, swellHeight, swellPeriod, swellDirection)
          this.updateWaveGroupText(waveGroup, waveHeight, wavePeriod, waveDirection)
          this.updateWindGroupText(windGroup, windSpeed, windDirection)
          this.updateTimeGroupText(timeGroup, time)

          // added in order to inject the 'save-forecast button' in the SVG
          // After SVG is loaded and appended, attach the event listener
          const saveBtn = parsedSvg.getElementById('btn-save-forecast')
          if (saveBtn) {
            saveBtn.addEventListener('click', (event) => {
              console.log('SVG button clicked!', event)

              // Call the save method directly on this controller
              this.saveForecast()
            })
          } else {
            console.log('Save button not found in SVG')
          }
        })
    }

    hideAllElements(edges, nodes) {
      edges.forEach(edge => {
        edge.style.visibility = "hidden"
        edge.setAttribute("stroke-width", "1")
        edge.setAttribute("stroke", "#D8E6E7")
      })
      nodes.forEach(node => {
        node.style.visibility = "hidden"
        addPaddingRect(node)
      })
    }

    showNodesAndEdges(nodes, svg, nodeIndices) {
      nodeIndices.forEach(index => {
        const node = nodes[index]
        if (!node) return

        node.style.visibility = "visible"
        const nodeId = node.id.replace(/^q?sn-/, "")
        const relatedEdges = svg.querySelectorAll(`[id^="e-${nodeId}-"]`)

        relatedEdges.forEach(edge => {
          edge.style.visibility = "visible"
          const toId = edge.id.split("-")[2]
          const teasedNode = svg.getElementById(`sn-${toId}`) || svg.getElementById(`qsn-${toId}`)
          if (teasedNode) teasedNode.style.visibility = "visible"
        })
      })
    }

    blurNodes(nodes, nodeIndices) {
      nodeIndices.forEach(index => {
        const node = nodes[index]
        if (!node) return

        node.style.visibility = "visible"
        node.setAttribute("filter", "url(#blur-effect)")
        node.style.pointerEvents = "none"
      })
    }
    // update Group value function needs to be refactored, to stay dry
    // find swellGroup value
    updateSwellGroupText(swellGroup, swellHeight, swellPeriod, swellDirection) {
      if (!swellGroup || swellHeight == null || swellPeriod == null || !swellDirection) return;

      // Find position of original group element
      let originalX = swellGroup.getAttribute("x");
      let originalY = swellGroup.getAttribute("y");

      if (!originalX || !originalY) {
        const bbox = swellGroup.getBBox?.();
        if (bbox) {
          originalX = bbox.x + bbox.width / 2;
          originalY = bbox.y + bbox.height / 2  + 5;
        } else {
          originalX = 110; // fallback value
          originalY = 400;
        }
      }

        const newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newText.setAttribute("id", "swell-value");
        newText.setAttribute("x", originalX);
        newText.setAttribute("y", originalY);
        newText.setAttribute("text-anchor", "middle");
        newText.setAttribute("style", "font-family: 'Self Modern', sans-serif; font-size: 1.5rem; fill: black;");
        newText.textContent = `${swellHeight.toFixed(1)}m ${swellPeriod.toFixed(1)}s ${swellDirection}`;
        console.log("newText")
        console.log(newText)
        swellGroup.parentNode.replaceChild(newText, swellGroup)
  }

    updateWaveGroupText(waveGroup, waveHeight, wavePeriod, waveDirection) {
      if (!waveGroup || waveHeight == null || wavePeriod == null || !waveDirection) return;

      // Find position of original group element
      let originalX = waveGroup.getAttribute("x");
      let originalY = waveGroup.getAttribute("y");

      if (!originalX || !originalY) {
        const bbox = waveGroup.getBBox?.();
        if (bbox) {
          originalX = bbox.x + bbox.width / 2;
          originalY = bbox.y + bbox.height / 2 + 5;
        } else {
          originalX = 110; // fallback value
          originalY = 400;
        }
      }

        const newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newText.setAttribute("id", "wave-value");
        newText.setAttribute("x", originalX);
        newText.setAttribute("y", originalY);
        newText.setAttribute("text-anchor", "middle");
        newText.setAttribute("style", "font-family: 'Self Modern', sans-serif; font-size: 1.5rem; fill: black;");
        newText.textContent = `${waveHeight.toFixed(1)}m ${wavePeriod.toFixed(1)}s ${waveDirection}`;
        console.log("newText")
        console.log(newText)
        waveGroup.parentNode.replaceChild(newText, waveGroup)
  }

    updateWindGroupText(windGroup, windSpeed, windDirection) {
      if (!windGroup || windSpeed == null || !windDirection) return;

      // Find position of original group element
      let originalX = windGroup.getAttribute("x");
      let originalY = windGroup.getAttribute("y");

      if (!originalX || !originalY) {
        const bbox = windGroup.getBBox?.();
        if (bbox) {
          originalX = bbox.x + bbox.width / 2;
          originalY = bbox.y + bbox.height / 2 + 5;
        } else {
          originalX = 110; // fallback value
          originalY = 400;
        }
      }

        const newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newText.setAttribute("id", "wind-value");
        newText.setAttribute("x", originalX);
        newText.setAttribute("y", originalY);
        newText.setAttribute("text-anchor", "middle");
        newText.setAttribute("style", "font-family: 'Self Modern', sans-serif; font-size: 1.5rem; fill: black;");
        // newText.textContent = `${windSpeed.toFixed(1)}km/h ${windDirection}`;
        newText.textContent = "to be updated";
        console.log("newText")
        console.log(newText)
        windGroup.parentNode.replaceChild(newText, windGroup)
  }

    updateTimeGroupText(timeGroup, time) {
      if (!timeGroup || time == null) return;

      // Find position of original group element
      let originalX = timeGroup.getAttribute("x");
      let originalY = timeGroup.getAttribute("y");

      if (!originalX || !originalY) {
        const bbox = timeGroup.getBBox?.();
        if (bbox) {
          originalX = bbox.x + bbox.width / 2;
          originalY = bbox.y + bbox.height / 2 + 8;
        } else {
          originalX = 110; // fallback value
          originalY = 400;
        }
      }

        const newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newText.setAttribute("id", "time-value");
        newText.setAttribute("x", originalX);
        newText.setAttribute("y", originalY);
        newText.setAttribute("text-anchor", "middle");
        newText.setAttribute("style", "font-family: 'Self Modern', sans-serif; font-size: 1.5rem; fill: black;");
        newText.textContent = `${time}`;
        console.log("newText")
        console.log(newText)
        timeGroup.parentNode.replaceChild(newText, timeGroup)
  }

  saveForecast() {
    if (!this.currentForecastData) {
      console.warn("No forecast data available. Please select a time slot first.")
      alert("Please select a time slot first to populate forecast data, then try saving again.")
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
    console.log("Tide value type:", typeof this.currentForecastData.tide)
    console.log("Tide value length:", this.currentForecastData.tide?.length)

    // Let's also try to extract tide data directly at save time as a fallback
    const currentTideElement = document.querySelector('[data-weather="tide-current"]')
    console.log("Current tide element at save time:", currentTideElement)
    if (currentTideElement) {
      console.log("Current tide text at save time:", currentTideElement.textContent)
    }

    // If tide is empty, try alternative methods to get tide data
    let tideValue = this.currentForecastData.tide || ""
    if (!tideValue || tideValue.length === 0) {
      // Try alternative selectors for tide data
      const altTideSelectors = [
        '[data-weather="tide-current"]',
        '[data-weather="tide"]',
        '[data-tide]',
        '.tide-data',
        '[data-weather-type="tide"]',
        '.tide-value',
        '[class*="tide"]'
      ]

      for (const selector of altTideSelectors) {
        const tideEl = document.querySelector(selector)
        if (tideEl && tideEl.textContent && tideEl.textContent.trim() !== '') {
          tideValue = tideEl.textContent.trim()
          console.log(`Found tide data using selector ${selector}:`, tideValue)
          break
        }
      }

      // If still no tide data, use placeholder
      if (!tideValue || tideValue.length === 0) {
        tideValue = "N/A" // or "" if you prefer empty
        console.log("No tide data found, using placeholder:", tideValue)
      }
    }

    // Get location data from the page
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
    formData.append("selected_forecast[tide]", tideValue)
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

  getCurrentLocationId() {
    // Option 1: Get from URL params (if location ID is in the URL)
    const urlParams = new URLSearchParams(window.location.search)
    let locationId = urlParams.get('location_id')
    if (locationId) {
      console.log("Using location ID from URL:", locationId)
      return locationId
    }

    // Option 2: Get from data attribute on the current forecast data
    locationId = document.querySelector('[data-location-id]')?.dataset.locationId
    if (locationId) {
      console.log("Using location ID from data attribute:", locationId)
      return locationId
    }

    // Option 3: Get from a global variable or session
    if (window.currentLocationId) {
      console.log("Using location ID from global variable:", window.currentLocationId)
      return window.currentLocationId
    }

    // Option 4: Try to find the current location ID from saved locations data
    // Get current break card data to match against saved locations
    const currentBreakCard = document.querySelector('.break-card')
    if (currentBreakCard) {
      const breakName = currentBreakCard.querySelector('[data-card="break-name"]')?.textContent
      const region = currentBreakCard.querySelector('[data-card="region"]')?.textContent
      const country = currentBreakCard.querySelector('[data-card="country"]')?.textContent
      const latitude = currentBreakCard.querySelector('[data-card="latitude"]')?.textContent
      const longitude = currentBreakCard.querySelector('[data-card="longitude"]')?.textContent

      console.log("Current break card data:", { breakName, region, country, latitude, longitude })

      // Try to get saved locations data from save-location controller
      const saveLocationElement = document.querySelector('[data-controller*="save-location"]')
      if (saveLocationElement && saveLocationElement.dataset.saveLocationLocationsValue) {
        try {
          const savedLocations = JSON.parse(saveLocationElement.dataset.saveLocationLocationsValue)
          console.log("Found saved locations data:", savedLocations)

          // Find matching location by break name, region, country, and coordinates
          const matchingLocation = savedLocations.find(loc =>
            loc.break === breakName &&
            loc.region === region &&
            loc.country === country &&
            parseFloat(loc.latitude).toFixed(6) === parseFloat(latitude).toFixed(6) &&
            parseFloat(loc.longitude).toFixed(6) === parseFloat(longitude).toFixed(6)
          )

          if (matchingLocation && matchingLocation.id) {
            console.log("Found matching saved location with ID:", matchingLocation.id)
            return matchingLocation.id
          }
        } catch (error) {
          console.log("Error parsing saved locations JSON:", error)
        }
      }
    }

    // Option 5: Try to get from the currently selected dropdown option
    const dropdownSelects = [
      'select[data-dropdown-target="locationSelect"]',
      'select[name="location"]',
      'select.location-select',
      '#location-select'
    ]

    for (const selector of dropdownSelects) {
      const selectElement = document.querySelector(selector)
      if (selectElement && selectElement.value && selectElement.value !== '') {
        locationId = selectElement.value
        console.log(`Using location ID from dropdown (${selector}):`, locationId)
        return locationId
      }
    }

    // Option 6: Try to get from the last used location in the save-location controller
    const saveLocationElement = document.querySelector('[data-controller*="save-location"]')
    if (saveLocationElement) {
      locationId = saveLocationElement.dataset.locationId
      if (locationId) {
        console.log("Using location ID from save-location controller:", locationId)
        return locationId
      }
    }

    // Option 7 (FALLBACK): Try to get from locations JSON data
    try {
      const locationsData = document.querySelector('[data-save-location-locations-value]')?.dataset.saveLocationLocationsValue
      if (locationsData) {
        const locations = JSON.parse(locationsData)
        if (locations && locations.length > 0) {
          locationId = locations[0].id
          console.warn("FALLBACK: Using first location ID from JSON data:", locationId)
          return locationId
        }
      }
    } catch (error) {
      console.log("Error parsing locations JSON:", error)
    }

    console.error("Location ID not found in any source")
    return null
  }

  getCurrentLocationData() {
    console.log("=== DEBUGGING LOCATION DATA EXTRACTION ===")

    // PRIMARY METHOD: Get from dropdown button texts (most reliable)
    const countryDropdown = document.querySelector('[data-dropdown-type-value="country"]')
    const regionDropdown = document.querySelector('[data-dropdown-type-value="region"]')
    const breakDropdown = document.querySelector('[data-dropdown-type-value="break"]')

    console.log("Dropdown elements found:", {
      country: !!countryDropdown,
      region: !!regionDropdown,
      break: !!breakDropdown
    })

    if (countryDropdown && regionDropdown && breakDropdown) {
      const countryButton = countryDropdown.querySelector('[data-dropdown-target="button"]')
      const regionButton = regionDropdown.querySelector('[data-dropdown-target="button"]')
      const breakButton = breakDropdown.querySelector('[data-dropdown-target="button"]')

      console.log("Dropdown buttons found:", {
        country: !!countryButton,
        region: !!regionButton,
        break: !!breakButton
      })

      if (countryButton && regionButton && breakButton) {
        const country = countryButton.textContent?.trim()
        const region = regionButton.textContent?.trim()
        const breakName = breakButton.textContent?.trim()

        console.log("Dropdown button texts:", { country, region, breakName })

        // Check if all dropdowns have been selected (not showing default text)
        if (country && region && breakName &&
            country !== 'Country' &&
            region !== 'Region' &&
            breakName !== 'Break') {
          console.log("✅ SUCCESS: Found location data from dropdown buttons:", { region, country, break: breakName })
          return { region, country, break: breakName }
        } else {
          console.log("❌ Dropdown buttons have default values or are empty")
          console.log("Checking if we can use break card data when break dropdown is not selected...")

          // If country and region are selected but break is still default,
          // try to get break name from a currently displayed break card
          if (country !== 'Country' && region !== 'Region' && breakName === 'Break') {
            const currentBreakCard = document.querySelector('.break-card')
            if (currentBreakCard) {
              const cardBreakName = currentBreakCard.querySelector('[data-card="break-name"]')?.textContent?.trim()
              if (cardBreakName && cardBreakName !== 'Loading...') {
                console.log("✅ SUCCESS: Using break name from card with dropdown country/region:", {
                  region, country, break: cardBreakName
                })
                return { region, country, break: cardBreakName }
              }
            }
          }
        }
      }
    }

    // SECONDARY METHOD: Try to get location data from the current break card
    const currentBreakCard = document.querySelector('.break-card')
    console.log("Break card found:", !!currentBreakCard)

    if (currentBreakCard) {
      const breakNameEl = currentBreakCard.querySelector('[data-card="break-name"]')
      const regionEl = currentBreakCard.querySelector('[data-card="region"]')
      const countryEl = currentBreakCard.querySelector('[data-card="country"]')

      console.log("Break card elements found:", {
        breakName: !!breakNameEl,
        region: !!regionEl,
        country: !!countryEl
      })

      if (breakNameEl && regionEl && countryEl) {
        const breakName = breakNameEl.textContent?.trim()
        const region = regionEl.textContent?.trim()
        const country = countryEl.textContent?.trim()

        console.log("Break card data:", { region, country, breakName })

        if (breakName && region && country &&
            breakName !== 'Loading...' &&
            region !== '--' &&
            country !== '--') {
          console.log("✅ SUCCESS: Found location data from break card:", { region, country, break: breakName })
          return { region, country, break: breakName }
        } else {
          console.log("❌ Break card has default/loading values")
        }
      }
    }

    // TERTIARY METHOD: Try to get from data attributes on the page
    const regionEl = document.querySelector('[data-location-region]')
    const countryEl = document.querySelector('[data-location-country]')
    const breakEl = document.querySelector('[data-location-break]')

    console.log("Data attribute elements found:", {
      region: !!regionEl,
      country: !!countryEl,
      break: !!breakEl
    })

    if (regionEl && countryEl && breakEl) {
      const locationData = {
        region: regionEl.dataset.locationRegion,
        country: countryEl.dataset.locationCountry,
        break: breakEl.dataset.locationBreak
      }
      console.log("✅ SUCCESS: Found location data from data attributes:", locationData)
      return locationData
    }

    // FALLBACK METHOD: Try to get from saved locations data
    try {
      const saveLocationElement = document.querySelector('[data-controller*="save-location"]')
      console.log("Save location element found:", !!saveLocationElement)

      if (saveLocationElement && saveLocationElement.dataset.saveLocationLocationsValue) {
        const locations = JSON.parse(saveLocationElement.dataset.saveLocationLocationsValue)
        console.log("Saved locations data:", locations)

        if (locations && locations.length > 0) {
          const firstLocation = locations[0]
          if (firstLocation.region && firstLocation.country && firstLocation.break) {
            console.log("✅ FALLBACK: Using first location from JSON data:", firstLocation)
            return {
              region: firstLocation.region,
              country: firstLocation.country,
              break: firstLocation.break
            }
          }
        }
      }
    } catch (error) {
      console.log("Error parsing locations JSON:", error)
    }

    // DEBUG: List all elements that might contain location data
    console.log("=== DEBUGGING: Available elements on page ===")
    console.log("All dropdown elements:", document.querySelectorAll('[data-dropdown-type-value]'))
    console.log("All break cards:", document.querySelectorAll('.break-card'))
    console.log("All data-card elements:", document.querySelectorAll('[data-card]'))
    console.log("All elements with save-location controller:", document.querySelectorAll('[data-controller*="save-location"]'))

    console.error("❌ FAILED: Location data not found in any source")
    return { region: null, country: null, break: null }
  }

  showSaveSuccess() {
    const saveBtn = document.getElementById('btn-save-forecast')
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
    const saveBtn = document.getElementById('btn-save-forecast')
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

}
