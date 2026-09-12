// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');
if (hamburger && mainNav) {
  hamburger.addEventListener('click', () => mainNav.classList.toggle('open'));
}

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  const packageSelect = document.getElementById('package');
  const vehicleTypeSelect = document.getElementById('vehicleType');
  const locationSelect = document.getElementById('location');
  const addonCheckboxes = document.querySelectorAll('input[data-addon-price]');
  const estimatedTotalEl = document.getElementById('estimatedTotal');

  function recalcTotal() {
    let total = 0;
    const pkgOption = packageSelect.options[packageSelect.selectedIndex];
    if (pkgOption && pkgOption.dataset.price) {
      total += parseFloat(pkgOption.dataset.price);
    }
    const vtOption = vehicleTypeSelect.options[vehicleTypeSelect.selectedIndex];
    if (vtOption && vtOption.dataset.upcharge) {
      total += parseFloat(vtOption.dataset.upcharge);
    }
    addonCheckboxes.forEach(cb => {
      if (cb.checked) total += parseFloat(cb.dataset.addonPrice);
    });
    const locOption = locationSelect.options[locationSelect.selectedIndex];
    if (locOption && locOption.dataset.mobile) {
      total += parseFloat(locOption.dataset.mobile);
    }
    estimatedTotalEl.textContent = '$' + total.toFixed(2);
  }

  [packageSelect, vehicleTypeSelect, locationSelect].forEach(el => {
    if (el) el.addEventListener('change', recalcTotal);
  });
  addonCheckboxes.forEach(cb => cb.addEventListener('change', recalcTotal));

  bookingForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const statusEl = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');
    const accessKey = bookingForm.querySelector('input[name="access_key"]').value;

    if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
      statusEl.textContent = 'Booking form is not fully set up yet — the site owner needs to add a free Web3Forms access key.';
      statusEl.className = 'form-status error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    const formData = new FormData(bookingForm);
    formData.append('Estimated Total', estimatedTotalEl.textContent);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });
      const result = await response.json();

      if (result.success) {
        statusEl.textContent = "Thank you! Your booking request has been sent — we'll confirm shortly.";
        statusEl.className = 'form-status success';
        bookingForm.reset();
        estimatedTotalEl.textContent = '$0.00';
      } else {
        statusEl.textContent = 'Something went wrong sending your request. Please call (506) 260-8990 instead.';
        statusEl.className = 'form-status error';
      }
    } catch (err) {
      statusEl.textContent = 'Network error. Please call (506) 260-8990 or try again.';
      statusEl.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Booking Request';
    }
  });
}
