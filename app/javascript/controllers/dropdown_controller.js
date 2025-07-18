import { Controller } from "@hotwired/stimulus"

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
    }
  }

  populateRegions(selectedCountry) {
    const regionDropdown = document.querySelector('[data-dropdown-type-value="region"]')
    if (!regionDropdown) return

    const regionMenu = regionDropdown.querySelector('[data-dropdown-target="menu"]')
    const regionButton = regionDropdown.querySelector('[data-dropdown-target="button"]')

    // Reset region button
    regionButton.textContent = "Region"

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
    } else {
      breakMenu.innerHTML = '<li><span class="dropdown-item-text text-muted">No breaks available</span></li>'
    }
  }

  populateBreaksForCountry(selectedCountry) {
    const breakDropdown = document.querySelector('[data-dropdown-type-value="break"]')
    if (!breakDropdown) return

    const breakMenu = breakDropdown.querySelector('[data-dropdown-target="menu"]')

    // Get all breaks for all regions in the country
    const allBreaks = []
    const countryData = this.locationsData.countries[selectedCountry] || {}

    Object.values(countryData).forEach(regionData => {
      allBreaks.push(...Object.keys(regionData))
    })

    if (allBreaks.length > 0) {
      breakMenu.innerHTML = allBreaks.map(breakName =>
        `<li><a class="dropdown-item"
                href="#"
                data-value="${breakName}"
                data-action="click->dropdown#selectItem">${breakName}</a></li>`
      ).join('')
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
  }

  getSelectedCountry() {
    const countryDropdown = document.querySelector('[data-dropdown-type-value="country"]')
    if (!countryDropdown) return null

    const countryButton = countryDropdown.querySelector('[data-dropdown-target="button"]')
    return countryButton ? countryButton.textContent.trim() : null
  }
}
