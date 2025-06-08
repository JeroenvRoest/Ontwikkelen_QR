function onScanSuccess(decodedText) {
  console.log("Scanned:", decodedText);

  // stop scanner om dubble scans te voorkomen
  html5QrCode.stop().then(() => {
    console.log("Scanner gestopt na succesvolle scan.");
  }).catch(err => {
    console.warn("Kon scanner niet stoppen:", err);
  });

  //gegevens ophalen via API
  fetch(`https://1a2480b0-fd9b-48ad-bfa8-f417948043b0.mock.pstmn.io/t/client/${decodedText}`)
    .then(res => {
      if (!res.ok) throw new Error("Geen geldige response");
      return res.json();
    })
    .then(data => {
      console.log("Gekregen data:", data);
      document.getElementById("name").innerText = data.name || "Onbekend";
      document.getElementById("clientId").innerText = data.id || "Onbekend";
      document.getElementById("geboortedatum").innerText = data.dateOfBirth || "Onbekend";
      document.getElementById("kamernummer").innerText = data.roomNumber || "Onbekend";
      document.getElementById("afdeling").innerText = data.location || "Onbekend";
      document.getElementById("allergieën").innerText = data.Allergieën || "Onbekend";
      document.getElementById("reanimeren").innerText = data.reanimeren || "Onbekend";

      // Maak knoppen zichtbaar
      document.getElementById("showNotesBtn").style.display = "inline-block";
      document.getElementById("showReportsBtn").style.display = "inline-block";

      // Event listeners voor knoppen
      const showNotesBtn = document.getElementById("showNotesBtn");
      const showReportsBtn = document.getElementById("showReportsBtn");

      showNotesBtn.onclick = () => fetchMedicalNotes(data.id);
      showReportsBtn.onclick = () => fetchReportsByClient(data.id);

      // Maak vorige data leeg
      document.getElementById("medicalNotes").innerHTML = "";
      document.getElementById("reports").innerHTML = "";
    })
    .catch(err => {
      console.error(err);
      document.getElementById("result").innerText = "Fout bij ophalen cliënt.";
    });
}


// Instantieer de QR-code lezer
const html5QrCode = new Html5Qrcode("reader");

// Camera kiezen en scanner starten
Html5Qrcode.getCameras().then(devices => {
  if (devices && devices.length) {
    const cameraId = devices[0].id;
    html5QrCode.start(
      cameraId,
      { fps: 10, qrbox: 250 },
      onScanSuccess
    );
  } else {
    document.getElementById("result").innerText = "Geen camera's gevonden.";
  }
}).catch(err => {
  console.error("Camera-initialisatie mislukt:", err);
  document.getElementById("result").innerText = "Fout bij toegang tot camera.";
});

// medische notities ophalen
function fetchMedicalNotes(clientId) {
  const notesContainer = document.getElementById("medicalNotes");
  notesContainer.innerHTML = "Bezig met laden...";

  // API medical_notes
  fetch(`https://1a2480b0-fd9b-48ad-bfa8-f417948043b0.mock.pstmn.io/t/clients/${clientId}/medical_notes`)
    .then(res => {
      if (!res.ok) throw new Error("Fout bij ophalen medische notities");
      return res.json();
    })
    .then(data => {
      if (!data.medicalNotes || data.medicalNotes.length === 0) {
        notesContainer.innerHTML = "Geen medische notities gevonden.";
        return;
      }

      // Maak een lijst van niet verwijderde notities     
      let html = "<h4>Medische notities:</h4><ul>";
      const visibleNotes = data.medicalNotes.filter(note => !note.deleted);
  
      if (visibleNotes.length === 0) {
        notesContainer.innerHTML = "Geen medische notities gevonden.";
        return;
      }

      visibleNotes.forEach(note => {
        html += `<li><strong>ID:</strong> ${note.id}<br/>
                <strong>Datum:</strong> ${note.startDate} - ${note.endDate || 'nu'}<br/>
                <strong>Inhoud:</strong> ${note.content}<br/>
                <strong>Auteur:</strong> ${note.createdBy || note.authorId}</li><br/>`;
      });
      html += "</ul>";
      notesContainer.innerHTML = html;
        })
        
    .catch(err => {
      console.error(err);
      notesContainer.innerHTML = "Fout bij ophalen medische notities.";
    });
}

function fetchReportsByClient(clientId, options = {}) {
  const reportsContainer = document.getElementById("reports");
  reportsContainer.innerHTML = "Bezig met laden...";

  if (options.report_type && Array.isArray(options.report_type)) {
    options.report_type.forEach(rt => params.append("report_type", rt));
  }

  // API rapportages
const url = `https://1a2480b0-fd9b-48ad-bfa8-f417948043b0.mock.pstmn.io/t/dossier/reports/${clientId}`;

  //ophalen rapportages
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Fout bij ophalen rapportages");
      return res.json();
    })
    //alles er geen rapportatges zijn
    .then(data => {
      if (!data.reports || data.reports.length === 0) {
        reportsContainer.innerHTML = "Geen rapportages gevonden.";
        return;
      }

      //weergegeven data rapportages
      let html = "<h4>Rapportages:</h4><ul>";
      data.reports.forEach(report => {
        html += `<li>
          <strong>ID:</strong> ${report.id}<br/>
          <strong>Datum:</strong> ${new Date(report.reportingDate).toLocaleDateString()}<br/>
          <strong>Commentaar:</strong> ${report.comment}<br/>
          <strong>Auteur:</strong> ${report.carenName} (${report.carenRole})<br/>
          <strong>Status:</strong> ${report.status}<br/>
          <strong>Rapporttype ID:</strong> ${report.reportTypeId}
        </li><br/>`;
      });
      html += "</ul>";

      reportsContainer.innerHTML = html;
    })
    .catch(err => {
      console.error(err);
      reportsContainer.innerHTML = "Fout bij ophalen rapportages.";
    });
}

