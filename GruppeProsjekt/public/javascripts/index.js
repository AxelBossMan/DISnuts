document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#wordTable tbody");
  const addBtn = document.getElementById("addRowBtn");
  const saveBtn = document.getElementById("sendSMSBtn");

  addBtn.addEventListener("click", () => {
    const row = document.createElement("tr");

    // Word input
    const wordCell = document.createElement("td");
    const wordInput = document.createElement("input");
    wordInput.type = "text";
    wordInput.placeholder = "Word";
    wordInput.style.padding = "6px";
    wordCell.appendChild(wordInput);

    // Answer input
    const answerCell = document.createElement("td");
    const answerInput = document.createElement("input");
    answerInput.type = "text";
    answerInput.placeholder = "Answer";
    answerInput.style.padding = "6px";
    answerCell.appendChild(answerInput);

    // minus button
    const minusCell = document.createElement("td");
    const subtract = document.createElement("button");

    subtract.textContent = "–";
    subtract.style.padding = "6px";
    subtract.style.marginLeft = "5px";
    subtract.style.marginTop = "10px";
    subtract.style.backgroundColor = "rgb(255,182,193)";
    subtract.style.cursor = "pointer";

    subtract.addEventListener("click", () => {
      row.remove();
    });

    minusCell.appendChild(subtract);

    row.appendChild(wordCell);
    row.appendChild(answerCell);
    row.appendChild(minusCell);

    tableBody.appendChild(row);
  });
  

})

// Send SMS button functionality
document.getElementById("sendSMSBtn").addEventListener("click", async () => {
  // Send POST request to /api/send
  const response = await fetch("/api/send", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      }
  });

  const result = await response.json();

  if (result.success) {
      alert("Message sent! SID: " + result.sid);
  } else {
      alert("Error: " + result.error);
  }
});