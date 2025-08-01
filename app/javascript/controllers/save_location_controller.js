import { Controller } from "@hotwired/stimulus"


export default class extends Controller {
  static targets = ["button", "deleteButton"]
  static values = { locations: Array, type: String }

  connect() {
    // Access locations data through Stimulus values
    this.locationsData = this.locationsValue

    if (this.locationsData && this.locationsData.length > 0) {
      this.visualizeSaved()
    }
  }  // Check if a location is already saved by the current user
  isLocationSaved(breakName, region, country, latitude, longitude) {
    if (!this.locationsData || this.locationsData.length === 0) {
      return false
    }

    return this.locationsData.some(location =>
      location.break === breakName &&
      location.region === region &&
      location.country === country &&
      parseFloat(location.latitude) === parseFloat(latitude) &&
      parseFloat(location.longitude) === parseFloat(longitude)
    )
  }

  // Hide or show heart button based on whether location is saved
  updateHeartButtonVisibility(card, breakName, region, country, latitude, longitude) {
    const heartButton = card.querySelector('.heart-save')
    const deleteButton = card.querySelector('.button-remove')

    if (this.isLocationSaved(breakName, region, country, latitude, longitude)) {
      // Show filled heart and make non-clickable for saved locations
      if (heartButton) {
        const heartIcon = heartButton.querySelector('i')
        if (heartIcon) {
          heartIcon.classList.remove('far', 'fa-heart')
          heartIcon.classList.add('fas', 'fa-heart')
        }
        heartButton.style.pointerEvents = 'none'
        heartButton.style.opacity = '0.7'
        heartButton.setAttribute('title', 'Location already saved')
      }
      // Show delete button for saved locations
      if (deleteButton) {
        deleteButton.style.display = 'inline-block'
      }
    } else {
      // Show empty heart and make clickable for unsaved locations
      if (heartButton) {
        const heartIcon = heartButton.querySelector('i')
        if (heartIcon) {
          heartIcon.classList.remove('fas', 'fa-solid')
          heartIcon.classList.add('far', 'fa-heart')
        }
        heartButton.style.pointerEvents = 'auto'
        heartButton.style.opacity = '1'
        heartButton.setAttribute('title', 'Save location')
      }
      // Hide delete button for unsaved locations
      if (deleteButton) {
        deleteButton.style.display = 'none'
      }
    }
  }

  // Update heart buttons for a specific location across all cards
  updateHeartButtonsForLocation(breakName, region, country, latitude, longitude) {
    // Find all cards with matching location data
    const allCards = document.querySelectorAll('.break-card')

    allCards.forEach(card => {
      const cardBreak = card.querySelector('[data-card="break-name"]')?.textContent
      const cardRegion = card.querySelector('[data-card="region"]')?.textContent
      const cardCountry = card.querySelector('[data-card="country"]')?.textContent
      const cardLat = card.querySelector('[data-card="latitude"]')?.textContent
      const cardLng = card.querySelector('[data-card="longitude"]')?.textContent

      if (cardBreak === breakName &&
          cardRegion === region &&
          cardCountry === country &&
          parseFloat(cardLat) === parseFloat(latitude) &&
          parseFloat(cardLng) === parseFloat(longitude)) {

        const heartButton = card.querySelector('.heart-save')
        if (heartButton) {
          // Show filled heart and make non-clickable for saved locations
          const heartIcon = heartButton.querySelector('i')
          if (heartIcon) {
            heartIcon.classList.remove('far', 'fa-heart')
            heartIcon.classList.add('fas', 'fa-heart')
          }
          heartButton.style.pointerEvents = 'none'
          heartButton.style.opacity = '0.7'
          heartButton.setAttribute('title', 'Location already saved')
        }

        // Show delete button for saved locations
        const deleteButton = card.querySelector('.button-remove')
        if (deleteButton) {
          deleteButton.style.display = 'inline-block'
        }
      }
    })
  }

