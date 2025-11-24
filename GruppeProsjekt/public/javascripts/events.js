document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.querySelector(".event-grid");
  
    try {
      const response = await fetch("/api/events");
  
      if (!response.ok) {
        throw new Error("Server returned " + response.status);
      }
  
      const events = await response.json();
  
      // tøm grid
      grid.innerHTML = "";
  
      // bygg kort
      events.forEach(ev => {
        grid.innerHTML += `
          <div class="event-card" data-event-id="${ev.event_id}">
            <div class="event-title">${ev.event_name}</div>
            <div class="event-meta">${ev.location} · ${new Date(ev.time).toLocaleDateString()}</div>
            <div class="event-footer">
              <button class="event-button manage-event" type="button">
                Manage
              </button>
            </div>
          </div>
        `;
      });
  
      const buttons = grid.querySelectorAll(".manage-event");
      buttons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
          const ev = events[index]; 
          localStorage.setItem("selectedEvent", JSON.stringify(ev));
          localStorage.setItem("selectedEventId", ev.id);
            console.log(ev.id)
          window.location.href = "/";
        });
      });
  
    } catch (err) {
      console.error(err);
      grid.innerHTML = `<p style="color:red;">Could not load events from server.</p>`;
    }
  
    // return-knappen
    const returnBtn = document.getElementById("return");
    if (returnBtn) {
      returnBtn.addEventListener("click", () => {
        window.location.href = "/";
      });
    }
  });
  