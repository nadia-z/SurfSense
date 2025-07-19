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

  focusOnCard(event) {
    console.log('we are in focusOnCard now')
    console.log(event.currentTarget)

    const cardsContainer = document.getElementById('break-cards-container')
    console.log(cardsContainer)
    const allCards = cardsContainer.querySelectorAll('.card-body')

    // full information card - to be triggered by selection



    // after selecting card wipe the container and replace with just the selected card
    cardsContainer.innerHTML = ""
    cardsContainer.insertBefore(event.currentTarget.parentElement, null)



  }
}
