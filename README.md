# History Gallery

Visor 3D de una galería de arte. 

## Inicio rápido

```bash
npm install
npm start
```

Abrir [http://localhost:9990](http://localhost:9990).

## Uso

- **Flechas** (abajo): recorrer las obras en orden (interior → exterior)
- **Clic** en un cuadro: ver su ficha
- **WASD**: mover la cámara · **Shift+W/S**: subir/bajar
- **Ctrl/Cmd+I**: mostrar/ocultar el icono de controles
- Intro automática al cargar; luego exploración libre con OrbitControls

## Obras

Configuración en `obras/artworks.json`. Por obra:

| Campo | Descripción |
|-------|-------------|
| `image` | Imagen en `obras/image/` |
| `fichaHtml` | Ficha en `obras/html/` (HTML libre) |
| `slot` | Pared e índice del cuadro |

Slots válidos en `src/paintings/artworksConfig.js`.

## Entornos HDR

Añadir `.hdr` en `env/` y ejecutar `npm run generate:hdr`.

## Ajustes

- Cámara inicial: `CAMERA_INTRO` en `src/config.js`
- Iluminación y entorno: panel de controles (Tweakpane)
- Debug de posición de cámara: checkbox en el panel
