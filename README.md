# Pídele

App de pedidos a domicilio para La Cruz de Elota. Une a **compradores**, **negocios** y **repartidores**, con un **administrador**.
El pago de la comida es directo al negocio por transferencia (CLABE, tarjeta o QR CoDi) y el envío se paga en efectivo al repartidor: sin comisiones para nadie.

## Archivos
| Archivo | Va en |
|---|---|
| `index.html`, `manifest.json`, `sw.js`, `firebase-config.js`, `icons/` | Este repositorio de GitHub (GitHub Pages) |
| `Code.gs` (se entrega como `Codigo-gs.html`) | Apps Script ligado a una Hoja de cálculo |
| `worker.js` (se entrega como `worker-cloudflare.html`) | Cloudflare Worker para WhatsApp (ver `GUIA-WhatsApp.md`) |

## Instalación
1. **Servidor**: crea una Hoja de cálculo nueva → Extensiones → Apps Script → pega el código en `Code.gs`.
   Cambia `ADMIN_TEL` y `ADMIN_PASS` al inicio y ejecuta `instalar()` una vez (acepta permisos).
2. **Publica**: Implementar → Nueva implementación → Aplicación web · Ejecutar como **Yo** · Acceso **Cualquier usuario**. Copia la URL que termina en `/exec`.
3. **App**: en `index.html` pega esa URL en `const API_URL = '...'`.
4. **GitHub**: sube los archivos a un repositorio → Settings → Pages → rama `main`, carpeta `/root`.
5. Entra con tu teléfono y contraseña de administrador → Ajustes → pon el WhatsApp de soporte.

Cada vez que cambies `Code.gs`: Implementar → Administrar implementaciones → editar → **Nueva versión** (así la URL no cambia).
Cada vez que cambies `sw.js` o `index.html` de forma importante, sube el número en `VERSION` de `sw.js` para que los teléfonos tomen la versión nueva.

## Flujo de un pedido
`NUEVO` → negocio acepta y fija minutos → `POR_PAGAR` (el cliente ve CLABE/QR y adjunta comprobante) → `PAGO_ENVIADO` → negocio confirma → `PREPARANDO` (aparece a repartidores con su hora de salida) → `LISTO` → repartidor recoge → `EN_CAMINO` → `ENTREGADO`.

- Un repartidor toma **1 pedido cada 10 min** (ajustable) y máximo 3 activos.
- La app calcula la ruta (recoger antes de entregar), marca si un pedido extra “te queda en ruta” y abre la ruta completa en Google Maps.
- Se cancelan solos: pedidos que el negocio no acepta en 15 min y los que no reciben comprobante en 30 min.

## Versión 1.1
- Catálogo visible sin cuenta: fila de categorías y negocios en 2 columnas; se pide entrar solo al enviar el pedido.
- Menú del negocio con secciones en columna y productos en 2 columnas (foto, precio, tiempo de preparación, descripción).
- Hoja de producto con extras con costo, opciones "sin…", indicaciones y cantidad.
- Horario semanal por negocio (también cruzando medianoche); fuera de horario y 15 min antes del cierre no entran pedidos.
- Botón Salir siempre visible arriba a la derecha; al salir, la sesión queda invalidada en el servidor.
- El servidor agrega solo las columnas nuevas al publicar una versión nueva (no hace falta volver a ejecutar `instalar()`).

## Versión 1.2 · diseño Pídele
- Nuevo diseño verde/crema: pantalla de inicio, categorías en una fila, restaurantes en 2 columnas con portada, logo, ★ y tiempo estimado; buscador de negocios y platillos.
- Perfil del negocio con portada, logo, pestañas Menú / Información (horario, mapa, formas de pago).
- Compra en pasos: Tu pedido → Datos de entrega (a domicilio o recoger en restaurante, quién recibe) → Método de pago → ¡Listo!
- Formas de pago: efectivo por defecto; transferencia y CoDi solo si el negocio registra sus datos. Sin tarjeta.
- Efectivo a domicilio: el repartidor paga la comida al negocio al recogerla y cobra todo al cliente.
- El negocio marca "Entregar al repartidor" y el pedido pasa a En camino; en "recoger", marca "Entregado al cliente".
- Seguimiento con mapa: casa, negocio y repartidor (GPS reciente o último punto donde recogió/entregó) y 4 pasos.
- El repartidor ve nombre y teléfono de quien recibe, botón a Google Maps y "Copiar ubicación"; esos datos se borran al entregar.
- El cliente confirma que recibió y califica restaurante y entrega (★ visibles en las tarjetas).

## Versión 1.3 · notificaciones
- Notificaciones con la app cerrada vía Firebase Cloud Messaging; Apps Script las envía con la cuenta de servicio guardada en la propiedad `FCM_CUENTA` (nunca la subas a GitHub).
- Negocio: pedido nuevo, comprobante recibido, repartidor asignado, cancelaciones y chat. Cliente: cada cambio de su pedido y chat. Repartidores: pedidos disponibles y "ya está listo". Admin: cuentas por aprobar.
- Al tocar la notificación se abre el pedido. Al cerrar sesión el teléfono se da de baja; los teléfonos dados de baja en Firebase se limpian solos.
- `firebase-config.js` lleva la configuración web y la clave VAPID. En iPhone solo funciona con la app instalada en la pantalla de inicio (iOS 16.4+).
- Prueba desde el editor de Apps Script con `probarNotificacion()`.

## Versión 1.4 · menú en Excel y variantes
- En Mi menú: descargar plantilla, exportar el menú y subir un Excel (.xlsx, .xls o .csv) con vista previa antes de guardar (nuevos, actualizados y errores por fila).
- Una fila por producto: Sección, Producto, Descripción, Precio, Variantes (`Chica:80; Grande:120`), Extras (`Queso:10; Salsa`), Se puede quitar, Tiempo, Disponible, ID.
- Al reimportar, el ID (o sección + nombre) actualiza el producto sin duplicarlo y conserva su foto; lo que no viene en el archivo no se toca.
- Variantes: el cliente elige una (obligatoria) y su precio reemplaza al normal; las tarjetas muestran "Desde $…".
- Fotos rápidas desde la lista ("📷 Foto") y filtro de productos sin foto.

