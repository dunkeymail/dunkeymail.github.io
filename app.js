const mockProfile = {
  name: "Aideen Foley",
  id: "183629837",
  venue: "Solinca Classic Dragão",
  activity: "Natação Livre",
  image: "profile.jpg"
};

const scannerScreen = document.getElementById("scanner-screen");
const loadingScreen = document.getElementById("loading-screen");
const successScreen = document.getElementById("success-screen");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const statusEl = document.getElementById("status");

const profileImage = document.getElementById("profile-image");
const profileName = document.getElementById("profile-name");
const venueValue = document.getElementById("venue-value");
const activityValue = document.getElementById("activity-value");
const timeValue = document.getElementById("time-value");

let qrScanner = null;
let hasScanned = false;
let cameraRunning = false;

function showScreen(screen) {
  [scannerScreen, loadingScreen, successScreen].forEach((s) => {
    s.classList.remove("active");
  });
  screen.classList.add("active");
}

function formatCheckinTime() {
  const now = new Date();

  const datePart = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });

  const timePart = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${datePart}, ${timePart} · 01:42`;
}

function populateSuccess() {
  profileImage.src = mockProfile.image;
  profileName.innerHTML = `${mockProfile.name} <span class="inline-id">• ${mockProfile.id}</span>`;
  venueValue.textContent = mockProfile.venue;
  activityValue.textContent = mockProfile.activity;
  timeValue.textContent = formatCheckinTime();
}

async function stopScanner() {
  if (!qrScanner || !cameraRunning) return;

  try {
    await qrScanner.stop();
  } catch (err) {
    console.error(err);
  }

  cameraRunning = false;
}

async function clearScanner() {
  if (!qrScanner) return;

  try {
    await qrScanner.clear();
  } catch (err) {
    console.error(err);
  }

  document.getElementById("reader").innerHTML = "";
  qrScanner = null;
}

async function handleScanSuccess(decodedText) {
  if (hasScanned) return;
  hasScanned = true;

  statusEl.textContent = `QR detected`;
  showScreen(loadingScreen);

  await stopScanner();

  setTimeout(() => {
    populateSuccess(decodedText);
    showScreen(successScreen);
  }, 900);
}

async function startScanner() {
  if (cameraRunning) return;

  hasScanned = false;
  statusEl.textContent = "Starting camera ...";

  if (!qrScanner) {
    qrScanner = new Html5Qrcode("reader");
  }

  try {
    await qrScanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const edge = Math.min(viewfinderWidth, viewfinderHeight) * 0.72;
          return { width: edge, height: edge };
        },
        rememberLastUsedCamera: true,
        aspectRatio: 1.3333333
      },
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      () => {}
    );

    cameraRunning = true;
    statusEl.textContent = "Point the camera at any QR code.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Camera access failed. On iPhone, use Safari from your GitHub Pages URL or home screen app.";
  }
}

async function resetApp() {
  await stopScanner();
  await clearScanner();
  showScreen(scannerScreen);
  statusEl.textContent = "";
  startScanner();
}

startBtn.addEventListener("click", startScanner);
resetBtn.addEventListener("click", resetApp);

populateSuccess();
