let isScanning = false;

function onScanSuccess(decodedText) {
  if (isScanning) return; //voorkomt dubbele scans
  isScanning = true;

  console.log("Scanned:", decodedText);

  // stop scanner om dubble scans te voorkomen
  html5QrCode.stop().then(() => {
    document.getElementById("reader").innerHTML = "";
    console.log("Scanner gestopt na succesvolle scan.");
    window.location.href = `client.html?id=${decodedText}`;
  }).catch(err => {
    console.warn("Kon scanner niet stoppen:", err);
    window.location.href = `client.html?id=${decodedText}`;
  });
}

// lijst met beschikbare camera's
let cameras = [];
// index van de huidige camera
let currentCameraIndex = 0;
const html5QrCode = new Html5Qrcode("reader");

// Functie om scanner te starten met de camera op currentCameraIndex
function startScanner() {
  if (cameras.length === 0) {
    document.getElementById("result").innerText = "Geen camera's gevonden.";
    return;
  }
  const cameraId = cameras[currentCameraIndex].id;
  html5QrCode.start(
    cameraId,
    { fps: 10, qrbox: 250 },
    onScanSuccess
  ).catch(err => {
    console.error("Kan scanner niet starten:", err);
    document.getElementById("result").innerText = "Fout bij starten scanner.";
  });
}

// Camera's ophalen en scanner starten
Html5Qrcode.getCameras().then(devices => {
  if (devices && devices.length) {
    cameras = devices;
    currentCameraIndex = 0;
    startScanner();
  } else {
    document.getElementById("result").innerText = "Geen camera's gevonden.";
  }
}).catch(err => {
  console.error("Camera-initialisatie mislukt:", err);
  document.getElementById("result").innerText = "Fout bij toegang tot camera.";
});

// Switch camera functie
function switchCamera() {
  if (cameras.length <= 1) {

    // geeft popup: 1 camera beschikbaar
    alert("Er is maar één camera beschikbaar.");
    return;
  }
  html5QrCode.stop().then(() => {
    // Volgende camera selecteren
    currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
    startScanner();
  }).catch(err => {
    console.error("Kon scanner niet stoppen:", err);
  });
}

// Voeg event listener toe aan de switchCameraBtn
document.getElementById("switchCameraBtn").addEventListener("click", switchCamera);



