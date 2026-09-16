document.addEventListener('DOMContentLoaded', () => {
  const selectBox      = document.getElementById('selectBox');
  const selectBoxLabel = document.getElementById('selectBoxLabel');

  const modalOverlay     = document.getElementById('modalOverlay');
  const modalBox         = document.getElementById('modalBox');
  const modalClose       = document.getElementById('modalClose');
  const video            = document.getElementById('birthdayVideo');
  const videoPlaceholder = document.getElementById('videoPlaceholder');
  const placeholderText  = document.getElementById('placeholderText');
  const playBtn          = document.getElementById('playBtn');
  const textPane         = document.getElementById('textPane');
  const textPaneInner    = document.getElementById('textPaneInner');

  function isVideoOff(val){
    if (val === false || val === 0) return true;
    if (typeof val === 'string') {
      const v = val.trim().toLowerCase();
      return v === 'false' || v === 'no' || v === 'off' || v === '0';
    }
    return false;
  }

  const videoEnabled = !isVideoOff(SITE_CONFIG.videoEnabled); // tolerant of true/false, "true"/"false", 1/0, etc.

  // ---- pull content from config.js ----
  selectBoxLabel.textContent = SITE_CONFIG.boxLabel;
  textPaneInner.textContent  = SITE_CONFIG.message;

  if (videoEnabled) {
    video.src = SITE_CONFIG.videoFile;
  } else {
    // no video: the placeholder note sits where the video would have been
    video.classList.add('hidden');
    videoPlaceholder.classList.remove('hidden');
    placeholderText.textContent = SITE_CONFIG.placeholderMessage || "";
    playBtn.classList.add('no-video');
    playBtn.setAttribute('aria-label', 'Read the letter');
  }

  // ---- debug helper: log *why* the video failed, and recover the UI instead of getting stuck ----
  video.addEventListener('error', () => {
    if (!videoEnabled) return; // no real video loaded in this mode, nothing to report
    const codes = {1:'aborted', 2:'network error', 3:'file is corrupt or an unsupported codec', 4:'file not found or format not supported by this browser'};
    const reason = video.error ? (codes[video.error.code] || video.error.message) : 'unknown';
    console.error('[birthday site] Video failed ("' + SITE_CONFIG.videoFile + '"): ' + reason);

    // snap the UI back to the play button instead of leaving a frozen, stuck box
    modalBox.classList.remove('expanded');
    playBtn.classList.remove('hidden');
    textPane.classList.remove('in');
  });

  // ---- open the modal ----
  selectBox.addEventListener('click', () => {
    resetModal();
    modalOverlay.classList.add('show');
    modalClose.focus();
  });

  // ---- start: video (or the note) slides left, box widens, letter fades in ----
  function reveal(){
    playBtn.classList.add('hidden');
    modalBox.classList.add('expanded');
    setTimeout(() => textPane.classList.add('in'), 250);
  }

  playBtn.addEventListener('click', () => {
    if (!videoEnabled) {
      reveal();
      return;
    }

    const playPromise = video.play();

    // only animate the layout once we know playback actually started
    if (playPromise !== undefined) {
      playPromise.then(reveal).catch((err) => {
        console.error('[birthday site] Playback was blocked or failed:', err);
        alert("The video couldn't play. Open the browser console (F12 → Console tab) to see why — usually it's a filename mismatch or a video format this browser can't play.");
      });
    } else {
      // older browsers that don't return a promise from play()
      reveal();
    }
  });

  // ---- close modal ----
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('show')) closeModal();
  });

  function closeModal(){
    modalOverlay.classList.remove('show');
    if (videoEnabled) video.pause();
    selectBox.focus();
  }

  function resetModal(){
    if (videoEnabled) {
      video.pause();
      video.load();          // fully reload the video element so a previous error doesn't stick around
    }
    modalBox.classList.remove('expanded');
    playBtn.classList.remove('hidden');
    textPane.classList.remove('in');
  }
});
