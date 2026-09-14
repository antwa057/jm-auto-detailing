// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');
if (hamburger && mainNav) {
  hamburger.addEventListener('click', () => mainNav.classList.toggle('open'));
}

// ---------- Booking page: Detailing vs Bodywork toggle ----------
const toggleDetailing = document.getElementById('toggleDetailing');
const toggleBodywork = document.getElementById('toggleBodywork');
if (toggleDetailing && toggleBodywork) {
  const detailingPanel = document.getElementById('detailingPanel');
  const bodyworkPanel = document.getElementById('bodyworkPanel');

  toggleDetailing.addEventListener('click', () => {
    toggleDetailing.classList.add('active');
    toggleBodywork.classList.remove('active');
    detailingPanel.style.display = 'grid';
    bodyworkPanel.style.display = 'none';
  });

  toggleBodywork.addEventListener('click', () => {
    toggleBodywork.classList.add('active');
    toggleDetailing.classList.remove('active');
    bodyworkPanel.style.display = 'block';
    detailingPanel.style.display = 'none';
  });
}

// ---------- Booking page: dynamic pricing by vehicle type + Web3Forms submission ----------
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  const packageSelect = document.getElementById('package');
  const vehicleTypeSelect = document.getElementById('vehicleType');
  const odourAddon = document.getElementById('odourAddon');
  const estimatedTotalEl = document.getElementById('estimatedTotal');

  const PRICING = {
    'Quick Wash': { Sedan: 10.99, SUV: 20 },
    'Full Interior Detail': { Sedan: 100, SUV: 120 },
    'Premium Detail': { Sedan: 160, SUV: 180 }
  };

  function formatPrice(p) {
    return p % 1 === 0 ? '$' + p : '$' + p.toFixed(2);
  }

  function currentSizeKey() {
    return vehicleTypeSelect.value === 'SUV/Truck/Minivan' ? 'SUV' : 'Sedan';
  }

  function refreshPackageOptions() {
    const hasVehicleType = !!vehicleTypeSelect.value;
    const sizeKey = currentSizeKey();

    Array.from(packageSelect.options).forEach(opt => {
      if (!opt.value) {
        opt.textContent = hasVehicleType ? 'Select a package...' : 'Select vehicle type first...';
        return;
      }
      const price = PRICING[opt.value][sizeKey];
      opt.dataset.price = price;
      opt.textContent = `${opt.value} (${formatPrice(price)})`;
    });

    packageSelect.disabled = !hasVehicleType;
    recalcTotal();
  }

  function recalcTotal() {
    let total = 0;

    const pkgOption = packageSelect.options[packageSelect.selectedIndex];
    if (pkgOption && pkgOption.dataset.price) {
      total += parseFloat(pkgOption.dataset.price);
    }

    if (odourAddon && odourAddon.checked) {
      total += currentSizeKey() === 'SUV' ? 70 : 50;
    }

    estimatedTotalEl.textContent = '$' + total.toFixed(2);
  }

  vehicleTypeSelect.addEventListener('change', refreshPackageOptions);
  packageSelect.addEventListener('change', recalcTotal);
  if (odourAddon) odourAddon.addEventListener('change', recalcTotal);

  packageSelect.disabled = true;
  refreshPackageOptions();

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
        packageSelect.disabled = true;
        refreshPackageOptions();
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