## Versión 1.4.1 · compartir
- Compartir la app desde Inicio y Perfil (menú del teléfono; si no hay, enlace, WhatsApp, Facebook y QR).
- Cada negocio tiene su enlace directo (`?negocio=ID`) y un QR descargable listo para imprimir; también se comparte desde su portada.
- Vista previa con logo y descripción al compartir por WhatsApp o Facebook.

## Versión 1.5 · velocidad y promociones
**Servidor**
- Las notificaciones se envían después de soltar el candado: mientras Firebase responde, otros pedidos ya se pueden guardar.
- Estrellas guardadas en columnas `califSuma` / `califNum` de Negocios y Usuarios (se calculan una vez con todo el historial al subir de versión).
- Catálogo, menús y ajustes en caché del servidor (2–10 min); cualquier cambio del negocio, su menú o sus promos la borra al instante.
- Archivo nocturno (entre 3 y 5 am, con el disparador de cada 5 min): pedidos entregados o cancelados con más de `diasArchivo` días (7 por omisión) y sus mensajes pasan a `HistorialPedidos` / `HistorialMensajes`. Se pueden consultar, no modificar. Para correrlo a mano: `archivarAhora()`.
- Nuevas acciones: `arranque` (config + sesión + catálogo en una llamada), `catalogo`, `menus` (hasta 8 menús en una llamada), `panelNegocio`, `misPedidosAnteriores`.

**App**
- Una sola llamada al abrir; el inicio se pinta al instante con el catálogo guardado en el teléfono y se actualiza por detrás.
- Precarga en segundo plano de los menús y fotos de los negocios que el cliente más probablemente abrirá (sus favoritos y los más pedidos).
- Menús guardados en el teléfono: solo se vuelven a bajar si el negocio los cambió.
- Mapas y Firebase se cargan cuando hacen falta; imágenes al tamaño en que se muestran.
- Sondeo por rol: cliente 60 s, negocio 30 s, repartidor 20 s (y al instante cuando llega una notificación). Chat abierto: cada 8 s.
- El service worker abre la app desde la caché sin esperar a la red y la actualiza por detrás.

**Promociones**
- Pestaña **Promos** del negocio: imagen, título, descripción, producto (opcional) con precio especial, fechas, días y horario (puede cruzar medianoche). Máximo `maxPromos` activas (3).
- Banner en Inicio con las promos de la categoría elegida (en "Todos", primero las de las categorías favoritas del cliente) y categoría **🏷️ Promociones** con todas.
- El precio especial lo cobra el servidor mientras la promo esté vigente; si termina con el producto en el carrito, el cliente ve el precio corregido antes de confirmar.
- Se publican directo; el administrador puede ocultarlas desde Resumen → Promociones activas (el negocio recibe aviso y no puede reactivarla).

**Al actualizar a 1.5** no hace falta volver a ejecutar `instalar()`: al publicar la nueva versión se crean solas las hojas `Promos`, `HistorialPedidos` y `HistorialMensajes` y las columnas nuevas.

## Versión 1.6 · promoción del día y un carrito por negocio
**Promoción del día**
- Cada negocio tiene una sola promoción por día (una tarjeta en el banner, que rota cada 5 s con los demás negocios) y dentro de ella los productos que quiera, cada uno con precio especial opcional (incluye variantes).
- Puede programar promociones distintas para días distintos; si dos activas coinciden en un día, la app no deja guardarla o reactivarla.
- En el menú del negocio aparece la sección **🏷️ Promo del día** al principio. Al tocar la tarjeta del banner se abre esa sección (o el producto, si solo hay uno).
- Si un producto se agota sale de la promo; si se agotan todos, la promo deja de mostrarse.
- Al actualizar, las promociones de la 1.5 se convierten solas; si un negocio tenía varias activas el mismo día, queda la más reciente y las demás se pausan.

**Carritos**
- Un carrito por negocio (máximo 4 a la vez); agregar de otro negocio ya no vacía el anterior.
- El carrito muestra cada negocio con su subtotal y su envío; se puede dejar fuera alguno para pedirlo después (los de negocios cerrados se apartan solos).
- Datos de entrega una sola vez; forma de pago por negocio.
- "Confirmar N pedidos" crea todos en una sola llamada (`crearPedidos`); si alguno no se puede (negocio cerrado, fuera del área, precio cambiado), no se crea ninguno y se avisa cuál.
- Cada pedido es independiente: su envío, su repartidor, su pago y su seguimiento.
- `crearPedido` (un negocio) sigue funcionando para teléfonos con la versión anterior.

## Versión 1.7 · suscripción de negocios y banners
Pídele no cobra comisiones por venta: cada negocio paga una **cuota mensual** por estar en la app (con sus banners incluidos) y, si quiere, **banners extra**.

**Suscripción**
- Al aprobar un negocio nuevo arranca con `diasPrueba` días gratis (30). Los negocios que ya estaban activos reciben ese mismo periodo al actualizar.
- El negocio paga cuando quiera: transfiere a la cuenta de Pídele (datos en Ajustes: `pagoBanco`, `pagoTitular`, `pagoClabe`, `pagoTarjeta`) y sube su comprobante en *Negocio → Mi suscripción*.
- El administrador lo revisa en **Cobros** y lo confirma (o lo rechaza con motivo). Cada mes suma `diasPorPago` (30) días **a la fecha de corte**; si ya estaba vencido, cuentan desde el día en que se confirma. También se puede registrar a mano un pago en efectivo.
- Recordatorios (notificación + aviso en su panel) los días `diasAviso` (5,3,1) antes del corte y el mismo día, a partir de las 9 am.
- Pasado el corte tiene `diasGracia` (3) días visible; después deja de mostrarse y no recibe pedidos hasta que pague (sus pedidos en curso terminan normal; nada se borra).
- Hoja nueva: `Pagos`. Columnas nuevas en Negocios: `vence`, `bannersExtra`, `extrasVence`.

