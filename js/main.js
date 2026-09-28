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

// Año del footer y años de tradición (fundada en 1961), siempre al día
var year = new Date().getFullYear();
document.getElementById('year').textContent = year;
document.getElementById('anios').textContent = year - 1961;
