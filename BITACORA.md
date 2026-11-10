# Bitácora — gdcayquina.cl

Sitio de la Gran Diablada Calameña. Hosting: Hostinger (con CDN). Repositorio: github.com/Pillage1982/pagina-diablada (público).

---

## 30-09-2026

### 1. Estilos de la sección Música no se veían en el sitio publicado
- **Problema:** en gdcayquina.cl la lista de canciones aparecía sin estilos, mientras que en local se veía bien.
- **Causa:** el `styles.css` nuevo sí estaba en el servidor, pero el CDN de Hostinger seguía entregando la versión antigua (caché de 7 días).
- **Solución:** se agregó un número de versión a los enlaces en `index.html`: `css/styles.css?v=2` y `js/main.js?v=2`.
- **Regla a futuro:** cada vez que cambie `styles.css` o `main.js`, subir el número (`?v=3`, `?v=4`…). Si aun así no se actualiza, limpiar la caché del CDN en hPanel.
- Nota: el tema claro u oscuro depende de la configuración de cada computador o navegador; no es un error.

### 2. Commit de la sección Música — `a310a64`
- Lista de 10 canciones con reproductor y botón de descarga MP3.
- Carpeta `musica/` (unos 44 MB) y estilos de la lista.
- Los MP3 llevan metadatos ID3 de autoría y derechos (título, pista, álbum, artista, © Gran Diablada Calameña, texto de licencia, enlaces al sitio y carátula).
- Los metadatos identifican la obra, pero se pueden borrar. Para respaldar legalmente la autoría, se recomienda inscribir las obras en el Departamento de Derechos Intelectuales (Ley 17.336).

### 3. Sección Transparencia — `205e91e`
- **Origen:** QR de un documento notarial, la "Autorización para el uso de cuentas bancarias personales con fines institucionales GDC". Firmada el 26-09-2026, con firma autorizada en la Primera Notaría de El Loa-Calama el 29-09-2026. El titular de la cuenta es Jorge Luis Montalbán Cofré (2do Director).
- **Qué se publicó:** solo la primera hoja (el certificado del notario), como imagen en `img/certificado-notarial.jpg`, accesible desde el botón "Ver certificado notarial".
- **Protección de datos aplicada a la imagen:**
  - Se taparon el QR, el código CVE y el código de barras, que permiten descargar el documento completo.
  - Se dejó visible el nombre del titular.
  - Marca de agua: "COPIA INFORMATIVA · USO EXCLUSIVO SOCIOS GDC".
  - No se incluyen las hojas con el RUT, la cuenta bancaria, la firma y la huella.
  - La imagen no contiene texto oculto ni metadatos.
- **En la página:** enlace "Transparencia" en los menús de escritorio y móvil, y botón con `rel="nofollow"`.
- **`robots.txt`:** pide a los buscadores no indexar la imagen del certificado.
- **Texto de la sección:** se dejó en un tono neutro y se quitó la mención a la reserva de datos, para evitar controversia durante la transición de directiva.
- Se cambió el fondo alternado de las secciones Actividades y Contacto.

### Archivos subidos a Hostinger
- `index.html`, `robots.txt`, `img/certificado-notarial.jpg` (además de `css/styles.css`, `js/main.js` y `musica/` en la subida anterior).

### Pendientes y recomendaciones
- No compartir el QR ni el PDF original en grupos abiertos, y nunca subir el PDF original al repositorio, que es público.
- Del documento notarial: solo lo firmó el titular (no hay firma en representación de la GDC), y la notaría legaliza la firma, no el contenido. Se sugiere que lo firmen también el presidente y el tesorero.
- La sección Actividades todavía tiene contenido de ejemplo.

---

## 03-10-2026

