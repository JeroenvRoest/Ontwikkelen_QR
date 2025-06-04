function onScanSuccess(decodedText) {
  console.log("Scanned:", decodedText);

  // Stop scanner om dubbele scans te voorkomen
  html5QrCode.stop().then(() => {
    console.log("Scanner gestopt na succesvolle scan.");
  }).catch(err => {
    console.warn("Kon scanner niet stoppen:", err);
  });

  // Ophalen van gegevens via de mock API
  fetch(`https://1a2480b0-fd9b-48ad-bfa8-f417948043b0.mock.pstmn.io/t/client/${decodedText}`)
    .then(res => {
      if (!res.ok) throw new Error("Geen geldige response");
      return res.json();
    })
    .then(data => {
      document.getElementById("name").innerText = data.name || "Onbekend";
      document.getElementById("CliëntID").innerText = data.id || "Onbekend";
      document.getElementById("kamernummer").innerText = data.roomNumber || "Onbekend";
      document.getElementById("afdeling").innerText = data.location || "Onbekend";
      document.getElementById("allergieën").innerText = data.Allergieën || "Onbekend";

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
