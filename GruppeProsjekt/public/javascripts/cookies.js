// Enkel funksjon for å lese cookies
function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
    return null;
}

// Sjekk om brukeren har login-cookie
const session = getCookie("companySession");

if (!session) {
    // Ikke logget inn → redirect
    window.location.href = "/login.html";
}