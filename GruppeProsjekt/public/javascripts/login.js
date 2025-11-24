const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
const createAccountBtn = document.getElementById("createAccountBtn");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Tøm feilmelding hvis den finnes fra før
    errorMsg.style.display = "none";
    errorMsg.textContent = "";

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    const data = {
        email: email,
        password: password
    };

    const response = await fetch("/authenticator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    // Hvis feil login → vis feilmelding
    if (!result.success) {
        const msg = result.message ||result.error || "Login failed.";
        errorMsg.textContent = msg;
        errorMsg.style.display = "block";
        return;
    }

    // Hvis login OK → gå videre til verify
    window.location.href = "/verify.html?email=" + encodeURIComponent(email);
});

// Knapp for å gå til register-siden
createAccountBtn.addEventListener("click", function () {
    window.location.href = "/register.html";
});