const form = document.getElementById("registerForm");

form.addEventListener("submit", async function (event) {
    event.preventDefault(); // Stopper vanlig form-submission

    // Henter verdier manuelt (tydeligere for studenter)
    const companyName = form.company_name.value;
    const email = form.email.value;
    const phoneNumber = form.phone_number.value;
    const password = form.password.value;

    // Lager et vanlig JS-objekt for å sende til backend
    const data = {
        company_name: companyName,
        email: email,
        phone_number: phoneNumber,
        password: password
    };

    // Sender request til backend
    const response = await fetch("/authenticator/register", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    alert(result.message);

    // Hvis alt gikk bra → videre til login
    if (result.success) {
        window.location.href = "/login.html";
    }
});