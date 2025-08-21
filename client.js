function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');

  // Voegt d e token toe aan de headers
  const fetchOptions = {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
    }
  };

  return fetch(url, fetchOptions)
    .then(res => {
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    });
}


function getClientIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// oude functie
// function loadClientData(clientId) {
//   //gegevens ophalen via API
//   fetchWithAuth(
//     `${API_URL}/t/client/${clientId}`
//   )
    
//     .then((data) => {
//       document.getElementById("name").innerText = data.name || "Onbekend";
//       document.getElementById("clientId").innerText = data.id || "Onbekend";
//       document.getElementById("geboortedatum").innerText =
//         data.dateOfBirth || "Onbekend";
//       document.getElementById("kamernummer").innerText =
//         data.roomNumber || "Onbekend";
//       document.getElementById("afdeling").innerText =
//         data.location || "Onbekend";
//       document.getElementById("allergieën").innerText =
//         data.Allergieën || "Onbekend";
//       document.getElementById("reanimeren").innerText =
//         data.reanimeren || "Onbekend";

//       //Maak knoppen zichtbaar
//       document.getElementById("showNotesBtn").style.display = "inline-block";
//       document.getElementById("showReportsBtn").style.display = "inline-block";
//       document.getElementById("showEmergencyContactBtn").style.display =
//         "inline-block";

//       // Event listeners voor knoppen
//       document.getElementById("showNotesBtn").onclick = () => {
//         const container = document.getElementById("medicalNotes");
//         if (container.innerHTML.trim()) {
//           container.innerHTML = "";
//         } else {
//           fetchMedicalNotes(data.id);
//         }
//       };

//       document.getElementById("showReportsBtn").onclick = () => {
//         const container = document.getElementById("reports");
//         if (container.innerHTML.trim()) {
//           container.innerHTML = "";
//         } else {
//           fetchReportsByClient(data.id);
//         }
//       };

//       document.getElementById("showEmergencyContactBtn").onclick = () => {
//         const container = document.getElementById("emergencyContact");
//         if (container.innerHTML.trim()) {
//           container.innerHTML = "";
//         } else {
//           fetchEmergencyContact(data.id);
//         }
//       };
//     })
//     .catch((err) => {
//       console.error(err);
//       alert("Fout bij ophalen cliëntgegevens.");
//     });
// }

// Haalt clientinformatie op uit de API
function getClientData(clientId) {
  return fetchWithAuth(`${API_URL}/t/client/${clientId}`);
}

// Rendert de clientinformatie in het client info blok
function renderClientInfo(data) {
  document.getElementById("name").innerText = data.name || "Onbekend";
  document.getElementById("clientId").innerText = data.id || "Onbekend";
  document.getElementById("geboortedatum").innerText = data.dateOfBirth || "Onbekend";
  document.getElementById("kamernummer").innerText = data.roomNumber || "Onbekend";
  document.getElementById("afdeling").innerText = data.location || "Onbekend";
  document.getElementById("allergieën").innerText = data.Allergieën || "Onbekend";
  document.getElementById("reanimeren").innerText = data.reanimeren || "Onbekend";
}

// setup van de knoppen
function setupClientButtons(data) {
  const notesBtn = document.getElementById("showNotesBtn");
  const reportsBtn = document.getElementById("showReportsBtn");
  const contactBtn = document.getElementById("showEmergencyContactBtn");

  // Maak knoppen zichtbaar
  notesBtn.style.display = "inline-block";
  reportsBtn.style.display = "inline-block";
  contactBtn.style.display = "inline-block";

  // Event listeners
  notesBtn.onclick = () => toggleContainer("medicalNotes", () => fetchMedicalNotes(data.id));
  reportsBtn.onclick = () => toggleContainer("reports", () => fetchReportsByClient(data.id));
  contactBtn.onclick = () => toggleContainer("emergencyContact", () => fetchEmergencyContact(data.id));
}

// Wisselt de inhoud van een container: leegt het als het gevuld is, anders voert het fetchFn uit
function toggleContainer(containerId, fetchFn) {
  const container = document.getElementById(containerId);
  if (container.innerHTML.trim()) {
    container.innerHTML = "";
  } else {
    fetchFn();
  }
}

// Laadt clientgegevens op via de API en zet de UI en knoppen op
function loadClientData(clientId) {
  getClientData(clientId)
    .then(data => {
      renderClientInfo(data);
      setupClientButtons(data);
    })
    .catch(err => {
      console.error(err);
      alert("Fout bij ophalen cliëntgegevens.");
    });
}





