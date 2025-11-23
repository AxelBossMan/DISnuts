document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#wordTable tbody");
  const addBtn = document.getElementById("addRowBtn");
  const sendBtn = document.getElementById("sendSMSBtn");
  const introInput = document.getElementById("messageInput");
  const phoneMessages = document.getElementById("phoneMessages");

 
  function buildPreview() {
    const intro = introInput.value.trim();
    const rows = document.querySelectorAll("#wordTable tbody tr");

    let html = "";

    //label
    html += `
      <div class="phone-bubble system">
        Scheduled message preview <br>
      </div>
    `;

    //intro text mesaage 
    const introText = intro;

    // get all of the words and answers
    const pairs = [];
      rows.forEach((row) => {
        const wordInput = row.querySelector("input.word-input");
        if (!wordInput) return;

        const w = wordInput.value.trim();
        if (w) {
          pairs.push(w.toUpperCase());
        }
      });

      if (pairs.length > 0) {
        let listHTML = "<br><br>Available keywords:<br>";
      
        pairs.forEach((word) => {
          listHTML += `• ${word}<br>`;
        });
      
        html += `
          <div class="phone-bubble user">
            ${introText.replace(/\n/g, "<br>")}
            ${listHTML}
          </div>
        `;
      } else {

        html += `
          <div class="phone-bubble user">
            ${introText.replace(/\n/g, "<br>")}<br>
            
          </div>
        `;
      }

    phoneMessages.innerHTML = html;
  }

  // make a new row
  function addRow() {
    const row = document.createElement("tr");

    //word input
    const wordCell = document.createElement("td");
    const wordInput = document.createElement("input");
    wordInput.type = "text";
    wordInput.placeholder = "Word";
    wordInput.className = "word-input";
    wordInput.style.padding = "6px";
    wordInput.addEventListener("input", buildPreview);
    wordCell.appendChild(wordInput);

    // Answer input
    const answerCell = document.createElement("td");
    const answerInput = document.createElement("input");
    answerInput.type = "text";
    answerInput.placeholder = "Answer";
    answerInput.className = "answer-input";
    answerInput.style.padding = "6px";
    answerInput.addEventListener("input", buildPreview);
    answerCell.appendChild(answerInput);

    // minus button
    const minusCell = document.createElement("td");
    const subtract = document.createElement("button");
    subtract.textContent = "–";
    subtract.style.padding = "6px";
    subtract.style.marginLeft = "5px";
    subtract.style.backgroundColor = "rgb(255,182,193)";
    subtract.style.cursor = "pointer";

    subtract.addEventListener("click", () => {
      row.remove();
      buildPreview();
    });

    minusCell.appendChild(subtract);

    row.appendChild(wordCell);
    row.appendChild(answerCell);
    row.appendChild(minusCell);

    tableBody.appendChild(row);
    buildPreview();
  }

  //connect the ecents
  addBtn.addEventListener("click", addRow);
  introInput.addEventListener("input", buildPreview);

  sendBtn.addEventListener("click", async () => {
    const response = await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      alert("Message sent! SID: " + result.sid);
    } else {
      alert("Error: " + result.error);
    }
  });

  buildPreview();
});
