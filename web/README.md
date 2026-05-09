# TaskManager — Sitio de exposición (estático)

Contenido en HTML/CSS/JS sin paso de build. Sirve para una presentación tipo diapositivas (5 páginas).

## Archivos

| Página            | Archivo             |
|-------------------|---------------------|
| Portada           | `index.html`        |
| Arquitectura      | `arquitectura.html` |
| Casos de uso      | `casos-uso.html`    |
| Mockups           | `mockups.html`      |
| Descripciones     | `descripciones.html`|

Recursos: `assets/styles.css`, `assets/app.js`, `assets/mermaid-init.js`.

## Dokploy / ruta `/web`

1. Publica esta carpeta como **sitio estático** (raíz del sitio = contenido de `web/`).
2. Si la URL pública es `https://tu-dominio.com/web/`, las rutas relativas (`assets/...`, `arquitectura.html`) seguirán funcionando siempre que el path del sitio coincida con el prefijo donde está desplegada la carpeta.
3. Los diagramas (**Mermaid**) se cargan solo en `arquitectura.html` y `casos-uso.html` vía CDN (`cdn.jsdelivr.net`); hace falta acceso a ese dominio desde el navegador.

## Atajos

- Flechas **←** **→** (o RePág / AvPág): diapositiva anterior / siguiente.
- Botón sol/luna: tema claro u oscuro (persistente en `localStorage`).
