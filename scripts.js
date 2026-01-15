const TIMING = {
  TOAST_ANIMATION_MS: 420,
  TOAST_VISIBLE_MS: 4200,
};

const SELECTORS = {
  FORM: ".contact-form",
  TOAST: "#success-toast",
  ERROR_MESSAGE: ".error-message",
  INPUT_ERROR: ".input-error",
  RADIO_GROUP: ".radio-group",
  SUCCESS_TOAST_ICON: ".success-toast-icon",
};

const FIELD_IDS = {
  FIRST_NAME: "first-name",
  LAST_NAME: "last-name",
  EMAIL: "email",
  QUERY_TYPE: "queryType",
  MESSAGE: "message",
  CONSENT: "consent",
};

const FIELD_NAMES = {
  QUERY_TYPE: "queryType",
};

const ARIA_ATTRIBUTES = {
  INVALID: "aria-invalid",
};

const CLASS_NAMES = {
  VISIBLE: "visible",
  ERROR: "error",
  INPUT_ERROR: "input-error",
  SELECTED: "selected",
  SHOW: "show",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const Name_REGEX = /^[a-zA-Z\s'-]+$/;

function querySelector(selector) {
  return { selector, element: document.querySelector(selector) };
}

function querySelectorAll(selector) {
  return { selector, elements: Array.from(document.querySelectorAll(selector)) };
}

function getElementById(id) {
  return { id, element: document.getElementById(id) };
}

function getErrorElementById(id) {
  return { errorId: `${id}-error`, element: document.getElementById(`${id}-error`) };
}

function getRadioInputsByName(name) {
  return querySelectorAll(`input[name="${name}"]:checked`);
}

function getFirstInvalidField(form) {
  return { element: form.querySelector(":invalid") };
}

function validateRequired(element) {
  if (!element || !element.value || !element.value.trim()) {
    return { isValid: false, message: "This field is required" };
  }
  return { isValid: true };
}

function validateName(element) {
  if (!element || !element.value) {
    return { isValid: false, message: "This field is required" };
  } else if (!Name_REGEX.test(element.value)) {
    return { isValid: false, message: "Please enter a valid name" };
  }
  return { isValid: true };
}

function validateEmail(element) {
  if (!element || !element.value) {
    return { isValid: false, message: "This field is required" };
  }
  if (!EMAIL_REGEX.test(element.value)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }
  return { isValid: true };
}

function validateChecked(element) {
  if (!element || !element.checked) {
    return { isValid: false, message: "To submit this form, please consent to being contacted" };
  }
  return { isValid: true };
}

function validateRadioGroup(name) {
  const { elements } = getRadioInputsByName(name);
  if (!elements || !elements.length) {
    return { isValid: false, message: "Please select a query type" };
  }
  return { isValid: true };
}

function setErrorMessage(id, message) {
  const { element: errorBox } = getErrorElementById(id);
  if (!errorBox) {
    return { success: false };
  }
  errorBox.textContent = message;
  errorBox.classList.add(CLASS_NAMES.VISIBLE);
  return { success: true };
}

function clearErrorMessage(id) {
  const { element: errorBox } = getErrorElementById(id);
  if (!errorBox) {
    return { success: false };
  }
  errorBox.textContent = "";
  errorBox.classList.remove(CLASS_NAMES.VISIBLE);
  return { success: true };
}

function setAriaInvalid(id) {
  if (id === FIELD_IDS.QUERY_TYPE) {
    const { elements } = getRadioInputsByName(FIELD_NAMES.QUERY_TYPE);
    elements.forEach((radio) => {
      radio.setAttribute(ARIA_ATTRIBUTES.INVALID, "true");
    });
  } else {
    const { element } = getElementById(id);
    element?.setAttribute(ARIA_ATTRIBUTES.INVALID, "true");
  }
}

function removeAriaInvalid(id) {
  if (id === FIELD_IDS.QUERY_TYPE) {
    const { elements } = getRadioInputsByName(FIELD_NAMES.QUERY_TYPE);
    elements.forEach((radio) => {
      radio.removeAttribute(ARIA_ATTRIBUTES.INVALID);
    });
  } else {
    const { element } = getElementById(id);
    element?.removeAttribute(ARIA_ATTRIBUTES.INVALID);
  }
}

function addErrorStyle(id) {
  if (id === FIELD_IDS.QUERY_TYPE) {
    const { elements } = querySelectorAll(SELECTORS.RADIO_GROUP);
    elements.forEach((group) => {
      group.classList.add(CLASS_NAMES.ERROR);
    });
  } else {
    const { element } = getElementById(id);
    element?.classList.add(CLASS_NAMES.INPUT_ERROR);
  }
}

function removeErrorStyle(id) {
  if (id === FIELD_IDS.QUERY_TYPE) {
    const { elements } = querySelectorAll(SELECTORS.RADIO_GROUP);
    elements.forEach((group) => {
      group.classList.remove(CLASS_NAMES.ERROR);
    });
  } else {
    const { element } = getElementById(id);
    element?.classList.remove(CLASS_NAMES.INPUT_ERROR);
  }
}

function displayFieldError(id, message) {
  setErrorMessage(id, message);
  setAriaInvalid(id);
  addErrorStyle(id);
}

function clearFieldError(id) {
  clearErrorMessage(id);
  removeAriaInvalid(id);
  removeErrorStyle(id);
}

function validateFieldWithValidator(id, validator) {
  const element = id === FIELD_IDS.QUERY_TYPE ? null : getElementById(id).element;
  return Promise.resolve(id === FIELD_IDS.QUERY_TYPE ? validator() : validator(element)).then(
    (result) => {
      if (!result.isValid) {
        displayFieldError(id, result.message);
        return { id, isValid: false };
      }
      clearFieldError(id);
      return { id, isValid: true };
    }
  );
}

function attachInvalidEventListener(form) {
  form.addEventListener(
    "invalid",
    (event) => {
      event.preventDefault();
      const element = event.target;
      const id = element.name === FIELD_NAMES.QUERY_TYPE ? FIELD_IDS.QUERY_TYPE : element.id;

      let validator = validateRequired;
      if (id === FIELD_IDS.EMAIL) {
        validator = validateEmail;
      } else if (id === FIELD_IDS.FIRST_NAME || id === FIELD_IDS.LAST_NAME) {
        validator = validateName;
      } else if (id === FIELD_IDS.CONSENT) {
        validator = validateChecked;
      } else if (id === FIELD_IDS.QUERY_TYPE) {
        validator = () => {
          return validateRadioGroup(FIELD_NAMES.QUERY_TYPE);
        };
      }

      const result = validator(element);
      if (!result.isValid) {
        displayFieldError(id, result.message);
      } else {
        clearFieldError(id);
      }
    },
    true
  );
}

function attachInputEventListener(form) {
  form.addEventListener("input", (event) => {
    const element = event.target;
    const id = element.name === FIELD_NAMES.QUERY_TYPE ? FIELD_IDS.QUERY_TYPE : element.id;
    clearFieldError(id);
  });
}

function attachChangeEventListener(form) {
  form.addEventListener("change", (event) => {
    const element = event.target;
    const id = element.name === FIELD_NAMES.QUERY_TYPE ? FIELD_IDS.QUERY_TYPE : element.id;
    clearFieldError(id);
  });
}

function focusFirstInvalidField(form) {
  const { element: firstInvalid } = getFirstInvalidField(form);
  if (!firstInvalid) {
    return;
  }
  const focusTarget =
    firstInvalid.name === FIELD_NAMES.QUERY_TYPE
      ? querySelector(`input[name="${FIELD_NAMES.QUERY_TYPE}"]`).element
      : firstInvalid;
  focusTarget?.focus();
}

function attachSubmitEventListener(form) {
  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        focusFirstInvalidField(form);
        return;
      }

      try {
        await showSuccessToast();
      } catch (error) {
        handleError(error);
      }
    },
    false
  );
}

