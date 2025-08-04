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
    this.showFlowchartWithUpdatedData(event.detail);
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

   showFlowchartWithUpdatedData(data) {
  // Access all the weather values from the data object
    const time = data.time;
    const swellHeight = data.swellHeight;
    console.log("data.swellHeight")
    console.log(data.swellHeight)
    const swellPeriod = data.swellPeriod;
    const swellDirection = data.swellDirection;
    const waveHeight = data.waveHeight;
    const wavePeriod = data.wavePeriod;
    const waveDirection = data.waveDirection;
    const windSpeed = data.windSpeed;
    const windDirection = data.windDirection;
    const temperature = data.temperature;
    const tide = data.tide;

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

          const oldSvg = document.querySelector("svg#flowchart"); // use an ID or class to target it
          if (oldSvg) oldSvg.remove();

          parsedSvg.setAttribute("id", "flowchart");
          document.body.appendChild(parsedSvg);

          let swellGroup = parsedSvg.getElementById("swell-value");
          let waveGroup = parsedSvg.getElementById("wave-value");
          let windGroup = parsedSvg.getElementById("wind-value");
          let timeGroup = parsedSvg.getElementById("time-value");
          console.log("timeGroup")
          console.log(timeGroup)

          createDefs(parsedSvg)
          const edges = parsedSvg.querySelectorAll('[id^="e-"]')
          const nodes = parsedSvg.querySelectorAll('[id^="sn-"], [id^="qsn-"]')

          this.hideAllElements(edges, nodes)
          this.showNodesAndEdges(nodes, parsedSvg, [0, 1, 2, 3])
          this.blurNodes(nodes, [4, 8])
          initializeNodeClickListeners(nodes, edges, parsedSvg, { applyBlur, removeBlur })
          this.updateSwellGroupText(swellGroup, swellHeight, swellPeriod, swellDirection)
          this.updateWaveGroupText(waveGroup, waveHeight, wavePeriod, waveDirection)
          this.updateWindGroupText(windGroup, windSpeed, windDirection)
          this.updateTimeGroupText(timeGroup, time)
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
    // update Group value function needs to be refactored, to stay dry
    // find swellGroup value
    updateSwellGroupText(swellGroup, swellHeight, swellPeriod, swellDirection) {
      if (!swellGroup || swellHeight == null || swellPeriod == null || !swellDirection) return;

      // Find position of original group element
      let originalX = swellGroup.getAttribute("x");
      let originalY = swellGroup.getAttribute("y");

      if (!originalX || !originalY) {
        const bbox = swellGroup.getBBox?.();
        if (bbox) {
          originalX = bbox.x + bbox.width / 2;
          originalY = bbox.y + bbox.height / 2  + 5;
        } else {
          originalX = 110; // fallback value
          originalY = 400;
        }
      }

        const newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newText.setAttribute("id", "swell-value");
        newText.setAttribute("x", originalX);
        newText.setAttribute("y", originalY);
        newText.setAttribute("text-anchor", "middle");
        newText.setAttribute("style", "font-family: 'Self Modern', sans-serif; font-size: 1.5rem; fill: black;");
        newText.textContent = `${swellHeight.toFixed(1)}m ${swellPeriod.toFixed(1)}s ${swellDirection}`;
        console.log("newText")
        console.log(newText)
        swellGroup.parentNode.replaceChild(newText, swellGroup)
  }

   updateWaveGroupText(waveGroup, waveHeight, wavePeriod, waveDirection) {
      if (!waveGroup || waveHeight == null || wavePeriod == null || !waveDirection) return;

      // Find position of original group element
      let originalX = waveGroup.getAttribute("x");
      let originalY = waveGroup.getAttribute("y");

      if (!originalX || !originalY) {
        const bbox = waveGroup.getBBox?.();
        if (bbox) {
          originalX = bbox.x + bbox.width / 2;
          originalY = bbox.y + bbox.height / 2 + 5;
        } else {
          originalX = 110; // fallback value
          originalY = 400;
        }
      }

        const newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newText.setAttribute("id", "wave-value");
        newText.setAttribute("x", originalX);
        newText.setAttribute("y", originalY);
        newText.setAttribute("text-anchor", "middle");
        newText.setAttribute("style", "font-family: 'Self Modern', sans-serif; font-size: 1.5rem; fill: black;");
        newText.textContent = `${waveHeight.toFixed(1)}m ${wavePeriod.toFixed(1)}s ${waveDirection}`;
        console.log("newText")
        console.log(newText)
        waveGroup.parentNode.replaceChild(newText, waveGroup)
  }

    updateWindGroupText(windGroup, windSpeed, windDirection) {
      if (!windGroup || windSpeed == null || !windDirection) return;

      // Find position of original group element
      let originalX = windGroup.getAttribute("x");
      let originalY = windGroup.getAttribute("y");

      if (!originalX || !originalY) {
        const bbox = windGroup.getBBox?.();
        if (bbox) {
          originalX = bbox.x + bbox.width / 2;
          originalY = bbox.y + bbox.height / 2 + 5;
        } else {
          originalX = 110; // fallback value
          originalY = 400;
        }
      }

        const newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newText.setAttribute("id", "wind-value");
        newText.setAttribute("x", originalX);
        newText.setAttribute("y", originalY);
        newText.setAttribute("text-anchor", "middle");
        newText.setAttribute("style", "font-family: 'Self Modern', sans-serif; font-size: 1.5rem; fill: black;");
        // newText.textContent = `${windSpeed.toFixed(1)}km/h ${windDirection}`;
        newText.textContent = "to be updated";
        console.log("newText")
        console.log(newText)
        windGroup.parentNode.replaceChild(newText, windGroup)
  }

     updateTimeGroupText(timeGroup, time) {
      if (!timeGroup || time == null) return;

      // Find position of original group element
      let originalX = timeGroup.getAttribute("x");
      let originalY = timeGroup.getAttribute("y");

      if (!originalX || !originalY) {
        const bbox = timeGroup.getBBox?.();
        if (bbox) {
          originalX = bbox.x + bbox.width / 2;
          originalY = bbox.y + bbox.height / 2 + 8;
        } else {
          originalX = 110; // fallback value
          originalY = 400;
        }
      }

        const newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newText.setAttribute("id", "time-value");
        newText.setAttribute("x", originalX);
        newText.setAttribute("y", originalY);
        newText.setAttribute("text-anchor", "middle");
        newText.setAttribute("style", "font-family: 'Self Modern', sans-serif; font-size: 1.5rem; fill: black;");
        newText.textContent = `${time}`;
        console.log("newText")
        console.log(newText)
        timeGroup.parentNode.replaceChild(newText, timeGroup)
  }

}
