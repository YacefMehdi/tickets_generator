const authForm = document.querySelector("form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");
const togglePassword = document.getElementById("toggle-password");
const params = new URLSearchParams(window.location.search);
const reason = params.get("reason");

if (reason === "expired") {
    document.getElementById("error-message").innerText = "Votre session a expiré. Veuillez vous reconnecter.";
    document.getElementById("error-message").style.display = "block";
    setTimeout(() => {
        document.getElementById("error-message").style.display = "none";
    }, 8000);
}

togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
});

authForm.addEventListener("submit", function (event) {
	event.preventDefault();
	errorMessage.textContent = "";
	errorMessage.style.display = "none";
    fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            localStorage.setItem("token", data.token);
			window.location.href = "my-tickets.html";
        } else {
            errorMessage.textContent = data.message;
            errorMessage.style.display = "block";
        }
    })
    .catch(error => console.error("Error:", error)
)});

