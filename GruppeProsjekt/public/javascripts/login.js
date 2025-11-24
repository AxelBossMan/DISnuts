document.getElementById("loginForm").onsubmit = async (e) => {
    e.preventDefault();
  
    const data = Object.fromEntries(new FormData(e.target).entries());
    const email = data.email;
  
    const res = await fetch("/authenticator/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const json = await res.json();
    alert(json.message);
  
    if (json.success) {
      window.location.href = `/verify.html?email=${encodeURIComponent(email)}`;
    }
  };