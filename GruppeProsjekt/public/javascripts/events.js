document.addEventListener("DOMContentLoaded", () => {
    const returnBtn = document.getElementById("return");
  
    if (returnBtn) {
      returnBtn.addEventListener("click", () => {
        window.location.href = "/";
      });
    }
  });

  