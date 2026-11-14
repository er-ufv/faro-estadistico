/* =====================================================================
   tutorial.js — Botón «Tutorial»: cómo usar Faro, paso a paso.
   Solo recuerda (en una clave aparte) si ya se ha mostrado; no toca el
   progreso de los ejercicios.
   ===================================================================== */
(function () {
  "use strict";
  const CLAVE_VISTO = "faro-tutorial-visto-v3";
  const chip = (txt, color) => `<span style="background:${color}">${txt}</span>`;
  const DIAPOS = [
    { id: "bienvenida", titulo: "Bienvenida", html: `<h3>¿Qué es Faro estadístico?</h3>
      <img src="docs/capturas/inicio.jpg" alt="Portada de Faro estadístico" loading="lazy">
      <p>Faro es una herramienta para <b>entender y practicar</b> el análisis de datos de los Temas 3 y 4: aprender la lógica de la inferencia, elegir la prueba adecuada e interpretar y redactar sus resultados.</p>
      <ol><li>Escribe tu nombre y apellidos y elige tu <b>grupo</b>: te acompañará el avatar de tu docente.</li>
      <li>Tu progreso se guarda <b>en este navegador</b>. Si cambias de ordenador, guarda una copia desde <i>Mi cuaderno</i> (lo verás al final de este tutorial).</li>
      <li>Todos los datos son <b>simulados</b> con fines docentes.</li></ol>` },
    { id: "espacios", titulo: "Los dos temas", html: `<h3>Cómo está organizado</h3>
      <div class="rejilla c2 tuto-temas2"><div class="caja" style="background:#fff8ec"><b>Tema 3 · Estadística descriptiva</b><br>Para describir y resumir los datos de tu muestra: variables y frecuencias, tendencia central, posición, dispersión, forma (curva normal y z) y gráficos. Termina con un reto final.</div>
      <div class="caja" style="background:#eaf3fd"><b>Tema 4 · Estadística inferencial</b><br>Para ir de la muestra a la población. Tiene dos espacios: <b>Fundamentos</b> (muestras, intervalos, contraste de hipótesis, supuestos) y <b>Usar los estadísticos</b> (el esquema de decisión y cada prueba), más un repaso final.</div></div>
      <img src="docs/capturas/esquema.jpg" alt="Esquema de decisión interactivo del Tema 4" loading="lazy">
      <p>Cambia de tema cuando quieras con los botones <b>Tema 3 · Descriptiva</b> y <b>Tema 4 · Inferencial</b> de la cabecera.</p>` },
    { id: "modulo", titulo: "Un módulo", html: `<h3>Cada módulo tiene cuatro pestañas</h3>
      <div class="tuto-pasos">${chip("1 · Explicación", "#003865")}${chip("2 · Explora", "#1F6FD1")}${chip("3 · Practica", "#E5254B")}${chip("+ Para profundizar", "#5b3f8c")}</div>
      <img src="docs/capturas/grupos-independientes.jpg" alt="Módulo Explora de grupos independientes" loading="lazy">
      <ol><li><b>Explicación:</b> tu docente te cuenta la idea clave en viñetas. Pulsa la viñeta para avanzar.</li>
      <li><b>Explora:</b> una simulación. Mueve los controles y observa qué cambia. Prueba las propuestas de las cajas «Prueba esto».</li>
      <li><b>Practica:</b> ejercicios basados en los casos de clase.</li>
      <li><b>Para profundizar</b> (opcional): las fórmulas, un ejemplo resuelto a mano con datos que puedes cambiar y las tablas de valores críticos (curva normal, t, χ², U, Wilcoxon).</li></ol>` },
    { id: "practica", titulo: "Practicar", html: `<h3>Cómo funcionan los ejercicios</h3>
      <img src="docs/capturas/practica.jpg" alt="Ejercicios de práctica" loading="lazy">
      <ol><li>Tienes <b>dos intentos</b>. Si fallas el primero, recibes una <b>pista</b>.</li>
      <li>Tras resolverlo, lee la <b>explicación</b>: ahí está lo importante, aciertes o no.</li>
      <li>Para redactar resultados, sigue siempre los tres pasos: <i>por qué esta prueba, qué resultados obtengo y qué puedo concluir</i>.</li>
      <li>Si te atascas, usa <b>«Pregúntale a Antonio IA»</b>: le llega el enunciado para que te ayude a razonar.</li></ol>` },
    { id: "antonio", titulo: "Antonio IA", html: `<h3>Antonio IA, tu tutor de estadística</h3>
      <p style="display:flex;gap:14px;align-items:center"><img src="img/antonio-ia.jpg" alt="Ilustración de Antonio IA" style="width:110px;margin:0;border-radius:50%" loading="lazy">
      <span>Ábrelo con el botón <b>💬 Antonio IA</b> de la cabecera o desde cualquier ejercicio. Te responde con <b>preguntas</b> para que llegues tú a la solución.</span></p>
      <ol><li>Cuéntale qué has intentado y dónde te pierdes: cuanto más concreta sea tu duda, mejor te ayudará.</li>
      <li>Es una IA y puede equivocarse: contrasta lo que te diga con los materiales del tema.</li>
      <li><b>No escribas datos personales</b> en el chat.</li></ol>` },
    { id: "cuaderno", titulo: "Mi cuaderno", html: `<h3>Tu cuaderno personal</h3>
      <img src="docs/capturas/cuaderno.jpg" alt="Cuaderno personal del estudiante" loading="lazy">
      <ol><li>Muestra qué conceptos <b>dominas</b>, cuáles conviene <b>repasar</b> y cuáles son <b>prioritarios</b>, con el apartado que debes revisar.</li>
      <li>Puedes <b>imprimirlo o guardarlo en PDF</b>.</li>
      <li><b>Guarda una copia de tu progreso</b> (archivo .json) y cárgala en otro ordenador o navegador para seguir donde lo dejaste.</li>
      <li>Si borras los datos de navegación del navegador, se borra tu progreso: por eso conviene guardar la copia.</li></ol>` },
    { id: "examen", titulo: "Para el examen", html: `<h3>Una ruta de estudio para el examen</h3>
      <ol><li>Empieza por el <b>Tema 3</b>: la desviación típica, la curva normal y las puntuaciones z son la base del Tema 4.</li>
      <li>Recorre <b>Fundamentos</b>: Explicación → Explora → Practica.</li>
      <li>Domina el <b>esquema de decisión</b>: es la llave para elegir la prueba.</li>
      <li>Practica cada prueba y redacta los resultados en los tres pasos.</li>
      <li>Haz el <b>Repaso final</b> y revisa las prioridades de <b>Mi cuaderno</b>.</li>
      <li>Si quieres entender de dónde sale cada número, entra en <b>Para profundizar</b>. En el módulo «¿Qué prueba?» tienes un <b>formulario</b> con todas las pruebas y tablas.</li></ol>
      <h3 style="margin-top:16px">¿Por dónde empiezas?</h3>
      <div class="tuto-elegir"><button type="button" class="btn" data-tuto-ir="tema3">Tema 3 · Estadística descriptiva ▶</button><button type="button" class="btn contorno" data-tuto-ir="tema4">Tema 4 · Estadística inferencial ▶</button></div>
      <p class="small gris">Puedes volver a este tutorial cuando quieras con el botón <b>Tutorial</b> de la cabecera.</p>` }
  ];

  let i = 0, fondo;
  function montar() {
    fondo = document.createElement("div");
    fondo.className = "tuto-fondo"; fondo.hidden = true;
    fondo.innerHTML = `<div class="tuto" role="dialog" aria-modal="true" aria-labelledby="tutoTit">
      <div class="tuto-cab"><h2 id="tutoTit">Cómo usar Faro</h2><button type="button" class="tuto-cerrar" aria-label="Cerrar el tutorial">×</button></div>
      <div class="tuto-temas">${DIAPOS.map((d, k) => `<button type="button" data-k="${k}">${k + 1} · ${d.titulo}</button>`).join("")}</div>
      <div class="tuto-cuerpo" aria-live="polite"></div>
      <div class="tuto-pie"><button type="button" class="btn contorno peq" data-mover="-1">◀ Anterior</button><div class="tuto-puntos"></div><button type="button" class="btn peq" data-mover="1">Siguiente ▶</button></div></div>`;
    document.body.appendChild(fondo);
    fondo.addEventListener("click", e => { if (e.target === fondo) cerrar(); });
    fondo.querySelector(".tuto-cerrar").addEventListener("click", cerrar);
    fondo.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => ir(+b.dataset.k)));
    fondo.querySelectorAll("[data-mover]").forEach(b => b.addEventListener("click", () => {
      const n = i + +b.dataset.mover; if (n >= DIAPOS.length) { cerrar(); if (window.App) window.App.irA("inicio"); } else ir(Math.max(0, n));
    }));
    document.addEventListener("keydown", e => {
      if (fondo.hidden) return;
      if (e.key === "Escape") cerrar(); if (e.key === "ArrowRight") ir(Math.min(DIAPOS.length - 1, i + 1)); if (e.key === "ArrowLeft") ir(Math.max(0, i - 1));
    });
  }
  function ir(k) {
    i = k;
    fondo.querySelector(".tuto-cuerpo").innerHTML = DIAPOS[k].html;
    fondo.querySelectorAll("[data-k]").forEach(b => b.classList.toggle("activo", +b.dataset.k === k));
    fondo.querySelector(".tuto-puntos").innerHTML = DIAPOS.map((_, n) => `<i class="${n === k ? "on" : ""}"></i>`).join("");
    fondo.querySelector('[data-mover="-1"]').disabled = k === 0;
    fondo.querySelector('[data-mover="1"]').textContent = k === DIAPOS.length - 1 ? "Empezar ✔" : "Siguiente ▶";
    fondo.querySelector(".tuto").scrollTop = 0;
    fondo.querySelectorAll("[data-tuto-ir]").forEach(b => b.addEventListener("click", () => { cerrar(); if (window.App) window.App.irA(b.dataset.tutoIr); }));
  }
  function abrir(k) { if (!fondo) montar(); fondo.hidden = false; ir(k || 0); fondo.querySelector(".tuto-cerrar").focus(); try { localStorage.setItem(CLAVE_VISTO, "1"); } catch (e) { /* sin almacenamiento */ } }
  function cerrar() { if (fondo) fondo.hidden = true; }

  function abrirSiNuevo() { let v = false; try { v = !!localStorage.getItem(CLAVE_VISTO); } catch (e) { v = true; } if (!v) setTimeout(() => abrir(0), 600); }
  window.FaroTutorial = { abrir, cerrar, abrirSiNuevo };
  document.querySelectorAll("[data-tutorial]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); abrir(0); }));

  // Se muestra una vez a quien ya tenía perfil (así descubre las novedades)
  let visto = false; try { visto = !!localStorage.getItem(CLAVE_VISTO); } catch (e) { visto = true; }
  if (!visto && window.Tutor && window.Tutor.perfil && window.Tutor.perfil()) setTimeout(() => abrir(0), 900);
})();
