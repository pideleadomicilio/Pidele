// llena los datos del responsable (legal-datos.js) en la página
(function () {
  var L = window.LEGAL || {};
  document.querySelectorAll('[data-l]').forEach(function (el) {
    var k = el.getAttribute('data-l'), v = L[k] || '';
    if (k === 'contacto') {
      el.innerHTML = '';
      if (L.correo && !/ESCRIBE/.test(L.correo)) { var a = document.createElement('a'); a.href = 'mailto:' + L.correo; a.textContent = L.correo; el.appendChild(a); }
      if (L.whatsapp) { var w = document.createElement('a'); w.href = 'https://wa.me/52' + String(L.whatsapp).replace(/\D/g, '').slice(-10); w.textContent = 'WhatsApp ' + L.whatsapp; if (el.childNodes.length) el.appendChild(document.createTextNode(' · ')); el.appendChild(w); }
      if (!el.childNodes.length) { el.textContent = 'FALTA EL CORREO EN legal-datos.js'; el.className += ' falta'; }
      return;
    }
    el.textContent = v;
    if (/ESCRIBE/.test(v)) el.className += ' falta';
  });
})();
