// HENT VALGT EVENT FRA localStorage
const selectedEventRaw = localStorage.getItem("selectedEvent");

if (selectedEventRaw) {
  try {
    const selectedEvent = JSON.parse(selectedEventRaw);

    // vis event-navn et sted i UI
    const label = document.getElementById("selected-event-label");
    if (label && selectedEvent.event_name) {
      label.textContent = `Managing event: ${selectedEvent.event_name} (${selectedEvent.location})`;
    }

    // hvis du vil, kan du også bruke selectedEvent videre i koden her:
    // - preutfylle intro-tekst
    // - lagre event_id når du sender SMS-oppsett til backend
    // osv.

  } catch (e) {
    console.error("Could not parse selectedEvent from localStorage", e);
  }
}



document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#wordTable tbody");
  const addBtn = document.getElementById("addRowBtn");
  const sendBtn = document.getElementById("sendSMSBtn");
  const saveBtn = document.getElementById("saveSMSBtn");
  const introInput = document.getElementById("messageInput");
  const phoneMessages = document.getElementById("phoneMessages");
  //const returnEvent = document.getElementById("return");

  
  // global payload som både preview og send kan bruke
  let payload = { intro: "", keywords: {} };

  // iPhone-preview
  function buildPreview() {
    const intro = introInput.value.trim();
    const rows = document.querySelectorAll("#wordTable tbody tr");

    let html = "";

    // label øverst
    html += `
      <div class="phone-bubble system">
        SCHEDULED MESSAGE PREVIEW
      </div>
    `;

    const introText = intro || "";

   
    const pairs = {};

    rows.forEach((row) => {
      const wordInput = row.querySelector("input.word-input");
      const answerInput = row.querySelector("input.answer-input");

      if (!wordInput || !answerInput) return;

      const w = wordInput.value.trim();
      const a = answerInput.value.trim();

      if (w && a) {
        pairs[w.toUpperCase()] = a;   
      }
    });


    payload = {
      intro,
      keywords: pairs,
    };

    console.log("payload:", payload);

    const words = Object.keys(pairs);

    if (words.length > 0) {
      let listHTML = "<br><br>Available keywords:<br>";

      words.forEach((word) => {
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


  function addRow() {
    const row = document.createElement("tr");

    // Word input
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

    // minus-knapp
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
    wordInput.focus();

    buildPreview();
  }

  // events
  addBtn.addEventListener("click", addRow);
  introInput.addEventListener("input", buildPreview);

  // Enter i et inputfelt = legg til ny rad
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const target = e.target;
      if (
        target.tagName.toLowerCase() === "input" &&
        (target.classList.contains("word-input") ||
          target.classList.contains("answer-input"))
      ) {
        e.preventDefault();
        addRow();
      }
    }
  });

  // Send-knappen
  sendBtn.addEventListener("click", async () => {
    const response = await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      alert("Message sent! SID: " + result.sid);
    } else {
      alert("Error: " + result.error);
    }
  });

  saveBtn.addEventListener("click", async () => {
    console.log("Saving payload:", payload);

      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        alert("Saved!");
      } else {
        alert("Save failed: " + (result.error || "unknown"));
      }
  });


  // første preview
  buildPreview();
});

document.getElementById("return").addEventListener("click", () => {
  window.location.href = "/events";
});