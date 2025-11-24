document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.querySelector(".event-grid");
  
    try {
      const response = await fetch("/api/events");
  
      if (!response.ok) {
        throw new Error("Server returned " + response.status);
      }
  
      const events = await response.json();
  
      grid.innerHTML = "";
  
      events.forEach(ev => {
        grid.innerHTML += `
          <div class="event-card">
            <div class="event-title">${ev.event_name}</div>
            <div class="event-meta">${ev.location} · ${new Date(ev.time).toLocaleDateString()}</div>
            <div class="event-footer">
              <button class="event-button" type="button">
                Manage
              </button>
            </div>
          </div>
        `;
      });
    } catch (err) {
      console.error(err);
      grid.innerHTML = `<p style="color:red;">Could not load events from server.</p>`;
    }
  
    const returnBtn = document.getElementById("return");
    if (returnBtn) {
      returnBtn.addEventListener("click", () => {
        window.location.href = "/";
      });
    }
  });
  