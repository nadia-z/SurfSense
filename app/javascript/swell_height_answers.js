const answers = [
  "The swell might be too small to be surfable.",
  "These waves are typically gentle, with a slow breaking motion. They offer a good balance of challenge and safety for beginners.",
  "Some beginners might be comfortable with waves in this range, especially if they have some prior experience or good swimming skills. However, it's important to assess your comfort level and be aware that these waves can be a bit more powerful.",
  "Waves of this size are usually considered too big for beginners, as they can be difficult to manage and potentially dangerous.",
  "Generally waves of this size are recommended for intermediate surfers, and even experienced  beginners might find  them challenging."];

export function findAnswerToSwellHeight(swellHeight) {
  if (swellHeight >= 0 && swellHeight <= 0.3) {
    return answers[0];
  } else if (swellHeight > 0.3 && swellHeight <= 0.6) {
    return answers[1];
  } else if (swellHeight > 0.6 && swellHeight <= 0.9) {
    return answers[2];
  } else if (swellHeight > 0.9 && swellHeight <= 1.2) {
    return answers[3];
  } else if (swellHeight > 1.2 && swellHeight <= 1.7) {
    return answers[4];
  } else {
    return answers[5];
  }
}

export function updateSwellHeightAnswer(swellHeightAnswer, swellHeight) {
  if (!swellHeightAnswer) return;
  const answerText = findAnswerToSwellHeight(swellHeight);
  if (!answerText) return;

  const newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  newText.setAttribute("id", "swell-height-answer");
  newText.setAttribute("x", "110");
  newText.setAttribute("y", "420"); // adjust as needed
  newText.setAttribute("fill", "black");
  newText.textContent = answerText;

  swellHeightAnswer.parentNode.replaceChild(newText, swellHeightAnswer);
}
