import { Controller } from "@hotwired/stimulus"
import { fetchWeatherApi } from 'openmeteo'

export default class extends Controller {
  static targets = ["button", "menu"]
  static values = { locations: Object, type: String }

  connect() {
    this.locationsData = this.locationsValue
    this.dropdownType = this.typeValue

    // Cache the templates from the DOM
    this.weatherTemplate = document.getElementById('weather-template').innerHTML
    this.cardTemplate = document.getElementById('card-template').innerHTML
  }
// API request snippet from API documentation, add data requests here following documentation
// in case we want to have more information about the forecast

  async fetchWeatherData(lat, lng, breakName) {
    try {
      const params1 = {
        "latitude": lat,
        "longitude": lng,
        "hourly": ["wave_height", "swell_wave_height", "swell_wave_direction", "swell_wave_period", "wave_direction", "wave_period"],
        "timezone": "auto",
        "forecast_days": 3
      }

      const params2 = {
        "latitude": lat,
        "longitude": lng,
        "hourly": ["temperature_2m", "wind_speed_10m", "wind_direction_10m"],
        "timezone": "auto"
      }

      const urlMarine = "https://marine-api.open-meteo.com/v1/marine"
      const urlWeather = "https://api.open-meteo.com/v1/forecast"

      const responses1 = await fetchWeatherApi(urlMarine, params1)
      const responses2 = await fetchWeatherApi(urlWeather, params2)

      // Process first location for each model
      const marineResponse = responses1[0]
      const weatherResponse = responses2[0]

      // Use marineResponse for marine data, weatherResponse for weather data
      // Attributes for timezone and location (use marineResponse for consistency)
      const utcOffsetSeconds = marineResponse.utcOffsetSeconds()
      const timezone = marineResponse.timezone()
      const latitude = marineResponse.latitude()
      const longitude = marineResponse.longitude()

      const marineHourly = marineResponse.hourly()
      const weatherHourly = weatherResponse.hourly()

      // Create weather data structure, merging both marine and weather hourly data
      const weatherData = {
        location: {
          latitude,
          longitude,
          timezone,
          utcOffsetSeconds
        },
        hourly: {
          time: [...Array((Number(marineHourly.timeEnd()) - Number(marineHourly.time())) / marineHourly.interval())].map(
            (_, i) => new Date((Number(marineHourly.time()) + i * marineHourly.interval() + utcOffsetSeconds) * 1000)
          ),
          waveHeight: marineHourly.variables(0).valuesArray(),
          swellWaveHeight: marineHourly.variables(1).valuesArray(),
          swellWaveDirection: marineHourly.variables(2).valuesArray(),
          swellWavePeriod: marineHourly.variables(3).valuesArray(),
          waveDirection: marineHourly.variables(4).valuesArray(),
          wavePeriod: marineHourly.variables(5).valuesArray(),
          // Add weather model data
          temperature_2m: weatherHourly.variables(0).valuesArray(),
          wind_speed_10m: weatherHourly.variables(1).valuesArray(),
          wind_direction_10m: weatherHourly.variables(2).valuesArray(),
        },
      }

      this.displayWeatherData(weatherData, breakName)
    } catch (error) {
      console.error('Error fetching weather data:', error)
      this.displayWeatherError(breakName)
    }
  }

