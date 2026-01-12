document.addEventListener('DOMContentLoaded', () => {
  initRadioGroups();
  initFormValidation();
});

function initRadioGroups() {
  const groups = document.querySelectorAll('.radio-group');

  groups.forEach((group) => {
    const radio = group.querySelector('input[type="radio"]');
    if (!radio) return;

    group.addEventListener('click', (event) => {
      if (event.target.tagName.toLowerCase() === 'input') return;
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      radio.focus({ preventScroll: true });
    });

    radio.addEventListener('change', () => {
      const sameName = document.querySelectorAll(`.radio-group input[name="${radio.name}"]`);
      sameName.forEach((r) => {
        const parent = r.closest('.radio-group');
        if (parent) parent.classList.toggle('selected', r.checked);
      });
    });

    if (radio.checked) group.classList.add('selected');
  });
}

function initFormValidation() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const validators = {
    'first-name': (el) => (el.value.trim() !== '' ? true : 'This field is required'),
    'last-name': (el) => (el.value.trim() !== '' ? true : 'This field is required'),
    'email': (el) => {
      if (el.value.trim() === '') return 'This field is required';
      return /\S+@\S+\.\S+/.test(el.value) ? true : 'Please enter a valid email address';
    },
    'message': (el) => (el.value.trim() !== '' ? true : 'This field is required'),
    'consent': (el) => (el.checked ? true : 'To submit this form, please consent to being contacted'),
    'queryType': () => (document.querySelector('input[name="queryType"]:checked') ? true : 'Please select a query type'),
  };

  const showError = (id, message) => {
    const container = document.getElementById(`${id}-error`);
    if (!container) return;
    container.textContent = message;
    container.classList.add('visible');
  };

  const clearError = (id) => {
    const container = document.getElementById(`${id}-error`);
    if (!container) return;
    container.textContent = '';
    container.classList.remove('visible');
  };

  const markInvalid = (id) => {
    if (id === 'queryType') {
      document.getElementById('queryType-error')?.classList.add('visible');
      document.querySelectorAll('.radio-group').forEach((rg) => rg.classList.add('error'));
      return;
    }
    document.getElementById(id)?.classList.add('input-error');
  };

  const clearInvalid = (id) => {
    if (id === 'queryType') {
      document.getElementById('queryType-error')?.classList.remove('visible');
      document.querySelectorAll('.radio-group').forEach((rg) => rg.classList.remove('error'));
      return;
    }
    document.getElementById(id)?.classList.remove('input-error');
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    Object.keys(validators).forEach((id) => {
      clearError(id);
      clearInvalid(id);
    });

    let firstInvalidControl = null;

    Object.entries(validators).forEach(([id, validate]) => {
      const result = id === 'queryType' ? validate() : validate(document.getElementById(id));
      if (result !== true) {
        showError(id, result);
        markInvalid(id);
        if (!firstInvalidControl) {
          firstInvalidControl = id === 'queryType' ? document.querySelector('input[name="queryType"]') : document.getElementById(id);
        }
      }
    });

    if (firstInvalidControl) {
      firstInvalidControl.focus();
      return;
    }

    // Replace with actual submit behavior as needed
      showSuccessToast();
  });

  ['first-name', 'last-name', 'email', 'message', 'consent'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const eventName = el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(eventName, () => {
      clearError(id);
      clearInvalid(id);
    });
  });

  document.querySelectorAll('input[name="queryType"]').forEach((r) => {
    r.addEventListener('change', () => {
      clearError('queryType');
      clearInvalid('queryType');
    });
  });
}

/* Success toast handling */
function showSuccessToast() {
  const toast = document.getElementById('success-toast');
  if (!toast) return;
  // ensure visible
  toast.hidden = false;
  // force reflow then add class to trigger animation
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  toast.getBoundingClientRect();
  toast.classList.add('show');

  const closeBtn = toast.querySelector('.success-toast__close');
  const dismiss = () => {
    toast.classList.remove('show');
    setTimeout(() => (toast.hidden = true), 420);
  };

  // timeout auto-dismiss
  const timeoutId = setTimeout(dismiss, 4200);

  // click close
  closeBtn?.addEventListener('click', () => {
    clearTimeout(timeoutId);
    dismiss();
  }, { once: true });

  // also dismiss when clicking the toast itself
  toast.addEventListener('click', (e) => {
    if ((e.target).closest('.success-toast__close')) return;
    clearTimeout(timeoutId);
    dismiss();
  }, { once: true });
}
