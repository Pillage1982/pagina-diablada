// Menú móvil
var menuBtn = document.getElementById('menuBtn');
var mobileMenu = document.getElementById('mobileMenu');

function setMenu(open) {
  mobileMenu.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

menuBtn.addEventListener('click', function () {
  setMenu(!mobileMenu.classList.contains('open'));
});
mobileMenu.querySelectorAll('a').forEach(function (a) {
  a.addEventListener('click', function () { setMenu(false); });
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') setMenu(false);
});

// Reproductor de canciones: un solo <audio> compartido por toda la lista
var player = new Audio();
player.preload = 'none';
var current = null;

function fmt(s) {
  s = Math.floor(s || 0);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function setPlaying(track, playing) {
  var title = track.querySelector('.track-title').textContent;
  var btn = track.querySelector('.track-play');
  track.classList.toggle('playing', playing);
  btn.querySelector('span').textContent = playing ? '❚❚' : '▶';
  btn.setAttribute('aria-label', (playing ? 'Pausar ' : 'Reproducir ') + title);
}

document.querySelectorAll('.track').forEach(function (track) {
  var seek = track.querySelector('.track-seek');
  var time = track.querySelector('.track-time');
  time.dataset.total = time.textContent;

  track.querySelector('.track-play').addEventListener('click', function () {
    if (current === track) {
      if (player.paused) player.play(); else player.pause();
      return;
    }
    if (current) {
      setPlaying(current, false);
      current.querySelector('.track-seek').hidden = true;
      current.querySelector('.track-time').textContent = current.querySelector('.track-time').dataset.total;
    }
    current = track;
    player.src = track.dataset.src;
    seek.value = 0;
    seek.hidden = false;
    player.play();
  });

  seek.addEventListener('input', function () {
    if (current === track) player.currentTime = seek.value;
  });
});

player.addEventListener('play', function () { if (current) setPlaying(current, true); });
player.addEventListener('pause', function () { if (current) setPlaying(current, false); });
player.addEventListener('loadedmetadata', function () {
  if (current) current.querySelector('.track-seek').max = Math.floor(player.duration);
});
player.addEventListener('timeupdate', function () {
  if (!current) return;
  current.querySelector('.track-seek').value = Math.floor(player.currentTime);
  current.querySelector('.track-time').textContent =
    fmt(player.currentTime) + ' / ' + current.querySelector('.track-time').dataset.total;
});
player.addEventListener('ended', function () {
  // Al terminar, sigue con la próxima canción de la lista
  var next = current && current.nextElementSibling;
  if (next) next.querySelector('.track-play').click();
});

// Año del footer y años de tradición (fundada en 1961), siempre al día
var year = new Date().getFullYear();
document.getElementById('year').textContent = year;
document.getElementById('anios').textContent = year - 1961;

// Próximas actividades, leídas desde la app (app.gdcayquina.cl/publico/actividades)
var eventGrid = document.getElementById('eventGrid');
var MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
var TIPOS = { entrenamiento: 'Ensayo', partido: 'Presentación', reunion: 'Reunión' };

function el(tag, cls, text) {
  var node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

function eventStatus(texto) {
  var p = el('p', 'event-status', texto + ' ');
  var a = el('a', null, 'Síguenos en Instagram');
  a.href = 'https://instagram.com/gdcayquinaoficial';
  a.target = '_blank';
  a.rel = 'noopener';
  p.appendChild(a);
  p.appendChild(document.createTextNode(' para enterarte de las novedades.'));
  eventGrid.replaceChildren(p);
}

function eventCard(ev) {
  // fecha llega como "AAAA-MM-DD HH:MM:SS" en hora de Chile
  var m = String(ev.fecha).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return null;
  var card = el('div', 'event-card');
  var date = el('div', 'event-date');
  date.appendChild(el('span', 'd', String(Number(m[3]))));
  date.appendChild(el('span', 'm', MESES[Number(m[2]) - 1]));
  var body = el('div');
  body.appendChild(el('h3', null, ev.nombre));
  body.appendChild(el('p', 'when', (TIPOS[ev.tipo] || 'Actividad') + ' · ' + m[4] + ':' + m[5] + ' hrs'));
  if (ev.ubicacion) body.appendChild(el('p', null, ev.ubicacion));
  card.appendChild(date);
  card.appendChild(body);
  return card;
}

if (eventGrid) {
  fetch(eventGrid.dataset.api)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (eventos) {
      var cards = eventos.map(eventCard).filter(Boolean);
      if (!cards.length) return eventStatus('Por ahora no hay actividades programadas.');
      eventGrid.replaceChildren.apply(eventGrid, cards);
    })
    .catch(function () {
      eventStatus('No pudimos cargar el calendario en este momento.');
    });
}

// Solicitud de ingreso "Súmate a la promesa": se envía a la app
// (app.gdcayquina.cl/publico/solicitud-ingreso), que avisa por correo a la directiva.
var solicitudDialog = document.getElementById('solicitudDialog');
var solicitudForm = document.getElementById('solicitudForm');
var solicitudEstado = document.getElementById('solicitudEstado');
var solicitudApoderado = document.getElementById('solicitudApoderado');
var EDAD_MAYORIA = 18;
var CAMPOS_APODERADO = ['nombre_apoderado', 'rut_apoderado', 'telefono_apoderado'];

function edadDesde(fecha) {
  var m = String(fecha || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  var hoy = new Date();
  var edad = hoy.getFullYear() - Number(m[1]);
  var mes = hoy.getMonth() + 1;
  if (mes < Number(m[2]) || (mes === Number(m[2]) && hoy.getDate() < Number(m[3]))) edad--;
  return edad;
}

function esMenor() {
  var edad = edadDesde(solicitudForm.elements.fecha_nacimiento.value);
  return edad !== null && edad < EDAD_MAYORIA;
}

function actualizarApoderado() {
  var menor = esMenor();
  solicitudApoderado.hidden = !menor;
  CAMPOS_APODERADO.forEach(function (campo) {
    solicitudForm.elements[campo].required = menor;
  });
}

function rutValido(rut) {
  var limpio = String(rut || '').replace(/[.\-\s]/g, '').toUpperCase();
  if (!/^\d{7,8}[\dK]$/.test(limpio)) return false;
  var cuerpo = limpio.slice(0, -1);
  var suma = 0;
  var mult = 2;
  for (var i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  var resto = 11 - (suma % 11);
  var dv = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return limpio.slice(-1) === dv;
}

function celularValido(tel) {
  var d = String(tel || '').replace(/\D/g, '');
  return /^9\d{8}$/.test(d) || /^569\d{8}$/.test(d);
}

function mostrarEstado(texto, tipo) {
  solicitudEstado.textContent = texto;
  solicitudEstado.className = 'solicitud-estado' + (tipo ? ' ' + tipo : '');
}

// Revisión en el navegador para avisar antes de enviar; la app valida todo de nuevo.
function errorFormulario(f) {
  if (!rutValido(f.rut.value)) return ['rut', 'Revisa el RUT: no es válido.'];
  if (!f.fecha_nacimiento.value || edadDesde(f.fecha_nacimiento.value) < 0) return ['fecha_nacimiento', 'Ingresa tu fecha de nacimiento.'];
  if (f.nombres.value.trim().length < 2) return ['nombres', 'Ingresa tus nombres.'];
  if (f.apellido_paterno.value.trim().length < 2) return ['apellido_paterno', 'Ingresa tu apellido paterno.'];
  if (!celularValido(f.telefono.value)) return ['telefono', 'Ingresa un celular válido, por ejemplo +56 9 1234 5678.'];
  if (!f.email.checkValidity() || !f.email.value) return ['email', 'Ingresa un correo electrónico válido.'];
  if (esMenor()) {
    if (f.nombre_apoderado.value.trim().length < 5) return ['nombre_apoderado', 'Ingresa el nombre completo del apoderado.'];
    if (!rutValido(f.rut_apoderado.value)) return ['rut_apoderado', 'Revisa el RUT del apoderado: no es válido.'];
    if (!celularValido(f.telefono_apoderado.value)) return ['telefono_apoderado', 'Ingresa un celular válido para el apoderado.'];
  }
  if (!f.acepta_datos.checked) return ['acepta_datos', 'Debes autorizar el uso de tus datos para enviar la solicitud.'];
  return null;
}

if (solicitudDialog && solicitudForm) {
  solicitudForm.elements.fecha_nacimiento.max = new Date().toISOString().slice(0, 10);

  document.querySelectorAll('[data-abrir-solicitud]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      mostrarEstado('');
      solicitudDialog.showModal();
    });
  });
  solicitudDialog.querySelectorAll('[data-cerrar-solicitud]').forEach(function (btn) {
    btn.addEventListener('click', function () { solicitudDialog.close(); });
  });
  // Clic fuera del formulario (en el fondo oscuro) también cierra
  solicitudDialog.addEventListener('click', function (e) {
    if (e.target === solicitudDialog) solicitudDialog.close();
  });

  solicitudForm.elements.fecha_nacimiento.addEventListener('change', actualizarApoderado);

  solicitudForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = solicitudForm.elements;
    var error = errorFormulario(f);
    if (error) {
      mostrarEstado(error[1], 'error');
      f[error[0]].focus();
      return;
    }

    var datos = {
      rut: f.rut.value,
      fecha_nacimiento: f.fecha_nacimiento.value,
      nombres: f.nombres.value,
      apellido_paterno: f.apellido_paterno.value,
      apellido_materno: f.apellido_materno.value,
      telefono: f.telefono.value,
      email: f.email.value,
      comparsa_interes: f.comparsa_interes.value,
      mensaje: f.mensaje.value,
      sitio_web: f.sitio_web.value,
      acepta_datos: f.acepta_datos.checked
    };
    if (esMenor()) {
      CAMPOS_APODERADO.forEach(function (campo) { datos[campo] = f[campo].value; });
    }

    var enviar = solicitudForm.querySelector('[type="submit"]');
    enviar.disabled = true;
    mostrarEstado('Enviando…');

    fetch(solicitudForm.dataset.api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) {
          if (!r.ok) throw new Error(data.mensaje || 'No pudimos enviar tu solicitud.');
          return data;
        });
      })
      .then(function (data) {
        solicitudForm.reset();
        actualizarApoderado();
        mostrarEstado('¡Solicitud enviada' + (data.folio ? ' (folio ' + data.folio + ')' : '') +
          '! La directiva la revisará y te contactaremos por correo.', 'ok');
      })
      .catch(function (err) {
        var texto = err instanceof TypeError
          ? 'No pudimos conectarnos. Revisa tu conexión e intenta nuevamente.'
          : err.message;
        mostrarEstado(texto, 'error');
      })
      .finally(function () { enviar.disabled = false; });
  });
}