  displayWeatherData(weatherData, breakName) {
    const weatherContainer = document.getElementById(`weather-${breakName.replace(/\s+/g, '-')}`)
    if (!weatherContainer) return

    // Get current conditions (same calculation code as before)
    const currentHour = 0
    const now = weatherData.hourly.time[currentHour]
    const currentWaveHeight = weatherData.hourly.waveHeight[currentHour]
    const currentSwellHeight = weatherData.hourly.swellWaveHeight[currentHour]
    const currentWaveDirection = weatherData.hourly.waveDirection[currentHour]
    const currentWavePeriod = weatherData.hourly.wavePeriod[currentHour]
    const currentSwellDirection = weatherData.hourly.swellWaveDirection[currentHour]
    const currentSwellPeriod = weatherData.hourly.swellWavePeriod[currentHour]

    const currentTemperature = weatherData.hourly.temperature_2m[currentHour]
    const currentWindSpeed = weatherData.hourly.wind_speed_10m[currentHour]
    const currentWindDirection = weatherData.hourly.wind_direction_10m[currentHour]

    // Get today's max wave height
    const todayMaxWave = Math.max(...weatherData.hourly.waveHeight.slice(0, 24))
    const todayMaxSwell = Math.max(...weatherData.hourly.swellWaveHeight.slice(0, 24))

    // Helper functions (same as before)
    const getCompassDirection = (degrees) => {
      if (degrees === null || degrees === undefined) return 'N/A'
      const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
      return directions[Math.round(degrees / 22.5) % 16]
    }

    const formatValue = (value) => {
      return value !== null && value !== undefined ? value.toFixed(1) : 'N/A'
    }

    // Use the template instead of inline HTML
    weatherContainer.innerHTML = this.weatherTemplate

    // Populate the data using data attributes, with null checks
    const setText = (selector, value) => {
      const el = weatherContainer.querySelector(selector);
      if (el) el.textContent = value;
    };

    setText('[data-weather="wave-height"]', formatValue(currentWaveHeight));
    setText('[data-weather="wave-direction"]', `${getCompassDirection(currentWaveDirection)} (${formatValue(currentWaveDirection)}°)`);
    setText('[data-weather="wave-period"]', formatValue(currentWavePeriod));
    setText('[data-weather="max-wave"]', formatValue(todayMaxWave));
    setText('[data-weather="swell-height"]', formatValue(currentSwellHeight));
    setText('[data-weather="swell-direction"]', `${getCompassDirection(currentSwellDirection)} (${formatValue(currentSwellDirection)}°)`);
    setText('[data-weather="swell-period"]', formatValue(currentSwellPeriod));
    setText('[data-weather="max-swell"]', formatValue(todayMaxSwell));
    setText('[data-weather="timestamp"]', now.toLocaleTimeString());
    setText('[data-weather="timezone"]', weatherData.location.timezone);
    setText('[data-weather="temperature"]', formatValue(currentTemperature));
    setText('[data-weather="wind-direction"]', `${getCompassDirection(currentWindDirection)} (${formatValue(currentWindDirection)}°)`);
    setText('[data-weather="wind-speed"]', formatValue(currentWindSpeed));

    // hourly forecast
    const forecastTimes = weatherData.hourly.time.map(t => new Date(t))
    const hoursToShow = [6, 9, 12, 15, 18, 21]
    const template = document.getElementById('time-slot-template')
    const timeSlotsContainer = document.querySelector('.time-slots-container')
    timeSlotsContainer.innerHTML = ""

    hoursToShow.forEach(hour => {
      const today = new Date()
      const matchIndex = forecastTimes.findIndex(date =>
        date.getHours() === hour &&
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      )

      if (matchIndex !== -1) {
        const clone = template.content.cloneNode(true)
        const timeStr = forecastTimes[matchIndex].toLocaleTimeString([], { hour: 'numeric', hour12: true });

        // Fill in forecast values
        clone.querySelector('[data-weather="time"]').textContent = timeStr;

        // swell height
        const swellEl = clone.querySelector('[data-weather="swell-height"]');
        const swellValue = weatherData.hourly.swellWaveHeight[matchIndex].toFixed(1);
        // add visible text and dataset attribute, to be able to acces if from other controllers
        swellEl.textContent = swellValue;
        swellEl.dataset.swellHeight = swellValue;

        clone.querySelector('[data-weather="swell-period"]').textContent = weatherData.hourly.swellWavePeriod[matchIndex].toFixed(1);
        clone.querySelector('[data-weather="swell-direction"]').textContent = getCompassDirection(weatherData.hourly.swellWaveDirection[matchIndex]);
        clone.querySelector('[data-weather="wave-height"]').textContent = weatherData.hourly.waveHeight[matchIndex].toFixed(1);
        clone.querySelector('[data-weather="wave-period"]').textContent = weatherData.hourly.wavePeriod[matchIndex].toFixed(1);
        clone.querySelector('[data-weather="wave-direction"]').textContent = getCompassDirection(weatherData.hourly.waveDirection[matchIndex]);

        clone.querySelector('[data-weather="temperature"]').textContent = weatherData.hourly.temperature_2m[matchIndex].toFixed(1);
        clone.querySelector('[data-weather="wind-speed"]').textContent = weatherData.hourly.wind_speed_10m[matchIndex].toFixed(1);
        clone.querySelector('[data-weather="wind-direction"]').textContent =  getCompassDirection(weatherData.hourly.wind_direction_10m[matchIndex]);

        timeSlotsContainer.appendChild(clone)
      }
    })
  }