### SEO del sitio
- **`<head>`:** título y descripción con palabras clave (Calama, Ayquina, Virgen de Guadalupe, 1961), `canonical`, `robots`, `lang="es-CL"`, etiquetas Open Graph y Twitter con URL absoluta e imagen para compartir `img/og-image.jpg` (1200×630).
- **Datos estructurados (JSON-LD):** WebSite, WebPage, DanceGroup (fundación, fundador, Calama, correo, Instagram y Facebook) y la lista de canciones con duración.
- **Imágenes:** versiones livianas en WebP y JPG (`logo-96`, `logo-300`, `virgen-guadalupe-600/900`, `careta-600/900`), con textos alternativos más descriptivos. Los originales se mantienen.
- **Íconos:** `favicon.ico`, `apple-touch-icon.png`, `img/favicon-32.png`, `img/icon-192.png`, `img/icon-512.png` y `site.webmanifest`.
- **Archivos nuevos:** `sitemap.xml`; `robots.txt` ahora indica dónde está el sitemap.
- **`.htaccess`:** redirige `www.gdcayquina.cl` a `gdcayquina.cl` (antes ambos respondían y duplicaban el contenido), compresión, caché del navegador y `noindex` para el certificado.
- **Título principal (h1):** ahora incluye el nombre de la agrupación y dice «Más de 60 años» (antes «Más de 50», inconsistente con los 65 años del contador).
- Íconos PNG comprimidos (el de 512 px bajó de 252 KB a 96 KB).
- `styles.css` pasó a `?v=4`.

### Pendientes de SEO (requieren acceso del administrador)
- Registrar el sitio en Google Search Console y enviar `https://gdcayquina.cl/sitemap.xml`.
- Crear un Perfil de Empresa en Google (Calama) y enlazar el sitio desde Instagram y Facebook.

### Actividades conectadas a la app
- La sección Actividades ya no tiene contenido de ejemplo: carga las próximas actividades (hasta 6, no finalizadas, desde hoy) desde `https://app.gdcayquina.cl/publico/actividades`.
- **App (repo club-deportivo-app, rama `cliente/calamena`):** nueva ruta pública de solo lectura `GET /publico/actividades` (`backend/routes/publicoRoutes.js`, montada en `server.js` antes del CORS global). Entrega solo nombre, tipo, fecha y lugar; nunca la descripción. Tiene caché de 5 minutos.
- Si la app no responde o no hay actividades, la sección muestra un mensaje con enlace a Instagram.
- `main.js` pasó a `?v=3` y `styles.css` a `?v=5`.
- **Decisión (03-10-2026):** se muestran todas las actividades (ensayos, presentaciones y reuniones), no solo presentaciones.
- **Orden de despliegue:** primero la app (probar en dev.gdcayquina.cl y luego producción); después subir la web.

---

## 20-10-2026

### Animación de aniversario — `2a2d969`
- **Cuándo se activa:** sola, cada año del **20 al 24 de octubre** (dos días antes y dos días después del aniversario, el 22 de octubre de 1961). Para verla en otras fechas: `gdcayquina.cl/?aniversario`.
- **Qué hace:** entran dos cañones (izquierda y derecha) que disparan confeti dos veces y se retiran; después cae confeti sin parar y suben globos de colores.
- **Saludo:** cartel grande «¡Feliz aniversario!» con «65 años de fe y tradición · 22 de octubre de 1961». Los años se calculan solos cada año. El cartel es siempre oscuro con borde naranjo, para que se lea bien en modo claro y oscuro.
- La ✕ del saludo solo lo oculta; el confeti y los globos siguen al cerrar el saludo y al hacer scroll.
- No bloquea clics ni formularios. En celular sale menos confeti y menos globos. Si el dispositivo tiene activado «reducir movimiento», solo se muestra el saludo.
- **Para cambiar la fecha:** variables `ANIVERSARIO_MES` y `ANIVERSARIO_DIA` al final de `js/main.js`.
- `styles.css` pasó a `?v=8` y `main.js` a `?v=7`.

### Archivos subidos a Hostinger
- `index.html`, `css/styles.css`, `js/main.js` (zip `gdcayquina-aniversario.zip` en el escritorio).

