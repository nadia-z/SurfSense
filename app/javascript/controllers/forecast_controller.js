import { Controller } from "@hotwired/stimulus"
import { createDefs, applyBlur, removeBlur, addPaddingRect } from "../flowchart_effects"
import { initializeNodeClickListeners } from "../flowchart_interactions"
import { findAnswerToSwellHeight, updateSwellAnswer } from "../swell_height_answers";

// Connects to data-controller="forecast"
export default class extends Controller {
  static targets = ["card"]

  connect() {
    console.log("Forecast controller connected")
  }

  selectCard(event) {
    event.preventDefault()
    const selectedCard = this.cardTarget
    // Placeholder for logic
  }

  toggleLongForecastInfo(event) {
    const forecastContainer = document.getElementById("forecast-container")
    console.log("we are in toggleForecastInfo now")
    forecastContainer.style.display = "grid"

    const buttonBack = document.getElementById("btn-back")
     if (buttonBack) {
       buttonBack.style.display = "block"
     }
  }

  focusOnCard(event) {
    console.log("we are in focusOnCard now")
    const cardsContainer = document.getElementById("break-cards-container")
    cardsContainer.innerHTML = ""
    cardsContainer.insertBefore(event.currentTarget.parentElement, null)

    this.toggleLongForecastInfo(event)
    this.deactivateClickFunctionalities(event)
  }

  deactivateClickFunctionalities() {
    //I want to deactivate the card click functionalities in order to click on other buttons in the card
    // without triggering the 'focusOnCard' function
    // Find ALL elements with this action and remove the data-action attribute
    const elementToDeactivate = document.querySelector('#card-template')
    elementToDeactivate.removeAttribute('data-action')

    console.log('DONE - Deactivated')
  }

  switchToFlowChart(event) {
    event.preventDefault()

    // Find the parent .break-card element
    const breakCard = this.element.closest('.break-card');
    // remove the parent element so that only the flowchart remains visible
    if (breakCard) {
      breakCard.remove();
    }
    const forecastContainer = document.getElementById("forecast-container")
    const flowchartContainer = document.getElementById("flowchart-container")
    const svgContainer = document.getElementById("svg-container")

    // Reset flowchart visuals
    svgContainer.innerHTML = ""
    flowchartContainer.dataset.loaded = "false"

    // Read updated forecast values
    const swellHeightEl = document.querySelector('[data-weather="swell-height"]')
    const swellHeight = parseFloat(swellHeightEl?.dataset.swellHeight || "0")

    // Dispatch updated data
    document.dispatchEvent(new CustomEvent("swell:updated", {
      detail: { swellHeight }
    }))

    const timeLabel = event.currentTarget.innerText.trim()


    forecastContainer.style.display = "none"
    flowchartContainer.style.display = "block"

    if (flowchartContainer.dataset.loaded === "true") return

    fetch("/flowchart.svg")
      .then(res => res.text())
      .then(svgText => {
        svgContainer.innerHTML = svgText
        flowchartContainer.dataset.loaded = "true"
        const svg = document.querySelector("svg")

        createDefs(svg)
        const edges = svg.querySelectorAll('[id^="e-"]')
        const nodes = svg.querySelectorAll('[id^="sn-"], [id^="qsn-"]')
        const swellTextEl = svg.getElementById('swell-height-value')

        this.hideAllElements(edges, nodes)
        this.showNodesAndEdges(nodes, svg, [0, 1, 2, 3])
        this.blurNodes(nodes, [4, 8])
        initializeNodeClickListeners(nodes, edges, svg, { applyBlur, removeBlur })
        this.updateSwellHeightText(swellHeight)
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

  updateSwellHeightText(swellHeight) {
    if (!swellHeight) return
    const newText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    newText.setAttribute("id", "swell-height-value")
    newText.setAttribute("x", "110")
    newText.setAttribute("y", "400")
    newText.setAttribute("fill", "black")
    newText.textContent = "0.6 m"
    swellHeight.parentNode.replaceChild(newText, swellHeight)
  }
}
