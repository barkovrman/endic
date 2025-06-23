// PWA initialization script

// Create offline indicator
const offlineIndicator = document.createElement('div');
offlineIndicator.className = 'offline-indicator';
offlineIndicator.textContent = 'Вы сейчас офлайн. Используются кэшированные данные.';
document.body.insertBefore(offlineIndicator, document.body.firstChild);

// Check online status and update UI
function updateOnlineStatus() {
  if (navigator.onLine) {
    document.body.classList.remove('offline');
  } else {
    document.body.classList.add('offline');
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial check
updateOnlineStatus();

// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('Service worker registered successfully', reg);
      })
      .catch((err) => {
        console.error('Service worker registration failed:', err);
      });
  });
}

// Add to home screen prompt handler
let deferredPrompt;
const addBtn = document.createElement('button');
addBtn.id = 'add-button';
addBtn.textContent = 'Установить приложение';
addBtn.classList.add('add-to-home');
addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';

  addBtn.addEventListener('click', () => {
    // Hide our user interface that shows our A2HS button
    addBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });

  // Add the button to the DOM
  document.body.insertBefore(addBtn, document.body.firstChild);
});
