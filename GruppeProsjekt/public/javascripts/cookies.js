// Enkel funksjon for å lese cookies
function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) return value;
    }
    return null;
}

// Sjekk om brukeren har login-cookie
const session = getCookie("companySession");

if (!session) {
    // Ikke logget inn → redirect
    window.location.href = "/login.html";
}