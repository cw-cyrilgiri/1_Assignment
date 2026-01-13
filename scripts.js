document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact-form');
  const toast = document.getElementById('success-toast');

  if (!form || !toast) return;

  form.addEventListener('submit', (e) => {
    if (!form.checkValidity()) return;

    e.preventDefault();
    showToast();
    form.reset();
  });

  function showToast() {
    toast.hidden = false;
    toast.getBoundingClientRect();
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => (toast.hidden = true), 420);
    }, 4200);
  }
});
