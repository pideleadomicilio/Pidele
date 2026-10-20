# Pídele

App de pedidos a domicilio para La Cruz de Elota. Une a **compradores**, **negocios** y **repartidores**, con un **administrador**.
El pago de la comida es directo al negocio por transferencia (CLABE, tarjeta o QR CoDi) y el envío se paga en efectivo al repartidor: sin comisiones para nadie.

## Archivos
| Archivo | Va en |
|---|---|
| `index.html`, `manifest.json`, `sw.js`, `firebase-config.js`, `icons/` | Este repositorio de GitHub (GitHub Pages) |
| `Code.gs` (se entrega como `Codigo-gs.html`) | Apps Script ligado a una Hoja de cálculo |

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

## Pendiente
Ranking oculto de clientes, reportes de mal uso, amonestaciones y tickets de soporte para apelar bloqueos.