function resetFormAfterSuccess(form) {
  form.reset();

  const { elements: errorMessages } = querySelectorAll(SELECTORS.ERROR_MESSAGE);
  errorMessages.forEach((msg) => {
    msg.textContent = "";
    msg.classList.remove(CLASS_NAMES.VISIBLE);
  });

  const { elements: inputErrors } = querySelectorAll(SELECTORS.INPUT_ERROR);
  inputErrors.forEach((input) => {
    input.classList.remove(CLASS_NAMES.INPUT_ERROR);
  });

  const { elements: radioGroups } = querySelectorAll(SELECTORS.RADIO_GROUP);
  radioGroups.forEach((group) => {
    group.classList.remove(CLASS_NAMES.SELECTED, CLASS_NAMES.ERROR);
  });

  const firstInput = querySelector("input,textarea,select").element;
  firstInput?.focus();
}

function hideToast(toast) {
  return new Promise((resolve) => {
    toast.classList.remove(CLASS_NAMES.SHOW);
    setTimeout(() => {
      toast.hidden = true;
      resolve();
    }, TIMING.TOAST_ANIMATION_MS);
  });
}

function showSuccessToast() {
  const { element: toast } = getElementById("success-toast");
  if (!toast) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const { element: form } = querySelector(SELECTORS.FORM);

    toast.hidden = false;
    toast.getBoundingClientRect();
    toast.classList.add(CLASS_NAMES.SHOW);

    if (form) {
      resetFormAfterSuccess(form);
    }

    setTimeout(() => {
      hideToast(toast).then(() => {
        resolve();
      });
    }, TIMING.TOAST_VISIBLE_MS);
  });
}

function handleError(error) {
  console.error("Form script error:", error);
}

function initializeForm() {
  const { element: form } = querySelector(SELECTORS.FORM);
  if (!form) {
    return { success: false };
  }

  attachInvalidEventListener(form);
  attachInputEventListener(form);
  attachChangeEventListener(form);
  attachSubmitEventListener(form);

  return { success: true };
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    initializeForm();
  } catch (error) {
    handleError(error);
  }
});
