export function initializeNodeClickListeners(nodes, edges, svg, helpers) {

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

        if (fromId === nodeId) {
          edge.style.visibility = "visible";
          edge.setAttribute("stroke", "#F3F1BA");
          edge.setAttribute("stroke-width", "1");
          highlightedEdges.push(edge);

          const nextNode = svg.getElementById(`sn-${toId}`) || svg.getElementById(`qsn-${toId}`);
          if (nextNode) {
            nextNode.style.visibility = "visible";
            nextNode.removeAttribute("filter");
            const target = nextNode.querySelector("path, text");
            if(target) target.setAttribute("fill", "#F3F1BA");
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
