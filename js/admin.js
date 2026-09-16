document.addEventListener('DOMContentLoaded', () => {
  const PASSWORD = "Ak@11ory";

  const gate      = document.getElementById('gate');
  const panel     = document.getElementById('panel');
  const pwInput   = document.getElementById('pwInput');
  const pwSubmit  = document.getElementById('pwSubmit');
  const pwError   = document.getElementById('pwError');

  const videoEnabled = document.getElementById('videoEnabled');
  const videoFields    = document.getElementById('videoFields');
  const placeholderField = document.getElementById('placeholderField');
  const placeholderMessage = document.getElementById('placeholderMessage');
  const videoFolder = document.getElementById('videoFolder');
  const videoName    = document.getElementById('videoName');
  const boxLabel      = document.getElementById('boxLabel');
  const scriptText    = document.getElementById('scriptText');

  const generateBtn = document.getElementById('generateBtn');
  const outputWrap    = document.getElementById('outputWrap');
  const output          = document.getElementById('output');
  const copyBtn          = document.getElementById('copyBtn');
  const copyNote          = document.getElementById('copyNote');

  // show either the video fields or the placeholder field, never both
  function syncVideoToggleUI(){
    if (videoEnabled.checked) {
      videoFields.classList.remove('hidden');
      placeholderField.classList.add('hidden');
    } else {
      videoFields.classList.add('hidden');
      placeholderField.classList.remove('hidden');
    }
  }
  videoEnabled.addEventListener('change', syncVideoToggleUI);

  // prefill the form with whatever config.js currently has
  if (typeof SITE_CONFIG !== 'undefined') {
    if (SITE_CONFIG.videoFile) {
      const parts = SITE_CONFIG.videoFile.split('/');
      videoName.value = parts.pop();
      videoFolder.value = parts.length ? parts.join('/') + '/' : '';
    }
    boxLabel.value = SITE_CONFIG.boxLabel;
    scriptText.value = SITE_CONFIG.message;
    videoEnabled.checked = SITE_CONFIG.videoEnabled !== false;
    if (SITE_CONFIG.placeholderMessage) placeholderMessage.value = SITE_CONFIG.placeholderMessage;
  }
  syncVideoToggleUI();

  function unlock(){
    if (pwInput.value === PASSWORD) {
      gate.classList.add('hidden');
      panel.classList.remove('hidden');
    } else {
      pwError.classList.remove('hidden');
    }
  }

  pwSubmit.addEventListener('click', unlock);
  pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') unlock(); });

  // escape characters that would break a JS template literal
  function escapeForTemplate(str){
    return str
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${');
  }
  function escapeForString(str){
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  generateBtn.addEventListener('click', () => {
    const folder = videoFolder.value.trim().replace(/\/?$/, '/');
    const name = videoName.value.trim();
    const videoPath = (folder === '/' ? '' : folder) + name;

    const code =
`const SITE_CONFIG = {
  videoEnabled: ${videoEnabled.checked},
  videoFile: "${escapeForString(videoPath)}",
  placeholderMessage: \`${escapeForTemplate(placeholderMessage.value.trim())}\`,
  boxLabel: "${escapeForString(boxLabel.value.trim())}",
  message: \`${escapeForTemplate(scriptText.value)}\`
};`;

    output.textContent = code;
    outputWrap.classList.remove('hidden');
    copyNote.textContent = '';
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.textContent);
      copyNote.textContent = 'Copied! Paste it into js/config.js.';
    } catch (err) {
      copyNote.textContent = 'Could not copy automatically — select the text above and copy it manually.';
    }
  });
});
