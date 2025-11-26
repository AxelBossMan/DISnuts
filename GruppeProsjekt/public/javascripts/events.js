document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector(".event-grid");
  const titleEl = document.querySelector("#info h1");

  try {
    const response = await fetch("/api/events");

    if (!response.ok) {
      throw new Error("Server returned " + response.status);
    }

    const payload = await response.json();
    console.log("DATA FROM /api/events:", payload);

    // payload er { events: [...], company_name: ... }
    const events = payload.events || [];
    const companyName = payload.company_name || null;

    // sett tittel
    titleEl.textContent = `${companyName} – events`;

    grid.innerHTML = "";

    if (!events.length) {
      grid.innerHTML = "<p>No events found.</p>";
      return;
    }

    // Render kort
    events.forEach(ev => {
      grid.innerHTML += `
        <div class="event-card" data-event-id="${ev.event_id}">
          <div class="event-title">${ev.event_name}</div>
          <div class="event-meta">
            ${ev.location} · ${new Date(ev.time).toLocaleString("no-NO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </div>
          <div class="event-footer">
            <button class="event-button manage-event" type="button">
              Manage
            </button>
          </div>
        </div>
      `;
    });

    // Klikk på "Manage"
    const buttons = grid.querySelectorAll(".manage-event");
    buttons.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        const ev = events[index];
        localStorage.setItem("selectedEvent", JSON.stringify(ev));
        console.log(ev.id);
        window.location.href = "/";
      });
    });

  } catch (err) {
    console.error("Error loading events page:", err);
    grid.innerHTML = `<p style="color:red;">Could not load events from server.</p>`;
  }


  const returnBtn = document.getElementById("return");
  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      window.location.href = "/";
    });
  }
});

