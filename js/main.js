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
