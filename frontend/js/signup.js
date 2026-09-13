const signupForm = document.querySelector("form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const errorMessage = document.getElementById("error-message");

const togglePassword = document.getElementById("toggle-password");
togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
});

const toggleConfirmPassword = document.getElementById("toggle-confirm-password");
toggleConfirmPassword.addEventListener("click", function () {
    if (confirmPasswordInput.type === "password") {
        confirmPasswordInput.type = "text";
    } else {
        confirmPasswordInput.type = "password";
    }
});

function getPasswordError(password) {
    if (password.length < 8) {
        return "Le mot de passe doit contenir au moins 8 caractères.";
    }
    if (!/[A-Z]/.test(password)) {
        return "Le mot de passe doit contenir au moins une majuscule.";
    }
    if (!/[0-9]/.test(password)) {
        return "Le mot de passe doit contenir au moins un chiffre.";
    }
    if (!/[!@#$%&*|~?-]/.test(password)) {
        return "Le mot de passe doit contenir au moins un caractère spécial.";
    }
    return null;
}

signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (username === "" || password === "" || confirmPassword === "") {
        errorMessage.textContent = "Veuillez remplir tous les champs.";
        errorMessage.style.display = "block";
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = "Les mots de passe ne correspondent pas.";
        errorMessage.style.display = "block";
        return;
    }

    const passwordError = getPasswordError(password);
    if (passwordError) {
        errorMessage.textContent = passwordError;
        errorMessage.style.display = "block";
        return;
    }

    fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "error") {
                errorMessage.textContent = data.message;
                errorMessage.style.display = "block";
            } else {
                window.location.href = "login.html";
            }
        })
        .catch(error => console.error("Error:", error));
});