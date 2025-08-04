  import { Controller } from "@hotwired/stimulus"
  import { createDefs, applyBlur, removeBlur, addPaddingRect } from "../flowchart_effects"
  import { initializeNodeClickListeners } from "../flowchart_interactions"
  import { findAnswerToSwellHeight, updateSwellHeightAnswer } from "../swell_height_answers";

  // Connects to data-controller="forecast"
  export default class extends Controller {
    static targets = ["card"]

    connect() {
    console.log("Forecast controller connected");

    document.addEventListener("timeSlot:selected", (event) => {
      const { swellHeight } = event.detail;
      this.showFlowchartWithUpdatedData(swellHeight);
    });
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

    showFlowchartWithUpdatedData(swellHeight) {

        const breakCardContainer = document.getElementById("break-cards-container");
        if (breakCardContainer) {
          breakCardContainer.innerHTML = ""; // clear cards
          breakCardContainer.style.display = "none";
        }


      fetch("/flowchart.svg")
        .then(res => res.text())
        .then(svgText => {
          console.log("fetching svg")
          const parser = new DOMParser()
          const svgDoc = parser.parseFromString(svgText, "image/svg+xml")
          const parsedSvg = svgDoc.documentElement

          const svg = document.querySelector("svg")
          document.body.appendChild(parsedSvg);

          let swellHeightEl = svg.getElementById("swell-value");

          createDefs(parsedSvg)
          const edges = parsedSvg.querySelectorAll('[id^="e-"]')
          const nodes = parsedSvg.querySelectorAll('[id^="sn-"], [id^="qsn-"]')

          this.hideAllElements(edges, nodes)
          this.showNodesAndEdges(nodes, parsedSvg, [0, 1, 2, 3])
          this.blurNodes(nodes, [4, 8])
          initializeNodeClickListeners(nodes, edges, parsedSvg, { applyBlur, removeBlur })
          this.updateSwellHeightText(swellHeightEl, swellHeight)
          console.log("swellHeight is:")
          console.log(swellHeight)
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


    updateSwellHeightText(swellHeightEl, swellHeight) {
    if (!swellHeightEl || !swellHeight) return;
    const newText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    newText.setAttribute("id", "swell-value")
    newText.setAttribute("x", "110")
    newText.setAttribute("y", "400")
    newText.setAttribute("style", "font-family: 'Self Modern', sans-serif; font-size: 1.4rem; fill: black;");
    newText.textContent = `${swellHeight.toFixed(1)} m`;
    console.log("newText")
    console.log(newText)
    swellHeightEl.parentNode.replaceChild(newText, swellHeightEl)
  }

  }
