const authForm = document.querySelector("form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");

const togglePassword = document.getElementById("toggle-password");
togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
});

authForm.addEventListener("submit", function (event) {
	event.preventDefault();
	
    fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
			window.location.href = "ticket_gen.html";
        } else {
            errorMessage.textContent = data.message;
        }
    })
    .catch(error => console.error("Error:", error)
)});