  displayWeatherError(breakName) {
    const weatherContainer = document.getElementById(`weather-${breakName.replace(/\s+/g, '-')}`)
    if (!weatherContainer) return

    weatherContainer.innerHTML = `
      <div class="alert alert-warning py-2" role="alert">
        <small>Unable to load weather data</small>
      </div>
    `
  }


  createBreakCard(breakName, region, country, breakData) {
    const card = document.createElement('div')
    card.className = 'break-card card mb-3'
    card.dataset.lat = breakData.latitude
    card.dataset.lng = breakData.longitude

    // Use the template instead of inline HTML
    card.innerHTML = this.cardTemplate

    // Populate the card data using data attributes
    card.querySelector('[data-card="break-name"]').textContent = breakName
    card.querySelector('[data-card="region"]').textContent = region
    card.querySelector('[data-card="country"]').textContent = country
    card.querySelector('[data-card="latitude"]').textContent = breakData.latitude
    card.querySelector('[data-card="longitude"]').textContent = breakData.longitude

    // Set the weather container ID
    const weatherContainer = card.querySelector('[data-card="weather-container"]')
    weatherContainer.id = `weather-${breakName.replace(/\s+/g, '-')}`

    // Fetch weather data for this break
    this.fetchWeatherData(breakData.latitude, breakData.longitude, breakName)

    return card
  }



  populateBreaksForCountry(selectedCountry) {
    const breakDropdown = document.querySelector('[data-dropdown-type-value="break"]')
    if (!breakDropdown) return

    const breakMenu = breakDropdown.querySelector('[data-dropdown-target="menu"]')

    // Get all breaks for all regions in the country
    const allBreaks = []
    const countryData = this.locationsData.countries[selectedCountry] || {}

    Object.entries(countryData).forEach(([region, regionData]) => {
      Object.entries(regionData).forEach(([breakName, breakData]) => {
        allBreaks.push({ name: breakName, region: region, data: breakData })
      })
    })

    if (allBreaks.length > 0) {
      breakMenu.innerHTML = allBreaks.map(breakItem =>
        `<li><a class="dropdown-item"
                href="#"
                data-value="${breakItem.name}"
                data-action="click->dropdown#selectItem">${breakItem.name}</a></li>`
      ).join('')

      // Display all breaks as cards
      this.displayAllBreakCards(selectedCountry, allBreaks)
    } else {
      breakMenu.innerHTML = '<li><span class="dropdown-item-text text-muted">No breaks available</span></li>'
    }
  }

