import { Controller } from "@hotwired/stimulus"
import { fetchWeatherApi } from 'openmeteo'

export default class extends Controller {
  static targets = ["button", "menu"]
  static values = { locations: Object, type: String }

  connect() {
    this.locationsData = this.locationsValue
    console.log("Locations structure:", this.locationsData)
    console.log("Countries data:", this.locationsData?.countries)
    console.log("Type of locationsData:", typeof this.locationsData)

    // Store the dropdown type (country, region, break)
    this.dropdownType = this.typeValue
    console.log("Dropdown type:", this.dropdownType)
  }

  async fetchWeatherData(lat, lng, breakName) {
    try {
      const params = {
        "latitude": lat,
        "longitude": lng,
        "hourly": ["wave_height", "swell_wave_height", "swell_wave_direction", "swell_wave_period", "wave_direction", "wave_period"],
        "timezone": "auto",
        "forecast_days": 3
      }
      const url = "https://marine-api.open-meteo.com/v1/marine"
      const responses = await fetchWeatherApi(url, params)

      // Process first location
      const response = responses[0]

      // Attributes for timezone and location
      const utcOffsetSeconds = response.utcOffsetSeconds()
      const timezone = response.timezone()
      const latitude = response.latitude()
      const longitude = response.longitude()

      const hourly = response.hourly()

      // Create weather data structure
      const weatherData = {
        location: {
          latitude,
          longitude,
          timezone,
          utcOffsetSeconds
        },
        hourly: {
          time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())].map(
            (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
          ),
          waveHeight: hourly.variables(0).valuesArray(),
          swellWaveHeight: hourly.variables(1).valuesArray(),
          swellWaveDirection: hourly.variables(2).valuesArray(),
          swellWavePeriod: hourly.variables(3).valuesArray(),
          waveDirection: hourly.variables(4).valuesArray(),
          wavePeriod: hourly.variables(5).valuesArray(),
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

    // Get current conditions (first hour)
    const currentHour = 0
    const now = weatherData.hourly.time[currentHour]
    const currentWaveHeight = weatherData.hourly.waveHeight[currentHour]
    const currentSwellHeight = weatherData.hourly.swellWaveHeight[currentHour]
    const currentWaveDirection = weatherData.hourly.waveDirection[currentHour]
    const currentWavePeriod = weatherData.hourly.wavePeriod[currentHour]
    const currentSwellDirection = weatherData.hourly.swellWaveDirection[currentHour]
    const currentSwellPeriod = weatherData.hourly.swellWavePeriod[currentHour]

    // Get today's max wave height
    const todayMaxWave = Math.max(...weatherData.hourly.waveHeight.slice(0, 24))
    const todayMaxSwell = Math.max(...weatherData.hourly.swellWaveHeight.slice(0, 24))

    // Format direction to compass point
    const getCompassDirection = (degrees) => {
      if (degrees === null || degrees === undefined) return 'N/A'
      const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
      return directions[Math.round(degrees / 22.5) % 16]
    }

    // Format numbers to 1 decimal place
    const formatValue = (value) => {
      return value !== null && value !== undefined ? value.toFixed(1) : 'N/A'
    }

    weatherContainer.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <h6>Current Wave Conditions</h6>
          <p class="mb-1"><strong>Wave Height:</strong> ${formatValue(currentWaveHeight)}m</p>
          <p class="mb-1"><strong>Wave Direction:</strong> ${getCompassDirection(currentWaveDirection)} (${formatValue(currentWaveDirection)}°)</p>
          <p class="mb-1"><strong>Wave Period:</strong> ${formatValue(currentWavePeriod)}s</p>
          <p class="mb-1"><strong>Today's Max:</strong> ${formatValue(todayMaxWave)}m</p>
        </div>
        <div class="col-md-6">
          <h6>Swell Conditions</h6>
          <p class="mb-1"><strong>Swell Height:</strong> ${formatValue(currentSwellHeight)}m</p>
          <p class="mb-1"><strong>Swell Direction:</strong> ${getCompassDirection(currentSwellDirection)} (${formatValue(currentSwellDirection)}°)</p>
          <p class="mb-1"><strong>Swell Period:</strong> ${formatValue(currentSwellPeriod)}s</p>
          <p class="mb-1"><strong>Today's Max Swell:</strong> ${formatValue(todayMaxSwell)}m</p>
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-12">
          <small class="text-muted">
            <i class="fas fa-clock"></i> Updated: ${now.toLocaleTimeString()} (${weatherData.location.timezone})
          </small>
        </div>
      </div>
    `
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

  createBreakCard(breakName, region, country, breakData) {
    const card = document.createElement('div')
    card.className = 'break-card card mb-3'
    card.dataset.lat = breakData.latitude
    card.dataset.lng = breakData.longitude

    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${breakName}</h5>
        <p class="card-text">
          <small class="text-muted">${region}, ${country}</small><br>
          <small class="text-muted">Lat: ${breakData.latitude}</small>
          <small class="text-muted">Lng: ${breakData.longitude}</small>
        </p>
        <div class="weather-info" id="weather-${breakName.replace(/\s+/g, '-')}">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading weather...</span>
          </div>
          <span class="ms-2">Loading weather data...</span>
        </div>
      </div>
    `

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
}
