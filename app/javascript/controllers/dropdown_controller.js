import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button", "menu"]

  connect() {
  }

  selectItem(event) {
    event.preventDefault()

    // Get the selected text
    const selectedText = event.target.textContent.trim()

    // Update the button text
    this.buttonTarget.textContent = selectedText

    // Close the dropdown
    this.element.querySelector('.dropdown-toggle').click()
  }
}