// medische notities ophalen
function fetchMedicalNotes(clientId) {
  const notesContainer = document.getElementById("medicalNotes");
  notesContainer.innerHTML = "Bezig met laden...";

  // API medical_notes
  fetchWithAuth(
    `${API_URL}/t/clients/${clientId}/medical_notes`
  )
    
    .then((data) => {
      if (!data.medicalNotes || data.medicalNotes.length === 0) {
        notesContainer.innerHTML = "Geen medische notities gevonden.";
        return;
      }

      // Maak een lijst van niet verwijderde notities
      let html = "<h4>Medische notities:</h4><ul>";
      const visibleNotes = data.medicalNotes.filter((note) => !note.deleted);

      if (visibleNotes.length === 0) {
        notesContainer.innerHTML = "Geen medische notities gevonden.";
        return;
      }

      visibleNotes.forEach((note) => {
        html += `<li><strong>ID:</strong> ${note.id}<br/>
                <strong>Datum:</strong> ${note.startDate} - ${
          note.endDate || "nu"
        }<br/>
                <strong>Inhoud:</strong> ${note.content}<br/>
                <strong>Auteur:</strong> ${
                  note.createdBy || note.authorId
                }</li><br/>`;
      });
      html += "</ul>";
      notesContainer.innerHTML = html;
    })

    .catch((err) => {
      console.error(err);
      notesContainer.innerHTML = "Fout bij ophalen medische notities.";
    });
}

function fetchReportsByClient(clientId) {
  const reportsContainer = document.getElementById("reports");
  reportsContainer.innerHTML = "Bezig met laden...";

  // API rapportages
  const url = `${API_URL}/t/dossier/reports/${clientId}`;

  //ophalen rapportages
  fetchWithAuth(url)
    
    //alles er geen rapportatges zijn
    .then((data) => {
      if (!data.reports || data.reports.length === 0) {
        reportsContainer.innerHTML = "Geen rapportages gevonden.";
        return;
      }

      //weergegeven data rapportages
      let html = "<h4>Rapportages:</h4><ul>";
      data.reports.forEach((report) => {
        html += `<li>
          <strong>ID:</strong> ${report.id}<br/>
          <strong>Datum:</strong> ${new Date(
            report.reportingDate
          ).toLocaleDateString()}<br/>
          <strong>Commentaar:</strong> ${report.comment}<br/>
          <strong>Auteur:</strong> ${report.carenName} (${
          report.carenRole
        })<br/>
          <strong>Status:</strong> ${report.status}<br/>
          <strong>Rapporttype ID:</strong> ${report.reportTypeId}
        </li><br/>`;
      });
      html += "</ul>";

      reportsContainer.innerHTML = html;
    })
    .catch((err) => {
      console.error(err);
      reportsContainer.innerHTML = "Fout bij ophalen rapportages.";
    });
}

function fetchEmergencyContact(clientId) {
  // API URL
  const url = `${API_URL}/t/client_contact_relations/${clientId}`;
  const container = document.getElementById("emergencyContact");

  // Geef feedback dat het aan het laden is
  container.innerHTML = "Bezig met laden...";

  // Vraag de data op bij de API
  return fetchWithAuth(url)
    
    
    .then((data) => {
      const contactsArray = data.contacts;

      // Filter de op noodcontacten
      const emergencyContacts = contactsArray.filter(
        (contact) => contact.inCaseOfEmergency === true
      );

      if (emergencyContacts.length > 0) {
        const contact = emergencyContacts[0];

        container.innerHTML = `
          <p><strong>Naam:</strong> ${contact.name || "Onbekend"}</p>
          <p><strong>Relatie:</strong> ${
            contact.clientContactRelationType?.name ||
            contact.personalRelationType?.name ||
            "Onbekend"
          }</p>
          <p><strong>Telefoon:</strong> ${
            contact.personalRelationType?.relationCategory?.contactInfo ||
            "Onbekend"
          }</p>
        `;
      } else {
        // Geen noodcontact gevonden
        container.innerHTML = "Geen noodcontact gevonden.";
      }
    })
    .catch((err) => {
      // fout afhandeling
      console.error(err);
      container.innerHTML = "Fout bij ophalen noodcontact.";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const clientId = getClientIdFromURL();
  if (clientId) {
    loadClientData(clientId);
  } else {
    alert("Geen cliënt-ID gevonden in de URL.");
  }
});
