const btn = document.getElementById("checkBtn");
const input = document.getElementById("userInput");
const result = document.getElementById("result");
const API_URL = "https://api.languagetool.org/v2/check";

btn.addEventListener("click", async () => {
  const original = input.value.trim();

  if (!original) {
    result.innerHTML = "Please enter some text to check.";
    return;
  }

  result.innerHTML = "Analyzing...";
  btn.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `text=${encodeURIComponent(original)}&language=en-US`,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    let corrected = original;

    if (data.matches && data.matches.length > 0) {
      const sortedMatches = [...data.matches].sort(
        (a, b) => b.offset - a.offset
      );

      sortedMatches.forEach((match) => {
        if (match.replacements && match.replacements.length > 0) {
          const replacement = match.replacements[0].value;
          const start = match.offset;
          const end = match.offset + match.length;

          if (replacement && replacement.length > 1 && replacement !== "ie") {
            corrected =
              corrected.substring(0, start) +
              replacement +
              corrected.substring(end);
          }
        }
      });
    }

    // --- Grammar Score ---
    const issueCount = data.matches.length;
    let score = 1;

    if (issueCount === 0) score = 1;
    else if (issueCount <= 1) score = 2;
    else score = 3;

    // --- Score Label ---
    let scoreLabel = "";
    switch (score) {
      case 1:
        scoreLabel = "Grammatically correct!";
        break;
      case 2:
        scoreLabel = "average";
        break;
      case 3:
        scoreLabel = "wrong";
        break;
    }

    // --- Result Output ---
    let resultHTML = `<strong>Grammar Score (1-5):</strong> ${score} (${scoreLabel})<br><br>`;
    resultHTML += `<strong>Original:</strong> ${original}<br>`;
    resultHTML += `<strong>Corrected:</strong> ${corrected}<br>`;

    result.innerHTML = resultHTML;
  } catch (error) {
    console.error("Error:", error);
    result.innerHTML = "❌ Error checking grammar. Please try again.";
  } finally {
    btn.disabled = false;
  }
});
