// Shared site script. Safe to load on every page; each block no-ops when its
// targets aren't present.

// 1) Scroll spy — highlight the nav link for the section currently in view.
(function () {
  if (!('IntersectionObserver' in window)) return;
  var links = {};
  document.querySelectorAll('header nav a.navlink').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#') links[href.slice(1)] = a;
  });
  if (!Object.keys(links).length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var link = links[en.target.id];
      if (!link) return;
      Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
      link.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(links).forEach(function (id) {
    var s = document.getElementById(id);
    if (s) io.observe(s);
  });
})();

// 2) Waitlist forms — submit via fetch and show an inline confirmation, so the
// visitor never leaves the page or sees Formspree's default thank-you page.
(function () {
  document.querySelectorAll('form.waitlist').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      var err = form.querySelector('.form-err');
      if (err) err.remove();

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.innerHTML =
            '<p class="form-ok">✓ You\'re on the list — we\'ll email you. No spam.</p>';
          return;
        }
        return res.json().then(function (data) {
          var m = data && data.errors && data.errors[0] && data.errors[0].message;
          throw new Error(m || 'Something went wrong.');
        });
      }).catch(function (ex) {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        var p = document.createElement('p');
        p.className = 'form-err';
        p.textContent = ex.message + ' Please try again.';
        form.appendChild(p);
      });
    });
  });
})();
