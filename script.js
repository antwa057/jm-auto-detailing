// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');
if (hamburger && mainNav) {
  hamburger.addEventListener('click', () => mainNav.classList.toggle('open'));
}

// ---------- Booking page: live price estimate + Web3Forms submission ----------
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  const packageSelect = document.getElementById('package');
  const vehicleTypeSelect = document.getElementById('vehicleType');
  const odourAddon = document.getElementById('odourAddon');
  const estimatedTotalEl = document.getElementById('estimatedTotal');

  function isSUV() {
    const vtOption = vehicleTypeSelect.options[vehicleTypeSelect.selectedIndex];
    return !!(vtOption && vtOption.value === 'SUV/Truck/Minivan');
  }

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

    if (odourAddon && odourAddon.checked) {
      total += isSUV() ? 70 : 50;
    }

    estimatedTotalEl.textContent = '$' + total.toFixed(2);
  }

  [packageSelect, vehicleTypeSelect].forEach(el => {
    if (el) el.addEventListener('change', recalcTotal);
  });
  if (odourAddon) odourAddon.addEventListener('change', recalcTotal);

  bookingForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const statusEl = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');
    const accessKey = bookingForm.querySelector('input[name="access_key"]').value;

    if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
      statusEl.textContent = 'Booking form is not fully set up yet - the site owner needs to add a free Web3Forms access key.';
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
        statusEl.textContent = "Thank you! Your booking request has been sent - we will confirm shortly.";
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
