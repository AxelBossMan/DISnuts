// Hent email fra URL
const params = new URLSearchParams(window.location.search);
const email = params.get("email");

document.getElementById("verifyForm").onsubmit = async (e) => {
  e.preventDefault();

  const code = e.target.code.value;

  const res = await fetch("/authenticator/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code })
  });

  const json = await res.json();
  alert(json.message);

  if (json.success) {
    setTimeout(() => {
        window.location.href = "/index.html";
    }, 200);
  }
};