**Banners**
- Dos tipos: **🏷️ Promoción** (al menos un producto con precio especial, si `promoRequierePrecio` = 1) y **📣 Anuncio** (publicidad libre; sus productos salen en la sección *Novedades* del menú, sin cambiar precios).
- `bannersIncluidos` (1) por día en la suscripción + los extra pagados (`precioBannerExtra` al mes por banner, o prorrateado hasta el corte si se compra a mitad de mes).
- Visibilidad en la rotación de Inicio (cada 5 s): promoción `pesoPromocion` (2), anuncio `pesoAnuncio` (1), banner extra pagado `pesoExtra` (2).
- La categoría *Promociones* y la etiqueta "PROMO DEL DÍA" solo muestran promociones.
- Al actualizar, las promociones existentes con precio especial quedan como Promoción y las demás como Anuncio.

## Versión 2.13.0 · suscripción con Google Play
- Nuevos precios: Básico $299, Plus $399 y Pro $599 al mes (se actualizan solos en Ajustes al publicar el servidor).
- **Dentro de la app de Google Play**, Mi suscripción se paga con Google Play (Básico, Plus o Pro) y no se muestran transferencias ni banners extra: así lo exige Google para cobros digitales. En el navegador (pidele.app) todo sigue igual, con transferencia y comprobante.
- La app de Play pide suscribirse a partir del **20 de noviembre** (ajuste `playDesde`) a los negocios que **no** tienen plan **Donado**. Los que tienen Donado (los tuyos y los que ya pagaron por otro medio) nunca ven el cobro de Google.
- El servidor verifica cada compra con Google, la confirma (si no, Google la reembolsa a los 3 días), cambia el plan, fija la fecha de corte que da Google y registra el pago en Cobros como "Google Play". Cada 6 horas revisa renovaciones y cancelaciones.
- Si alguien reinstala la app o cambia de teléfono, su suscripción se liga sola al abrir Mi suscripción.
- En Cobros, cada negocio muestra si paga con ▶ Google Play o tiene 🎁 Donado. Para regalar el servicio: cambia su plan a Donado o usa "Donar meses".
- Repartidores: en la app de Play ven "Escribir a Pídele" mientras no exista el producto `repartidor` en el ajuste `playProductos`.
- Para probar el modo Play desde el navegador: `pidele.app/?modo=play` (y `?modo=web` para regresar).
- Configuración (una vez): en Play Console crea las suscripciones `pidele_basico`, `pidele_plus` y `pidele_pro`; en Usuarios y permisos invita el correo de la cuenta de servicio (el de `FCM_CUENTA`, o pon otra en la propiedad `PLAY_CUENTA`) con permiso de ver datos financieros y administrar pedidos y suscripciones; activa la "Google Play Android Developer API" en Google Cloud; pon el Package ID real en el ajuste `playPaquete` y ejecuta `probarGooglePlay()` desde el editor.