### Videos de saludo de aniversario — `5980875`
- Botón «▶ Ver saludos» en el cartel de aniversario: abre una ventana con dos videos de saludo (sin nombres). Se ve solo mientras está activa la celebración (20 al 24 de octubre).
- Archivos: `video/saludo-aniversario-1.mp4` (horizontal, 1:09) y `video/saludo-aniversario-2.mp4` (vertical, 1:38), con portadas `img/saludo-aniversario-1.jpg` y `-2.jpg`.
- Los videos se descargan solo al darles play; uno pausa al otro y a la música; al cerrar la ventana se pausan.
- Para cambiarlos otro año: reemplazar los archivos con el mismo nombre, o editar la lista `SALUDOS` en `js/main.js`.
- `styles.css` pasó a `?v=9` y `main.js` a `?v=8`. Zip para Hostinger: `gdcayquina-saludos.zip` en el escritorio.

---

## 21-10-2026

### Directiva y solicitud de ingreso — `9d3786d`
- **Directiva** (cuadrícula de 3 columnas, se lee de izquierda a derecha): Presidente Jorge Montalbán Cofré · Tesorero Wilson Muñoz Contrera · Secretaria María José Carozzi Ávalos · Primer, Segundo y Tercer Director (sin nombre) · Coordinador (sin nombre) · Caporales José Miguel Carvajal Sotomayor y Cristian Alejandro Pizarro Pizarro. Los cargos sin nombre muestran «—».
- **Solicitud de ingreso:** la comparsa de interés solo ofrece Diablos, Diablesas y China Supay (más «Aún no lo sé»). La app no valida la lista, no requirió cambios.
- `styles.css` pasó a `?v=10`. Zip para Hostinger: `gdcayquina-directiva.zip` en el escritorio.

---

## 22-10-2026

### Solicitud de ingreso = Ficha de actualización de datos GDC — `48ee857`
- **Formulario «Súmate a la promesa»:** ahora pide los mismos datos de la ficha en papel (`Ficha actualizacion de datos GDC 2027.pdf`): nombre, RUT, domicilio, ciudad, celular, fecha de nacimiento, estado civil, correo, sacramentos (bautizo, comunión, confirmación), condición (bailarín con bloque/fila, o socio), apoderado si es menor de 18, baile religioso anterior (Asociación / Federación / Central Caporales) y **firma** dibujada con el dedo o el mouse (si es menor, firma el apoderado).
- **App (rama `cliente/calamena`):** arma el PDF de la ficha con el mismo diseño y lo envía adjunto a presidencia, secretaría y caporales, con copia al postulante. En el panel, Tablas → Solicitudes muestra todos los datos y el botón «Ver ficha PDF». La fecha de ingreso y el pago de la cuota de inscripción se completan solos al aceptar y registrar el pago.
- `styles.css` pasó a `?v=11` y `main.js` a `?v=9`.
- **Orden de despliegue:** primero la app (dev.gdcayquina.cl y luego producción); después subir la web.
- **Commits de la app:** `b93d70c` en `cliente/calamena` y merge `3130029` en `cliente/calamena-produccion` (ambos subidos a GitHub). No cambia `package.json`, así que no hace falta `npm install`.
- **Zips en el escritorio:** `calamena-pruebas-b93d70c.zip` (dev.gdcayquina.cl), `calamena-produccion-3130029.zip` (app.gdcayquina.cl) y `gdcayquina-ficha-ingreso.zip` (sitio: `index.html`, `css/styles.css`, `js/main.js`).

---

## 10-11-2026

### Primer Director designado
- Se designó al **Primer Director: Rodrigo Montalbán Cofré** (antes aparecía «—» en la directiva).
- Solo cambia `index.html` (texto). No se tocó CSS ni JS, así que no hay que subir versión `?v=N`.
- **Archivo a subir a Hostinger:** `index.html`.

### Ajustes de la directiva
- Se **quitó el cargo de Coordinador** de la tabla.
- Se **agregó un tercer Caporal: Alonso Maldonado Troncoso**.
- Se corrigió el segundo apellido del Tesorero: **Wilson Muñoz Contreras** (antes «Contrera»).
- Solo cambia `index.html`. No se tocó CSS ni JS.
