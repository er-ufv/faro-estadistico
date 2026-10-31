// Pega aquí la URL pública de tu Worker de Cloudflare tras desplegarlo.
// Nunca pegues tu clave API de Gemini en este archivo ni en GitHub.
window.ANTONIO_IA_CONFIG = {
  endpoint: "",
  // Solo si has activado Turnstile en el Worker. Sin él, no publicar a gran escala.
  turnstileSiteKey: ""
};
