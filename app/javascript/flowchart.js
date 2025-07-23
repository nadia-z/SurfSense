import { createDefs, applyBlur, removeBlur, addPaddingRect } from './flowchart_effects.js';
import { initializeNodeClickListeners } from './flowchart_interactions.js';

document.addEventListener("DOMContentLoaded", () => {
  console.log("Flowchart JS loaded");
  const flowchartBtn = document.getElementById("show-flowchart-button");
  const flowchartContainer = document.getElementById("flowchart-container");

  if (!flowchartBtn || !flowchartContainer) return;

  flowchartBtn.addEventListener("click", () => {
    if (flowchartContainer.dataset.loaded === "true") return;

    fetch("/flowchart.svg")
      .then(res => res.text())
      .then(svgText => {
        console.log("SVG fetched");
        flowchartContainer.style.display = "block";
        document.getElementById("svg-container").innerHTML = svgText;
        flowchartContainer.dataset.loaded = "true";

        const svg = document.querySelector("svg");

        createDefs(svg);

        const edges = svg.querySelectorAll('[id^="e-"]');
        const nodes = svg.querySelectorAll('[id^="sn-"], [id^="qsn-"]');

        // Add transparent padding rects for better click areas
        nodes.forEach(node => addPaddingRect(node));

        // Hide everything initially
        edges.forEach(edge => {
          edge.style.visibility = "hidden";
          edge.setAttribute("stroke-width", "1");
          edge.setAttribute("stroke", "#D8E6E7");
        });
        nodes.forEach(node => (node.style.visibility = "hidden"));

        // Show some initial nodes and edges
        [0, 1, 2, 14].forEach(i => {
          const node = nodes[i];
          if (!node) return;
          node.style.visibility = "visible";

          const nodeId = node.id.replace(/^q?sn-/, "");
          const relatedEdges = svg.querySelectorAll(`[id^="e-${nodeId}-"]`);
          relatedEdges.forEach(edge => {
            edge.style.visibility = "visible";

            const toId = edge.id.split("-")[2];
            const teasedNode = svg.getElementById(`sn-${toId}`) || svg.getElementById(`qsn-${toId}`);
            if (teasedNode) teasedNode.style.visibility = "visible";
          });
        });

        // Blur these nodes initially
        [3, 4, 15].forEach(i => {
          const node = nodes[i];
          if (!node) return;
          node.style.visibility = "visible";
          applyBlur(node);
        });

        // Initialize click listeners with helpers
        initializeNodeClickListeners(nodes, edges, svg, { applyBlur, removeBlur });
      });
  });
});
