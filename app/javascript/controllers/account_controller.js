import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="account"
export default class extends Controller {
  static targets = ['Del_btn', 'Rem_btn']

  connect() {
  }

  toggle(event) {
    event.preventDefault()
    let Del_btn = this.Del_btnTarget
    let Rem_btn = this.Rem_btnTarget
    if (Del_btn.classList.contains('d-none')) {
      Del_btn.classList.remove('d-none')
      Rem_btn.innerText = "go back"
    } else {
      Del_btn.classList.add('d-none')
      Rem_btn.innertext = "remove picture"
    }
  }

}
