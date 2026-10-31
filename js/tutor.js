/* =====================================================================
   tutor.js — Avatares, bocadillos, ejercicios y cuaderno personal
   El progreso se guarda SOLO en el navegador del estudiante.
   ===================================================================== */
(function () {
  "use strict";
  const C = window.Contenido, App = window.App;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const azar = a => a[Math.floor(Math.random() * a.length)];
  const barajar = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const pocoMovimiento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MODULOS_ORDEN = ["muestras", "intervalos", "juicio", "supuestos", "esquema", "chi", "correlaciones", "independientes", "relacionadas"];

  // ------------------------------------------------------------------
  // Almacenamiento (con alternativa en memoria si el navegador lo bloquea)
  // ------------------------------------------------------------------
  const CLAVE = "ufv-tema4-tutor-v1";
  let memoria = { actual: null, perfiles: {} };
  function cargar() { try { const s = localStorage.getItem(CLAVE); if (s) memoria = JSON.parse(s); } catch (e) { /* sin almacenamiento */ } if (!memoria.perfiles) memoria.perfiles = {}; }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(memoria)); } catch (e) { /* sin almacenamiento */ } }
  const perfil = () => memoria.actual ? memoria.perfiles[memoria.actual] : null;
  const docente = () => { const p = perfil(); return p ? C.DOCENTES[C.GRUPOS[p.grupo]] : null; };
  cargar();

  // ------------------------------------------------------------------
  // Textos adaptados al docente y al estudiante
  // ------------------------------------------------------------------
  function tx(s) {
    const d = docente() || C.DOCENTES.eduar, p = perfil(), f = d.genero === "f";
    return s.replace(/\{la\}/g, f ? "la" : "el").replace(/\{La\}/g, f ? "La" : "El")
      .replace(/\{profe\}/g, f ? "profesora" : "profesor").replace(/\{Profe\}/g, f ? "Profesora" : "Profesor")
      .replace(/\{contenta\}/g, f ? "contenta" : "contento").replace(/\{orgullosa\}/g, f ? "orgullosa" : "orgulloso")
      .replace(/\{docente\}/g, d.nombre).replace(/\{alumno\}/g, p ? p.nombre.split(" ")[0] : "");
  }

  // ------------------------------------------------------------------
  // Avatar animado
  // ------------------------------------------------------------------
  const blobs = {};
  function rutaAvatar(d, estado) {
    if (pocoMovimiento || d.faltan.includes(estado)) return `img/avatares/${d.avatar}-reposo.webp`;
    return `img/avatares/${d.avatar}-${estado}.${d.ext[estado] || "webp"}`;
  }
  function precargar(d) {
    ["hablando", "esperando", "celebrando", "sorpresa", "reflexivo"].forEach(e => {
      const r = rutaAvatar(d, e);
      if (blobs[r] || location.protocol === "file:") return;
      blobs[r] = "cargando";
      fetch(r).then(x => x.ok ? x.blob() : null).then(b => { blobs[r] = b || null; }).catch(() => { blobs[r] = null; });
    });
  }
  let contadorSrc = 0;
  class Avatar {
    constructor(img) { this.img = img; this.t = null; }
    poner(estado, volverA = "esperando", ms) {
      const d = docente(); if (!d) return;
      (window.__expresiones = window.__expresiones || new Set()).add(d.avatar + ":" + estado);
      const r = rutaAvatar(d, estado), b = blobs[r];
      if (this.url) { URL.revokeObjectURL(this.url); this.url = null; }
      if (b && b instanceof Blob) { this.url = URL.createObjectURL(b); this.img.src = this.url; }
      else this.img.src = r + "#" + (++contadorSrc);       // reinicia la animación
      this.img.alt = `${tx("{Profe}")} ${d.nombre} (${estado})`;
      clearTimeout(this.t);
      if (volverA && estado !== volverA) this.t = setTimeout(() => this.poner(volverA, null), ms || C.DURACION[estado] || 3000);
    }
  }

  // ------------------------------------------------------------------
  // Viñeta: avatar + bocadillo con texto que se escribe
  // ------------------------------------------------------------------
  function vineta(cont, opciones = {}) {
    const d = docente();
    cont.innerHTML = `<div class="comic ${opciones.mini ? "mini" : ""}">
        <figure class="comic-avatar"><img alt=""><figcaption>${tx("{Profe}")} ${esc(d.nombre)}</figcaption></figure>
        <div class="bocadillo" tabindex="0"><p class="bocadillo-texto"><span class="ya"></span><span class="por"></span></p><div class="bocadillo-pie"></div></div>
      </div>`;
    const v = { av: new Avatar(cont.querySelector("img")), txt: cont.querySelector(".bocadillo-texto"), pie: cont.querySelector(".bocadillo-pie"), burbuja: cont.querySelector(".bocadillo"), timer: null };
    v.decir = (texto, estado = "hablando", alTerminar) => {
      clearInterval(v.timer);
      const t = tx(texto), ya = v.txt.querySelector(".ya"), por = v.txt.querySelector(".por");
      const durHablar = Math.min(7000, Math.max(C.DURACION.hablando, t.length * 24));
      v.av.poner(estado, "esperando", estado === "hablando" ? durHablar : undefined);
      if (pocoMovimiento) { ya.textContent = t; por.textContent = ""; if (alTerminar) alTerminar(); return; }
      let i = 0; ya.textContent = ""; por.textContent = t;
      v.completar = () => { clearInterval(v.timer); ya.textContent = t; por.textContent = ""; if (alTerminar) { const f = alTerminar; alTerminar = null; f(); } };
      v.timer = setInterval(() => { i += 2; ya.textContent = t.slice(0, i); por.textContent = t.slice(i); if (i >= t.length) v.completar(); }, 22);
    };
    v.burbuja.addEventListener("click", () => v.completar && v.completar());
    v.burbuja.addEventListener("keydown", e => { if (e.key === "Enter" && v.completar) v.completar(); });
    v.av.poner("esperando", null);
    return v;
  }

  // Diálogo de varias viñetas con navegación
  function dialogo(cont, lineas, final, opciones) {
    const v = vineta(cont, opciones); let k = 0;
    const pinta = () => {
      v.decir(lineas[k], "hablando");
      const ult = k === lineas.length - 1;
      v.pie.innerHTML = `<span class="puntos">${lineas.map((_, i) => `<i class="${i === k ? "on" : ""}"></i>`).join("")}</span>
        <span class="botones">${k > 0 ? '<button class="btn contorno peq" data-a="ant">◀ Anterior</button>' : ""}
        ${!ult ? '<button class="btn peq" data-a="sig">Siguiente ▶</button>' : (final || "")}</span>`;
      v.pie.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", e => {
        e.stopPropagation(); k += b.dataset.a === "sig" ? 1 : -1; pinta();
      }));
      if (ult && opciones && opciones.alFinal) opciones.alFinal(v);
    };
    pinta();
    return v;
  }

  // ------------------------------------------------------------------
  // Registro de resultados y dominio por concepto
  // ------------------------------------------------------------------
  const todosEjercicios = mod => (C.PRACTICA[mod] || []).flatMap(s => s.ejercicios.map(e => Object.assign({ mod, set: s.id }, e)));
  const TODOS = Object.keys(C.PRACTICA).flatMap(todosEjercicios);
  const conceptos = e => [].concat(e.concepto);
  const registro = id => perfil() && perfil().ej[id];
  const hechos = mod => todosEjercicios(mod).filter(e => registro(e.id)).length;

  function dominio() {
    const out = {};
    Object.keys(C.CONCEPTOS).forEach(k => { out[k] = { n: 0, primero: 0, solucion: 0 }; });
    TODOS.forEach(e => {
      const r = registro(e.id); if (!r) return;
      conceptos(e).forEach(k => { const o = out[k]; o.n++; if (r.res === "primero") o.primero++; if (r.res === "solucion") o.solucion++; });
    });
    Object.values(out).forEach(o => {
      o.pct = o.n ? o.primero / o.n : null;
      o.nivel = !o.n ? "sin" : (o.pct < .5 || o.solucion >= 2) ? "prioritario" : o.pct < .8 ? "repasar" : "dominado";
    });
    return out;
  }

  // ------------------------------------------------------------------
  // Ejercicios
  // ------------------------------------------------------------------
  const TIPO = { test: "Tipo test", emparejar: "Emparejar", clasificar: "Clasificar", completar: "Completar datos" };
  const numero = s => parseFloat(String(s).replace(/\s|%/g, "").replace("−", "-").replace(",", "."));

  function tarjetaEjercicio(e, n, tutorMod) {
    const div = document.createElement("article");
    div.className = "ejercicio"; div.id = "ej-" + e.id;
    const conc = conceptos(e).map(k => `<span class="chip-concepto">${C.CONCEPTOS[k].nombre}</span>`).join("");
    let cuerpo = "";
    if (e.tipo === "test") {
      // Las opciones se barajan cada vez: la clave no ocupa una posición fija
      cuerpo = `<div class="opciones">${barajar(e.opciones.map((o, i) => [o, i])).map(([o, i]) => `<label data-i="${i}"><input type="radio" name="r-${e.id}" value="${i}"> <span>${o}</span></label>`).join("")}</div>`;
    } else if (e.tipo === "emparejar" || e.tipo === "clasificar") {
      const filas = e.tipo === "emparejar" ? e.pares.map(p => [p[0], p[1]]) : e.items;
      const opts = e.tipo === "emparejar" ? barajar(e.pares.map(p => p[1])) : e.categorias;
      cuerpo = `<div class="emparejar">${filas.map((f, i) => `<div class="fila-emp" data-i="${i}"><span class="emp-izq">${f[0]}</span>
        <select aria-label="Respuesta para: ${esc(f[0].replace(/<[^>]+>/g, ""))}"><option value="">Elige…</option>${opts.map(o => `<option value="${esc(o)}">${o}</option>`).join("")}</select></div>`).join("")}</div>`;
    } else if (e.tipo === "completar") {
      cuerpo = `<div class="completar">${e.campos.map((c, i) => `<label class="campo">${c.etiqueta} <input type="text" inputmode="decimal" data-i="${i}" autocomplete="off">${c.unidad ? `<span>${c.unidad}</span>` : ""}</label>`).join("")}</div>`;
    }
    div.innerHTML = `<header><span class="num">${n}</span><span class="tipo">${TIPO[e.tipo]}</span><span class="estado-ej"></span></header>
      <div class="conceptos">${conc}</div>
      <p class="enunciado">${e.enunciado}</p>${e.contexto ? `<div class="contexto">${e.contexto}</div>` : ""}
      ${cuerpo}
      <div class="acciones"><button class="btn peq comprobar">Comprobar</button><button class="btn contorno peq repetir oculto">Repetir</button>${C.GEM ? `<button class="btn peq gem" title="Consulta a ${esc(C.GEM.nombre)} dentro de Faro">💬 Pregúntale a ${esc(C.GEM.nombre)}</button>` : ""}</div>
      <div class="feedback" aria-live="polite"></div>`;
    let intento = 0;
    const fb = div.querySelector(".feedback"), estadoEl = div.querySelector(".estado-ej");
    const controles = () => div.querySelectorAll("input, select");

    function respuestas() {
      if (e.tipo === "test") { const m = div.querySelector("input:checked"); return m ? +m.value : null; }
      if (e.tipo === "completar") return [...div.querySelectorAll(".completar input")].map(i => i.value.trim());
      return [...div.querySelectorAll("select")].map(s => s.value);
    }
    function evaluar(r) {   // devuelve array de aciertos por elemento
      if (e.tipo === "test") return [r === e.correcta];
      if (e.tipo === "completar") return e.campos.map((c, i) => { const v = numero(r[i]); return isFinite(v) && Math.abs(v - c.valor) <= (c.tol || 0) + 1e-9; });
      const sol = e.tipo === "emparejar" ? e.pares.map(p => p[1]) : e.items.map(it => it[1]);
      return r.map((v, i) => v === sol[i]);
    }
    function marcar(ok) {
      if (e.tipo === "test") return;
      const filas = e.tipo === "completar" ? div.querySelectorAll(".completar .campo") : div.querySelectorAll(".fila-emp");
      filas.forEach((f, i) => { f.classList.toggle("mal", !ok[i]); f.classList.toggle("bien", !!ok[i]); });
    }
    function mostrarSolucion() {
      if (e.tipo === "test") { div.querySelectorAll(".opciones label").forEach(l => l.classList.toggle("correcta", +l.dataset.i === e.correcta)); }
      else if (e.tipo === "completar") div.querySelectorAll(".completar input").forEach((inp, i) => { inp.value = Graf.numEje(e.campos[i].valor).replace("−", "-"); });
      else { const sol = e.tipo === "emparejar" ? e.pares.map(p => p[1]) : e.items.map(it => it[1]); div.querySelectorAll("select").forEach((s, i) => { s.value = sol[i]; }); }
      marcar(evaluar(respuestas()));
    }
    function terminar(res, pista) {
      if (e.tipo === "test") div.querySelectorAll(".opciones label").forEach(l => l.classList.toggle("correcta", +l.dataset.i === e.correcta));
      controles().forEach(c => { c.disabled = true; });
      div.querySelector(".comprobar").classList.add("oculto");
      div.querySelector(".repetir").classList.remove("oculto");
      div.classList.add("hecho", res);
      estadoEl.textContent = res === "primero" ? "✔ A la primera" : res === "segundo" ? "✔ A la segunda" : "Solución vista";
      const p = perfil(); p.ej[e.id] = { res, pista, fecha: new Date().toISOString().slice(0, 10) }; guardar();
      tutorMod.alResolver(e, res);
    }
    div.querySelector(".comprobar").addEventListener("click", () => {
      const r = respuestas();
      const vacio = e.tipo === "test" ? r === null : r.some(v => v === "");
      if (vacio) { fb.innerHTML = `<div class="caja alerta">Responde a todo antes de comprobar.</div>`; return; }
      const ok = evaluar(r), bien = ok.every(Boolean);
      marcar(ok); intento++;
      if (bien) {
        fb.innerHTML = `<div class="caja exito"><b>${intento === 1 ? "¡Correcto!" : "¡Ahora sí!"}</b> ${e.explicacion}</div>`;
        terminar(intento === 1 ? "primero" : "segundo", intento > 1);
      } else if (intento === 1) {
        const parcial = ok.length > 1 ? ` Tienes ${ok.filter(Boolean).length} de ${ok.length} bien; revisa las marcadas en rojo.` : "";
        fb.innerHTML = `<div class="caja reto"><b>Pista:</b> ${e.pista}${parcial}</div>`;
        tutorMod.alFallar(e, 1);
      } else {
        mostrarSolucion();
        fb.innerHTML = `<div class="caja alerta"><b>Solución:</b> ${e.explicacion}</div>`;
        terminar("solucion", true);
        tutorMod.alFallar(e, 2);
      }
    });
    const botonGem = div.querySelector(".gem");
    if (botonGem) botonGem.addEventListener("click", () => {
      const limpio = h => String(h).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      let mia = "";
      if (e.tipo === "test") { const m = div.querySelector("input:checked"); mia = m ? e.opciones[+m.value] : "(todavía no he respondido)"; }
      else if (e.tipo === "completar") mia = e.campos.map((c, i) => `${c.etiqueta}: ${div.querySelectorAll(".completar input")[i].value || "?"}`).join("; ");
      else mia = [...div.querySelectorAll(".fila-emp")].map(f => `${limpio(f.querySelector(".emp-izq").innerHTML)} → ${f.querySelector("select").value || "?"}`).join("; ");
      const setObj = (C.PRACTICA[e.mod] || []).find(x => x.id === e.set), ctx = setObj && setObj.descripcion ? `Contexto: ${limpio(setObj.descripcion)}\n` : "";
      if (window.AntonioIA && window.AntonioIA.abrir) {
        window.AntonioIA.abrir({
          faroModule: C.MODULOS[e.mod].titulo,
          exerciseStatement: [ctx, limpio(e.enunciado)].filter(Boolean).join('\n'),
          studentAnswer: mia,
          hintReceived: intento > 0 || registro(e.id) ? e.pista : '(ninguna todavía)',
          exerciseId: e.id
        });
      } else {
        fb.insertAdjacentHTML('afterbegin','<div class="caja alerta">El tutor todavía no está disponible.</div>');
      }
    });
    div.querySelector(".repetir").addEventListener("click", () => {
      const p = perfil(); delete p.ej[e.id]; guardar();
      const nueva = tarjetaEjercicio(e, n, tutorMod); div.replaceWith(nueva); tutorMod.actualizar();
    });
    // Estado guardado
    const reg = registro(e.id);
    if (reg) {
      mostrarSolucion();
      controles().forEach(c => { c.disabled = true; });
      div.querySelector(".comprobar").classList.add("oculto");
      div.querySelector(".repetir").classList.remove("oculto");
      div.classList.add("hecho", reg.res);
      estadoEl.textContent = reg.res === "primero" ? "✔ A la primera" : reg.res === "segundo" ? "✔ A la segunda" : "Solución vista";
      fb.innerHTML = `<div class="caja ${reg.res === "solucion" ? "alerta" : "exito"} small">${e.explicacion}</div>`;
    }
    return div;
  }

  // ------------------------------------------------------------------
  // Módulos: pasos Explicación · Explora · Practica
  // ------------------------------------------------------------------
  const pasoActual = {}, setActual = {};
  const vinetasPractica = {};

  function montarModulo(mod) {
    const sec = $("tab-" + mod); if (!sec || sec.dataset.montado) return;
    sec.dataset.montado = "1";
    const tieneExplora = !!sec.querySelector('[data-paso="explora"]');
    const barra = document.createElement("nav");
    barra.className = "pasos-mod"; barra.setAttribute("aria-label", "Pasos del módulo");
    barra.innerHTML = `<button data-p="explica"><b>1</b> Explicación</button>` + (tieneExplora ? `<button data-p="explora"><b>2</b> Explora</button>` : "") +
      `<button data-p="practica"><b>${tieneExplora ? 3 : 2}</b> Practica <span class="cuenta"></span></button>`;
    sec.prepend(barra);
    const esp = App.ESPACIO[mod], lista = esp ? ESPACIOS[esp].mods : null, i = lista ? lista.indexOf(mod) : -1;
    const migas = document.createElement("div"); migas.className = "migas";
    migas.innerHTML = (esp ? `<button class="enlace-ej" data-ir-esp="${esp}">${ESPACIOS[esp].titulo}</button><span>›</span>` : `<button class="enlace-ej" data-ir-esp="inicio">Inicio</button><span>›</span>`) +
      `<b>${C.MODULOS[mod].titulo}</b><span class="migas-nav">` +
      (lista && i > 0 ? `<button class="enlace-ej" data-ir-esp="${lista[i - 1]}">◀ ${C.MODULOS[lista[i - 1]].corto}</button>` : "") +
      (lista && i < lista.length - 1 ? `<button class="enlace-ej" data-ir-esp="${lista[i + 1]}">${C.MODULOS[lista[i + 1]].corto} ▶</button>` : esp === "fundamentos" ? `<button class="enlace-ej" data-ir-esp="estadisticos">Usar los estadísticos ▶</button>` : "") + `</span>`;
    sec.prepend(migas);
    migas.querySelectorAll("[data-ir-esp]").forEach(b => b.addEventListener("click", () => App.irA(b.dataset.irEsp)));
    const ex = document.createElement("div"); ex.className = "paso-mod"; ex.dataset.paso = "explica"; ex.innerHTML = `<div class="explica-cont"></div>`;
    const pr = document.createElement("div"); pr.className = "paso-mod"; pr.dataset.paso = "practica";
    pr.innerHTML = `<div class="practica-layout"><div class="practica-ej"></div><aside class="practica-tutor"><div class="tutor-mini"></div><div class="progreso-mod"></div></aside></div>`;
    barra.after(ex); sec.append(pr);
    barra.querySelectorAll("button").forEach(b => b.addEventListener("click", () => irPaso(mod, b.dataset.p)));
  }

  function irPaso(mod, paso, setId) {
    const sec = $("tab-" + mod);
    if (!sec.querySelector(`[data-paso="${paso}"]`)) paso = "explica";
    pasoActual[mod] = paso;
    sec.querySelectorAll(".paso-mod").forEach(d => d.classList.toggle("activo", d.dataset.paso === paso));
    sec.querySelectorAll(".pasos-mod button").forEach(b => b.classList.toggle("activo", b.dataset.p === paso));
    if (history.replaceState) history.replaceState(null, "", "#" + mod + (paso !== "explica" ? "/" + paso : "") + (setId ? "/" + setId : ""));
    if (paso === "explica") pintarExplica(mod);
    if (paso === "practica") pintarPractica(mod, setId);
    if (paso === "explora") App.redibujar();
    actualizarCuentas();
  }

  function pintarExplica(mod) {
    const sec = $("tab-" + mod), cont = sec.querySelector(".explica-cont"), M = C.MODULOS[mod];
    const tieneExplora = !!sec.querySelector('[data-paso="explora"]');
    const final = (tieneExplora ? `<button class="btn peq" data-ir-paso="explora">Ir a Explora ▶</button>` : "") + `<button class="btn ${tieneExplora ? "contorno" : ""} peq" data-ir-paso="practica">Practicar ▶</button>`;
    cont.innerHTML = `<h2 class="titulo-mod">${M.titulo}</h2><div class="vineta-grande"></div>`;
    dialogo(cont.querySelector(".vineta-grande"), M.explica, final, {
      alFinal: v => v.pie.querySelectorAll("[data-ir-paso]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); irPaso(mod, b.dataset.irPaso); }))
    });
    const p = perfil(); p.vistos = p.vistos || {}; p.vistos[mod] = true; guardar();
  }

  function pintarPractica(mod, setId) {
    const sec = $("tab-" + mod), sets = C.PRACTICA[mod] || [];
    if (setId && sets.some(s => s.id === setId)) setActual[mod] = setId;
    const s = sets.find(x => x.id === setActual[mod]) || sets[0]; setActual[mod] = s.id;
    const cont = sec.querySelector(".practica-ej");
    const tabs = sets.length > 1 ? `<div class="sets">${sets.map(x => `<button data-set="${x.id}" class="${x.id === s.id ? "activo" : ""}">${x.titulo} <span class="cuenta-set">${x.ejercicios.filter(e => registro(e.id)).length}/${x.ejercicios.length}</span></button>`).join("")}</div>` : "";
    cont.innerHTML = tabs + (s.descripcion ? `<div class="caja clave">${s.descripcion}</div>` : "") +
      (s.contexto ? `<div class="contexto-set">${s.contexto}</div>` : "") +
      (mod === "chi" && (s.id === "act1" || s.id === "act2") ? `<button class="enlace-ej" data-cargar="${s.id}">Ver esta tabla en «Explora» (χ², esperadas y residuos)</button>` : "") +
      `<div class="lista-ej"></div>`;
    cont.querySelectorAll("[data-set]").forEach(b => b.addEventListener("click", () => { setActual[mod] = b.dataset.set; irPaso(mod, "practica", b.dataset.set); }));
    cont.querySelectorAll("[data-cargar]").forEach(b => b.addEventListener("click", () => { App.cargarChi(b.dataset.cargar); irPaso("chi", "explora"); }));
    const tutorMod = controladorTutor(mod);
    const lista = cont.querySelector(".lista-ej");
    s.ejercicios.forEach((e, i) => lista.appendChild(tarjetaEjercicio(Object.assign({ mod, set: s.id }, e), i + 1, tutorMod)));
    // Viñeta del tutor
    const v = vineta(sec.querySelector(".tutor-mini"), { mini: true });
    vinetasPractica[mod] = v;
    const pend = s.ejercicios.filter(e => !registro(e.id)).length;
    v.decir(pend === 0 ? "Ya has resuelto todos estos ejercicios. Puedes repetir los que quieras." : pend === s.ejercicios.length ? `Te dejo ${s.ejercicios.length} ejercicios. Si fallas, te daré una pista y otra oportunidad.` : `Te quedan ${pend} ejercicios aquí. ¡Sigue así!`, "hablando");
    tutorMod.actualizar();
  }

  function controladorTutor(mod) {
    let racha = 0;
    const v = () => vinetasPractica[mod];
    const t = {
      alResolver(e, res) {
        if (res === "primero") { racha++; v().decir(racha % 3 === 0 ? azar(C.REACCIONES.racha) : azar(C.REACCIONES.acierto), racha % 3 === 0 ? "sorpresa" : "celebrando"); }
        else if (res === "segundo") { racha = 0; v().decir(azar(C.REACCIONES.segundo), "sorpresa"); }
        else racha = 0;
        t.actualizar();
        if (hechos(mod) === todosEjercicios(mod).length && res !== "solucion") setTimeout(() => v().decir(azar(C.REACCIONES.modulo), "celebrando"), 2600);
      },
      alFallar(e, n) { racha = 0; v().decir(n === 1 ? azar(C.REACCIONES.fallo) : azar(C.REACCIONES.fallo2), "reflexivo"); },
      actualizar() {
        const sec = $("tab-" + mod), tot = todosEjercicios(mod).length, h = hechos(mod);
        const pm = sec.querySelector(".progreso-mod");
        if (pm) pm.innerHTML = `<div class="barra-prog"><i style="width:${tot ? 100 * h / tot : 0}%"></i></div><p class="small">${h} de ${tot} ejercicios del módulo resueltos</p><button class="enlace-ej" data-ir-cuaderno>Ver mi cuaderno →</button>`;
        pm && pm.querySelector("[data-ir-cuaderno]").addEventListener("click", () => App.irA("cuaderno"));
        sec.querySelectorAll(".sets [data-set]").forEach(b => {
          const s = C.PRACTICA[mod].find(x => x.id === b.dataset.set);
          b.querySelector(".cuenta-set").textContent = `${s.ejercicios.filter(e => registro(e.id)).length}/${s.ejercicios.length}`;
        });
        actualizarCuentas();
      }
    };
    return t;
  }

  function actualizarCuentas() {
    [...MODULOS_ORDEN, "repaso"].forEach(mod => {
      const c = document.querySelector(`#tab-${mod} .pasos-mod .cuenta`);
      if (c) c.textContent = `${hechos(mod)}/${todosEjercicios(mod).length}`;
    });
  }

  // ------------------------------------------------------------------
  // Inicio y entrada
  // ------------------------------------------------------------------
  function pintarInicio() {
    const p = perfil(); if (!p) return;
    const cont = $("bienvenida");
    dialogo(cont, C.BIENVENIDA, `<button class="btn peq" data-empezar>Empezar por Fundamentos ▶</button>`, {
      alFinal: v => v.pie.querySelector("[data-empezar]").addEventListener("click", e => { e.stopPropagation(); App.irA("fundamentos"); })
    });
    pintarEspaciosInicio();
  }

  function pintarUsuario() {
    const p = perfil(), d = docente(), u = $("usuario");
    if (!p) { u.innerHTML = ""; return; }
    u.innerHTML = `<button id="cambiarUsuario" title="Cambiar de estudiante o de grupo"><img src="img/avatares/${d.avatar}-reposo.webp" alt=""><span>${esc(p.nombre.split(" ")[0])} · Grupo ${p.grupo}</span></button>`;
    $("cambiarUsuario").addEventListener("click", mostrarEntrada);
  }

  function mostrarEntrada() {
    const ov = $("entrada"), lista = Object.entries(memoria.perfiles);
    ov.classList.remove("oculto");
    ov.innerHTML = `<div class="entrada-caja" role="dialog" aria-modal="true" aria-labelledby="entradaTit">
      <img src="img/Logo_ufv.png" alt="UFV" class="entrada-logo">
      <h2 id="entradaTit">Tema 4 · Análisis inferencial</h2>
      <p>Escribe tu nombre y elige tu grupo. Tu progreso se guarda solo en este navegador.</p>
      ${lista.length ? `<div class="perfiles"><span class="small gris">Continuar como:</span>${lista.map(([id, p]) => `<button class="chip" data-perfil="${esc(id)}">${esc(p.nombre)} · ${p.grupo}</button>`).join("")}</div><hr>` : ""}
      <label class="control"><span class="etiqueta">Tu nombre</span><input type="text" id="entNombre" maxlength="60" autocomplete="given-name" placeholder="Nombre y apellido"></label>
      <div class="control"><span class="etiqueta">Tu grupo</span><div class="grupos">${Object.keys(C.GRUPOS).map(g => `<label><input type="radio" name="entGrupo" value="${g}"><span>${g}</span></label>`).join("")}</div></div>
      <div id="entDocente" class="ent-docente"></div>
      <div class="caja alerta oculto" id="entError"></div>
      <button class="btn" id="entOk">Entrar</button>
      ${perfil() ? '<button class="btn enlace" id="entCancelar">Cancelar</button>' : ""}
    </div>`;
    ov.querySelectorAll('input[name="entGrupo"]').forEach(r => r.addEventListener("change", () => {
      const d = C.DOCENTES[C.GRUPOS[r.value]];
      $("entDocente").innerHTML = `<img src="img/avatares/${d.avatar}-reposo.webp" alt=""><span>Tu docente: <b>${d.genero === "f" ? "Profesora" : "Profesor"} ${esc(d.completo)}</b></span>`;
    }));
    ov.querySelectorAll("[data-perfil]").forEach(b => b.addEventListener("click", () => entrar(b.dataset.perfil)));
    $("entOk").addEventListener("click", () => {
      const nombre = $("entNombre").value.trim().replace(/\s+/g, " "), g = ov.querySelector('input[name="entGrupo"]:checked');
      if (!nombre || !g) { const er = $("entError"); er.textContent = "Escribe tu nombre y elige tu grupo."; er.classList.remove("oculto"); return; }
      const id = nombre.toLowerCase() + "|" + g.value;
      if (!memoria.perfiles[id]) memoria.perfiles[id] = { nombre, grupo: g.value, creado: new Date().toISOString().slice(0, 10), ej: {}, vistos: {} };
      entrar(id);
    });
    $("entNombre").addEventListener("keydown", e => { if (e.key === "Enter") $("entOk").click(); });
    if ($("entCancelar")) $("entCancelar").addEventListener("click", () => ov.classList.add("oculto"));
    setTimeout(() => $("entNombre").focus(), 50);
  }

  function entrar(id) {
    memoria.actual = id; guardar();
    $("entrada").classList.add("oculto");
    precargar(docente());
    Object.keys(vinetasPractica).forEach(k => delete vinetasPractica[k]);
    pintarUsuario();
    App.irA("inicio");
  }

  // ------------------------------------------------------------------
  // Cuaderno
  // ------------------------------------------------------------------
  const NIVEL = { dominado: "Dominado", repasar: "Repasar", prioritario: "Prioritario", sin: "Sin practicar" };
  function pintarCuaderno() {
    const p = perfil(), d = docente(), dom = dominio(), cont = $("cuaderno");
    const practicados = Object.entries(dom).filter(([, o]) => o.n);
    const orden = practicados.sort((a, b) => (a[1].pct - b[1].pct) || (b[1].solucion - a[1].solucion));
    const prior = orden.filter(([, o]) => o.nivel !== "dominado").slice(0, 3);
    const dominados = orden.filter(([, o]) => o.nivel === "dominado").reverse();
    const totalEj = TODOS.length, hechosTot = TODOS.filter(e => registro(e.id)).length;
    const modsHechos = [...MODULOS_ORDEN, "repaso"].filter(m => hechos(m) === todosEjercicios(m).length).length;
    let msg, estado;
    if (!hechosTot) { msg = "Todavía no has hecho ejercicios, {alumno}. Empieza por el módulo 1 y vuelve aquí cuando quieras: iré anotando lo que dominas y lo que te conviene repasar."; estado = "hablando"; }
    else if (!prior.length) { msg = "¡Estoy muy {orgullosa} de ti, {alumno}! Dominas todo lo que has practicado." + (hechosTot < totalEj ? " Te quedan ejercicios por hacer: sigue así." : " Antes del examen, vuelve a hacer el repaso final."); estado = "celebrando"; }
    else {
      const n1 = C.CONCEPTOS[prior[0][0]].nombre.toLowerCase(), n2 = prior[1] ? C.CONCEPTOS[prior[1][0]].nombre.toLowerCase() : null;
      msg = (dominados.length ? `Vas muy bien con ${C.CONCEPTOS[dominados[0][0]].nombre.toLowerCase()}. ` : "Vas avanzando, {alumno}. ") + `Antes del examen, céntrate en ${n1}${n2 ? ` y en ${n2}` : ""}. Abajo te dejo qué repasar y dónde.`;
      estado = prior.some(([, o]) => o.nivel === "prioritario") ? "reflexivo" : "hablando";
    }
    const fecha = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    cont.innerHTML = `
      <div class="cuaderno-cab">
        <div><h2>Cuaderno de ${esc(p.nombre)}</h2>
        <p class="gris">Grupo ${p.grupo} · ${tx("{Profe}")} ${esc(d.completo)} · ${fecha}</p></div>
        <div class="fila-cifras">
          <div class="cifra azul"><div class="cifra-t">Ejercicios resueltos</div><div class="cifra-v">${hechosTot} de ${totalEj}</div></div>
          <div class="cifra verde"><div class="cifra-t">Módulos completados</div><div class="cifra-v">${modsHechos} de ${MODULOS_ORDEN.length + 1}</div></div>
          <div class="cifra roja"><div class="cifra-t">Aciertos a la primera</div><div class="cifra-v">${hechosTot ? Math.round(100 * TODOS.filter(e => registro(e.id) && registro(e.id).res === "primero").length / hechosTot) + " %" : "—"}</div></div>
        </div>
      </div>
      <div id="cuadernoVineta"></div>
      ${prior.length ? `<h3 class="seccion-c">Tus prioridades</h3><div class="rejilla c3">${prior.map(([k, o]) => { const c = C.CONCEPTOS[k]; return `<div class="prioridad ${o.nivel}"><span class="nivel ${o.nivel}">${NIVEL[o.nivel]}</span><h4>${c.nombre}</h4><p>${c.repaso}</p><p class="small gris">Repasa: ${c.diap}.</p><button class="btn peq" data-practicar="${c.modulo}">Practicar en «${C.MODULOS[c.modulo].corto}»</button></div>`; }).join("")}</div>` : ""}
      <h3 class="seccion-c">Mapa de conceptos</h3>
      <div class="mapa-conceptos">${Object.entries(C.CONCEPTOS).sort((a, b) => { const A = dom[a[0]], B = dom[b[0]]; return (A.n ? A.pct : 2) - (B.n ? B.pct : 2); }).map(([k, c]) => { const o = dom[k]; return `<div class="concepto"><span class="c-nom">${c.nombre}</span><div class="barra-prog ${o.nivel}"><i style="width:${o.n ? Math.max(3, 100 * o.pct) : 0}%"></i></div><span class="nivel ${o.nivel}">${NIVEL[o.nivel]}</span><span class="c-det small gris">${o.n ? `${o.primero}/${o.n} a la primera` : ""}</span></div>`; }).join("")}</div>
      <h3 class="seccion-c">Progreso por módulo</h3>
      <div class="tabla-scroll"><table class="t-ufv"><tr><th>Módulo</th><th>Resueltos</th><th>A la primera</th><th></th></tr>${[...MODULOS_ORDEN, "repaso"].map(m => { const es = todosEjercicios(m), h = es.filter(e => registro(e.id)), pr = h.filter(e => registro(e.id).res === "primero"); return `<tr><td class="fila">${C.MODULOS[m].titulo}</td><td>${h.length} de ${es.length}</td><td>${h.length ? pr.length + " de " + h.length : "—"}</td><td><button class="enlace-ej" data-practicar="${m}">${h.length === es.length ? "Repasar" : "Continuar"}</button></td></tr>`; }).join("")}</table></div>
      <p class="contacto">¿Dudas? Escribe a tu ${tx("{profe}")}: <a href="mailto:${d.email}">${d.email}</a></p>
      <div class="acciones-cuaderno no-imprimir">
        <button class="btn peq" id="cuImprimir">Imprimir o guardar en PDF</button>
        <button class="btn contorno peq" id="cuExportar">Guardar copia del progreso</button>
        <label class="btn contorno peq">Cargar copia<input type="file" id="cuImportar" accept="application/json" class="oculto"></label>
        <button class="btn enlace peq" id="cuBorrar">Borrar mi progreso</button>
      </div>
      <div id="cuMsg" aria-live="polite"></div>`;
    const v = vineta($("cuadernoVineta")); v.decir(msg, estado === "hablando" ? "hablando" : estado);
    cont.querySelectorAll("[data-practicar]").forEach(b => b.addEventListener("click", () => App.irA(b.dataset.practicar, "practica")));
    $("cuImprimir").addEventListener("click", () => window.print());
    $("cuExportar").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify({ app: "ufv-tema4", version: 1, perfil: p }, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = `progreso-tema4-${p.nombre.toLowerCase().replace(/[^a-z0-9áéíóúñü]+/gi, "-")}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $("cuImportar").addEventListener("change", ev => {
      const f = ev.target.files[0]; if (!f) return;
      f.text().then(t => {
        const o = JSON.parse(t);
        if (!o || o.app !== "ufv-tema4" || !o.perfil || !o.perfil.ej) throw new Error("formato");
        const id = o.perfil.nombre.toLowerCase() + "|" + o.perfil.grupo;
        memoria.perfiles[id] = o.perfil; memoria.actual = id; guardar(); pintarUsuario(); pintarCuaderno();
        $("cuMsg").innerHTML = `<div class="caja exito">Progreso cargado.</div>`;
      }).catch(() => { $("cuMsg").innerHTML = `<div class="caja alerta">Ese archivo no es una copia válida del progreso.</div>`; });
    });
    $("cuBorrar").addEventListener("click", function () {
      if (this.dataset.seguro) { p.ej = {}; p.vistos = {}; guardar(); pintarCuaderno(); return; }
      this.dataset.seguro = "1"; this.textContent = "¿Seguro? Pulsa otra vez para borrar";
    });
  }

  // ------------------------------------------------------------------
  // Espacios: Fundamentos y Usar los estadísticos
  // ------------------------------------------------------------------
  const ESPACIOS = {
    fundamentos: { titulo: "Fundamentos", mods: ["muestras", "intervalos", "juicio", "supuestos"], desc: "Las ideas que sostienen la inferencia." },
    estadisticos: { titulo: "Usar los estadísticos", mods: ["esquema", "chi", "correlaciones", "independientes", "relacionadas"], desc: "Elegir la prueba y aplicarla a casos de Psicología." }
  };
  const PREGUNTA = {
    muestras: "¿Por qué cada muestra da un resultado distinto?",
    intervalos: "¿Cómo estimamos la media de la población? ¿De dónde sale el 1,96?",
    juicio: "La lógica del contraste de hipótesis: H₀, α, el valor p y el veredicto.",
    supuestos: "Normalidad y homocedasticidad: aquí queremos p > ,05.",
    esquema: "Tipo de variables, objetivo y supuestos: el camino hasta la prueba.",
    chi: "Asociación entre dos variables categóricas y residuos corregidos.",
    correlaciones: "Pearson y Spearman: dirección, intensidad y significación.",
    independientes: "t de Student y U de Mann-Whitney: comparar dos grupos de personas distintas.",
    relacionadas: "t de Student y Wilcoxon: las mismas personas medidas dos veces."
  };
  const progresoMod = mod => { const t = todosEjercicios(mod).length, h = hechos(mod); return { t, h, pct: t ? h / t : 0 }; };
  const barra = (h, t) => `<div class="barra-prog"><i style="width:${t ? 100 * h / t : 0}%"></i></div><span class="small gris">${h}/${t} ejercicios${t && h === t ? " ✔" : ""}</span>`;

  function tarjetasRuta(mods) {
    return mods.map(m => {
      const pr = progresoMod(m), M = C.MODULOS[m], [n, ...resto] = M.titulo.split(" · ");
      return `<article class="parada ${pr.h === pr.t && pr.t ? "completa" : ""}" data-ir-mod="${m}" tabindex="0" role="button" aria-label="Abrir ${esc(M.titulo)}">
        <span class="parada-n">${n}</span><h3>${resto.join(" · ")}</h3><p>${PREGUNTA[m]}</p>${barra(pr.h, pr.t)}<span class="parada-ir">Entrar →</span></article>`;
    }).join("");
  }
  function activarTarjetas(cont) {
    cont.querySelectorAll("[data-ir-mod]").forEach(el => {
      const ir = () => App.irA(el.dataset.irMod);
      el.addEventListener("click", ir); el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ir(); } });
    });
  }

  function pintarEspaciosInicio() {
    const cont = $("espaciosInicio"); if (!cont) return;
    const total = mods => mods.reduce((a, m) => { const p = progresoMod(m); a.h += p.h; a.t += p.t; return a; }, { h: 0, t: 0 });
    const tarjeta = (k, clase) => { const E = ESPACIOS[k], t = total(E.mods); return `<article class="espacio ${clase}" data-ir-esp="${k}" tabindex="0" role="button">
        <span class="eti-espacio">${k === "fundamentos" ? "Espacio 1" : "Espacio 2"}</span><h2>${E.titulo}</h2><p>${E.desc}</p>
        <ul>${E.mods.map(m => `<li>${C.MODULOS[m].titulo.split(" · ")[1]}</li>`).join("")}</ul>${barra(t.h, t.t)}<span class="parada-ir">Entrar →</span></article>`; };
    const rp = progresoMod("repaso");
    cont.innerHTML = `<div class="rejilla c2">${tarjeta("fundamentos", "esp-azul")}${tarjeta("estadisticos", "esp-arena")}</div>
      <div class="rejilla c2"><article class="espacio mini" data-ir-esp="repaso" tabindex="0" role="button"><h3>Repaso final</h3><p>Preguntas mezcladas de todo el tema para antes del examen.</p>${barra(rp.h, rp.t)}</article>
      <article class="espacio mini" data-ir-esp="cuaderno" tabindex="0" role="button"><h3>Mi cuaderno</h3><p>Lo que ya dominas y lo que te conviene repasar.</p></article></div>
      ${C.GEM ? `<button type="button" class="espacio gem-tarjeta" id="antonioTarjeta" style="text-align:left;width:100%;cursor:pointer"><span class="gem-ico"><img src="img/antonio-ia.jpg" alt="Ilustración de Antonio IA, homenaje al profesor Antonio Pardo Merino" loading="lazy"></span><div><span class="eti-espacio">Tutor con IA · Gemini UFV</span><h3>${esc(C.GEM.nombre)}</h3><p>Si te atascas, ${esc(C.GEM.nombre)} te ayuda a razonar con preguntas, sin darte la solución hecha. En cada ejercicio tienes el botón <b>«Pregúntale a ${esc(C.GEM.nombre)}»</b>, que comparte el contexto de tu ejercicio automáticamente. Se abre aquí, sin salir de Faro. Es un homenaje a Antonio Pardo Merino.</p></div><span class="parada-ir">Abrir →</span></button>` : ""}`;
    const antonioTarjeta = cont.querySelector('#antonioTarjeta');
    if (antonioTarjeta) antonioTarjeta.addEventListener('click', () => window.AntonioIA?.abrir({}));
    cont.querySelectorAll("[data-ir-esp]").forEach(el => {
      const ir = () => App.irA(el.dataset.irEsp);
      el.addEventListener("click", ir); el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ir(); } });
    });
  }

  function pintarFundamentos() {
    const c = $("rutaFund"); c.innerHTML = `<div class="ruta-paradas">${tarjetasRuta(ESPACIOS.fundamentos.mods)}</div>`; activarTarjetas(c);
  }

  // Mapa interactivo del esquema de decisión
  const NODOS = [
    { id: "raiz", x: 500, y: 34, w: 170, t: ["2 variables"], k: "dec", info: "Empezamos por el <b>tipo de variables</b>: ¿son categóricas (cualitativas) o cuantitativas?" },
    { id: "cat", x: 120, y: 112, w: 170, t: ["Categóricas", "(cualitativas)"], k: "dec", info: "Variables con categorías: sí/no, Instagram/otras, clima positivo/negativo… El objetivo es <b>asociar</b>." },
    { id: "cuan", x: 610, y: 112, w: 170, t: ["Cuantitativas"], k: "dec", info: "Puntuaciones numéricas: ansiedad, horas de sueño, satisfacción… Ahora la pregunta es: ¿quiero <b>relacionar</b> o <b>comparar</b>?" },
    { id: "chi", x: 120, y: 210, w: 170, t: ["Chi-cuadrado", "(χ²) + residuos"], k: "prueba", ir: "chi", info: "<b>Chi-cuadrado de Pearson.</b> Asociación entre dos variables categóricas. Si es significativo, los residuos corregidos (±1,96) dicen dónde está la asociación." },
    { id: "rel", x: 330, y: 190, w: 150, t: ["Relacionar"], k: "dec", info: "Dos variables cuantitativas medidas en las mismas personas: ¿van juntas? Dirección, intensidad y significación." },
    { id: "comp", x: 790, y: 190, w: 150, t: ["Comparar"], k: "dec", info: "Una variable cuantitativa en dos grupos o en dos momentos: ¿hay diferencias?" },
    { id: "nr", x: 330, y: 266, w: 130, t: ["Normalidad"], k: "sup", ir: "supuestos", info: "<b>Supuesto de normalidad</b> (Shapiro-Wilk si n < 50; K-S con Lilliefors si n ≥ 50). Aquí queremos p > ,05. Pulsa para ir a «Supuestos»." },
    { id: "pear", x: 255, y: 360, w: 130, t: ["Correlación", "de Pearson (r)"], k: "prueba", ir: "correlaciones", info: "<b>Pearson (r).</b> Relación lineal entre dos cuantitativas con normalidad." },
    { id: "spear", x: 405, y: 360, w: 130, t: ["Correlación", "de Spearman (ρ)"], k: "prueba", ir: "correlaciones", info: "<b>Spearman (ρ).</b> Sin normalidad o con variables ordinales. Basada en rangos." },
    { id: "exc", x: 355, y: 470, w: 272, t: ["Excepción: Spearman si una variable es", "ordinal y la otra cuantitativa, o ambas ordinales"], k: "nota", info: "Por ejemplo: nivel de estudios (primaria/secundaria/universitarios) y satisfacción con la vida." },
    { id: "relac", x: 640, y: 266, w: 140, t: ["Muestras", "relacionadas"], k: "dec", info: "Las <b>mismas personas</b> medidas dos veces (antes y después de un taller, por ejemplo)." },
    { id: "indep", x: 880, y: 266, w: 140, t: ["Muestras", "independientes"], k: "dec", info: "<b>Grupos distintos</b> de personas (chicas y chicos; Psicología y Criminología)." },
    { id: "n1", x: 640, y: 342, w: 130, t: ["Normalidad"], k: "sup", ir: "supuestos", info: "<b>Supuesto de normalidad.</b> Si se cumple, prueba paramétrica; si no, no paramétrica." },
    { id: "trel", x: 580, y: 436, w: 120, t: ["t de Student", "relacionadas"], k: "prueba", ir: "relacionadas", info: "<b>t de Student para muestras relacionadas.</b> Compara la media de las diferencias de cada persona entre dos medidas." },
    { id: "wil", x: 706, y: 436, w: 110, t: ["Wilcoxon (W)"], k: "prueba", ir: "relacionadas", info: "<b>Wilcoxon.</b> Alternativa no paramétrica para muestras relacionadas: trabaja con los rangos de las diferencias." },
    { id: "n2", x: 880, y: 342, w: 130, t: ["Normalidad"], k: "sup", ir: "supuestos", info: "<b>Supuesto de normalidad.</b> Si no se cumple, vamos directamente a la U de Mann-Whitney. Si se cumple, comprobamos la homocedasticidad." },
    { id: "lev", x: 830, y: 436, w: 130, t: ["Homocedasticidad", "(Levene)"], k: "sup", ir: "supuestos", info: "<b>Prueba de Levene.</b> ¿Varianzas parecidas en los dos grupos? Queremos p > ,05." },
    { id: "tind", x: 790, y: 530, w: 120, t: ["t de Student", "independientes"], k: "prueba", ir: "independientes", info: "<b>t de Student para muestras independientes.</b> Compara las medias de dos grupos de personas distintas. Su lógica la tienes en «El juicio»." },
    { id: "mann", x: 930, y: 530, w: 120, t: ["U de", "Mann-Whitney"], k: "prueba", ir: "independientes", info: "<b>U de Mann-Whitney.</b> Alternativa no paramétrica para grupos independientes: compara rangos e informa de medianas." }
  ];
  const ARISTAS = [["raiz", "cat"], ["raiz", "cuan"], ["cat", "chi"], ["cuan", "rel"], ["cuan", "comp"], ["rel", "nr"], ["nr", "pear", "sí"], ["nr", "spear", "no"],
    ["comp", "relac"], ["comp", "indep"], ["relac", "n1"], ["n1", "trel", "sí"], ["n1", "wil", "no"], ["indep", "n2"], ["n2", "lev", "sí"], ["n2", "mann", "no"], ["lev", "tind", "sí"], ["lev", "mann", "no"]];
  function pintarMapa() {
    const N = Object.fromEntries(NODOS.map(n => [n.id, n])), H = l => l === 1 ? 40 : 50;
    const ejes = ARISTAS.map(([a, b, et]) => {
      const A = N[a], B = N[b], y1 = A.y + H(A.t.length) / 2, y2 = B.y - H(B.t.length) / 2, ym = (y1 + y2) / 2;
      const d = a === "n2" && b === "mann" ? `M${A.x + A.w / 2} ${A.y}H${B.x}V${y2}` : `M${A.x} ${y1}V${ym}H${B.x}V${y2}`;
      const directo = a === "n2" && b === "mann";
      const lx = directo ? B.x + 8 : B.x + (B.x < A.x ? -14 : 8), ly = directo ? A.y + 40 : ym + 14;
      return `<path d="${d}" class="mapa-eje" marker-end="url(#mapaFlecha)"/>` + (et ? `<text x="${lx}" y="${ly}" class="mapa-et">${et}</text>` : "");
    }).join("");
    const cajas = NODOS.map(n => {
      const h = H(n.t.length), lineas = n.t.map((l, i) => `<text x="${n.x}" y="${n.y + (n.t.length === 1 ? 5 : i === 0 ? -5 : 13)}" text-anchor="middle">${l}</text>`).join("");
      return `<g class="mapa-nodo ${n.k}" data-nodo="${n.id}" tabindex="0" role="button" aria-label="${n.t.join(" ")}"><rect x="${n.x - n.w / 2}" y="${n.y - h / 2}" width="${n.w}" height="${h}" rx="10"/>${lineas}${n.k === "prox" ? `<text x="${n.x}" y="${n.y + h / 2 + 13}" text-anchor="middle" class="mapa-prox">próximamente</text>` : ""}</g>`;
    }).join("");
    const S = N.spear, X = N.exc, excEje = `<path d="M${S.x} ${S.y + 25}V${X.y - 25}" class="mapa-eje discontinua" marker-end="url(#mapaFlecha)"/>`;
    $("mapaDecision").innerHTML = `<svg viewBox="0 0 1010 580" class="mapa-svg" role="img" aria-label="Esquema de decisión de pruebas estadísticas de 1.º curso">
      <defs><marker id="mapaFlecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#5B6770"/></marker></defs>${ejes}${excEje}${cajas}</svg>`;
    const info = $("mapaInfo");
    const mostrar = n => {
      $("mapaDecision").querySelectorAll(".mapa-nodo").forEach(g => g.classList.toggle("sel", g.dataset.nodo === n.id));
      info.innerHTML = `<p>${n.info}</p>` + (n.ir ? `<button class="btn peq" data-ir-mod="${n.ir}">Ir a «${C.MODULOS[n.ir].corto}» →</button>` : n.k === "prox" ? `<p class="small gris">Este módulo se añadirá con la siguiente parte del tema.</p>` : "");
      activarTarjetas(info);
    };
    $("mapaDecision").querySelectorAll(".mapa-nodo").forEach(g => {
      const n = N[g.dataset.nodo];
      g.addEventListener("click", () => mostrar(n));
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); mostrar(n); } });
    });
    info.innerHTML = `<p>Pulsa cualquier caja del esquema. Las cajas <span class="ley dec">azul claro</span> son decisiones, las <span class="ley sup">rosas</span> son supuestos y las <span class="ley prueba">azul oscuro</span> son pruebas: púlsalas para ir a su módulo.</p>`;
  }

  function pintarEstadisticos() {
    pintarMapa();
    const c = $("rutaEst");
    c.innerHTML = `<div class="ruta-paradas cinco">${tarjetasRuta(ESPACIOS.estadisticos.mods)}</div>`;
    activarTarjetas(c);
  }

  // ------------------------------------------------------------------
  // Conexión con la navegación
  // ------------------------------------------------------------------
  MODULOS_ORDEN.concat("repaso").forEach(montarModulo);
  App.alEntrar = function (tab, sub, setId) {
    if (!perfil()) return;
    if (tab === "inicio") pintarInicio();
    else if (tab === "cuaderno") pintarCuaderno();
    else if (tab === "fundamentos") pintarFundamentos();
    else if (tab === "estadisticos") pintarEstadisticos();
    else if (C.MODULOS[tab]) {
      const p = perfil(), visto = p.vistos && p.vistos[tab];
      irPaso(tab, sub || pasoActual[tab] || (visto ? (tab === "repaso" ? "practica" : "explora") : "explica"), setId);
    }
  };

  window.Tutor = { dominio, perfil };
  if (perfil()) { precargar(docente()); pintarUsuario(); App.arrancar(); }
  else { App.arrancar(); mostrarEntrada(); }
  // Enlace de la cabecera a Antonio IA (toma la URL de contenido.js)
  (() => { const a = document.getElementById("navGem"); if (!a) return; if (C.GEM) { a.removeAttribute("href"); a.style.cursor = "pointer"; a.textContent = "💬 " + C.GEM.nombre; a.addEventListener("click", (ev) => { ev.preventDefault(); window.AntonioIA?.abrir({}); }); } else a.remove(); })();
})();
