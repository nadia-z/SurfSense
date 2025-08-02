import { Controller } from "@hotwired/stimulus"
import { createDefs, applyBlur, removeBlur, addPaddingRect } from "../flowchart_effects"
import { initializeNodeClickListeners } from "../flowchart_interactions"
import { findAnswerToSwellHeight, updateSwellHeightAnswer } from "../swell_height_answers";

// Connects to data-controller="forecast"
export default class extends Controller {
  static targets = ["card"]

  connect() {
<<<<<<< Updated upstream
    console.log("Forecast controller connected")
  }
=======
  console.log("Forecast controller connected");

  document.addEventListener("timeSlot:selected", (event) => {
    const { swellHeight } = event.detail;
    this.showFlowchartWithUpdatedData(swellHeight);
  });
}
>>>>>>> Stashed changes

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

  showFlowchartWithUpdatedData(swellHeight) {
    console.log("Flowchart triggered from time slot");
    console.log("swellHeight passed in:", swellHeight);


    const flowchartContainer = document.getElementById("flowchart-container")
    flowchartContainer.style.display = "block";
    flowchartContainer.style.width = "100%";
    flowchartContainer.style.height = "auto";
    flowchartContainer.style.minHeight = "600px";
    const svgContainer = document.getElementById("svg-container")

     if (flowchartContainer.dataset.loaded === "true") {
    console.log("SVG already loaded, skipping fetch");
    return;
  }

    fetch("/flowchart.svg")
      .then(res => res.text())
      .then(svgText => {
        svgContainer.innerHTML = svgText
        console.log(svgContainer.innerHTML)
        flowchartContainer.dataset.loaded = "true"
        flowchartContainer.style.display = "block"
        const svg = document.querySelector("svg")

        createDefs(svg)
        const edges = svg.querySelectorAll('[id^="e-"]')
        const nodes = svg.querySelectorAll('[id^="sn-"], [id^="qsn-"]')
        const swellTextEl = svg.getElementById('swell-height-value')
        const swellAnswerEl = svg.getElementById('swell-height-answer')

        this.hideAllElements(edges, nodes)
        this.showNodesAndEdges(nodes, svg, [0, 1, 2, 3])
        this.blurNodes(nodes, [4, 8])
        initializeNodeClickListeners(nodes, edges, svg, { applyBlur, removeBlur })
        console.log("swellHeight is:")
        console.log(swellHeight)
        updateSwellHeightAnswer(swellAnswerEl, swellHeight)
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
}