  // Update the weather template data attribute with current saved locations
  updateWeatherTemplateData() {
    const weatherTemplate = document.getElementById('weather-template')
    if (weatherTemplate) {
      weatherTemplate.dataset.saveLocationLocationsValue = JSON.stringify(this.locationsData)
    }
  }

  saveLocation(event) {
    console.log('saveLocation method triggered')
    console.log('Event type:', event.type)
    console.log('Event target:', event.target)

    event.preventDefault()
    event.stopPropagation()

    console.log('Saving location...')

    // Find the card that contains the clicked button
    const clickedCard = event.target.closest('.break-card')
    if (!clickedCard) {
      alert('Error: Could not find the location card.')
      return
    }

    // Check if the data-card elements exist within this specific card
    const latElement = clickedCard.querySelector('[data-card="latitude"]')
    const longElement = clickedCard.querySelector('[data-card="longitude"]')
    const nameElement = clickedCard.querySelector('[data-card="break-name"]')
    const regionElement = clickedCard.querySelector('[data-card="region"]')
    const countryElement = clickedCard.querySelector('[data-card="country"]')

    console.log('Data card elements found:', {
      latitude: latElement,
      longitude: longElement,
      breakName: nameElement,
      region: regionElement,
      country: countryElement
    })

    if (!latElement || !longElement || !nameElement || !regionElement || !countryElement) {
      alert('Error: Could not find location data in this card. Please select a location first.')
      return
    }

    // Get the location data from the specific card
    const breakLat = latElement.textContent
    const breakLong = longElement.textContent
    const breakName = nameElement.textContent
    const breakRegion = regionElement.textContent
    const breakCountry = countryElement.textContent

    // Check if location is already saved
    if (this.isLocationSaved(breakName, breakRegion, breakCountry, breakLat, breakLong)) {
      console.log('Location already saved, ignoring save request')
      return
    }

    // Check if the hidden input elements exist
    const latInput = document.getElementById('location_latitude')
    const longInput = document.getElementById('location_longitude')
    const breakInput = document.getElementById('location_break')
    const regionInput = document.getElementById('location_region')
    const countryInput = document.getElementById('location_country')

    console.log('Hidden input elements found:', {
      latitude: latInput,
      longitude: longInput,
      break: breakInput,
      region: regionInput,
      country: countryInput
    })

    if (!latInput || !longInput || !breakInput || !regionInput || !countryInput) {
      alert('Error: Could not find hidden form inputs.')
      return
    }

    // I use the ids associated to the form hidden inputs to populate the form
    latInput.value = breakLat
    longInput.value = breakLong
    breakInput.value = breakName
    regionInput.value = breakRegion
    countryInput.value = breakCountry

    console.log('Form populated with:', breakCountry, breakRegion, breakName, breakLat, breakLong)

    this.send(event)
  }

