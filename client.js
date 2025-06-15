function getClientIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function loadClientData(clientId) {
  //gegevens ophalen via API
  fetch(
    `https://1a2480b0-fd9b-48ad-bfa8-f417948043b0.mock.pstmn.io/t/client/${clientId}`
  )
    .then((res) => {
      if (!res.ok) throw new Error("Geen geldige response");
      return res.json();
    })
    .then((data) => {
      document.getElementById("name").innerText = data.name || "Onbekend";
      document.getElementById("clientId").innerText = data.id || "Onbekend";
      document.getElementById("geboortedatum").innerText =
        data.dateOfBirth || "Onbekend";
      document.getElementById("kamernummer").innerText =
        data.roomNumber || "Onbekend";
      document.getElementById("afdeling").innerText =
        data.location || "Onbekend";
      document.getElementById("allergieën").innerText =
        data.Allergieën || "Onbekend";
      document.getElementById("reanimeren").innerText =
        data.reanimeren || "Onbekend";

      //Maak knoppen zichtbaar
      document.getElementById("showNotesBtn").style.display = "inline-block";
      document.getElementById("showReportsBtn").style.display = "inline-block";
      document.getElementById("showEmergencyContactBtn").style.display =
        "inline-block";

      // Event listeners voor knoppen
      document.getElementById("showNotesBtn").onclick = () => {
        const container = document.getElementById("medicalNotes");
        if (container.innerHTML.trim()) {
          container.innerHTML = "";
        } else {
          fetchMedicalNotes(data.id);
        }
      };

      document.getElementById("showReportsBtn").onclick = () => {
        const container = document.getElementById("reports");
        if (container.innerHTML.trim()) {
          container.innerHTML = "";
        } else {
          fetchReportsByClient(data.id);
        }
      };

      document.getElementById("showEmergencyContactBtn").onclick = () => {
        const container = document.getElementById("emergencyContact");
        if (container.innerHTML.trim()) {
          container.innerHTML = "";
        } else {
          fetchEmergencyContact(data.id);
        }
      };
    })
    .catch((err) => {
      console.error(err);
      alert("Fout bij ophalen cliëntgegevens.");
    });
}

// medische notities ophalen
function fetchMedicalNotes(clientId) {
  const notesContainer = document.getElementById("medicalNotes");
  notesContainer.innerHTML = "Bezig met laden...";

  // API medical_notes
  fetch(
    `https://1a2480b0-fd9b-48ad-bfa8-f417948043b0.mock.pstmn.io/t/clients/${clientId}/medical_notes`
  )
    .then((res) => {
      if (!res.ok) throw new Error("Fout bij ophalen medische notities");
      return res.json();
    })
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
  const url = `https://1a2480b0-fd9b-48ad-bfa8-f417948043b0.mock.pstmn.io/t/dossier/reports/${clientId}`;

  //ophalen rapportages
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Fout bij ophalen rapportages");
      return res.json();
    })
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
  const url = `https://1a2480b0-fd9b-48ad-bfa8-f417948043b0.mock.pstmn.io/t/client_contact_relations/${clientId}`;
  const container = document.getElementById("emergencyContact");

  // Geef feedback dat het aan het laden is
  container.innerHTML = "Bezig met laden...";

  // Vraag de data op bij de API
  return fetch(url)
    .then((res) => {
      // Controleer of het antwoord OK is, anders gooi een fout
      if (!res.ok)
        throw new Error(`Fout bij ophalen contactgegevens: ${res.statusText}`);
      return res.json();
    })
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
