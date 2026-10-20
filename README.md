# Pide Elota

App de pedidos a domicilio para La Cruz de Elota. Une a **compradores**, **negocios** y **repartidores**, con un **administrador**.
El pago de la comida es directo al negocio por transferencia (CLABE, tarjeta o QR CoDi) y el envío se paga en efectivo al repartidor: sin comisiones para nadie.

## Archivos
| Archivo | Va en |
|---|---|
| `index.html`, `manifest.json`, `sw.js`, `icons/` | Este repositorio de GitHub (GitHub Pages) |
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

## Fase 2 (pendiente)
Calificaciones y ranking de negocios y repartidores, ranking oculto de clientes, reportes de mal uso, amonestaciones y tickets de soporte para apelar bloqueos; notificaciones push con la app cerrada.
