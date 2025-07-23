export function createDefs(svg) {
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  // Glow filter
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
    feDropShadow.setAttribute("flood-color", "#f9f8dcff");
    feDropShadow.setAttribute("flood-opacity", "0.9");
    return feDropShadow;
  }

  glowFilter.appendChild(createDropShadow("1", "1"));
  glowFilter.appendChild(createDropShadow("-1", "-1"));
  glowFilter.appendChild(createDropShadow("-1", "1"));
  glowFilter.appendChild(createDropShadow("1", "-1"));
  defs.appendChild(glowFilter);

  // Blur filter
  const blurFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  blurFilter.setAttribute("id", "blur-effect");
  blurFilter.setAttribute("x", "-50%");
  blurFilter.setAttribute("y", "-50%");
  blurFilter.setAttribute("width", "250%");
  blurFilter.setAttribute("height", "250%");

  const feBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
  feBlur.setAttribute("stdDeviation", "8");
  blurFilter.appendChild(feBlur);
  defs.appendChild(blurFilter);

  svg.insertBefore(defs, svg.firstChild);
}

export function applyBlur(node) {
  node.setAttribute("filter", "url(#blur-effect)");
  node.style.pointerEvents = "none";
}

export function removeBlur(node) {
  node.removeAttribute("filter");
  node.style.pointerEvents = "auto";
}

export function addPaddingRect(node, padding = 20) {
  const bbox = node.getBBox();

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", bbox.x - padding);
  rect.setAttribute("y", bbox.y - padding);
  rect.setAttribute("width", bbox.width + padding * 2);
  rect.setAttribute("height", bbox.height + padding * 2);
  rect.setAttribute("fill", "transparent");
  rect.setAttribute("pointer-events", "all");

  node.insertBefore(rect, node.firstChild);
}
