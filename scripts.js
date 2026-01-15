const TOAST_ANIMATION_MS = 420;
const TOAST_VISIBLE_MS = 4200;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// attach event listeners after DOM is ready
document.addEventListener("DOMContentLoaded", () => init().catch(handleError));

// Helper functions for querying DOM
function qs(sel) {
  return document.querySelector(sel);
}
function qsa(sel) {
  return Array.from(document.querySelectorAll(sel));
}
function byId(id) {
  return document.getElementById(id);
}

// Validators
const required = (el) =>
  el && el.value && el.value.trim() ? true : "This field is required";
const email = (el) =>
  el && el.value && emailRegex.test(el.value)
    ? true
    : el && el.value
    ? "Please enter a valid email address"
    : "This field is required";
const checked = (el) =>
  el && el.checked
    ? true
    : "To submit this form, please consent to being contacted";
const radio = (name) =>
  qsa(`input[name="${name}"]:checked`).length
    ? true
    : "Please select a query type";

//add error message
function setError(id, msg) {
  const box = byId(id + "-error");
  if (!box) return;
  box.textContent = msg;
  box.classList.add("visible");

  // set aria-invalid for error indication
  if (id === "queryType")
    qsa('input[name="queryType"]').forEach((r) =>
      r.setAttribute("aria-invalid", "true")
    );
  else byId(id)?.setAttribute("aria-invalid", "true");
}

// clear error message
function clearError(id) {
  const box = byId(id + "-error");
  if (!box) return;
  box.textContent = "";
  box.classList.remove("visible");

  // remove aria-invalid
  if (id === "queryType")
    qsa('input[name="queryType"]').forEach((r) =>
      r.removeAttribute("aria-invalid")
    );
  else byId(id)?.removeAttribute("aria-invalid");
}

// add/remove error styles
function mark(id) {
  if (id === "queryType")
    qsa(".radio-group").forEach((r) => r.classList.add("error"));
  else byId(id)?.classList.add("input-error");
}
function unmark(id) {
  if (id === "queryType")
    qsa(".radio-group").forEach((r) => r.classList.remove("error"));
  else byId(id)?.classList.remove("input-error");
}

// central promise error handler
function handleError(err) {
  console.error("Form script error:", err);
}

// validation logic
function validateField(id, validator) {
  const el = id === "queryType" ? null : byId(id);
  return Promise.resolve(id === "queryType" ? validator() : validator(el)).then(
    (res) => {
      if (res !== true) {
        setError(id, res);
        mark(id);
        return false;
      }
      clearError(id);
      unmark(id);
      return true;
    }
  );
}

function init() {
  const form = qs(".contact-form");
  if (!form) return Promise.resolve(false);

  // Handle built-in invalid events and show custom messages (no loops)
  form.addEventListener(
    "invalid",
    (e) => {
      e.preventDefault(); // prevent native tooltip
      const el = e.target;
      const id = el.name === "queryType" ? "queryType" : el.id;
      let msg = "This field is required";
      if (id === "email") msg = email(el);
      else if (id === "consent") msg = checked(el);
      else if (id === "queryType") msg = radio("queryType");
      else msg = required(el);
      if (msg !== true) {
        setError(id, msg);
        mark(id);
      } else {
        clearError(id);
        unmark(id);
      }
    },
    true
  );

  // Clear errors on user input/change (single listeners, no loops)
  form.addEventListener("input", (e) => {
    const el = e.target;
    const id = el.name === "queryType" ? "queryType" : el.id;
    clearError(id);
    unmark(id);
  });
  form.addEventListener("change", (e) => {
    const el = e.target;
    const id = el.name === "queryType" ? "queryType" : el.id;
    clearError(id);
    unmark(id);
  });

  form.addEventListener(
    "submit",
    async (e) => {
      e.preventDefault();
      // checkValidity/reportValidity will trigger invalid events for any failing controls
      if (!form.checkValidity()) {
        form.reportValidity(); // triggers invalid handlers above
        focusFirstInvalid(form);
        return;
      }
      await showSuccessToast();
    },
    false
  );

  return Promise.resolve(true);
}

//focus on first invalid field
const focusFirstInvalid = (form) => {
  const firstBad = form.querySelector(":invalid");
  (firstBad && firstBad.name === "queryType"
    ? qs('input[name="queryType"]')
    : firstBad
  )?.focus();
};

function showSuccessToast() {
  const toast = byId("success-toast");
  if (!toast) return Promise.resolve(false);

  return new Promise((resolve) => {
    toast.hidden = false;
    toast.getBoundingClientRect();
    toast.classList.add("show");
    const form = qs(".contact-form");
    if (form) {
      form.reset();
      qsa(".error-message").forEach((e) => {
        e.textContent = "";
        e.classList.remove("visible");
      });
      qsa(".input-error").forEach((e) => e.classList.remove("input-error"));
      qsa(".radio-group").forEach((r) =>
        r.classList.remove("selected", "error")
      );
      qs("input,textarea,select")?.focus();
    }
    const hide = () => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.hidden = true;
        resolve(true);
      }, TOAST_ANIMATION_MS);
    };
    setTimeout(hide, TOAST_VISIBLE_MS);
  });
}
