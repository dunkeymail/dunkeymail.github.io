const scannerScreen = document.getElementById("scanner-screen");
const loadingScreen = document.getElementById("loading-screen");
const successScreen = document.getElementById("success-screen");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const statusEl = document.getElementById("status");
const qrPreview = document.getElementById("qr-preview");

let qrScanner = null;
let hasScanned = false;

function showScreen(screen) {
  [scannerScreen, loadingScreen, successScreen].forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

async function startScanner() {
  statusEl.textContent = "Starting camera...";
  hasScanned = false;

  qrScanner = new Html5Qrcode("reader");

  try {
    await qrScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      async (decodedText) => {
        if (hasScanned) return;
        hasScanned = true;

        qrPreview.textContent = decodedText.slice(0, 32) || "QR detected";
        showScreen(loadingScreen);

        try {
          await qrScanner.stop();
        } catch (e) {}

        setTimeout(() => {
          showScreen(successScreen);
        }, 1000);
      },
      () => {}
    );

    statusEl.textContent = "Point the camera at any QR code.";
  } catch (err) {
    statusEl.textContent = "Camera access failed. Use Safari over local network or HTTPS.";
    console.error(err);
  }
}

async function resetApp() {
  if (qrScanner) {
    try {
      await qrScanner.clear();
    } catch (e) {}
  }

  document.getElementById("reader").innerHTML = "";
  showScreen(scannerScreen);
  statusEl.textContent = "";
  startScanner();
}

startBtn.addEventListener("click", startScanner);
resetBtn.addEventListener("click", resetApp);
