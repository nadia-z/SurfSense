import { Controller } from "@hotwired/stimulus"

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
  }

  switchToFlowChart(event) {
    event.preventDefault()
    console.log("time clicked")

    // Find the parent .break-card element
    const breakCard = this.element.closest('.break-card');

    if (breakCard) {
      breakCard.remove();  // remove the parent element
    }


    const timeLabel = event.currentTarget.innerText.trim()
    const forecastContainer = document.getElementById("forecast-container")
    const flowchartContainer = document.getElementById("flowchart-container")
    const svgContainer = document.getElementById("svg-container")

    forecastContainer.style.display = "none"
    flowchartContainer.style.display = "block"

    if (flowchartContainer.dataset.loaded === "true") return

    fetch("/flowchart.svg")
      .then(res => res.text())
      .then(svgText => {
        svgContainer.innerHTML = svgText
        flowchartContainer.dataset.loaded = "true"
        const svg = document.querySelector("svg")

        this.createDefs(svg)
        const edges = svg.querySelectorAll('[id^="e-"]')
        const nodes = svg.querySelectorAll('[id^="sn-"], [id^="qsn-"]')
        const swellHeight = svg.getElementById('swell-height-value')

        this.hideAllElements(edges, nodes)
        this.showNodesAndEdges(nodes, svg, [0, 1, 2, 14])
        this.blurNodes(nodes, [3, 4, 15])
        this.initializeNodeClickListeners(nodes, edges, svg)
        this.updateSwellHeightText(swellHeight)
      })
  }

  createDefs(svg) {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
    const glowFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
    glowFilter.setAttribute("id", "glow")
    glowFilter.setAttribute("x", "-50%")
    glowFilter.setAttribute("y", "-50%")
    glowFilter.setAttribute("width", "250%")
    glowFilter.setAttribute("height", "250%")

    const feMorphology = document.createElementNS("http://www.w3.org/2000/svg", "feMorphology")
    feMorphology.setAttribute("operator", "dilate")
    feMorphology.setAttribute("radius", "3")
    glowFilter.appendChild(feMorphology)

    const createDropShadow = (dx, dy) => {
      const feDropShadow = document.createElementNS("http://www.w3.org/2000/svg", "feDropShadow")
      feDropShadow.setAttribute("dx", dx)
      feDropShadow.setAttribute("dy", dy)
      feDropShadow.setAttribute("stdDeviation", "1")
      feDropShadow.setAttribute("flood-color", "#b7d4daff")
      feDropShadow.setAttribute("flood-opacity", "0.9")
      return feDropShadow
    }

    glowFilter.appendChild(createDropShadow("1", "1"))
    glowFilter.appendChild(createDropShadow("-1", "-1"))
    glowFilter.appendChild(createDropShadow("-1", "1"))
    glowFilter.appendChild(createDropShadow("1", "-1"))
    defs.appendChild(glowFilter)

    const blurFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
    blurFilter.setAttribute("id", "blur-effect")
    const feBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur")
    feBlur.setAttribute("stdDeviation", "8")
    blurFilter.appendChild(feBlur)
    defs.appendChild(blurFilter)

    svg.insertBefore(defs, svg.firstChild)
  }

  hideAllElements(edges, nodes) {
    edges.forEach(edge => {
      edge.style.visibility = "hidden"
      edge.setAttribute("stroke-width", "1")
      edge.setAttribute("stroke", "#D8E6E7")
    })
    nodes.forEach(node => (node.style.visibility = "hidden"))
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

  initializeNodeClickListeners(nodes, edges, svg) {
    const revealedNodes = new Set()
    let lastClickedTextElement = null
    let lastGlowClone = null
    let highlightedEdges = []

    nodes.forEach(node => {
      node.style.cursor = "pointer"

      node.addEventListener("click", () => {
        const nodeId = node.id.replace(/^q?sn-/, "")

        if (lastGlowClone) lastGlowClone.remove()
        if (lastClickedTextElement)
          lastClickedTextElement.setAttribute("fill", lastClickedTextElement.tagName === "text" ? "black" : "#DEEEEF")

        revealedNodes.forEach(id => {
          const node = svg.getElementById(id)
          const el = node?.querySelector("path, text")
          if (el) el.setAttribute("fill", "#DEEEEF")
        })

        highlightedEdges.forEach(edge => {
          edge.setAttribute("stroke", "#D8E6E7")
          edge.setAttribute("stroke-width", "1")
        })
        highlightedEdges = []

        const target = node.querySelector("path, text")
        if (target) {
          const glowClone = target.cloneNode(true)
          glowClone.setAttribute("fill", "#c5dce1ff")
          glowClone.setAttribute("filter", "url(#glow)")
          glowClone.style.pointerEvents = "none"
          target.parentNode.insertBefore(glowClone, target)

          target.setAttribute("fill", "black")
          target.removeAttribute("filter")

          lastGlowClone = glowClone
          lastClickedTextElement = target
        }

        edges.forEach(edge => {
          const [_, fromId, toId] = edge.id.split("-")
          if (fromId === nodeId) {
            edge.style.visibility = "visible"
            edge.setAttribute("stroke", "#ffffffff")
            edge.setAttribute("stroke-width", "1")
            highlightedEdges.push(edge)

            const nextNode = svg.getElementById(`sn-${toId}`) || svg.getElementById(`qsn-${toId}`)
            if (nextNode) {
              nextNode.style.visibility = "visible"
              nextNode.removeAttribute("filter")
              nextNode.querySelector("path, text").setAttribute("fill", "#ffffffff")
              nextNode.style.pointerEvents = "auto"
              revealedNodes.add(nextNode.id)
            }

            const teasedEdges = svg.querySelectorAll(`[id^="e-${toId}-"]`)
            teasedEdges.forEach(teasedEdge => {
              teasedEdge.style.visibility = "visible"
              const teasedId = teasedEdge.id.split("-")[2]
              const teasedNode = svg.getElementById(`sn-${teasedId}`) || svg.getElementById(`qsn-${teasedId}`)
              if (teasedNode && !revealedNodes.has(teasedNode.id)) {
                teasedNode.style.visibility = "visible"
                teasedNode.setAttribute("filter", "url(#blur-effect)")
                teasedNode.style.pointerEvents = "none"
              }
            })
          }
        })
      })
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
