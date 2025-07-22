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
        const swellHeight = svg.getElementById('swell-height-value');

        hideAllElements(edges, nodes);
        showNodesAndEdges(nodes, svg, [0, 1, 2, 14]);
        blurNodes(nodes, [3, 4, 15]);
        initializeNodeClickListeners(nodes, edges, svg);
        updateSwellHeightText(swellHeight);

        function createDefs(svg) {
          const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

          const glowFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
          glowFilter.setAttribute("id", "glow");
          glowFilter.setAttribute("x", "-50%");
          glowFilter.setAttribute("y", "-50%");
          glowFilter.setAttribute("width", "250%");
          glowFilter.setAttribute("height", "250%");

          const feMorphology = document.createElementNS("http://www.w3.org/2000/svg", "feMorphology");
          feMorphology.setAttribute("operator", "dilate");
          feMorphology.setAttribute("radius", "3");
          glowFilter.appendChild(feMorphology);

          function createDropShadow(dx, dy) {
            const feDropShadow = document.createElementNS("http://www.w3.org/2000/svg", "feDropShadow");
            feDropShadow.setAttribute("dx", dx);
            feDropShadow.setAttribute("dy", dy);
            feDropShadow.setAttribute("stdDeviation", "1");
            feDropShadow.setAttribute("flood-color", "#d7fafcff");
            feDropShadow.setAttribute("flood-opacity", "0.9");
            return feDropShadow;
          }

          glowFilter.appendChild(createDropShadow("1", "1"));
          glowFilter.appendChild(createDropShadow("-1", "-1"));
          glowFilter.appendChild(createDropShadow("-1", "1"));
          glowFilter.appendChild(createDropShadow("1", "-1"));
          defs.appendChild(glowFilter);

          const blurFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
          blurFilter.setAttribute("id", "blur-effect");
          const feBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
          feBlur.setAttribute("stdDeviation", "8");
          blurFilter.appendChild(feBlur);
          defs.appendChild(blurFilter);

          svg.insertBefore(defs, svg.firstChild);
        }

        function hideAllElements(edges, nodes) {
          edges.forEach(edge => {
            edge.style.visibility = "hidden";
            edge.setAttribute("stroke-width", "1");
            edge.setAttribute("stroke", "white");
          });
          nodes.forEach(node => (node.style.visibility = "hidden"));
        }

        function showNodesAndEdges(nodes, svg, nodeIndices) {
          nodeIndices.forEach(index => {
            const node = nodes[index];
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
        }

        function blurNodes(nodes, nodeIndices) {
          nodeIndices.forEach(index => {
            const node = nodes[index];
            if (!node) return;

            node.style.visibility = "visible";
            node.setAttribute("filter", "url(#blur-effect)");
            node.style.pointerEvents = "none";
          });
        }

        function initializeNodeClickListeners(nodes, edges, svg) {
          const revealedNodes = new Set();

          let lastClickedTextElement = null;
          let lastGlowClone = null;
          let highlightedEdges = [];

          nodes.forEach(node => {
            node.style.cursor = "pointer";

            node.addEventListener("click", () => {
              const nodeId = node.id.replace(/^q?sn-/, "");

              if (lastGlowClone) {
                lastGlowClone.remove();
                lastGlowClone = null;
              }
              if (lastClickedTextElement) {
                const tag = lastClickedTextElement.tagName.toLowerCase();
                lastClickedTextElement.setAttribute("fill", tag === "text" ? "black" : "white");
              }

              revealedNodes.forEach(revealedId => {
                const revealedNode = svg.getElementById(revealedId);
                if (!revealedNode) return;
                const element = revealedNode.querySelector("path, text");
                if (element) element.setAttribute("fill", "white");
              });

              highlightedEdges.forEach(edge => {
                edge.setAttribute("stroke", "white");
                edge.setAttribute("stroke-width", "1");
              });
              highlightedEdges = [];

              const target = node.querySelector("path, text");
              if (target) {
                const glowClone = target.cloneNode(true);
                glowClone.setAttribute("fill", "#d7fafcff");
                glowClone.setAttribute("filter", "url(#glow)");
                glowClone.style.pointerEvents = "none";
                target.parentNode.insertBefore(glowClone, target);

                target.setAttribute("fill", "black");
                target.removeAttribute("filter");

                lastGlowClone = glowClone;
                lastClickedTextElement = target;
              }

              edges.forEach(edge => {
                const [_, fromId, toId] = edge.id.split("-");

                if (fromId === nodeId) {
                  edge.style.visibility = "visible";
                  edge.setAttribute("stroke", "#82f1f7ff");
                  edge.setAttribute("stroke-width", "1");
                  highlightedEdges.push(edge);

                  const nextNode = svg.getElementById(`sn-${toId}`) || svg.getElementById(`qsn-${toId}`);
                  if (nextNode) {
                    nextNode.style.visibility = "visible";
                    nextNode.removeAttribute("filter");
                    nextNode.querySelector("path, text").setAttribute("fill", "#82f1f7ff");
                    nextNode.style.pointerEvents = "auto";

                    revealedNodes.add(nextNode.id);
                  }

                  const teasedEdges = svg.querySelectorAll(`[id^="e-${toId}-"]`);
                  teasedEdges.forEach(tEdge => {
                    tEdge.style.visibility = "visible";
                    const teasedId = tEdge.id.split("-")[2];
                    const teasedNode = svg.getElementById(`sn-${teasedId}`) || svg.getElementById(`qsn-${teasedId}`);

                    if (teasedNode) {
                      teasedNode.style.visibility = "visible";
                      if (!revealedNodes.has(teasedNode.id)) {
                        teasedNode.setAttribute("filter", "url(#blur-effect)");
                        teasedNode.style.pointerEvents = "none";
                      }
                    }
                  });
                }
              });
            });
          });
        }

        function updateSwellHeightText(swellHeight) {
          if (!swellHeight) return;
          const newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
          newText.setAttribute("id", "swell-height-value");
          newText.setAttribute("x", "110");
          newText.setAttribute("y", "400");
          newText.setAttribute("fill", "black");
          newText.textContent = "0.6 m";
          swellHeight.parentNode.replaceChild(newText, swellHeight);
        }
      });
  });
});
