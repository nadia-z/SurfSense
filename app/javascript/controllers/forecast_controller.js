import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="forecast"
export default class extends Controller {
  static targets = ["card"]
  connect() {
    console.log('Forecast controller connected')
  }

  selectCard(event) {
    event.preventDefault()
    const selectedCard = this.cardTarget

  }

  toggleLongForecastInfo(event) {
    // toggle long form forecast info in break-card
    const forecastContainer = document.getElementById('forecast-container')
    console.log('we are in toggleForecastInfo now')
    console.log(forecastContainer)
    forecastContainer.style.display = "grid"
    // show button 'back to All Region' when expanding break-card
    const buttonBack = document.getElementById('btn-back')
    buttonBack.style.display = "block"
    // toggle button 'Save break' to save location/create instance of model 'Locations'


  }

  focusOnCard(event) {
    console.log('we are in focusOnCard now')
    console.log(event.currentTarget)

    const cardsContainer = document.getElementById('break-cards-container')

    // after selecting card wipe the container and replace with just the selected card
    cardsContainer.innerHTML = ""
    cardsContainer.insertBefore(event.currentTarget.parentElement, null)

    this.toggleLongForecastInfo(event)


  }

  switchToFlowChart(event) {

  }
}
