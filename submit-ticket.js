const token = localStorage.getItem("token")
if (!token) {
    window.location.href = "login.html"
} else {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = atob(payloadBase64);
    const payloadObj = JSON.parse(decodedPayload);
    if (payloadObj.role === "admin") {
        window.location.href = "my-tickets.html";
    }
}
document.getElementById("logout-btn").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});
document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
        window.location.href = "login.html";
        return;
    }
    const ticket = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        priority: document.getElementById("priority").value,
        state: "Nouveau",
    };

    if (ticket.title.trim() === "" || ticket.description.trim() === "") {
        document.getElementById("success-message").style.display = "none";
        document.getElementById("error-message").innerText = "Veuillez remplir tous les champs!";
        document.getElementById("error-message").style.display = "block";
        setTimeout(() => {
            document.getElementById("error-message").style.display = "none";
        }, 4000);
        return;
    }
    fetch("http://127.0.0.1:8000/submit-ticket", {
        method: "POST",
        headers: { "Content-type": "application/json", "Authorization": `Bearer ${currentToken}`},
        body: JSON.stringify(ticket)
    })
        .then(response => {

            if (response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "login.html?reason=expired";
                return;
            }
            return response.json();
        })
        .then(data => {
            console.log("Success", data);
            document.getElementById("success-message").innerText = "Ticket soumis avec succès !";
            document.getElementById("success-message").style.display = "block";
            document.getElementById("error-message").innerText = "";
            document.getElementById("error-message").style.display = "none";
            document.querySelector("form").reset();

            setTimeout(() => {
                document.getElementById("success-message").style.display = "none";
            }, 4000);
        })
        .catch(error =>{
            console.error("Error", error);
            document.getElementById("success-message").style.display = "none";
            document.getElementById("error-message").innerText = "Une erreur s'est produite";
            document.getElementById("error-message").style.display = "block";
        });

});