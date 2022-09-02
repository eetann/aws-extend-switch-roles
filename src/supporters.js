import { validateKeyCode } from './lib/verify_jwt'
import { LocalStorageRepository, SyncStorageRepository } from './lib/storage_repository'

const syncStorageRepo = new SyncStorageRepository(chrome || browser)
const localStorageRepo = new LocalStorageRepository(chrome || browser)

function updateKeyExpire(exp) {
  syncStorageRepo.set({ goldenKeyExpire: exp })
  .then(() => {
    localStorageRepo.set({ hasGoldenKey: exp ? exp : '' }).then(() => {})
    if (chrome.action) {
      chrome.action.setIcon({ path: `icons/Icon_48x48${exp ? '_g' : ''}.png` });
    } else {
      chrome.browserAction.setIcon({ path: `icons/Icon_48x48${exp ? '_g' : ''}.png` });
    }
  })
}

function setEventHandler() {
  const keyCodeValid = document.getElementById('keyCodeValid');
  const keyCodeInvalid = document.getElementById('keyCodeInvalid');

  textareaKeyCode.oninput = function() {
    const keyCode = this.value;
    if (!keyCode) {
      keyCodeValid.style.display = 'none';
      keyCodeInvalid.style.display = 'none';
      updateKeyExpire(null);
      return;
    }

    validateKeyCode(keyCode)
    .then(data => {
      keyCodeValid.style.display = 'block';
      keyCodeInvalid.style.display = 'none';
      updateKeyExpire(data.exp);
    })
    .catch(err => {
      keyCodeValid.style.display = 'none';
      keyCodeInvalid.style.display = 'block';
      updateKeyExpire(null);
    });
  }
}

window.onload = function() {
  const textareaKeyCode = document.getElementById('textareaKeyCode');

  textareaKeyCode.placeholder = `\
---------- BEGIN ------ AESR GOLDEN KEY ----------
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
----------- END ------- AESR GOLDEN KEY ----------`;

  syncStorageRepo.get(['goldenKeyExpire'])
  .then(data => {
    const { goldenKeyExpire } = data;
    if ((new Date().getTime() / 1000) < Number(goldenKeyExpire)) {
      document.getElementById('keyCodeValid').style.display = 'block';
    }
    setEventHandler();
  });
}
