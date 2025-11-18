document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#wordTable tbody");
  const addBtn = document.getElementById("addRowBtn");

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

    // Add cells to row
    row.appendChild(wordCell);
    row.appendChild(answerCell);

    // Insert row into table
    tableBody.appendChild(row);
  });
});