## Versión 2.12.3 · dominio pidele.app
- Archivo `CNAME` con `pidele.app` para GitHub Pages; vistas previas (WhatsApp/Facebook) de La Cruz y Cosalá apuntan a https://pidele.app/.
- DNS en GoDaddy: registros A de `@` a 185.199.108.153, 185.199.109.153, 185.199.110.153 y 185.199.111.153 (sin el 160.153.0.177 de GoDaddy) y CNAME `www` → `pideleadomicilio.github.io`.
- Con el dominio propio, `.well-known/assetlinks.json` queda en la raíz (https://pidele.app/.well-known/assetlinks.json), como lo pide la app de Android.

## Versión 2.12.2 · horarios que caben en la pantalla
- Horario del negocio (Mi negocio) y del repartidor (Perfil): el día a la izquierda y "abre a cierra" a la derecha; en teléfonos angostos las horas bajan debajo del día. Antes las casillas de hora ensanchaban la pantalla.
- Ningún campo de texto puede ensanchar su tarjeta (ni las filas con varios campos, como los tabuladores de tarifas).
- Revisado en anchos de 320, 360, 390 y 412 px: ninguna pantalla se sale.

## Versión 2.12.1 · pantalla fija
- La pantalla ya no se puede agrandar con dos dedos o doble toque ni arrastrar de lado; sin rebote al llegar arriba o abajo, así la barra inferior no se mueve.
- Campos de texto a 16 px para que el iPhone no acerque la pantalla al escribir.
- Las listas con desplazamiento propio (secciones del menú, categorías, banners, chat, ventanas) ya no arrastran la página al llegar a su final.

## Versión 2.12.0 · lista para Google Play
- **Aviso de privacidad** (`privacidad.html`), **Términos** (`terminos.html`) y **Eliminar cuenta** (`eliminar-cuenta.html`), públicos. Los datos del responsable se escriben una sola vez en `legal-datos.js`.
- Al crear cuenta hay que aceptar el aviso (se guarda fecha y versión). Las cuentas que ya existían lo aceptan una vez al entrar.
- **Eliminar mi cuenta** en Perfil (con contraseña) y **🗑️ Eliminar cuenta** en la tarjeta del usuario (administrador general, confirmando el teléfono): se borran los datos personales, los pedidos quedan como "Cuenta eliminada" y el teléfono queda libre para registrarse otra vez. No se puede con pedidos en curso.
- `manifest.json` con id, categorías, capturas y atajo; `.nojekyll` y `.well-known/assetlinks.json` (plantilla) para la verificación de la app de Android.

## Versión 2.11.0 · tarifas por horario, zonas, servicios de repartidor y moderador
- **Tres tabuladores de horario** (Ajustes → Envíos y tarifas): hora de inicio y tarifa base de cada uno (inicial: 7:00 $30 · 18:00 $35 · 23:00 $40). El último sigue después de medianoche. Reemplaza a `envioBase`. El administrador local también los edita.
- **Zonas con tarifa fija** (otros poblados o puntos lejanos: Ceuta, Bella Vista, UPMyS…): nombre, tarifa, radio y centro en el mapa. Dentro de una zona se cobra su tarifa (aunque pase del máximo de km) y de tarde o noche sube lo mismo que la tarifa base. Fuera de las zonas: tarifa base del horario + extra por km.
- **Foráneo**: el pedido que cae en una zona o a más de `radioCiudadKm` del centro. Se marca con 📍 y el nombre de la zona.
- **Oferta escalonada de foráneos**: primero al tercio de repartidores disponibles con mejor puntaje de foráneos (cumplimiento + cuántos ha entregado), a los `forEscalonMin` minutos al siguiente tercio y luego a todos. A los `forMinModerador` minutos sin repartidor, aviso al moderador.
- **➕ Capturar servicio** (repartidor, en Disponibles): elige negocio y productos del menú para un cliente suyo; el negocio le dice en cuánto tiempo estará listo, él paga en efectivo al recogerlo y lo marca entregado. Sin destino ni datos del cliente. Cuenta por separado en estadísticas y suma a sus entregas (no a calificaciones de clientes).
- **🎧 Moderador** (lo nombra el administrador en Resumen → Moderadores): pantalla **Atención** con los pedidos atorados (el negocio no acepta en `modMinAceptar` min, no confirma el pago en `modMinPago`, nadie lo toma, listo y el repartidor no pasa en `modMinRecoger`, o tarda en llegar). Puede llamar, asignar o reasignar repartidor, aceptar por el negocio, cambiar el método de pago, cancelar y ver todos los pedidos. Le llega una notificación por cada problema (si no hay moderador, al administrador). El administrador también tiene la pantalla Atención.

## Versión 2.10.0 · planes configurables, varias categorías y SVG
- **Cuatro planes** que se editan en Ajustes → "📋 Planes de los negocios": precio, categorías, anuncios por día, anuncio fijo semanal, visibilidad (x) y segundos en pantalla.
  - Inicial: Donado $0 · 1 categoría · sin anuncios | Básico $249 · 2 · 1 anuncio fijo por semana · x1 · 4 s | Plus $399 · 3 · 1 por día · x2 · 5 s | Pro $549 · 4 · 2 por día · x3 · 6 s.
  - Al actualizar: los precios de `cuotaBasica` / `cuotaMensual` y los `bannersIncluidos` pasan a Básico y Plus, y esos ajustes se quitan. Los negocios "con publicidad" quedan en **Plus**.
- El negocio elige Básico, Plus o Pro al registrarse y en Mi suscripción (libre en la prueba; con periodo pagado: subir al pagar con "Plan con este pago", bajar en su fecha de corte). **Donado** solo lo asigna el administrador (botón "📋 Plan" en su tarjeta): sin cobro ni suspensión; sus promociones solo salen en Promociones y en su negocio.
- **Anuncio fijo** (Básico): el anuncio que ya empezó no se puede editar, pausar ni borrar en sus primeros 7 días.
- **Visibilidad**: en cada vuelta del banner, un anuncio sale (visibilidad del plan × peso del tipo) veces; una promoción pesa `pesoPromocion` y un anuncio `pesoAnuncio`. Los banners extra (se mantienen) pesan `pesoExtra`.
- **Varias categorías** en Mi negocio (hasta las de su plan; la primera es la principal). El negocio aparece al filtrar por cualquiera y en el buscador. Si baja de plan, se quedan las primeras.
- **SVG** en promociones, portada y logo: el teléfono lo convierte en imagen nítida al tamaño del banner (no se guarda el código del SVG). Recomendado: exportarlo con el texto convertido a curvas.

## Versión 2.9.3 · ver como cliente o repartidor y pedidos de muestra
- En Resumen: **🍽️ Ver como cliente** (pide como cualquier cliente) y **🛵 Ver como repartidor**. La pestaña "Mi panel" regresa al administrador.
- **🧪 Pedido de muestra** (casilla al pagar, solo administradores): el negocio lo recibe en vivo con la etiqueta MUESTRA, aunque esté cerrado o recién registrado. Se puede simular el comprobante de transferencia.
- Como repartidor, el administrador solo ve y entrega sus pedidos de muestra; ningún repartidor real los ve ni recibe avisos.
- No cuentan en ventas, estadísticas, resumen, ranking, calificaciones ni cancelaciones. Se borran con "🗑️ Borrar" en Resumen o solos a las 24 h (con sus mensajes).

## Versión 2.9.2 · invitar repartidores
- "✉️ Invitar" (Resumen) tiene dos pestañas: Negocio y Repartidor. Para un repartidor: nombre, teléfono y vehículo; el enlace es de un solo uso para ese teléfono.
- El repartidor invitado queda aprobado al instante, con la inscripción gratis (queda en su historial como $0) y su mes de prueba. Su ciudad es la del enlace.
- La CURP se agrega después: su tarjeta dice "Falta CURP" y tiene el botón "🪪 Agregar CURP" (misma validación: 18 caracteres y una sola cuenta por persona).

## Versión 2.9.1 · cada negocio elige su plan
- Al registrar un negocio (o al pedir ser negocio desde el Perfil) se elige **Con publicidad ($399)** o **Básico ($249)**. Los negocios que ya existían quedan con publicidad.
- En "Mi suscripción" están los dos planes. Durante el mes de prueba (o sin periodo pagado) se cambia al instante y sin costo.
- Con un periodo pagado: bajar al Básico conserva el banner hasta la fecha de corte y los siguientes pagos ya son de $249 (se puede cancelar el cambio); subir se hace al pagar, con la casilla "Subir a plan con publicidad".

## Versión 2.9.0 · plan Básico por invitación, meses donados y estadísticas
- **Invitar negocio** (Resumen, solo el administrador general): nombre, teléfono y plan. Sale un enlace de un solo uso para ese teléfono; la cuenta queda aprobada al instante con su mes de prueba. El municipio es el del enlace (no lo cambia la ubicación).
- **Plan Básico** (`cuotaBasica`, $249): todo igual, sus promociones salen en la categoría Promociones y dentro de su negocio, pero no en el banner de Inicio. Desde "Mi suscripción" puede **subir al plan con publicidad** (se cobra la cuota completa y cambia al confirmar el pago). El administrador también cambia el plan desde la tarjeta del negocio.
- **🎁 Donar meses** (tarjeta del negocio o repartidor, solo el general): recorre su fecha de pago sin cobro; queda en su historial como donado y le llega aviso.
- **📊 Estadísticas** (solo el general): pedidos entregados y ventas de hoy, 7 y 30 días, por día, semana y mes; por hora y día de la semana; % con envío; top 10 de negocios **sin montos**. Opción de ver todos los municipios juntos y de copiar un resumen sin nombres para compartir.
- **Ajustes ordenados por categorías** con buscador; lo que cambias se marca antes de guardar.
- `cuotaMensual` nueva por omisión: $399 (en servidores ya instalados se conserva lo que tengas en Ajustes).

## Versión 2.8.0 · guía para nuevos usuarios
- Recorrido guiado la primera vez (invitado, cliente, negocio, repartidor): ilumina cada sección con una flecha y explica qué hacer. Se repite desde Perfil → "Ver guía otra vez".
- "Mi suscripción" y la guía explican el mes de prueba: desde cuándo corre y antes de cuándo es el primer pago.

## Versión 2.7.0 · la ciudad la decide la ubicación
- Ya no se ofrece elegir ciudad. La primera vez la ubicación es obligatoria y define la ciudad (radioMunicipioKm). Quien está fuera de las dos elige una y solo paga por transferencia.
- Si un cliente abre la app en la otra ciudad, cambia sola y puede regresar a la suya (12 h sin volver a cambiar). Negocios y repartidores no cambian solos; los administradores eligen desde Perfil.
- Servidor: `efectivoSoloEnZona` (1): el efectivo solo se acepta con ubicación dentro del municipio.

## Versión 2.6.0 · negocios y repartidores que también piden
- Registro: "Solo pedir", "Registrar mi negocio" o "Quiero repartir". Un cliente puede pedir después ser negocio o repartidor desde Perfil (Súmate a Pídele); mientras se revisa sigue pidiendo. Al rechazarla, la cuenta vuelve a cliente.
- Negocios y repartidores tienen "Pedir comida" (modo cliente) con su misma cuenta. No pueden pedirse a sí mismos ni entregar su propio pedido; su negocio no aparece en su catálogo.

## Versión 2.5.5 · periodo de gracia general
- Ajuste `primerCobro` (2026-12-01): ningún negocio ni repartidor paga antes de esa fecha. Al aprobar, el primer pago es la fecha más tarde entre los días de prueba y `primerCobro`; a los ya aprobados se les recorre su fecha (nunca se acorta) y se les avisa.

## Versión 2.5.4 · candado de municipio
- La primera vez la app usa la ubicación para elegir el municipio (si no da permiso, elige a mano y al pedir se le pide la ubicación).
- Para cambiarse de municipio (clientes y repartidores) hay que estar a menos de `radioMunicipioKm` (15) del centro del mapa de ese municipio. Los negocios no pueden cambiarse; los administradores sí, sin ubicación.
- Un enlace de otro municipio en un teléfono que ya eligió el suyo pide comprobar la ubicación antes de cambiar.

## Versión 2.5.3 · enlaces de Cosalá
- Página `cosala/` con su vista previa (título e imagen de Cosalá) que abre la app en Cosalá; los enlaces que se comparten desde Cosalá la usan. Imágenes de vista previa en icons/og-*.jpg.

## Versión 2.5.2 · Cosalá activado
- index.html ya trae la URL del servidor de Cosalá.

## Versión 2.5.1 · identidad de cada municipio
- La pantalla de inicio y las cargas usan el dibujo del municipio (la cruz en La Cruz, el arco en Cosalá) y el nombre debajo de Pídele; también en la barra verde y en la pantalla de entrar. Mismo index.html para todos.

## Versión 2.5.0 · municipios (Cosalá) y administrador local
- Cada municipio tiene su propio servidor (otra hoja y otro Apps Script con este mismo código, de preferencia en otra cuenta de Google): el tráfico de uno no hace lenta la app en el otro.
- La app es la misma página: la primera vez pregunta "¿Dónde estás?" y se conecta al servidor de ese municipio. El enlace `?pueblo=cosala` abre directo en Cosalá. Cada municipio guarda su sesión, carritos y menús por separado.
- Los municipios activos están en `PUEBLOS` (index.html); un municipio sin URL no aparece.
- Ajustes nuevos: `pueblo` (nombre del municipio del servidor) y `porcentajeLocal` (50).
- Administrador local: lo nombra el general (Resumen → Administrador local y comisiones). Aprueba negocios y repartidores, atiende pedidos, registra pagos en efectivo y ajusta las tarifas de envío. No cambia precios ni ajustes, ni confirma transferencias.
- Comisiones por mes: todo lo cobrado en el municipio × porcentaje; el efectivo que recibió el local cuenta como parte de su pago. El general marca cada mes como liquidado.
- Tablero general: en Resumen, "Todos los municipios" muestra cada servidor y el total (conecta tu cuenta de administrador de cada uno una vez).
- Worker: `/api/cosala` usa la variable `APPS_SCRIPT_URL_COSALA`; los mensajes de WhatsApp prueban cada servidor hasta encontrar el código.

## Versión 2.4.0 · nuevas promociones
- Al crear una Promoción el negocio elige el tipo: precio especial (como antes), 2x1/3x2/3x1/4x3, % de descuento por pieza, pesos de descuento por pieza, producto de regalo o % en la primera compra (con máximo opcional).
- Ya no hace falta poner precio especial: los precios del menú se quedan igual y el servidor descuenta lo que toca.
- En 2x1/3x2 se pueden combinar productos de la lista y se cobran los de mayor precio.
- En cada producto con opciones (tamaños) se elige una opción o "Todas las opciones". En %, $ y 2x1 se puede elegir "Aplica a todo el menú".
- Lo gratis o descontado es el producto y su opción; extras y opciones con costo se cobran.
- Regalo: en el carrito aparece "🎁 Agrega tu regalo" (si hay varios regalos, el cliente elige).
- Si varias promos tocan la misma pieza se aplica la mejor para el cliente; el % de primera compra (en ese negocio) se suma sobre lo que queda.
- Las piezas con precio especial no entran a otras promociones.
- El carrito, el pago, el pedido y la vista del negocio muestran cada descuento. Hojas nuevas: Promos (mecanica, valor, lleva, paga, tope, regalos) y Pedidos (descuento, descuentos); se agregan solas.
- Cada promoción sigue contando como un banner del plan del día.

## Versión 2.3.0 · conexión con datos móviles y animaciones de carga
- **Ruta alterna por Cloudflare:** si la conexión directa a Google falla en una red (se vio con datos de Telcel abriendo desde WhatsApp), la app reintenta por el Worker (`/api`) y recuerda esa ruta en ese teléfono por 24 h. Si después la alterna falla, vuelve a la directa. Solo se usa cuando la directa falla, para cuidar el límite gratis de Cloudflare (100,000 llamadas al día).
- **Sin duplicados:** cada operación lleva un identificador; si la app la reenvía por la otra ruta, el servidor devuelve el resultado anterior en vez de repetirla (pedidos, pagos, etc.).
- **Worker:** se actualiza `worker.js` (agrega `/api`); usa la misma variable `APPS_SCRIPT_URL`.
- **Animaciones:** pantalla de arranque con la animación "trazado" (charola ↔ monumento de La Cruz) y la palabra Pídele del logo; las cargas dentro de la app usan la animación "entrega".

## Versión 2.2.0 · menú con subsecciones y opciones
- **Plantilla de Excel a la medida** (*Mi menú → ⬇ Plantilla*): 3 preguntas (cómo acomodas el menú: secciones / secciones con subsecciones / lista; qué necesitan tus productos: opciones de preparación, variantes de precio, extras con costo, extras sin costo, ingredientes que se quitan; tiempo por producto) y descarga un Excel solo con esas columnas, con ejemplos.
- **Subsecciones:** columna *Subsección* en el Excel o botón *🗂️ Subsecciones* en cada sección de *Mi menú* (crear y asignar productos). El cliente las ve como subtítulos dentro de la sección.
- **Opciones de sección** (*Mi menú → 🧩 Opciones de sección*, o la hoja *Opciones* del Excel): un grupo (ej. *Tipo de leche*: Entera, Deslactosada, Almendra +$10) que se aplica a toda una sección, a una subsección (*Bebidas calientes > Café*) o a productos sueltos, con productos excluidos. Cada grupo es obligatorio u opcional y permite elegir 1 o hasta N. Los productos nuevos de esa sección lo toman solos.
- **Opciones de preparación por producto:** columna *Opciones de preparación* (`Término: Medio, Tres cuartos | Salsa (opcional, hasta 2): Verde, Roja:5`) o en el formulario del producto.
- El cliente elige en la hoja del producto (la app no deja agregar sin las obligatorias), el precio suma las opciones y el negocio, el repartidor y el carrito ven "Tipo de leche: Almendra". El servidor valida opciones y precios.
- *Exportar mi menú* incluye subsecciones, opciones de preparación, extras con y sin costo separados y la hoja *Opciones*. Los Excel anteriores (una sola columna de *Extras*) se siguen importando igual.

## Versión 2.1.0 · pedidos sin repartidor, instalación y verificación más fácil
- **Pedido que nadie toma:** si a los `minutosSinRepartidor` (10) de su hora de salida ningún repartidor lo ha tomado, se avisa una sola vez al negocio y al administrador, y se vuelve a avisar a los repartidores disponibles. El negocio ve en el pedido:
  - **🛵 Lo envío por mis medios**: aunque no tenga repartidores registrados; nombre y WhatsApp de quien lo lleva son opcionales. Se comparte la ficha por WhatsApp (o se elige el contacto, o se copia) y el negocio marca *Ya se entregó*.
  - **📒 Repartidores disponibles**: directorio de los repartidores de Pídele activos ahora (en su horario y sin pausa), con botón de WhatsApp para pedirles que lo tomen.
- **Efectivo con teléfono verificado:** ya no se pide estar en el punto de entrega (GPS); se mantiene el tope de efectivo en los primeros pedidos.
- **Dirección:** al marcar el punto en el mapa, la calle y la colonia se llenan solas (OpenStreetMap); el texto ya no es obligatorio.
- **Instalar:** tarjeta "Instala Pídele" en Inicio, Pedidos del negocio y Disponibles. En Android instala con un toque; en iPhone (y si el navegador no lo permite) muestra la guía de 3 pasos. Enlace `?instalar=1` (el que se comparte desde "Compartir Pídele") abre directo la instalación.
- **Verificación por WhatsApp:** pantalla con pasos grandes que resalta **"Toca el botón ENVIAR ➤"** y, mientras espera, recuerda enviarlo y permite abrir WhatsApp otra vez. Respuesta: "✅ ¡Gracias por verificar tu cuenta! Ya puedes regresar a Pídele." (llega cuando Meta apruebe el negocio).

## Versión 2.0.0 · ranking, pagos del envío y correcciones
**Calificaciones cruzadas y ranking (0-100)**
- Además de que el cliente califique, ahora el **repartidor** califica al negocio y al cliente (se le pide al marcar *Entregado*) y el **negocio** califica al cliente y al repartidor (botón *⭐ Calificar* en sus pedidos de hoy). Hay `diasCalificar` (2) días para hacerlo.
- **Puntaje del repartidor**: calificaciones de clientes y negocios (70) + experiencia, 1 punto cada 5 entregas (20) + cumplimiento, entregas vs. pedidos liberados (10) + bonus. Lo ve en *Perfil → Mi puntaje*.
- **Prioridad**: con `rankingPrioridad` = 1, los repartidores con `rankingNivelAlto` (80) o más toman los pedidos al instante; los de `rankingNivelMedio` (60) o más esperan `rankingEsperaMedioMin` (1 min) y el resto `rankingEsperaBajoMin` (2 min). A todos les llega el aviso; mientras esperan ven una cuenta regresiva.
- **Puntaje del negocio**: calificaciones de clientes y repartidores (70) + pedidos entregados (20) + cumplimiento, pocas cancelaciones (10) + bonus. Ordena los negocios en la app (abiertos primero). Lo ve en *Negocio → Mi puntaje*.
- **Puntaje del cliente (oculto)**: el negocio y el repartidor solo ven un indicador (🆕 nuevo · 👤 cliente · ✅ confiable · ⚠️ atención) con sus entregas y cancelaciones. Con `clienteMinCalif` (3) calificaciones o más y puntaje menor a `clienteUmbralEfectivo` (35), solo puede pagar por transferencia (0 = sin límite).
- **Bonus manual** (*Usuarios → 🎯 Bonus*): 0 a 30 puntos con días de vigencia, para repartidores y negocios; sin etiqueta visible.

**Pago del envío**
- *Negocio → Formas de pago → Cobrar el envío en la transferencia*: el cliente transfiere comida + envío al negocio y el negocio le paga el envío en efectivo al repartidor al entregarle el pedido (la app se lo recuerda).
- El repartidor puede registrar su **CLABE o tarjeta** en *Perfil*: el cliente ve "¿Pagas el envío por transferencia?" con sus datos. Al entregar, el repartidor marca si le pagaron en efectivo o por transferencia (queda en su historial).

**"Recibido" por error**
- Si el pedido va en camino, la app le pregunta al cliente "¿Ya tienes tu pedido en tus manos?" antes de confirmar.
- Si aun así lo confirma por error, el repartidor o el negocio pueden tocar **↩️ Aún no se entrega** dentro de `minutosCorregirEntrega` (60 min); el admin puede hacerlo con cualquier pedido entregado en ese tiempo. El pedido vuelve a *En camino* con los datos de quien recibe, y se quitan las calificaciones y los contadores de ese pedido.

**Comprobante desde la app del banco**
- En Android, con Pídele instalada en la pantalla de inicio, Pídele aparece al tocar *Compartir* en la app del banco. Se abre *Enviar comprobante*, el cliente elige el pedido y listo (imagen o PDF de hasta 4 MB). En iPhone sigue el botón *Adjuntar comprobante*, que ahora también acepta PDF.

**Recorrido por calles (opcional)**
- Con `rutaCalles` = 1, el mapa de *Mis entregas* dibuja el recorrido por calles (servicio gratuito OSRM con mapas de OpenStreetMap, lo calcula el teléfono del repartidor). Si falla, queda la línea recta. Sigue el botón de Google Maps.

## Versión 1.9.0 · turnos de repartidor y reparto propio
**Repartidor: horario y pausa**
- *Perfil → Mi horario de trabajo*: horario semanal (por defecto 7:00 a 18:00). Fuera de horario no recibe avisos; puede tocar **Activarme ahora** (queda activo hasta que termine el día) y **Terminar mi turno**.
- En *Disponibles*: **🟢 Disponible / ⏸️ En pausa** con pausas de 30 min, 1 hora o "hasta que la quite". En pausa no recibe avisos, pero ve la lista; si toma un pedido vuelve a quedar disponible.
- Sin horario configurado: recibe avisos siempre (salvo en pausa).

**Negocio: mis propios repartidores**
- *Negocio → Envíos*: **Repartidores de Pídele**, **Mis repartidores** o **Ambos**, más la lista de sus repartidores (nombre y teléfono, hasta 20).
- Con *Mis repartidores* el envío puede ser **gratis**, **precio fijo** o la **tarifa de la app**, siempre dentro de `kmMaximo`. Con *Ambos* el cliente paga la tarifa de la app.
- En el pedido: **Enviar con mi repartidor** → elige a quién → pasa a *En camino* y abre WhatsApp con la ficha (primer nombre y teléfono de quien recibe, dirección, referencia, ubicación en Google Maps y cuánto cobrar). Luego **Ya se entregó**. También puede reenviar la ficha o cancelar.
- Los pedidos con reparto propio no aparecen ni se avisan a los repartidores de Pídele. El cliente ve "Te lo lleva Pepe, su repartidor" (solo el primer nombre) y no califica repartidor.

## Versión 1.8.2 · historial del repartidor
- *Mis entregas* muestra la lista de **hoy** (entregados y cancelados, con hora, negocio, envío, forma de pago y dirección) y el botón **Ver mi historial (30 días)**, agrupado por día con totales; incluye pedidos ya archivados.
- Si el repartidor tiene pedidos en curso, la app abre directo en *Mis entregas* y *Disponibles* avisa "Tienes X pedido(s) en curso".

## Versión 1.8.1 · correcciones
- **Verificación sin respuesta automática:** mientras Meta no verifique el negocio, WhatsApp no deja contestar (error 131031), pero el mensaje *PIDELE 123456* sí llega y el teléfono se verifica solo; la app lo detecta en segundos.
  - `whatsappPidele` acepta números con lada de otro país (ej. `15556585439`, el número de prueba de Meta). 10 dígitos = México.
  - Ajuste nuevo `whatsappResponde`: 0 (por ahora) = los textos no prometen respuesta y "¿Olvidaste tu contraseña?" manda a soporte (`soporteWhatsApp`) en lugar de CLAVE. Cámbialo a 1 cuando Meta apruebe el negocio.
  - Los enlaces de pago y soporte usan `soporteWhatsApp`, no el número de verificación.
- **CURP:** *Aprobar* o *Reactivar* un repartidor sin CURP o sin inscripción abre el formulario con el campo de CURP; los errores se muestran dentro del formulario.
- **Repartidor:** botón **Activar ubicación** (si el permiso está bloqueado explica cómo habilitarlo en Android/iPhone) y aviso claro de por qué no puede tomar pedidos (cuenta sin aprobar, mensualidad, máximo de pedidos). La ubicación no es obligatoria.
- En *Perfil* se ve la versión de la app y la del servidor.

## Versión 1.8 · cuentas confiables
**Teléfono verificado por WhatsApp**
- En *Perfil* (o al pagar) el usuario toca **Verificar por WhatsApp**: se abre WhatsApp con "PIDELE 123456" para el número de Pídele (Ajustes → `whatsappPidele`).
- **Automático** con WhatsApp Business Platform + Cloudflare Worker (`worker.js`, ver `GUIA-WhatsApp.md`; propiedad del script `WA_SECRETO`): se verifica en segundos y se le contesta por WhatsApp.
- **Manual** (respaldo): *Resumen → Verificaciones pendientes* muestra el código de cada persona; se verifica con un toque. También desde la tarjeta de cada usuario.
- Negocios y repartidores quedan verificados al aprobarlos.

**Contraseñas**
- "¿Olvidaste tu contraseña?": el usuario envía **CLAVE** por WhatsApp desde su número y recibe una contraseña temporal (máximo una cada 10 min). El administrador también puede generarla (🔑 Clave temporal) y mandarla por WhatsApp.
- Al entrar con una contraseña temporal, la app obliga a crear una nueva.

**Reglas de efectivo** (configurables en Ajustes)
- `efectivoVerificado`: sin teléfono verificado solo se paga por transferencia.
- `efectivoRadioM` (150 m): a domicilio, el efectivo solo se acepta si al confirmar el GPS del cliente está cerca del punto de entrega (ubicación nueva en ese momento).
- `efectivoPedidosOtraDir` (5): con ese número de pedidos entregados (cada cancelación suya resta uno) puede usar efectivo en cualquier dirección.
- `efectivoTopeNuevos` ($400) hasta `efectivoPedidosNuevo` (3) pedidos entregados.
- Columnas nuevas en Usuarios: `entregados` y `cancelados` (se calculan una vez con todo el historial al actualizar).

**Repartidores: inscripción + mensualidad**
- Se registra → verifica su teléfono → paga su **inscripción** (`inscripcionRepartidor`) con comprobante (o en efectivo) → validación en persona con su INE.
- Al aprobarlo registras su **CURP**: la app no deja aprobar dos cuentas con la misma CURP. No hace falta guardar la foto de la INE.
- Primer mes gratis (`diasPruebaRepartidor`), luego **mensualidad** (`mensualidadRepartidor`) con fecha de corte, avisos, gracia y suspensión, igual que los negocios. Suspendido: no recibe avisos de pedidos ni puede tomarlos.
- Pagos y comprobantes en *Perfil → Mi mensualidad*; el administrador los ve en **Cobros** (pestaña Repartidores).
- Los repartidores que ya estaban activos reciben su mes gratis al actualizar y se consideran inscritos.

**Alertas** (*Resumen → Alertas de cuentas*): más de `alertaCuentasAparato` (2) cuentas de cliente en un mismo teléfono, o varias cuentas pidiendo al mismo punto exacto. No bloquean: son para revisar.

## Pendiente
- Aviso de privacidad y manejo de datos conforme a la nueva LFPDPPP (DOF 20/03/2025): aviso integral (página pública) y simplificado al registrarse con aceptación registrada; procedimiento para derechos ARCO (incluido borrar la cuenta desde la app); qué datos se guardan y cuánto tiempo; terceros que procesan datos (Google, Firebase, Cloudflare, Meta/WhatsApp, OpenStreetMap). Revisarlo con un abogado.
- Términos y condiciones de uso (Pídele como intermediario: facturas, cancelaciones, responsabilidad del negocio y del repartidor).
- Aviso a clientes: Pídele une al cliente con el negocio; al no cobrar comisiones no emite facturas, la factura se solicita directamente al negocio.
- Solicitar factura desde la app: el cliente guarda sus datos fiscales una vez y, al pedir factura de un pedido, el negocio los recibe listos.
- Cuota de validación (inscripción) para negocios que se sumen en 2027, después de la etapa inicial.
- Monedero por tienda (ej. 1% de cada compra para usar en ese negocio), activable solo por el negocio.
- Más adelante: entrega combinada de varios negocios con precio especial; reportes de mal uso, amonestaciones y tickets de soporte para apelar bloqueos.
- Seguridad extra: límite de intentos de contraseña, de registros por teléfono/aparato y de llamadas por minuto.
- Cuando Meta verifique el negocio: número real de Pídele en WhatsApp, `whatsappResponde` = 1 y publicar la app de Meta (En vivo) con aviso de privacidad.
