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

// Aniversario (22 de octubre de 1961): dos cañones lanzan confeti, luego sigue
// cayendo confeti y suben globos. Se activa desde dos días antes hasta dos días
// después de la fecha. Para probarlo fuera de esas fechas: gdcayquina.cl/?aniversario
var ANIVERSARIO_MES = 9; // octubre (enero = 0)
var ANIVERSARIO_DIA = 22;
var FIESTA_COLORES = ['#C9680E', '#E68A2E', '#7A211B', '#D9584A', '#2B6F6B', '#59C2BA', '#F2C14E', '#F6EEE0'];

function enAniversario(hoy) {
  var fecha = new Date(hoy.getFullYear(), ANIVERSARIO_MES, ANIVERSARIO_DIA);
  var dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.abs(Math.round((dia - fecha) / 864e5)) <= 2;
}

function azar(a, b) { return a + Math.random() * (b - a); }

function crearCanon(lado) {
  var canon = el('div', 'cannon cannon-' + lado);
  canon.setAttribute('aria-hidden', 'true');
  var cuerpo = el('div', 'cannon-body');
  var tubo = el('div', 'cannon-barrel');
  tubo.appendChild(el('span', 'cannon-muzzle'));
  cuerpo.appendChild(tubo);
  cuerpo.appendChild(el('span', 'cannon-wheel'));
  canon.appendChild(cuerpo);
  document.body.appendChild(canon);
  return canon;
}

// Videos de saludo que se muestran durante el aniversario (botón "Ver saludos" del cartel)
var SALUDOS = [
  { src: 'video/saludo-aniversario-1.mp4', poster: 'img/saludo-aniversario-1.jpg', w: 854, h: 480 },
  { src: 'video/saludo-aniversario-2.mp4', poster: 'img/saludo-aniversario-2.jpg', w: 576, h: 1024 }
];
var saludosDialog = null;

function crearSaludosDialog() {
  saludosDialog = el('dialog', 'saludos');
  saludosDialog.setAttribute('aria-labelledby', 'saludosTitulo');
  var head = el('div', 'saludos-head');
  var titulo = el('h2', null, 'Saludos de aniversario');
  titulo.id = 'saludosTitulo';
  var cerrar = el('button', 'solicitud-cerrar', '✕');
  cerrar.type = 'button';
  cerrar.setAttribute('aria-label', 'Cerrar');
  cerrar.addEventListener('click', function () { saludosDialog.close(); });
  head.appendChild(titulo);
  head.appendChild(cerrar);
  saludosDialog.appendChild(head);

  var grid = el('div', 'saludos-grid');
  var videos = SALUDOS.map(function (s, i) {
    var v = el('video');
    v.src = s.src;
    v.poster = s.poster;
    v.width = s.w;
    v.height = s.h;
    v.controls = true;
    v.preload = 'none';
    v.playsInline = true;
    v.setAttribute('aria-label', 'Saludo de aniversario ' + (i + 1));
    grid.appendChild(v);
    return v;
  });
  // Solo un video a la vez, y se pausa la música si estaba sonando
  videos.forEach(function (v) {
    v.addEventListener('play', function () {
      videos.forEach(function (otro) { if (otro !== v) otro.pause(); });
      player.pause();
    });
  });
  saludosDialog.appendChild(grid);

  saludosDialog.addEventListener('close', function () {
    videos.forEach(function (v) { v.pause(); });
  });
  saludosDialog.addEventListener('click', function (e) {
    if (e.target === saludosDialog) saludosDialog.close();
  });
  document.body.appendChild(saludosDialog);
  return saludosDialog;
}

