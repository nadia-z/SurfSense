import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="save-location"
export default class extends Controller {
  static targets = ["button"]
  static values = { locations: Object, type: String }

  connect() {
    // Access locations data through Stimulus values
    this.locationsData = this.locationsValue
  }

  saveLocation(event) {
    console.log('saveLocation method triggered')
    console.log('Event type:', event.type)
    console.log('Event target:', event.target)

    event.preventDefault()
    event.stopPropagation()

    console.log('Saving location...')

    // Check if the data-card elements exist
    const latElement = document.querySelector('[data-card="latitude"]')
    const longElement = document.querySelector('[data-card="longitude"]')
    const nameElement = document.querySelector('[data-card="break-name"]')
    const regionElement = document.querySelector('[data-card="region"]')
    const countryElement = document.querySelector('[data-card="country"]')

    console.log('Data card elements found:', {
      latitude: latElement,
      longitude: longElement,
      breakName: nameElement,
      region: regionElement,
      country: countryElement
    })

    if (!latElement || !longElement || !nameElement || !regionElement || !countryElement) {
      alert('Error: Could not find location data on the page. Please select a location first.')
      return
    }

    // Get the location data from the card
    const breakLat = latElement.textContent
    const breakLong = longElement.textContent
    const breakName = nameElement.textContent
    const breakRegion = regionElement.textContent
    const breakCountry = countryElement.textContent

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

      // Update heart icon - be more specific with selector
      const heartIcon = this.buttonTarget.querySelector("i");
      heartIcon.classList.remove("far");
      heartIcon.classList.add("fas", "fa-solid");
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

}


// 1. create partial for button 'save location' using form hidden is button
// 2. in JS take data and organise it so to pass it to my simple_form 'save_location'
// 3. use stimulus target to pass data to my hidden form targetting id of input elements
