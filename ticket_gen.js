document.querySelector("form").addEventListener("submit", function(event){
    event.preventDefault();

    const ticket = {
        name: document.getElementById("name").value,
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        priority: document.getElementById("priority").value,
    };

if (ticket.name.trim() === "" || ticket.title.trim() === "" || ticket.description.trim() === ""){
    document.getElementById("error-message").innerText = "Veuillez remplir tous les champs!";
    document.getElementById("error-message").style.display = "block";
    document.getElementById("success-message").style.display = "none";
    return; 
}
    fetch("http://127.0.0.1:8000/submit-ticket",{
        method: "POST",
        headers: { "Content-type":"application/json"},
        body: JSON.stringify(ticket)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Success", data);
        document.getElementById("success-message").innerText = "Ticket soumis avec succès !";
        document.getElementById("success-message").style.display = "block";
        document.getElementById("error-message").style.display = "none";
        document.querySelector("form").reset();
        
        setTimeout(() => {
            document.getElementById("success-message").style.display = "none";
        }, 4000);
    })
    .catch(error => console.error("Error", error));

});