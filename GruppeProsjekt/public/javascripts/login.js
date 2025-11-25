const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
const createAccountBtn = document.getElementById("createAccountBtn");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

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

    if (!result.success) {
        errorMsg.textContent = "Incorrect email or password.";
        errorMsg.style.display = "block";
        return;
    }

    window.location.href = "/verify.html?email=" + encodeURIComponent(email);
});

createAccountBtn.addEventListener("click", function () {
    window.location.href = "/register";
});