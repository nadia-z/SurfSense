export function initializeNodeClickListeners(nodes, edges, svg, helpers, swellHeight) {

  const { applyBlur, removeBlur } = helpers;

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
        lastClickedTextElement.setAttribute("fill", tag === "text" ? "black" : "#DEEEEF");
      }

      revealedNodes.forEach(revealedId => {
        const revealedNode = svg.getElementById(revealedId);
        if (!revealedNode) return;
        const element = revealedNode.querySelector("path, text");
        if (element) element.setAttribute("fill", "#DEEEEF");
      });

      highlightedEdges.forEach(edge => {
        edge.setAttribute("stroke", "#D8E6E7");
        edge.setAttribute("stroke-width", "1");
      });
      highlightedEdges = [];

      const target = node.querySelector("path, text");
      if (target) {
        const glowClone = target.cloneNode(true);
        glowClone.setAttribute("fill", "#fbf9dcff");
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

        // normalization so that the conditional nodes for swell that starts
        // with 005-a1 etc can meet condition
        const normalizedNodeId = nodeId.startsWith("005-") ? "005" : nodeId;

        if (fromId === normalizedNodeId) {
          edge.style.visibility = "visible";
          edge.setAttribute("stroke", "#F3F1BA");
          edge.setAttribute("stroke-width", "1");
          highlightedEdges.push(edge);

          let nextNode = svg.getElementById(`sn-${toId}`) || svg.getElementById(`qsn-${toId}`);

          // Handle conditional swell answer nodes
          if (toId === "005") {
            // This is the group for conditional swell answers
            const swellHeightAnswerNodes = [
              svg.getElementById("sn-005-a0"),
              svg.getElementById("sn-005-a1"),
              svg.getElementById("sn-005-a2"),
              svg.getElementById("sn-005-a3"),
              svg.getElementById("sn-005-a4"),
              svg.getElementById("sn-005-a5")
            ];

          // Hide all first
          swellHeightAnswerNodes.forEach(n => {
            if (n) {
              n.style.visibility = "hidden";
              n.setAttribute("filter", "url(#blur-effect)");
              n.style.pointerEvents = "none";
            }
          });

          let index = 5;
          if (swellHeight >= 0 && swellHeight <= 0.3) index = 0;
          else if (swellHeight > 0.3 && swellHeight <= 0.6) index = 1;
          else if (swellHeight > 0.6 && swellHeight <= 0.9) index = 2;
          else if (swellHeight > 0.9 && swellHeight <= 1.2) index = 3;
          else if (swellHeight > 1.2 && swellHeight <= 1.7) index = 4;

          nextNode = swellHeightAnswerNodes[index];

          if (nextNode) {
            nextNode.style.visibility = "visible";
            nextNode.removeAttribute("filter");
            const target = nextNode.querySelector("path, text");
            if (target) target.setAttribute("fill", "#F3F1BA");
            nextNode.style.pointerEvents = "auto";
            revealedNodes.add(nextNode.id);
          }

        } else if (nextNode) {
          // Regular node logic
          nextNode.style.visibility = "visible";
          nextNode.removeAttribute("filter");
          const target = nextNode.querySelector("path, text");
          if (target) target.setAttribute("fill", "#F3F1BA");
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
                applyBlur(teasedNode);
              }
            }
          });
        }
      });
    });
  });
}
