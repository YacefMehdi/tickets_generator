const token = localStorage.getItem("token")
const noTicketsMessage = document.getElementById("no-tickets-message");
const ticketsTable = document.getElementById("tickets-table");
const ticketTableBody = document.getElementById("ticket-table-body");
const modal = document.getElementById("details-ticket");
const closeDetailsBtn = document.getElementById("close-details-btn");
const totalTickets = document.getElementById("total-tickets");
const newTickets = document.getElementById("new-tickets");
const inProgressTickets = document.getElementById("in-progress-tickets");
const resolvedTickets = document.getElementById("resolved-tickets");
const changedState = document.getElementById("admin-state");
const adminNote = document.getElementById("admin-note");
const saveNoteBtn = document.getElementById("save-note-btn");
let currentStateCell = null;
let oldState = null;
let currentTicket = null;
if (!token) {
    window.location.href = "login.html"
}
else {
document.getElementById("logout-btn").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

    const payloadBase64 = token.split(".")[1];
    const decodedPayload = atob(payloadBase64);
    const payloadObj = JSON.parse(decodedPayload);

if (payloadObj.role === "admin") {
    fetch("http://127.0.0.1:8000/all-tickets", {
    method: "GET",
    headers: { "Content-type": "application/json", "Authorization": `Bearer ${token}` },
})
    .then(response => {
        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html?reason=expired";
        } else {
            return response.json();
        }
    })
    .then(data => {
        console.log("Success", data);
        if (data.all_tickets.length === 0) {
            noTicketsMessage.innerText = "Aucun ticket pour le moment";
            noTicketsMessage.style.display = "block";
            ticketsTable.style.display = "none";
        } else {
            noTicketsMessage.style.display = "none";
            ticketsTable.style.display = "table";
            document.getElementById("admin-stats").style.display = "flex";
            document.getElementById("username-col").style.display = "table-cell";  
            document.getElementById("details-username-label").style.display = "block";
            document.getElementById("details-username").style.display = "block"; 
            document.getElementById("details-state").style.display = "none";    
            document.getElementById("new-ticket-nav").style.display = "none";
            document.getElementById("my-tickets-nav").style.display = "none";
            ticketTableBody.innerHTML = "";
            let totalTickets = 0;
            let newTickets = 0;
            let inProgressTickets = 0;
            let resolvedTickets = 0;
            data.all_tickets.forEach(ticket => {
                const row = document.createElement("tr");
                            if (ticket.state === "Nouveau") {
                        newTickets += 1;
                    } else if (ticket.state === "En cours") {
                        inProgressTickets += 1;
                    } else if (ticket.state === "Résolu") {
                        resolvedTickets += 1;
                    }
                    totalTickets += 1;
                row.innerHTML = `
                    <td>${ticket.username}</td>
                    <td>${ticket.id}</td>
                    <td>${ticket.title}</td>
                    <td>${ticket.description}</td>
                    <td>${ticket.priority}</td>
                    <td>${ticket.timestamp}</td>
                    <td>${ticket.state}</td>
                `;
                
                row.addEventListener("click", function () {
                    document.getElementById("details-username").innerText = ticket.username;
                    document.getElementById("details-username").style.display = "inline";
                    document.getElementById("details-id").innerText = ticket.id;
                    document.getElementById("details-title").innerText = ticket.title;
                    document.getElementById("details-description").innerText = ticket.description;
                    document.getElementById("details-priority").innerText = ticket.priority;
                    document.getElementById("details-date").innerText = ticket.timestamp;
                    document.getElementById("details-state").innerText = ticket.state;
                    oldState = document.getElementById("details-state").innerText;
                    changedState.value = ticket.state;
                    adminNote.value = ticket.note || "";
                    currentStateCell = row.querySelector("td:last-child");
                    currentTicket = ticket;
                    modal.style.display = "flex";
                });
                ticketTableBody.appendChild(row);

                document.getElementById("total-tickets").textContent = `${totalTickets}`;
                document.getElementById("new-tickets").textContent = `${newTickets}`;
                document.getElementById("in-progress-tickets").textContent = `${inProgressTickets}`;
                document.getElementById("resolved-tickets").textContent = `${resolvedTickets}`;
            });
            changedState.style.display = "block";
            adminNote.style.display = "block";
            saveNoteBtn.style.display = "block";
            document.getElementById("admin-state").addEventListener("change", function () {
                currentStateCell.innerText = changedState.value;
                fetch("http://127.0.0.1:8000/all-tickets/change-state", {
                    method: "PATCH",
                    headers: { "Content-type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ id: document.getElementById("details-id").innerText, state: changedState.value }),
                })
                .then(response => {
                    if (response.status === 401) {
                        localStorage.removeItem("token");
                        window.location.href = "login.html?reason=expired";
                    } else {
                        return response.json();
                    }
                })
                .then(data => {
                    console.log("Success", data);
                    currentTicket.state = changedState.value;
                    oldState = changedState.value;
                })
                .catch(error => console.error("Error", error));
                if (oldState !== changedState.value) {
                    if (oldState === "Nouveau") {
                        newTickets -= 1;
                    } 
                    if (oldState === "En cours") {
                        inProgressTickets -= 1;
                    } 
                    if (oldState === "Résolu") {
                        resolvedTickets -= 1;
                    }
                    if (changedState.value === "Nouveau") {
                        newTickets += 1;
                    } 
                    if (changedState.value === "En cours") {
                        inProgressTickets += 1;
                    } 
                    if (changedState.value === "Résolu") {
                        resolvedTickets += 1;
                    }
                   }
                    document.getElementById("total-tickets").textContent = `${totalTickets}`;
                    document.getElementById("new-tickets").textContent = `${newTickets}`;
                    document.getElementById("in-progress-tickets").textContent = `${inProgressTickets}`;
                    document.getElementById("resolved-tickets").textContent = `${resolvedTickets}`;
            });
        }
    })
    .catch(error => console.error("Error", error));
    saveNoteBtn.addEventListener("click", function () {
    fetch("http://127.0.0.1:8000/all-tickets/add-note", {
        method: "PATCH",
        headers: { "Content-type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ id: document.getElementById("details-id").innerText, note: adminNote.value }),
    })
    .then(response => {
        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html?reason=expired";
        } else {
            return response.json();
        }
    })
    .then(data => {
        console.log("Success", data);
        currentTicket.note = adminNote.value;
        document.getElementById("success-message").innerText = "Note enregistrée avec succès !";
        document.getElementById("success-message").style.display = "block";
        document.getElementById("error-message").innerText = "";
        document.getElementById("error-message").style.display = "none";
        setTimeout(() => {
            document.getElementById("success-message").style.display = "none";
        }, 4000);
    })
    .catch(error => console.error("Error", error));
});}

if (payloadObj.role === "user") {
fetch("http://127.0.0.1:8000/my-tickets", {
    method: "GET",
    headers: { "Content-type": "application/json", "Authorization": `Bearer ${token}` },
})
    .then(response => {
        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html?reason=expired";
        } else {
            return response.json();
        }
    })
    .then(data => {
        console.log("Success", data);
        if (data.my_tickets.length === 0) {
            noTicketsMessage.innerText = "Aucun ticket pour le moment";
            noTicketsMessage.style.display = "block";
            ticketsTable.style.display = "none";
        } else {
            noTicketsMessage.style.display = "none";
            ticketsTable.style.display = "table";
            ticketTableBody.innerHTML = "";
            data.my_tickets.forEach(ticket => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${ticket.id}</td>
                    <td>${ticket.title}</td>
                    <td>${ticket.description}</td>
                    <td>${ticket.priority}</td>
                    <td>${ticket.timestamp}</td>
                    <td>${ticket.state}</td
                `;
                row.addEventListener("click", function () {
                    document.getElementById("details-id").innerText = ticket.id;
                    document.getElementById("details-title").innerText = ticket.title;
                    document.getElementById("details-description").innerText = ticket.description;
                    document.getElementById("details-priority").innerText = ticket.priority;
                    document.getElementById("details-date").innerText = ticket.timestamp;
                    document.getElementById("details-state").innerText = ticket.state;
                    document.getElementById("details-note").innerText = ticket.note || "Aucune note pour le moment";
                    document.getElementById("details-note").style.display = "inline";
                    modal.style.display = "flex";
                });
                ticketTableBody.appendChild(row);
            });
        }
    })
    .catch(error => console.error("Error", error));
}

closeDetailsBtn.addEventListener("click", function () {
    modal.style.display = "none";
})};
modal.addEventListener("click", function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});