  populateRegions(selectedCountry) {
    const regionDropdown = document.querySelector('[data-dropdown-type-value="region"]')
    if (!regionDropdown) return

    const regionMenu = regionDropdown.querySelector('[data-dropdown-target="menu"]')
    const regionButton = regionDropdown.querySelector('[data-dropdown-target="button"]')

    // Reset region button
    regionButton.textContent = "Region"

    // Clear existing cards when country changes
    this.clearBreakCards()

    // Get regions for selected country
    const regions = Object.keys(this.locationsData.countries[selectedCountry] || {})

    if (regions.length > 0) {
      // Check if there are empty regions (auto-populate breaks)
      const hasEmptyRegion = regions.some(region => region === "" || region.trim() === "")

      regionMenu.innerHTML = regions.map(region => {
        const displayText = region === "" || region.trim() === "" ? "All Regions" : region
        return `<li><a class="dropdown-item"
                       href="#"
                       data-value="${region}"
                       data-action="click->dropdown#selectItem">${displayText}</a></li>`
      }).join('')

      // If there's an empty region, auto-populate breaks for the country
      if (hasEmptyRegion) {
        this.populateBreaksForCountry(selectedCountry)
      }
    } else {
      regionMenu.innerHTML = '<li><span class="dropdown-item-text text-muted">No regions available</span></li>'
    }
  }

  populateBreaks(selectedCountry, selectedRegion) {
    const breakDropdown = document.querySelector('[data-dropdown-type-value="break"]')
    if (!breakDropdown) return

    const breakMenu = breakDropdown.querySelector('[data-dropdown-target="menu"]')
    const breakButton = breakDropdown.querySelector('[data-dropdown-target="button"]')

    // Reset break button
    breakButton.textContent = "Break"

    // If region is empty, show all breaks for the country
    if (selectedRegion === "" || selectedRegion.trim() === "" || selectedRegion === "All Regions") {
      this.populateBreaksForCountry(selectedCountry)
      return
    }

    // Get breaks for selected country and region
    const breaks = Object.keys(this.locationsData.countries[selectedCountry]?.[selectedRegion])

    if (breaks.length > 0) {
      breakMenu.innerHTML = breaks.map(breakName =>
        `<li><a class="dropdown-item"
                href="#"
                data-value="${breakName}"
                data-action="click->dropdown#selectItem">${breakName}</a></li>`
      ).join('')

      // Display cards for the breaks in this region
      this.displayBreakCards(selectedCountry, selectedRegion, breaks)
    } else {
      breakMenu.innerHTML = '<li><span class="dropdown-item-text text-muted">No breaks available</span></li>'
    }
  }




  clearBreaks() {
    const breakDropdown = document.querySelector('[data-dropdown-type-value="break"]')
    if (!breakDropdown) return

    const breakMenu = breakDropdown.querySelector('[data-dropdown-target="menu"]')
    const breakButton = breakDropdown.querySelector('[data-dropdown-target="button"]')

    breakButton.textContent = "Break"
    breakMenu.innerHTML = '<li><span class="dropdown-item-text text-muted">Select a region first</span></li>'

    // Clear cards when changing country
    this.clearBreakCards()
  }

  clearBreakCards() {
    const cardsContainer = document.getElementById('break-cards-container')
    if (cardsContainer) {
      cardsContainer.innerHTML = ''
    }
  }



  getSelectedCountry() {
    const countryDropdown = document.querySelector('[data-dropdown-type-value="country"]')
    if (!countryDropdown) return null

    const countryButton = countryDropdown.querySelector('[data-dropdown-target="button"]')
    return countryButton ? countryButton.textContent.trim() : null
  }

  getSelectedRegion() {
    const regionDropdown = document.querySelector('[data-dropdown-type-value="region"]')
    if (!regionDropdown) return null

    const regionButton = regionDropdown.querySelector('[data-dropdown-target="button"]')
    const regionText = regionButton ? regionButton.textContent.trim() : null

    // Handle "All Regions" case
    if (regionText === "All Regions" || regionText === "Region") {
      return null
    }

    return regionText
  }



