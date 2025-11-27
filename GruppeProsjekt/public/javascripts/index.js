let currentEventId = null;
let selectedEventRaw = null;  

document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("/api/events/setSelectedEvent");
  data = await response.json();
  console.log("Fetched selected event from session:", data);
  selectedEventRaw = data.event

    if (selectedEventRaw) {
      try {
        const selectedEvent = selectedEventRaw;
        console.log("Parsed selectedEvent:", selectedEvent);
        currentEventId = selectedEvent.event_id;

        const label = document.getElementById("selected-event-label");
        if (label && selectedEvent.event_name) {
          label.textContent = ` ${selectedEvent.event_name} (${selectedEvent.location})`;
        }

    } catch (e) {
      console.error("Could not parse selectedEvent from localStorage", e); //endre dette ???????????????????+
    }
  }
});





document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector("#wordTable tbody");
  const addBtn = document.getElementById("addRowBtn");
  const sendBtn = document.getElementById("sendSMSBtn");
  const saveBtn = document.getElementById("saveSMSBtn");
  const introInput = document.getElementById("messageInput");
  const phoneMessages = document.getElementById("phoneMessages");
  //const returnEvent = document.getElementById("return");
  const generateBtn = document.getElementById("generate");

  const scheduleSelect = document.getElementById("scheduleSelect");
  const customSchedule = document.getElementById("customSchedule");

    scheduleSelect.addEventListener("change", () => {
      if (scheduleSelect.value === "custom") {
        customSchedule.style.display = "block";
      } else {
        customSchedule.style.display = "none";
      }
    });
  // global payload som både preview og send kan bruke
  let payload = { intro: "", keywords: {} };

  // iPhone-preview
  function buildPreview() {
    const intro = introInput.value.trim();

    // Auto-resize the textarea to fit content
    try {
      introInput.style.height = 'auto';
      introInput.style.height = introInput.scrollHeight + 'px';
    } catch (e) {
      // ignore if introInput is not a textarea or style can't be set
    }
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

    // payload objektet med melding + keyworrs å sceduling tid
    payload = {
      intro,
      keywords: pairs,
      schedule: null,
    };

    // console.log("payload:", payload);

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


  function addRow(wordValue="",answerValue="") {
    const row = document.createElement("tr");

    // Word input
    const wordCell = document.createElement("td");
    const wordInput = document.createElement("input");
    wordInput.type = "text";
    wordInput.placeholder = "Word";
    wordInput.className = "word-input";
    wordInput.style.padding = "6px";
    wordInput.value = wordValue;
    wordInput.addEventListener("input", buildPreview);
    wordCell.appendChild(wordInput);

    // Answer input
    const answerCell = document.createElement("td");
    const answerInput = document.createElement("input");
    answerInput.type = "text";
    answerInput.placeholder = "Answer";
    answerInput.className = "answer-input";
    answerInput.style.padding = "6px";
    answerInput.value = answerValue;
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
    subtract.style.borderRadius = "5px";
    
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
  addBtn.addEventListener("click", () => addRow());
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
    // 1. legg inn schedule i payload
    if (scheduleSelect.value === "custom") {
      // bruker valgt dato/tid
      payload.schedule = customSchedule.value;          // f.eks. "2025-11-24T14:00"
    } else {
      // "now", "1h", "12h", "24h"
      payload.schedule = scheduleSelect.value;
    }

    // 2. legg inn event_id i payload (fra selectedEvent)
    payload.event_id = currentEventId;

    if (!payload.event_id) {
      alert("Error: Missing event_id (no event selected)");
      return;
    }
    console.log("Sending payload:", payload);

    // 3. send til backend
    const response = await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      // nå scheduler vi bare, ikke sender direkte SMS
      alert("Message scheduled!");
    } else {
      alert("Error: " + result.error);
    }
  });

  saveBtn.addEventListener("click", async () => {
    console.log("Saving payload:", payload);

      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({payload, event_id: currentEventId }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Saved!");
      } else {
        alert("Save failed: " + (result.error || "unknown"));
      }
  });

  if (currentEventId) {
    try {
      const res = await fetch(`/api/load?event_id=${currentEventId}`);
      const data = await res.json();

      if (data.success && data.payload) {
        const { intro, keywords } = data.payload;

        // sett intro-tekst i tekstboksen
        introInput.value = intro || "";

        // fyll tabellen med keywords
        const pairs = keywords || {}; // f.eks. { SKI: 'nordmann' }

        Object.entries(pairs).forEach(([word, answer]) => {
          addRow(word, answer);
        });

        // oppdater preview
        buildPreview();
      }
    } catch (err) {
      console.error("Could not load saved payload:", err);
    }
  }


  async function askChatGPT(prompt) {
    const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  // console.log('Svar fra ChatGPT:', data.reply);
  return data.reply; 
  }



  generateBtn.addEventListener("click", async () => {
    // show skeleton loader on intro input while generating
    try {
      introInput.classList.add('skeleton');
      introInput.disabled = true;
      introInput.dataset._prevPlaceholder = introInput.placeholder || '';
      introInput.placeholder = 'Generating...';

      let intro = await askChatGPT(`
    Create a short and engaging reminder SMS message about an upcoming local event. 
    Use the following event information exactly as provided:
    Event name: ${selectedEventRaw.event_name}
    Description: ${selectedEventRaw.event_description}
    Location: ${selectedEventRaw.location}
    Time: ${selectedEventRaw.time}

    Requirements:
    - Write in English
    - Maximum length: 400 characters
    - Must reference ALL the given event information
    - Friendly and inviting tone or match the event description tone
    - Must end with "Reply with ${selectedEventRaw.event_code} + keyword for additional information."
    `)
  
      // apply intro into textarea and trigger preview
      // console.log("intro: ", intro)
      introInput.value = intro || '';
      introInput.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (err) {
      console.error('Error generating intro:', err);
    } finally {
      // remove loader and re-enable input
      introInput.classList.remove('skeleton');
      introInput.disabled = false;
      introInput.placeholder = introInput.dataset._prevPlaceholder || '';
    }
  });
  // første preview
  buildPreview();


});

document.getElementById("return").addEventListener("click", () => {
  window.location.href = "/events";
});