  send(event) {
    event.preventDefault();

    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // Create form data manually
    const formData = new FormData();
    formData.append('location[latitude]', document.getElementById('location_latitude').value);
    formData.append('location[longitude]', document.getElementById('location_longitude').value);
    formData.append('location[break]', document.getElementById('location_break').value);
    formData.append('location[region]', document.getElementById('location_region').value);
    formData.append('location[country]', document.getElementById('location_country').value);

    // create boolean to see if user is logged in
    const isLoggedIn = document.body.dataset.currentUser === "true"
    console.log(isLoggedIn)
    console.log('Sending AJAX request to /locations');

    fetch('/locations', {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "X-CSRF-Token": csrfToken
      },
      body: formData
    })
    .then(response => {
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('Success:', data);

      // Add the new location to the saved locations data (include ID from server response)
      const newLocation = {
        id: data.location_id || data.id, // Server should return the created location ID
        break: document.getElementById('location_break').value,
        region: document.getElementById('location_region').value,
        country: document.getElementById('location_country').value,
        latitude: document.getElementById('location_latitude').value,
        longitude: document.getElementById('location_longitude').value
      }
      this.locationsData.push(newLocation)

      // Update the weather template data attribute for future checks
      this.updateWeatherTemplateData()

      // Update all heart buttons for this location (in case it appears in multiple cards)
      this.updateHeartButtonsForLocation(newLocation.break, newLocation.region, newLocation.country, newLocation.latitude, newLocation.longitude)
    })
    .catch((error) => {
      console.error('Error:', error);
      if(!isLoggedIn) {
        alert('Need to log-in to save location. Please try again.');
      } else {
        alert('Failed to save location. Please try again.');
      }
    });
  }

  deleteLocation(event) {

  }

  visualizeSaved() {
    // Get or create the break cards container (same as dropdown controller uses)
    let cardsContainer = document.getElementById('break-cards-container')
    if (!cardsContainer) {
      cardsContainer = document.createElement('div')
      cardsContainer.id = 'break-cards-container'
      cardsContainer.className = 'break-cards'

      // Insert after search wrapper
      const searchWrapper = document.querySelector('.search-wrapper')
      if (searchWrapper) {
        searchWrapper.insertAdjacentElement('afterend', cardsContainer)
      } else {
        // Fallback: insert after home container
        const homeContainer = document.querySelector('.home-container')
        if (homeContainer) {
          homeContainer.insertAdjacentElement('afterend', cardsContainer)
        }
      }
    }

    // Add a header for saved locations if container is empty
    if (cardsContainer.children.length === 0) {
      const savedHeader = document.createElement('h3')
      savedHeader.textContent = 'Your Saved Locations'
      savedHeader.className = 'saved-locations-header mt-4 mb-3'
      cardsContainer.appendChild(savedHeader)
    }

    // Get the dropdown controller instance to use its methods
    const dropdownElement = document.querySelector('[data-controller="dropdown"]')
    if (dropdownElement) {
      const dropdownController = this.application.getControllerForElementAndIdentifier(
        dropdownElement,
        'dropdown'
      )

      if (dropdownController) {
        // Use the existing createBreakCard method for each saved location
        this.locationsData.forEach((location, index) => {
          const breakData = {
            latitude: location.latitude,
            longitude: location.longitude
          }

          const card = dropdownController.createBreakCard(
            location.break,
            location.region || '',
            location.country || '',
            breakData
          )

          // Show filled heart and make non-clickable for saved locations
          const heartButton = card.querySelector('.heart-save')
          if (heartButton) {
            const heartIcon = heartButton.querySelector('i')
            if (heartIcon) {
              heartIcon.classList.remove('far', 'fa-heart')
              heartIcon.classList.add('fas', 'fa-heart')
            }
            heartButton.style.pointerEvents = 'none'
            heartButton.style.opacity = '0.7'
            heartButton.setAttribute('title', 'Location already saved')
          }

          // Show delete button for saved locations
          const deleteButton = card.querySelector('.button-remove')
          if (deleteButton) {
            deleteButton.style.display = 'inline-block'
          }

          cardsContainer.appendChild(card)
        })
      } else {
        console.error('Could not find dropdown controller instance')
      }
    } else {
      console.error('Could not find dropdown controller element')
    }
  }

  deleteLocation(event) {
    console.log('Delete button clicked - basic implementation')
    event.preventDefault()

    // TODO: Implement delete functionality
    alert('Delete functionality to be implemented')

    console.log('deleteLocation method triggered')
    console.log('Event type:', event.type)
    console.log('Event target:', event.target)

    event.preventDefault()
    event.stopPropagation()

    console.log('Deleting location...')



  }

}


// 1. create partial for button 'save location' using form hidden is button
// 2. in JS take data and organise it so to pass it to my simple_form 'save_location'
// 3. use stimulus target to pass data to my hidden form targetting id of input elements