  displayBreakCards(selectedCountry, selectedRegion, breaks) {
    // Get or create cards container
    let cardsContainer = document.getElementById('break-cards-container')
    if (!cardsContainer) {
      cardsContainer = document.createElement('div')
      cardsContainer.id = 'break-cards-container'
      cardsContainer.className = 'break-cards'

      // Insert after search wrapper
      const searchWrapper = document.querySelector('.search-wrapper')
      if (searchWrapper) {
        searchWrapper.insertAdjacentElement('afterend', cardsContainer)
      }
    }

    // Clear existing cards
    cardsContainer.innerHTML = ''

    // Create cards for each break
    breaks.forEach(breakName => {
      const breakData = this.locationsData.countries[selectedCountry][selectedRegion][breakName]
      const card = this.createBreakCard(breakName, selectedRegion, selectedCountry, breakData)
      cardsContainer.appendChild(card)
    })
  }

  displaySingleBreakCard(selectedCountry, selectedRegion, selectedBreak) {
    // Get or create cards container
    let cardsContainer = document.getElementById('break-cards-container')
    if (!cardsContainer) {
      cardsContainer = document.createElement('div')
      cardsContainer.id = 'break-cards-container'
      cardsContainer.className = 'break-cards'

      // Insert after search wrapper
      const searchWrapper = document.querySelector('.search-wrapper')
      if (searchWrapper) {
        searchWrapper.insertAdjacentElement('afterend', cardsContainer)
      }
    }

    // Clear existing cards
    cardsContainer.innerHTML = ''

    // Find the break data
    let breakData = null
    let actualRegion = selectedRegion

    if (selectedRegion) {
      // Try to find in the specific region
      breakData = this.locationsData.countries[selectedCountry]?.[selectedRegion]?.[selectedBreak]
    } else {
      // Search through all regions if "All Regions" was selected
      const countryData = this.locationsData.countries[selectedCountry] || {}
      for (const [region, regionData] of Object.entries(countryData)) {
        if (regionData[selectedBreak]) {
          breakData = regionData[selectedBreak]
          actualRegion = region
          break
        }
      }
    }

    if (breakData) {
      const card = this.createBreakCard(selectedBreak, actualRegion, selectedCountry, breakData)
      cardsContainer.appendChild(card)
    } else {
      console.error(`Break "${selectedBreak}" not found in ${selectedCountry}`)
    }
  }

  displayAllBreakCards(selectedCountry, allBreaks) {
    // Get or create cards container
    let cardsContainer = document.getElementById('break-cards-container')
    if (!cardsContainer) {
      cardsContainer = document.createElement('div')
      cardsContainer.id = 'break-cards-container'
      cardsContainer.className = 'break-cards'

      // Insert after search wrapper
      const searchWrapper = document.querySelector('.search-wrapper')
      if (searchWrapper) {
        searchWrapper.insertAdjacentElement('afterend', cardsContainer)
      }
    }

    // Clear existing cards
    cardsContainer.innerHTML = ''

    // Create cards for each break
    allBreaks.forEach(breakItem => {
      const card = this.createBreakCard(breakItem.name, breakItem.region, selectedCountry, breakItem.data)
      cardsContainer.appendChild(card)
    })
  }



  selectItem(event) {
    event.preventDefault()
    const selectedText = event.target.textContent.trim()
    this.buttonTarget.textContent = selectedText

    // Check if locations data is available
    if (!this.locationsData || !this.locationsData.countries) {
      console.error("Locations data not available:", this.locationsData)
      return
    }

    // Handle cascading based on dropdown type
    if (this.dropdownType === "country") {
      this.populateRegions(selectedText)
      this.clearBreaks()
    } else if (this.dropdownType === "region") {
      const selectedCountry = this.getSelectedCountry()
      this.populateBreaks(selectedCountry, selectedText)
    } else if (this.dropdownType === "break") {
      const selectedCountry = this.getSelectedCountry()
      const selectedRegion = this.getSelectedRegion()
      this.displaySingleBreakCard(selectedCountry, selectedRegion, selectedText)
    }
  }
}