function celebrarAniversario() {
  var msg = el('div', 'fiesta-msg');
  var texto = el('div', 'fiesta-texto');
  texto.appendChild(el('strong', null, '¡Feliz aniversario!'));
  var linea = el('span', null, (new Date().getFullYear() - 1961) + ' años de fe y tradición · ');
  linea.appendChild(el('em', null, '22 de octubre de 1961'));
  texto.appendChild(linea);
  var verSaludos = el('button', 'btn btn-solid fiesta-ver', '▶ Ver saludos');
  verSaludos.type = 'button';
  verSaludos.addEventListener('click', function () {
    (saludosDialog || crearSaludosDialog()).showModal();
  });
  texto.appendChild(verSaludos);
  msg.appendChild(texto);
  var cerrar = el('button', 'fiesta-cerrar', '✕');
  cerrar.type = 'button';
  cerrar.setAttribute('aria-label', 'Cerrar saludo');
  // Cerrar solo oculta el saludo: el confeti y los globos siguen
  cerrar.addEventListener('click', function () { msg.classList.remove('visible'); });
  msg.appendChild(cerrar);
  document.body.appendChild(msg);

  // Con movimiento reducido solo se muestra el saludo
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    msg.classList.add('visible');
    return;
  }

  var canvas = el('canvas', 'fiesta-canvas');
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0;
  function medir() {
    // En celular la barra del navegador aparece y desaparece al hacer scroll y cambia
    // el alto: solo se redimensiona si cambia el ancho o la pantalla crece.
    if (window.innerWidth === W && window.innerHeight <= H) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  medir();
  window.addEventListener('resize', medir);

  var movil = W < 640;
  var MAX_LLUVIA = movil ? 55 : 110;
  var MAX_GLOBOS = movil ? 5 : 9;
  var confeti = [];
  var globos = [];
  var lluvia = false;
  var acumulado = 0;
  var proximoGlobo = 0;

  function papel(x, y, vx, vy, cae) {
    confeti.push({
      x: x, y: y, vx: vx, vy: vy, cae: cae,
      w: azar(5, 10), h: azar(8, 16),
      rot: azar(0, 6.28), vrot: azar(-6, 6),
      giro: azar(0, 6.28), vgiro: azar(4, 10),
      fase: azar(0, 6.28),
      color: FIESTA_COLORES[Math.floor(Math.random() * FIESTA_COLORES.length)]
    });
  }

  function disparar(canon, dir) {
    var boca = canon.querySelector('.cannon-muzzle').getBoundingClientRect();
    var x = boca.left + boca.width / 2;
    var y = boca.top + boca.height / 2;
    var n = movil ? 70 : 130;
    for (var i = 0; i < n; i++) {
      var ang = azar(48, 72) * Math.PI / 180;
      var v = H * azar(1.4, 2.6);
      papel(x, y, dir * Math.cos(ang) * v, -Math.sin(ang) * v, false);
    }
    canon.classList.remove('fire');
    void canon.offsetWidth; // reinicia la animación de retroceso
    canon.classList.add('fire');
  }

  function globo() {
    var r = movil ? azar(16, 24) : azar(22, 32);
    globos.push({
      x: azar(W * 0.05, W * 0.95), y: H + r * 2, r: r,
      v: azar(55, 105), fase: azar(0, 6.28), amp: azar(10, 26),
      color: FIESTA_COLORES[Math.floor(Math.random() * 7)]
    });
  }

  function dibujarGlobo(g, t) {
    var x = g.x + Math.sin(t * 1.2 + g.fase) * g.amp;
    var y = g.y;
    // Hilo ondulado
    ctx.strokeStyle = 'rgba(120,100,80,0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + g.r * 1.2);
    for (var i = 1; i <= 8; i++) {
      ctx.lineTo(x + Math.sin(t * 3 + g.fase + i) * 3, y + g.r * 1.2 + i * g.r * 0.35);
    }
    ctx.stroke();
    // Nudo
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.moveTo(x, y + g.r * 1.12);
    ctx.lineTo(x - 4, y + g.r * 1.32);
    ctx.lineTo(x + 4, y + g.r * 1.32);
    ctx.fill();
    // Cuerpo con brillo
    var grad = ctx.createRadialGradient(x - g.r * 0.35, y - g.r * 0.45, g.r * 0.1, x, y, g.r * 1.2);
    grad.addColorStop(0, 'rgba(255,255,255,0.75)');
    grad.addColorStop(0.25, g.color);
    grad.addColorStop(1, g.color);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, g.r, g.r * 1.18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  var antes = performance.now();
  function cuadro(ahora) {
    var dt = Math.min((ahora - antes) / 1000, 0.05);
    antes = ahora;
    var t = ahora / 1000;
    ctx.clearRect(0, 0, W, H);

    if (lluvia) {
      // Mantiene la lluvia pareja: entran tantos papeles como los que salen por abajo
      acumulado += dt * MAX_LLUVIA / (H / 110);
      var cayendo = confeti.filter(function (p) { return p.cae; }).length;
      while (acumulado >= 1) {
        acumulado--;
        if (cayendo++ < MAX_LLUVIA) papel(azar(0, W), -20, azar(-20, 20), azar(60, 140), true);
      }
      proximoGlobo -= dt;
      if (proximoGlobo <= 0 && globos.length < MAX_GLOBOS) {
        globo();
        proximoGlobo = azar(1.2, 3.2);
      }
    }

    var roce = Math.exp(-2.6 * dt);
    confeti = confeti.filter(function (p) {
      p.vx = p.vx * roce;
      p.vy = p.vy * roce + 380 * dt;
      p.x += (p.vx + Math.sin(t * 2 + p.fase) * 30) * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      p.giro += p.vgiro * dt;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.giro));
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      return p.y < H + 30;
    });

    globos = globos.filter(function (g) {
      g.y -= g.v * dt;
      dibujarGlobo(g, t);
      return g.y > -g.r * 5;
    });

    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);

  // Secuencia: entran los cañones, disparan dos veces, salen y queda la fiesta
  var izq = crearCanon('left');
  var der = crearCanon('right');
  setTimeout(function () { izq.classList.add('in'); der.classList.add('in'); }, 300);
  setTimeout(function () { disparar(izq, 1); disparar(der, -1); msg.classList.add('visible'); }, 1200);
  setTimeout(function () { disparar(izq, 1); disparar(der, -1); }, 1900);
  setTimeout(function () { lluvia = true; }, 2300);
  setTimeout(function () { izq.classList.remove('in'); der.classList.remove('in'); }, 3400);
  setTimeout(function () { izq.remove(); der.remove(); }, 4400);
}

if (/[?&]aniversario\b/.test(location.search) || enAniversario(new Date())) celebrarAniversario();