// ---------- Bodywork page: clickable service cards, year/make/model dropdowns, Forminit submission ----------
const bodyworkForm = document.getElementById('bodyworkForm');
if (bodyworkForm) {
  const yearSelect = document.getElementById('bwYear');
  const makeSelect = document.getElementById('bwMake');
  const modelSelect = document.getElementById('bwModel');
  const otherModelWrap = document.getElementById('bwOtherModelWrap');

  // Clicking a service card checks its matching checkbox and scrolls to the form
  document.querySelectorAll('.service-card-link').forEach(card => {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      const service = card.dataset.service;
      const checkbox = document.querySelector(`input[data-service-checkbox="${service}"]`);
      if (checkbox) checkbox.checked = true;
      document.getElementById('quoteForm').scrollIntoView({ behavior: 'smooth' });
    });
  });

  const MAKES_MODELS = {
    "Acura": ["ILX","TLX","TSX","RDX","MDX","ZDX","NSX","Integra","Other/Not Listed"],
    "Alfa Romeo": ["Giulia","Stelvio","4C","Other/Not Listed"],
    "Aston Martin": ["DB11","DB12","Vantage","DBX","Rapide","Other/Not Listed"],
    "Audi": ["A3","A4","A5","A6","A7","A8","Q3","Q5","Q7","Q8","e-tron","TT","R8","Other/Not Listed"],
    "Bentley": ["Continental","Flying Spur","Bentayga","Mulsanne","Other/Not Listed"],
    "BMW": ["1 Series","2 Series","3 Series","4 Series","5 Series","6 Series","7 Series","8 Series","X1","X2","X3","X4","X5","X6","X7","Z4","i3","i4","iX","Other/Not Listed"],
    "Buick": ["Encore","Encore GX","Envision","Enclave","Regal","LaCrosse","Verano","Century","LeSabre","Other/Not Listed"],
    "Cadillac": ["ATS","CTS","CT4","CT5","CT6","XT4","XT5","XT6","Escalade","SRX","DeVille","Other/Not Listed"],
    "Chevrolet": ["Spark","Sonic","Cruze","Malibu","Impala","Camaro","Corvette","Bolt EV","Trax","Trailblazer","Equinox","Blazer","Traverse","Tahoe","Suburban","Colorado","Silverado","Aveo","Cobalt","HHR","Other/Not Listed"],
    "Chrysler": ["300","200","Pacifica","Voyager","Sebring","Town & Country","PT Cruiser","Other/Not Listed"],
    "Dodge": ["Charger","Challenger","Dart","Journey","Durango","Grand Caravan","Avenger","Caliber","Neon","Magnum","Nitro","Other/Not Listed"],
    "Ferrari": ["488","F8","Roma","Portofino","SF90","812","Other/Not Listed"],
    "Fiat": ["500","500X","500L","124 Spider","Other/Not Listed"],
    "Ford": ["Fiesta","Focus","Fusion","Taurus","Mustang","EcoSport","Escape","Edge","Explorer","Expedition","Bronco","Bronco Sport","Ranger","F-150","F-250","F-350","Maverick","Transit Connect","Flex","C-Max","Other/Not Listed"],
    "Genesis": ["G70","G80","G90","GV60","GV70","GV80","Other/Not Listed"],
    "GMC": ["Terrain","Acadia","Yukon","Yukon XL","Canyon","Sierra","Savana","Envoy","Other/Not Listed"],
    "Honda": ["Civic","Accord","Fit","Insight","CR-V","HR-V","Pilot","Passport","Ridgeline","Odyssey","Element","Prelude","S2000","Other/Not Listed"],
    "Hummer": ["H1","H2","H3","EV Pickup","EV SUV","Other/Not Listed"],
    "Hyundai": ["Accent","Elantra","Sonata","Veloster","Venue","Kona","Tucson","Santa Fe","Santa Cruz","Palisade","Ioniq 5","Ioniq 6","Genesis Coupe","Other/Not Listed"],
    "Infiniti": ["Q50","Q60","Q70","QX30","QX50","QX55","QX60","QX70","QX80","G35","G37","FX35","Other/Not Listed"],
    "Isuzu": ["Rodeo","Trooper","Axiom","Ascender","Other/Not Listed"],
    "Jaguar": ["XE","XF","XJ","F-Type","E-Pace","F-Pace","I-Pace","Other/Not Listed"],
    "Jeep": ["Wrangler","Gladiator","Cherokee","Grand Cherokee","Compass","Renegade","Patriot","Liberty","Commander","Other/Not Listed"],
    "Kia": ["Rio","Forte","Optima","K5","Stinger","Soul","Seltos","Sportage","Sorento","Telluride","Niro","EV6","Sedona","Carnival","Other/Not Listed"],
    "Lamborghini": ["Huracan","Aventador","Urus","Gallardo","Other/Not Listed"],
    "Land Rover": ["Range Rover","Range Rover Sport","Range Rover Evoque","Range Rover Velar","Discovery","Discovery Sport","Defender","LR2","LR3","LR4","Other/Not Listed"],
    "Lexus": ["IS","ES","GS","LS","RC","LC","UX","NX","RX","GX","LX","RZ","Other/Not Listed"],
    "Lincoln": ["MKZ","MKS","MKC","MKX","MKT","Continental","Navigator","Aviator","Corsair","Nautilus","Town Car","Other/Not Listed"],
    "Lotus": ["Elise","Evora","Emira","Exige","Other/Not Listed"],
    "Maserati": ["Ghibli","Quattroporte","Levante","GranTurismo","Other/Not Listed"],
    "Mazda": ["Mazda2","Mazda3","Mazda6","MX-5 Miata","CX-3","CX-30","CX-5","CX-9","CX-50","CX-90","Tribute","Other/Not Listed"],
    "McLaren": ["570S","720S","GT","Artura","Other/Not Listed"],
    "Mercedes-Benz": ["A-Class","C-Class","E-Class","S-Class","CLA","CLS","GLA","GLB","GLC","GLE","GLS","G-Class","SL","AMG GT","Metris","Sprinter","Other/Not Listed"],
    "Mercury": ["Grand Marquis","Sable","Milan","Mountaineer","Mariner","Other/Not Listed"],
    "MINI": ["Cooper","Cooper S","Clubman","Countryman","Paceman","Other/Not Listed"],
    "Mitsubishi": ["Mirage","Lancer","Eclipse Cross","Outlander","Outlander Sport","RVR","Endeavor","Galant","Other/Not Listed"],
    "Nissan": ["Versa","Sentra","Altima","Maxima","370Z","GT-R","Leaf","Kicks","Juke","Rogue","Murano","Pathfinder","Armada","Frontier","Titan","Xterra","Cube","Other/Not Listed"],
    "Oldsmobile": ["Alero","Cutlass","Intrigue","Bravada","Other/Not Listed"],
    "Plymouth": ["Neon","Voyager","Breeze","Other/Not Listed"],
    "Polestar": ["Polestar 1","Polestar 2","Polestar 3","Other/Not Listed"],
    "Pontiac": ["Grand Am","Grand Prix","Sunfire","G6","G5","Vibe","Torrent","Solstice","Other/Not Listed"],
    "Porsche": ["911","718 Boxster","718 Cayman","Panamera","Macan","Cayenne","Taycan","Other/Not Listed"],
    "Ram": ["1500","2500","3500","ProMaster","Dakota","Other/Not Listed"],
    "Rolls-Royce": ["Phantom","Ghost","Wraith","Cullinan","Dawn","Other/Not Listed"],
    "Saab": ["9-3","9-5","9-2X","9-7X","Other/Not Listed"],
    "Saturn": ["Ion","Aura","Vue","Outlook","Sky","Other/Not Listed"],
    "Scion": ["tC","xB","xD","FR-S","iQ","iA","Other/Not Listed"],
    "Smart": ["Fortwo","Fortwo Electric Drive","Other/Not Listed"],
    "Subaru": ["Impreza","Legacy","Outback","Forester","Crosstrek","Ascent","BRZ","WRX","Tribeca","Baja","Other/Not Listed"],
    "Suzuki": ["Swift","SX4","Grand Vitara","Kizashi","XL7","Other/Not Listed"],
    "Tesla": ["Model S","Model 3","Model X","Model Y","Cybertruck","Other/Not Listed"],
    "Toyota": ["Corolla","Camry","Avalon","Yaris","Prius","Matrix","Echo","RAV4","Highlander","4Runner","Sequoia","Land Cruiser","Tacoma","Tundra","Sienna","C-HR","Venza","FJ Cruiser","Other/Not Listed"],
    "Volkswagen": ["Golf","Jetta","Passat","Beetle","Rabbit","CC","Arteon","Tiguan","Atlas","Atlas Cross Sport","ID.4","Touareg","Other/Not Listed"],
    "Volvo": ["S60","S90","V60","V90","XC40","XC60","XC90","C40","Other/Not Listed"],
    "Other / Not Listed": ["Other/Not Listed"]
  };

  const thisYear = new Date().getFullYear() + 1;
  for (let y = thisYear; y >= 1980; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }

  Object.keys(MAKES_MODELS).sort().forEach(make => {
    const opt = document.createElement('option');
    opt.value = make;
    opt.textContent = make;
    makeSelect.appendChild(opt);
  });

  makeSelect.addEventListener('change', function () {
    const models = MAKES_MODELS[makeSelect.value] || [];
    modelSelect.innerHTML = '<option value="">Select model...</option>';
    models.forEach(model => {
      const opt = document.createElement('option');
      opt.value = model;
      opt.textContent = model;
      modelSelect.appendChild(opt);
    });
    modelSelect.disabled = !makeSelect.value;
    otherModelWrap.style.display = 'none';
  });

  modelSelect.addEventListener('change', function () {
    otherModelWrap.style.display = modelSelect.value === 'Other/Not Listed' ? 'block' : 'none';
  });

  bodyworkForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const statusEl = document.getElementById('bwFormStatus');
    const submitBtn = document.getElementById('bwSubmitBtn');

    const FORMINIT_ENDPOINT = 'https://forminit.com/f/cimg3ihn34k';

    if (FORMINIT_ENDPOINT.includes('YOUR_FORMINIT_FORM_ID')) {
      statusEl.textContent = 'This quote form is not fully set up yet - the site owner needs to add a free Forminit form ID.';
      statusEl.className = 'form-status error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    const formData = new FormData(bodyworkForm);

    try {
      const response = await fetch(FORMINIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      if (response.ok) {
        statusEl.textContent = "Thank you! Your quote request (and photos) have been sent - we'll review it with the team and get back to you.";
        statusEl.className = 'form-status success';
        bodyworkForm.reset();
        modelSelect.disabled = true;
        otherModelWrap.style.display = 'none';
      } else {
        statusEl.textContent = 'Something went wrong sending your request. Please call (506) 260-8990 instead.';
        statusEl.className = 'form-status error';
      }
    } catch (err) {
      statusEl.textContent = 'Network error. Please call (506) 260-8990 or try again.';
      statusEl.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request My Quote';
    }
  });
}
