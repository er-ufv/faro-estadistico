/* =====================================================================
   app.js — Lógica interactiva del recurso «Tema 4 · Inferencia» (UFV)
   Traducción a JavaScript de la aplicación Shiny original.
   Todos los datos son SIMULADOS con fines docentes.
   ===================================================================== */
(function () {
  "use strict";
  const { Grafico, COL, leyenda, histograma } = Graf;
  const E = Est;

  // ------------------------------------------------------------------
  // Utilidades
  // ------------------------------------------------------------------
  const $ = id => document.getElementById(id);
  const val = id => parseFloat($(id).value);
  const radio = n => document.querySelector(`input[name="${n}"]:checked`).value;
  const setRadio = (n, v) => { const r = document.querySelector(`input[name="${n}"][value="${v}"]`); if (r) r.checked = true; };
  function num(x, d = 2) {
    if (!isFinite(x)) return "—";
    let s = Math.abs(x).toFixed(d);
    let [ent, dec] = s.split(".");
    ent = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    s = dec !== undefined ? ent + "," + dec : ent;
    return (x < 0 && Number(Math.abs(x).toFixed(d)) !== 0 ? "−" : "") + s;
  }
  const sinCero = s => s.replace(/^(−?)0,/, "$1,");
  const pTxt = p => p < .001 ? "p < ,001" : "p = " + sinCero(num(p, 3));
  const alfaTxt = a => sinCero(num(a, a < .01 ? 3 : 2));
  function pct(x) { let s = (x * 100).toFixed(2).replace(/\.?0+$/, ""); return s.replace(".", ",") + " %"; }
  const cifra = (t, v, s, tipo = "") => `<div class="cifra ${tipo}"><div class="cifra-t">${t}</div><div class="cifra-v">${v}</div>${s ? `<div class="cifra-s">${s}</div>` : ""}</div>`;
  const paso = (n, t, cuerpo) => `<div class="paso"><h6><span class="bola">${n}</span>${t}</h6>${cuerpo}</div>`;
  const seq = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));
  const max = a => a.reduce((m, v) => v > m ? v : m, -Infinity);
  const min = a => a.reduce((m, v) => v < m ? v : m, Infinity);

  // Valor visible junto a cada deslizador
  const formatosSalida = { j_dif: v => num(v, 2), mj_dif: v => num(v, 2), h_ratio: v => num(v, 1), c_r: v => num(v, 2), ti_d: v => num(v, 2), ti_ratio: v => num(v, 1), tr_d: v => num(v, 2) };
  function actualizarSalida(inp) {
    const o = $(inp.id + "_v"); if (!o) return;
    const v = parseFloat(inp.value);
    o.textContent = formatosSalida[inp.id] ? formatosSalida[inp.id](v) : num(v, 0);
  }
  document.querySelectorAll('input[type=range]').forEach(inp => { actualizarSalida(inp); inp.addEventListener("input", () => actualizarSalida(inp)); });
  function setRange(id, v) { $(id).value = v; actualizarSalida($(id)); }

  // ------------------------------------------------------------------
  // Navegación
  // ------------------------------------------------------------------
  let pestanaActual = "inicio";
  const render = {};
  const App = window.App = { render };
  // Cada módulo pertenece a uno de los dos espacios de la barra superior
  App.ESPACIO = { muestras: "fundamentos", intervalos: "fundamentos", juicio: "fundamentos", supuestos: "fundamentos", esquema: "estadisticos", chi: "estadisticos", correlaciones: "estadisticos", independientes: "estadisticos", relacionadas: "estadisticos" };
  function irA(tab, sub, setId) {
    if (!document.getElementById("tab-" + tab)) tab = "inicio";
    pestanaActual = tab;
    document.querySelectorAll(".pestana").forEach(s => s.classList.toggle("activa", s.id === "tab-" + tab));
    const espacio = App.ESPACIO[tab] || tab;
    document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("activo", b.dataset.tab === espacio));
    $("nav").classList.remove("abierta");
    if (history.replaceState) history.replaceState(null, "", "#" + tab);
    window.scrollTo({ top: 0 });
    if (App.alEntrar) App.alEntrar(tab, sub, setId);
    redibujar();
  }
  function redibujar() { (render[pestanaActual] || (() => {}))(); }
  App.irA = irA; App.redibujar = redibujar;
  // Arranque: abre la pestaña indicada en la URL (#chi, #chi/practica, #chi/practica/act1…)
  App.arrancar = function () {
    const [tab, sub, setId] = location.hash.replace("#", "").split("/");
    irA(tab || "inicio", sub, setId);
  };
  window.addEventListener("hashchange", () => App.arrancar());
  document.querySelectorAll("#nav button").forEach(b => b.addEventListener("click", () => irA(b.dataset.tab)));
  document.querySelectorAll("[data-ir]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); irA(a.dataset.ir); }));
  $("menuMovil").addEventListener("click", () => $("nav").classList.toggle("abierta"));
  document.querySelectorAll(".subnav").forEach(nav => {
    nav.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      nav.querySelectorAll("button").forEach(x => x.classList.toggle("activo", x === b));
      const cont = nav.parentElement;
      cont.querySelectorAll(":scope > .subpestana").forEach(s => s.classList.toggle("activa", s.id === b.dataset.sub));
      redibujar();
    }));
  });
  let tRes; window.addEventListener("resize", () => { clearTimeout(tRes); tRes = setTimeout(redibujar, 150); });
  const visible = id => $(id) && $(id).offsetParent !== null;

  // ------------------------------------------------------------------
  // INICIO
  // ------------------------------------------------------------------
  const modulos = [
    ["1", "Muestras", "¿Por qué cada muestra da un resultado distinto?", "muestras"],
    ["2", "Intervalos de confianza", "¿Cómo estimamos la media de la población sin evaluar a todo el mundo? ¿De dónde sale el 1,96?", "intervalos"],
    ["3", "El juicio", "La lógica del contraste de hipótesis: H₀, α, el valor p y el veredicto.", "juicio"],
    ["4", "Supuestos", "Normalidad y homocedasticidad: aquí queremos p > ,05.", "supuestos"],
    ["5", "¿Qué prueba?", "El esquema de toma de decisiones, paso a paso, y casos para practicar.", "esquema"],
    ["6", "Chi-cuadrado", "Asociación entre dos variables categóricas y residuos corregidos.", "chi"],
    ["7", "Correlaciones", "Pearson y Spearman: dirección, intensidad y significación.", "correlaciones"],
    ["★", "Repaso final", "Preguntas mezcladas de todo el tema para antes del examen.", "repaso"]
  ];
  if ($("itinerario")) $("itinerario").innerHTML = modulos.map(m => `<div class="modulo ir" data-ir="${m[3]}"><span class="n">${m[0]}</span><h5>${m[1]}</h5><p>${m[2]}</p></div>`).join("");
  document.querySelectorAll("#itinerario [data-ir]").forEach(d => d.addEventListener("click", () => irA(d.dataset.ir)));

  // ==================================================================
  // 1 · MUESTRAS
  // ==================================================================
  const POB = E.conSemilla(2026, () => E.rnorm(5000, 58, 20).map(v => Math.round(E.limitar(v, 0, 100))));
  const MU = E.media(POB);
  const SIGMA = Math.sqrt(POB.reduce((s, v) => s + (v - MU) ** 2, 0) / POB.length);
  const mEst = { medias: [], ult: null };
  const mReset = () => { mEst.medias = []; mEst.ult = null; render.muestras(); };
  $("m_n").addEventListener("input", mReset);
  $("m_reset").addEventListener("click", mReset);
  $("m_mu").addEventListener("change", () => render.muestras());
  $("m_una").addEventListener("click", () => { const x = E.muestra(POB, val("m_n")); mEst.ult = x; mEst.medias.push(E.media(x)); render.muestras(); });
  $("m_cien").addEventListener("click", () => {
    const n = val("m_n");
    for (let i = 0; i < 99; i++) mEst.medias.push(E.media(E.muestra(POB, n)));
    const x = E.muestra(POB, n); mEst.ult = x; mEst.medias.push(E.media(x));
    render.muestras();
  });

  render.muestras = function () {
    const n = val("m_n"), ee = SIGMA / Math.sqrt(n), k = mEst.medias.length, verMu = $("m_mu").checked;
    $("m_cifras").innerHTML =
      cifra("Muestras extraídas", num(k, 0), "", "azul") +
      cifra("Media de la última muestra", k ? num(mEst.medias[k - 1], 1) : "—", "estadístico", "roja") +
      cifra("Dispersión de tus medias", k > 1 ? num(E.dt(mEst.medias), 2) : "—", "DT de las medias obtenidas") +
      cifra("Error típico teórico", num(ee, 2), `σ / √n = ${num(SIGMA, 1)} / √${n}`, "verde");

    // Última muestra
    if (!mEst.ult) Graf.vacio("m_g1", "Pulsa «Extraer 1 muestra»", 300);
    else {
      const h = histograma(mEst.ult, 0, 5), ymax = max(h.map(b => b.n)) * 1.25, m = E.media(mEst.ult);
      const g = new Grafico("m_g1", { alto: 300, xlim: [0, 100], ylim: [0, ymax], xlab: "Apoyo social percibido (0–100)", ylab: "Número de personas" });
      h.forEach(b => g.rect(b.x0, b.x1, 0, b.n, { color: COL.suave, borde: "#fff" }));
      g.vline(m, { color: COL.rojo, grosor: 3 });
      g.etiqueta(m, ymax * 0.93, "media de la muestra = " + num(m, 1), { color: COL.rojo, tam: 12 });
      if (verMu) { g.vline(MU, { color: COL.azul, trazo: "6 4", grosor: 2 }); g.etiqueta(MU, ymax * 0.06, "μ = " + num(MU, 1), { color: COL.azul, tam: 12 }); }
    }
    // Medias acumuladas
    if (!k) Graf.vacio("m_g2", "Aquí se irán acumulando las medias", 300);
    else {
      const bw = Math.max(0.25, Math.round(ee / 2.5 * 100) / 100), xl = [MU - 22, MU + 22];
      const h = histograma(mEst.medias, xl[0], bw);
      const xs = seq(xl[0], xl[1], 300), curva = k >= 30 ? xs.map(x => [x, E.dnorm(x, MU, ee) * k * bw]) : [];
      const ymax = Math.max(max(h.map(b => b.n)), curva.length ? max(curva.map(p => p[1])) : 0) * 1.12;
      const g = new Grafico("m_g2", { alto: 300, xlim: xl, ylim: [0, ymax], xlab: "Media de cada muestra", ylab: "Número de muestras" });
      h.forEach(b => g.rect(b.x0, b.x1, 0, b.n, { color: COL.rojo, opacidad: .75, borde: "#fff" }));
      if (curva.length) g.linea(curva, { color: COL.azul, grosor: 2 });
      if (verMu) g.vline(MU, { color: COL.azul, trazo: "6 4", grosor: 2 });
    }
    if (k < 30) $("m_mensaje").innerHTML = `<div class="caja reto">Cuando tengas al menos 30 muestras aparecerá la curva teórica de las medias (distribución muestral).</div>`;
    else {
      const q1 = E.cuantil(mEst.medias, .025), q2 = E.cuantil(mEst.medias, .975);
      $("m_mensaje").innerHTML = `<div class="caja clave"><b>Puente hacia los intervalos de confianza.</b> El 95 % central de tus medias está entre <b>${num(q1, 1)}</b> y <b>${num(q2, 1)}</b>. La teoría dice que debería estar en μ ± 1,96 × error típico = ${num(MU, 1)} ± ${num(1.96 * ee, 1)} → [${num(MU - 1.96 * ee, 1)} ; ${num(MU + 1.96 * ee, 1)}]. Esa es la idea que usaremos al construir un intervalo de confianza.</div>`;
    }
  };

  // ==================================================================
  // 2 · INTERVALOS
  // ==================================================================
  ["ic_media", "ic_dt", "ic_n", "ic_t"].forEach(id => $(id).addEventListener("input", () => render.intervalos()));
  document.querySelectorAll('input[name="ic_conf"]').forEach(r => r.addEventListener("change", () => render.intervalos()));
  document.querySelectorAll("[data-ic]").forEach(b => b.addEventListener("click", () => {
    const [m, s, n] = b.dataset.ic.split(",");
    $("ic_media").value = m; $("ic_dt").value = s; $("ic_n").value = n; render.intervalos();
  }));

  function calcIC() {
    const m = val("ic_media"), s = val("ic_dt"), n = Math.round(val("ic_n"));
    if (!isFinite(m) || !(s > 0) || !(n >= 2)) return null;
    const conf = parseFloat(radio("ic_conf")), a = 1 - conf, usaT = $("ic_t").checked;
    const crit = usaT ? E.qt(1 - a / 2, n - 1) : E.qnorm(1 - a / 2);
    const ee = s / Math.sqrt(n), me = crit * ee;
    return { m, s, n, conf, a, usaT, crit, ee, me, li: m - me, ls: m + me };
  }

  function dibujarIC() {
    const r = calcIC();
    if (!r) { $("ic_resultado").innerHTML = `<div class="caja alerta">Revisa los datos: la DT debe ser mayor que 0 y n al menos 2.</div>`; return; }
    const simb = r.usaT ? `t(${r.n - 1})` : "z";
    $("ic_resultado").innerHTML = `
      <div class="resultado-ic"><h3>IC al ${pct(r.conf)} = [${num(r.li, 2)} ; ${num(r.ls, 2)}]</h3>
        <span>Estimación puntual: ${num(r.m, 2)} · Margen de error: ±${num(r.me, 2)}</span></div>
      <div class="rejilla c4">
        ${paso(1, "Error típico", `<div>EE = DT / √n</div><div class="grande">${num(r.s, 2)} / √${r.n} = ${num(r.ee, 2)}</div>`)}
        ${paso(2, "Valor crítico", `<div>${simb} que deja ${pct(r.a / 2)} en cada cola</div><div class="grande">${num(r.crit, 3)}</div>`)}
        ${paso(3, "Margen de error", `<div>ME = valor crítico × EE</div><div class="grande">${num(r.crit, 2)} × ${num(r.ee, 2)} = ${num(r.me, 2)}</div>`)}
        ${paso(4, "Intervalo", `<div>media ± ME</div><div class="grande">${num(r.m, 2)} ± ${num(r.me, 2)}</div>`)}
      </div>`;

    // Curva y valor crítico
    const gl = r.usaT ? r.n - 1 : Infinity, dens = x => E.dtdens(x, gl);
    const xs = seq(-4.5, 4.5, 500), ytop = dens(0);
    const g = new Grafico("ic_g1", {
      alto: 290, xlim: [-4.5, 4.5], ylim: [0, ytop * 1.08], sinY: true,
      xmarcas: [-r.crit, 0, r.crit], xetiq: ["−" + num(r.crit, 3), "0", "+" + num(r.crit, 3)], xmarcaClase: "critico",
      xlab: r.usaT ? `Distribución t de Student (gl = ${r.n - 1})` : "Distribución normal estándar (z)"
    });
    g.area(xs.filter(x => x <= -r.crit).map(x => [x, dens(x)]), { color: COL.rojo, opacidad: .75 });
    g.area(xs.filter(x => x >= r.crit).map(x => [x, dens(x)]), { color: COL.rojo, opacidad: .75 });
    g.area([[-r.crit, dens(r.crit)], ...xs.filter(x => Math.abs(x) <= r.crit).map(x => [x, dens(x)]), [r.crit, dens(r.crit)]], { color: COL.suave });
    g.linea(xs.map(x => [x, dens(x)]), { color: COL.azul });
    g.vline(-r.crit, { trazo: "5 4", grosor: 1.2 }); g.vline(r.crit, { trazo: "5 4", grosor: 1.2 });
    g.texto(0, ytop * .45, "1 − α\n" + pct(r.conf), { tam: 20, negrita: true });
    g.etiqueta(-3.6, ytop * .32, "α/2\n" + pct(r.a / 2), { color: COL.rojo, tam: 13 });
    g.etiqueta(3.6, ytop * .32, "α/2\n" + pct(r.a / 2), { color: COL.rojo, tam: 13 });
    $("ic_g1_txt").innerHTML = `Con un nivel de confianza del <b>${pct(r.conf)}</b>, el ${pct(r.a)} restante (α) se reparte entre las dos colas: ${pct(r.a / 2)} en cada una. El valor que deja ese ${pct(r.a / 2)} por encima es <b>${num(r.crit, 3)}</b>. Por eso multiplicamos el error típico por ese número.` +
      (r.usaT ? `<br><span class="gris">Con la t de Student el valor crítico es algo mayor que 1,96, sobre todo con muestras pequeñas. Con n grande, t y z casi coinciden.</span>` : "");

    // Niveles de confianza
    const niveles = [0.90, 0.95, 0.99, 0.999];
    const ints = niveles.map(cf => { const c = r.usaT ? E.qt(1 - (1 - cf) / 2, r.n - 1) : E.qnorm(1 - (1 - cf) / 2); return [r.m - c * r.ee, r.m + c * r.ee]; });
    const lo = min(ints.map(v => v[0])), hi = max(ints.map(v => v[1])), pad = (hi - lo) * .12;
    const g2 = new Grafico("ic_g2", { alto: 290, xlim: [lo - pad, hi + pad], ylim: [0.4, 4.6], ymarcas: [4, 3, 2, 1], yetiq: v => pct(niveles[4 - v]), xlab: "Valores plausibles para la media poblacional", ylab: "Confianza" });
    niveles.forEach((cf, i) => {
      const y = 4 - i, sel = Math.abs(cf - r.conf) < 1e-9;
      g2.segmento(ints[i][0], y, ints[i][1], y, { color: sel ? COL.rojo : COL.suave, grosor: 10, extremo: "round" });
      g2.punto(r.m, y, { color: "#fff", r: 4 });
      g2.texto(ints[i][0], y, num(ints[i][0], 1), { dy: -12, color: COL.gris, tam: 12 });
      g2.texto(ints[i][1], y, num(ints[i][1], 1), { dy: -12, color: COL.gris, tam: 12 });
    });
  }

  // --- 100 intervalos ---
  const ci = { lote: null, total: 0, aciertos: 0 };
  function generarCI() {
    const n = val("ci_n"), conf = parseFloat(radio("ci_conf")), z = E.qnorm(1 - (1 - conf) / 2);
    ci.lote = [];
    for (let i = 0; i < 100; i++) {
      const x = E.rnorm(n, 60, 20), m = E.media(x), me = z * E.dt(x) / Math.sqrt(n);
      ci.lote.push({ m, li: m - me, ls: m + me, ok: m - me <= 60 && m + me >= 60 });
    }
    ci.total += 100; ci.aciertos += ci.lote.filter(d => d.ok).length;
  }
  const ciReset = () => { ci.total = 0; ci.aciertos = 0; generarCI(); render.intervalos(); };
  $("ci_go").addEventListener("click", () => { generarCI(); render.intervalos(); });
  $("ci_reset").addEventListener("click", ciReset);
  $("ci_n").addEventListener("input", ciReset);
  document.querySelectorAll('input[name="ci_conf"]').forEach(r => r.addEventListener("change", ciReset));
  $("ci_ocultar").addEventListener("change", () => render.intervalos());

  function dibujarCI() {
    if (!ci.lote) generarCI();
    const d = ci.lote, oc = $("ci_ocultar").checked, ac = d.filter(v => v.ok).length;
    $("ci_cifras").innerHTML =
      cifra("En esta tanda", oc ? "¿?" : `${ac} de 100`, "intervalos que contienen μ", "verde") +
      cifra("Acumulado", oc ? "¿?" : pct(Math.round(ci.aciertos / ci.total * 1000) / 1000), `${num(ci.aciertos, 0)} de ${num(ci.total, 0)} intervalos`) +
      cifra("Nivel de confianza", pct(parseFloat(radio("ci_conf"))), "lo que esperamos a la larga", "azul") +
      cifra("Anchura media", num(E.media(d.map(v => v.ls - v.li)), 1), "puntos (de un extremo a otro)", "roja");
    const g = new Grafico("ci_g", { alto: 560, xlim: [40, 80], ylim: [0, 104], xlab: "Apoyo social percibido: intervalo de cada estudio", ylab: "Estudio nº", ymarcas: [1, 25, 50, 75, 100] });
    d.forEach((v, i) => {
      const c = oc ? COL.medio : (v.ok ? COL.verde : COL.rojo);
      g.segmento(v.li, i + 1, v.ls, i + 1, { color: c, grosor: v.ok || oc ? 2 : 2.6 });
      g.punto(v.m, i + 1, { color: c, r: 2 });
    });
    if (!oc) { g.vline(60, { color: COL.azul, trazo: "6 4", grosor: 2 }); g.etiqueta(60, 102.5, "μ = 60", { tam: 12 }); }
    leyenda("ci_g", oc ? [[COL.medio, "¿Contiene μ? Desconocido"]] : [[COL.verde, "Contiene μ"], [COL.rojo, "No contiene μ"]]);
  }

  // --- Precisión ---
  ["pr_n1", "pr_n2"].forEach(id => $(id).addEventListener("input", () => render.intervalos()));
  document.querySelectorAll('input[name="pr_conf"]').forEach(r => r.addEventListener("change", () => render.intervalos()));
  function dibujarPrec() {
    const conf = parseFloat(radio("pr_conf")), z = E.qnorm(1 - (1 - conf) / 2), ns = [val("pr_n1"), val("pr_n2")];
    const me = ns.map(n => z * 20 / Math.sqrt(n)), cols = [COL.ambar, COL.medio];
    const g = new Grafico("pr_g1", { alto: 200, xlim: [44, 76], ylim: [0.3, 2.7], ymarcas: [2, 1], yetiq: v => v === 2 ? `A (n = ${ns[0]})` : `B (n = ${ns[1]})`, xlab: "Satisfacción laboral (0–100)", margen: { l: 100 } });
    [0, 1].forEach(i => {
      const y = 2 - i;
      g.segmento(60 - me[i], y, 60 + me[i], y, { color: cols[i], grosor: 14, extremo: "round" });
      g.punto(60, y, { color: COL.azul, r: 6 });
      g.texto(60 - me[i], y, num(60 - me[i], 1), { dy: -16, color: COL.gris, tam: 12 });
      g.texto(60 + me[i], y, num(60 + me[i], 1), { dy: -16, color: COL.gris, tam: 12 });
      g.texto(Math.min(60 + me[i], 70), y, "±" + num(me[i], 2), { dx: 18, dy: 5, ancla: "start", negrita: true, tam: 13 });
    });
    const xs = seq(10, 1000, 300), curva = xs.map(n => [n, z * 20 / Math.sqrt(n)]);
    const g2 = new Grafico("pr_g2", { alto: 290, xlim: [0, 1000], ylim: [0, max(curva.map(p => p[1])) * 1.08], xlab: "Tamaño de la muestra (n)", ylab: "Margen de error (± puntos)" });
    g2.linea(curva, { color: COL.azul, grosor: 2.5 });
    ["A", "B"].forEach((l, i) => { g2.punto(ns[i], me[i], { color: cols[i], r: 7 }); g2.texto(ns[i], me[i], `${l}: ±${num(me[i], 2)}`, { dy: -14, negrita: true }); });
  }

  render.intervalos = function () {
    if (visible("ic_resultado")) dibujarIC();
    if (visible("ci_g")) dibujarCI();
    if (visible("pr_g1")) dibujarPrec();
  };

  // ==================================================================
  // 3 · EL JUICIO
  // ==================================================================
  let jDatos = null;
  function generarJuicio() {
    const n = val("j_n"), dif = val("j_dif");
    jDatos = {
      chicos: E.rnorm(n, 6, 1.5).map(v => E.limitar(v, 0, 10)),
      chicas: E.rnorm(n, 6 + dif, 1.5).map(v => E.limitar(v, 0, 10)),
      jit1: E.runif(n, -.18, .18), jit2: E.runif(n, -.18, .18), difReal: dif, n
    };
  }
  $("j_go").addEventListener("click", () => { generarJuicio(); render.juicio(); });
  ["j_n", "j_dif"].forEach(id => $(id).addEventListener("input", () => { generarJuicio(); render.juicio(); }));
  document.querySelectorAll('input[name="j_alpha"]').forEach(r => r.addEventListener("change", () => render.juicio()));
  $("j_revelar").addEventListener("change", () => render.juicio());

  function dibujarJuicio() {
    if (!jDatos) generarJuicio();
    const d = jDatos, a = parseFloat(radio("j_alpha"));
    const tt = E.tStudent(d.chicas, d.chicos, 1 - a);
    const sp = Math.sqrt((E.varianza(d.chicas) + E.varianza(d.chicos)) / 2), dc = tt.dif / sp;
    const condena = tt.p <= a;
    $("j_pasos").innerHTML =
      paso(1, "Presunción de inocencia", `<div class="grande">H₀: μ chicas = μ chicos</div><div class="small">Suponemos que en la población no hay diferencias. H₁: μ chicas ≠ μ chicos.</div>`) +
      paso(2, "Las pruebas", `<div>Chicas: M = ${num(tt.m1, 2)} · Chicos: M = ${num(tt.m2, 2)}</div><div class="grande">t(${tt.gl}) = ${num(tt.t, 2)}</div><div class="small">Diferencia = ${num(tt.dif, 2)} · d de Cohen = ${num(dc, 2)}</div>`) +
      paso(3, "¿Sorprendentes si fuera inocente?", `<div class="grande">${pTxt(tt.p)}</div><div class="small">Si no hubiera diferencias en la población, obtendríamos una diferencia así de grande (o más) en ${tt.p < .001 ? "menos del 0,1 %" : "un " + pct(Math.round(tt.p * 1000) / 1000)} de los estudios.</div>`) +
      paso(4, "Comparar con la duda razonable", `<div class="grande">${pTxt(tt.p)} ${condena ? "≤" : ">"} α = ${alfaTxt(a)}</div><div class="small">α se fijó antes de ver los datos.</div>`);

    let realidad = "";
    if ($("j_revelar").checked) {
      const inoc = d.difReal === 0;
      const txt = inoc && condena ? "Realidad: era INOCENTE (diferencia real = 0). Has cometido un ERROR TIPO I: condenar a un inocente."
        : inoc ? "Realidad: era INOCENTE (diferencia real = 0). Acierto."
          : condena ? `Realidad: era CULPABLE (diferencia real = ${num(d.difReal, 2)}). Acierto.`
            : `Realidad: era CULPABLE (diferencia real = ${num(d.difReal, 2)}). Has cometido un ERROR TIPO II: absolver a un culpable.`;
      realidad = `<div class="realidad">👁 ${txt}</div>`;
    }
    $("j_veredicto").innerHTML = condena
      ? `<div class="veredicto culpable"><h3>⚖️ Veredicto: CULPABLE → rechazamos H₀</h3><div>Las pruebas serían muy improbables si no hubiera diferencias. Existen diferencias estadísticamente significativas en autoestima entre chicas y chicos.</div>${realidad}</div>`
      : `<div class="veredicto absuelto"><h3>⚖️ Veredicto: NO CULPABLE → no rechazamos H₀</h3><div>No hay pruebas suficientes de diferencias. Ojo: esto no demuestra que no existan; solo que estos datos no bastan para afirmarlo.</div>${realidad}</div>`;

    // Distribución t bajo H0
    const lim = Math.max(4.5, Math.min(Math.abs(tt.t) + 1, 15)), xs = seq(-lim, lim, 700), dens = x => E.dtdens(x, tt.gl);
    const ta = Math.abs(tt.t), ytop = dens(0);
    const g = new Grafico("j_g1", { alto: 320, xlim: [-lim, lim], ylim: [0, ytop * 1.1], sinY: true, xlab: `Estadístico t (gl = ${tt.gl})` });
    g.area(xs.filter(x => x <= -ta).map(x => [x, dens(x)]), { color: COL.ambar, opacidad: .6 });
    g.area(xs.filter(x => x >= ta).map(x => [x, dens(x)]), { color: COL.ambar, opacidad: .6 });
    g.area(xs.filter(x => x <= -tt.tcrit).map(x => [x, dens(x)]), { color: COL.rojo, opacidad: .75 });
    g.area(xs.filter(x => x >= tt.tcrit).map(x => [x, dens(x)]), { color: COL.rojo, opacidad: .75 });
    g.linea(xs.map(x => [x, dens(x)]), { color: COL.azul });
    g.vline(tt.t, { color: "#111", grosor: 2.5 });
    g.vline(-tt.t, { color: "#111", grosor: 1.2, trazo: "2 4" });
    g.texto(0, ytop * .35, "Lo esperable\nsi H₀ es cierta", { tam: 13 });
    g.etiqueta(E.limitar(tt.t, -lim * .8, lim * .8), ytop * .9, "tus pruebas\nt = " + num(tt.t, 2), { color: "#111", tam: 12 });
    leyenda("j_g1", [[COL.ambar, "Valor p"], [COL.rojo, "Zona de condena (α)"]]);
    $("j_g1_txt").innerHTML = `La curva muestra qué valores de t aparecerían si el acusado fuera inocente (H₀ cierta). <b style="color:${COL.rojo}">En rojo</b>, la zona de condena: el ${pct(a)} más extremo (valores críticos ±${num(tt.tcrit, 2)}). <b style="color:${COL.ambar}">En naranja</b>, el valor p: el área más allá de tus pruebas. Si tus pruebas caen en la zona de condena, p ≤ α.`;

    // Datos de la muestra
    const g2 = new Grafico("j_g2", { alto: 320, xlim: [0.4, 2.6], ylim: [0, 10], xmarcas: [1, 2], xetiq: ["Chicas", "Chicos"], ylab: "Autoestima (0–10)", rejillaX: false });
    [[d.chicas, d.jit1, COL.ambar, 1], [d.chicos, d.jit2, COL.medio, 2]].forEach(([v, j, c, x]) => {
      v.forEach((y, i) => g2.punto(x + j[i], y, { color: c, r: 2.6, opacidad: .45 }));
      const m = E.media(v), e = E.qt(.975, v.length - 1) * E.dt(v) / Math.sqrt(v.length);
      g2.segmento(x, m - e, x, m + e, { grosor: 2.5 });
      g2.segmento(x - .12, m - e, x + .12, m - e, { grosor: 2.5 }); g2.segmento(x - .12, m + e, x + .12, m + e, { grosor: 2.5 });
      g2.punto(x, m, { r: 7 });
      g2.texto(x + .2, m, "M = " + num(m, 2), { ancla: "start", negrita: true, dy: 4, tam: 12 });
    });
    g2.texto(1.5, 0.3, "Media e IC al 95 % de cada grupo", { color: COL.gris, tam: 11 });

    // IC de la diferencia
    const excl = tt.ic[0] > 0 || tt.ic[1] < 0, l = Math.max(1, Math.abs(tt.ic[0]) + .2, Math.abs(tt.ic[1]) + .2);
    const g3 = new Grafico("j_g3", { alto: 150, xlim: [-l, l], ylim: [0.4, 1.6], sinY: true, xlab: "Diferencia de medias (chicas − chicos)" });
    g3.vline(0, { color: COL.gris, trazo: "5 4", grosor: 1.2 });
    g3.texto(0, 1.45, "0 = sin diferencia (H₀)", { color: COL.gris, tam: 12 });
    g3.segmento(tt.ic[0], 1, tt.ic[1], 1, { color: excl ? COL.rojo : COL.azul, grosor: 12, extremo: "round" });
    g3.punto(tt.dif, 1, { color: "#fff", r: 4 });
    g3.texto(tt.ic[0], .62, num(tt.ic[0], 2), { color: COL.gris, tam: 12 }); g3.texto(tt.ic[1], .62, num(tt.ic[1], 2), { color: COL.gris, tam: 12 });
    $("j_ic_txt").innerHTML = `El IC al ${pct(1 - a)} (es decir, 1 − α) de la diferencia es [${num(tt.ic[0], 2)} ; ${num(tt.ic[1], 2)}]. <b>${excl ? "No incluye el 0" : "Incluye el 0"}</b>, y por eso ${excl ? "p ≤ α (rechazamos H₀)." : "p > α (no rechazamos H₀)."} El intervalo y el contraste siempre coinciden en su veredicto, pero el intervalo además nos dice <b>cuánto</b> difieren los grupos.`;
  }

  // --- Mil juicios ---
  let mil = null;
  function celebrarMil() {
    const n = val("mj_n"), dif = val("mj_dif"), a = parseFloat(radio("mj_alpha")), gl = 2 * n - 2;
    const tcrit = E.qt(1 - a / 2, gl), cond = new Array(1000);
    for (let k = 0; k < 1000; k++) {
      let s1 = 0, q1 = 0, s2 = 0, q2 = 0;
      for (let i = 0; i < n; i++) { const x = E.rnorm1(6, 1.5); s1 += x; q1 += x * x; const y = E.rnorm1(6 + dif, 1.5); s2 += y; q2 += y * y; }
      const m1 = s1 / n, m2 = s2 / n, v1 = (q1 - n * m1 * m1) / (n - 1), v2 = (q2 - n * m2 * m2) / (n - 1);
      const t = (m2 - m1) / Math.sqrt((v1 + v2) / 2 * (2 / n));
      cond[k] = Math.abs(t) >= tcrit;
    }
    mil = { cond, a, dif, n };
  }
  $("mj_go").addEventListener("click", () => { celebrarMil(); render.juicio(); });

  function dibujarMil() {
    if (!mil) celebrarMil();
    const c = mil.cond.filter(Boolean).length, tasa = c / 1000, inoc = mil.dif === 0;
    $("mj_cifras").innerHTML =
      cifra("Realidad", inoc ? "Inocente" : "Culpable", inoc ? "diferencia real = 0 (H₀ verdadera)" : "diferencia real = " + num(mil.dif, 2), "azul") +
      cifra("Condenas (rechazo H₀)", `${num(c, 0)} de 1.000`, pct(tasa), "roja") +
      cifra("Absoluciones (no rechazo H₀)", `${num(1000 - c, 0)} de 1.000`, pct(1 - tasa)) +
      cifra(`<span style="text-transform:none">α</span> fijado`, alfaTxt(mil.a), `${mil.n} participantes por grupo`, "verde");
    const cont = $("mj_g"), w = Math.max(320, cont.clientWidth), alto = Math.min(340, w * 20 / 50 + 20);
    const g = new Grafico(cont, { alto, xlim: [0, 50], ylim: [0, 20], sinX: true, sinY: true, margen: { t: 6, b: 6, l: 6, r: 6 } });
    const orden = mil.cond.slice().sort((x, y) => y - x);
    orden.forEach((v, i) => { const x = i % 50, y = 19 - Math.floor(i / 50); g.rect(x + .06, x + .94, y + .06, y + .94, { color: v ? COL.rojo : COL.suave, rx: 1.5 }); });
    leyenda(cont, [[COL.rojo, "Condena (rechazo H₀)"], [COL.suave, "Absolución (no rechazo H₀)"]]);
    if (inoc) {
      $("mj_mensaje").innerHTML = `<div class="caja clave"><b>El acusado era inocente en los 1.000 juicios.</b> Aun así, condenaste en el <b>${pct(tasa)}</b> de ellos: son <b>errores tipo I</b>. Fíjate en que este porcentaje se parece mucho a α = ${alfaTxt(mil.a)}: α es precisamente la probabilidad de condenar a un inocente que aceptamos de antemano. Y el ${pct(1 - tasa)} de absoluciones se parece a 1 − α.</div>`;
    } else {
      $("mj_mensaje").innerHTML = `<div class="caja clave"><b>El acusado era culpable en los 1.000 juicios.</b> Lo condenaste en el <b>${pct(tasa)}</b> (<b>potencia</b>: capacidad de detectar una diferencia real) y lo absolviste en el <b>${pct(1 - tasa)}</b> (<b>errores tipo II</b>). Para reducir el error tipo II, aumenta el tamaño de la muestra.</div>` +
        (mil.dif <= 0.3 && tasa > .5 ? `<div class="caja alerta"><b>Significativo ≠ importante.</b> Con muestras grandes se detectan diferencias muy pequeñas (aquí, ${num(mil.dif, 2)} puntos en una escala de 0 a 10). Por eso conviene informar también del tamaño del efecto y del intervalo de confianza.</div>` : "");
    }
  }

  render.juicio = function () {
    if (visible("j_pasos")) dibujarJuicio();
    if (visible("mj_g")) dibujarMil();
  };

  // ==================================================================
  // 4 · SUPUESTOS
  // ==================================================================
  function genForma(forma, n) {
    switch (forma) {
      case "asimpos": return E.rgamma(n, 1.5, 6).map(v => 18 + v);
      case "asimneg": return E.rgamma(n, 1.5, 6).map(v => 45 - v);
      case "atipicos": { const x = E.rnorm(n, 30, 5), k = Math.max(1, Math.round(n * .05)); for (let i = 0; i < k; i++) x[i] = 30 + (Math.random() < .5 ? -1 : 1) * (18 + 7 * Math.random()); return x; }
      case "unif": return E.runif(n, 15, 45);
      default: return E.rnorm(n, 30, 5);
    }
  }
  let nDatos = null, hDatos = null;
  const genNorm = () => { nDatos = genForma(radio("n_forma"), val("n_n")); };
  const genHomo = () => {
    const n1 = val("h_n1"), n2 = val("h_n2");
    hDatos = { psi: E.rnorm(n1, 28, 6), cri: E.rnorm(n2, 33, 6 * val("h_ratio")), j1: E.runif(n1, -.15, .15), j2: E.runif(n2, -.15, .15) };
  };
  $("n_go").addEventListener("click", () => { genNorm(); render.supuestos(); });
  $("n_n").addEventListener("input", () => { genNorm(); render.supuestos(); });
  document.querySelectorAll('input[name="n_forma"]').forEach(r => r.addEventListener("change", () => { genNorm(); render.supuestos(); }));
  $("h_go").addEventListener("click", () => { genHomo(); render.supuestos(); });
  ["h_ratio", "h_n1", "h_n2"].forEach(id => $(id).addEventListener("input", () => { genHomo(); render.supuestos(); }));

  function dibujarNorm() {
    if (!nDatos) genNorm();
    const x = nDatos, n = x.length, sw = E.shapiroWilk(x), ks = E.lilliefors(x), usarSW = n < 50;
    const pUsado = usarSW ? sw.p : ks.p, cumple = pUsado > .05;
    const fila = (nom, est, p, elegida) => `<tr class="${elegida ? "elegida" : ""}"><td class="fila">${nom}${elegida ? ' <span style="color:var(--ambar)">← la que interpretamos</span>' : ""}</td><td>${est}</td><td>${pTxt(p)}</td><td>${p > .05 ? "No se rechaza H₀" : "Se rechaza H₀"}</td></tr>`;
    $("n_resultado").innerHTML = `<div class="tabla-scroll"><table class="t-ufv"><tr><th>Prueba</th><th>Estadístico</th><th>p</th><th>Decisión</th></tr>
      ${fila("Shapiro-Wilk", `W(${n}) = ${sinCero(num(sw.W, 3))}`, sw.p, usarSW)}
      ${fila("Kolmogorov-Smirnov (Lilliefors)", `D(${n}) = ${sinCero(num(ks.D, 3))}`, ks.p, !usarSW)}</table></div>` +
      (cumple ? `<div class="veredicto cumple"><h3>✔ Se cumple el supuesto de normalidad</h3><div>p &gt; ,05: no hay evidencia de desviación de la normalidad (no se rechaza H₀).</div></div>`
        : `<div class="veredicto culpable"><h3>⚠ No se cumple el supuesto de normalidad</h3><div>p ≤ ,05: hay evidencia de desviación de la normalidad (se rechaza H₀). En el esquema de clase usaríamos la alternativa no paramétrica.</div></div>`);

    const mn = min(x), mx = max(x), m = E.media(x), s = E.dt(x);
    const bw = (mx - mn) / Math.max(8, Math.min(25, Math.round(Math.sqrt(n) * 1.5)));
    const h = histograma(x, mn, bw), xs = seq(mn - 5, mx + 5, 300), curva = xs.map(v => [v, E.dnorm(v, m, s) * n * bw]);
    const g = new Grafico("n_g1", { alto: 300, xlim: [mn - 5, mx + 5], ylim: [0, Math.max(max(h.map(b => b.n)), max(curva.map(p => p[1]))) * 1.1], xlab: "Autoestima", ylab: "Frecuencia" });
    h.forEach(b => g.rect(b.x0, b.x1, 0, b.n, { color: COL.suave, borde: "#fff" }));
    g.linea(curva, { color: COL.rojo, grosor: 2.5 });

    const xo = E.ordenar(x), aa = n <= 10 ? 3 / 8 : 0.5, teo = xo.map((_, i) => E.qnorm((i + 1 - aa) / (n + 1 - 2 * aa)));
    const y1 = E.cuantil(x, .25), y2 = E.cuantil(x, .75), x1 = E.qnorm(.25), x2 = E.qnorm(.75), pend = (y2 - y1) / (x2 - x1), ord = y1 - pend * x1;
    const xl = [min(teo) - .3, max(teo) + .3], yl = [min(xo) - 2, max(xo) + 2];
    const g2 = new Grafico("n_g2", { alto: 300, xlim: xl, ylim: yl, xlab: "Valores teóricos (normal)", ylab: "Valores observados" });
    g2.linea([[xl[0], ord + pend * xl[0]], [xl[1], ord + pend * xl[1]]], { color: COL.rojo, grosor: 2 });
    xo.forEach((v, i) => g2.punto(teo[i], v, { color: COL.azul, r: 3, opacidad: .7 }));
  }

  function dibujarHomo() {
    if (!hDatos) genHomo();
    const d = hDatos, l = E.levene([d.psi, d.cri]), s1 = E.dt(d.psi), s2 = E.dt(d.cri), cumple = l.p > .05;
    $("h_resultado").innerHTML = `<div class="fila-cifras">${cifra("DT Psicología", num(s1, 2), "varianza = " + num(s1 * s1, 1))}${cifra("DT Criminología", num(s2, 2), "varianza = " + num(s2 * s2, 1), "roja")}${cifra("Prueba de Levene", `F(${l.gl1}, ${l.gl2}) = ${num(l.F, 2)}`, pTxt(l.p), "azul")}</div>` +
      (cumple ? `<div class="veredicto cumple"><h3>✔ Se cumple la homocedasticidad</h3><div>p &gt; ,05: no hay evidencia de diferencias entre las varianzas (no se rechaza H₀).</div></div>`
        : `<div class="veredicto culpable"><h3>⚠ No se cumple la homocedasticidad</h3><div>p ≤ ,05: hay evidencia de que las varianzas son distintas (se rechaza H₀).</div></div>`);
    const todos = d.psi.concat(d.cri), lo = min(todos), hi = max(todos), pad = (hi - lo) * .05;
    const g = new Grafico("h_g", { alto: 300, xlim: [lo - pad, hi + pad], ylim: [0.4, 2.6], ymarcas: [2, 1], yetiq: v => v === 2 ? "Psicología" : "Criminología", xlab: "Ansiedad", margen: { l: 96 } });
    [[d.psi, d.j1, COL.azul, 2], [d.cri, d.j2, COL.rojo, 1]].forEach(([v, j, c, y]) => {
      const q1 = E.cuantil(v, .25), q2 = E.cuantil(v, .5), q3 = E.cuantil(v, .75), iqr = q3 - q1;
      const wlo = min(v.filter(z => z >= q1 - 1.5 * iqr)), whi = max(v.filter(z => z <= q3 + 1.5 * iqr));
      g.segmento(wlo, y, q1, y, { color: c }); g.segmento(q3, y, whi, y, { color: c });
      g.rect(q1, q3, y - .25, y + .25, { color: "none", borde: c, grosorBorde: 2 });
      g.segmento(q2, y - .25, q2, y + .25, { color: c, grosor: 3 });
      v.forEach((z, i) => g.punto(z, y + j[i], { color: c, r: 3, opacidad: .45 }));
    });
  }

  render.supuestos = function () {
    if (visible("n_resultado")) dibujarNorm();
    if (visible("h_g")) dibujarHomo();
  };

  // ==================================================================
  // 5 · ESQUEMA DE DECISIÓN
  // ==================================================================
  const PRUEBAS = {
    chi: { n: "Chi-cuadrado de Pearson (χ²) + residuos", para: "Analizar la asociación entre dos variables categóricas.", rep: "χ²(gl, N = …) = …, p = …. Si es significativo, se interpretan los residuos estandarizados corregidos (±1,96).", donde: "Practícala en el apartado 6." },
    pearson: { n: "Correlación de Pearson (r)", para: "Relación lineal entre dos variables cuantitativas: dirección e intensidad. Prueba paramétrica.", rep: "r(gl) = …, p = …", donde: "Practícala en el apartado 7." },
    spearman: { n: "Correlación de Spearman (ρ)", para: "Relación monótona entre variables ordinales o cuantitativas sin normalidad. Prueba no paramétrica basada en rangos.", rep: "ρ(gl) = …, p = …", donde: "Practícala en el apartado 7." },
    t_rel: { n: "t de Student para muestras relacionadas (t)", para: "Comparar las medias de las mismas personas en dos momentos o condiciones.", rep: "t(gl) = …, p = …", donde: "Practícala en el apartado 9 · Muestras relacionadas." },
    wilcoxon: { n: "Prueba de Wilcoxon (W)", para: "Alternativa no paramétrica para comparar dos medidas de las mismas personas.", rep: "z = …, p = …, con las medianas de las dos medidas", donde: "Practícala en el apartado 9 · Muestras relacionadas." },
    t_ind: { n: "t de Student para muestras independientes (t)", para: "Comparar las medias de dos grupos formados por personas distintas.", rep: "t(gl) = …, p = …", donde: "Practícala en el apartado 8 · Grupos independientes." },
    mann: { n: "U de Mann-Whitney (U)", para: "Alternativa no paramétrica para comparar dos grupos independientes.", rep: "U = …, z = …, p = …, con las medianas de cada grupo", donde: "Practícala en el apartado 8 · Grupos independientes." }
  };

  function camino() {
    const ch = (t, cl = "") => ({ t, cl }), tipo = radio("w_tipo");
    if (tipo === "cat") return { pasos: [ch("2 variables"), ch("Categóricas")], prueba: "chi" };
    if (tipo === "rel") {
      if ($("w_ordinal").checked) return { pasos: [ch("2 variables"), ch("Relacionar"), ch("Variable ordinal (excepción)", "supuesto")], prueba: "spearman" };
      const nr = radio("w_norm_rel");
      return { pasos: [ch("2 variables"), ch("Cuantitativas"), ch("Relacionar"), ch("Normalidad: " + (nr === "si" ? "sí" : "no"), "supuesto")], prueba: nr === "si" ? "pearson" : "spearman" };
    }
    const base = [ch("2 variables"), ch("Cuantitativa"), ch("Comparar")], nc = radio("w_norm_comp");
    if (radio("w_muestras") === "rel") return { pasos: base.concat([ch("Muestras relacionadas"), ch("Normalidad: " + (nc === "si" ? "sí" : "no"), "supuesto")]), prueba: nc === "si" ? "t_rel" : "wilcoxon" };
    if (nc === "no") return { pasos: base.concat([ch("Muestras independientes"), ch("Normalidad: no", "supuesto")]), prueba: "mann" };
    const lv = radio("w_lev");
    return { pasos: base.concat([ch("Muestras independientes"), ch("Normalidad: sí", "supuesto"), ch("Homocedasticidad: " + (lv === "si" ? "sí" : "no"), "supuesto")]), prueba: lv === "si" ? "t_ind" : "mann" };
  }

  function dibujarEsquema() {
    const tipo = radio("w_tipo");
    $("w_bloque_rel").classList.toggle("oculto", tipo !== "rel");
    $("w_bloque_normrel").classList.toggle("oculto", $("w_ordinal").checked);
    $("w_bloque_comp").classList.toggle("oculto", tipo !== "comp");
    $("w_bloque_lev").classList.toggle("oculto", !(radio("w_muestras") === "ind" && radio("w_norm_comp") === "si"));
    const c = camino(), p = PRUEBAS[c.prueba];
    $("w_camino").innerHTML = `<div style="margin:8px 0 14px">${c.pasos.map(s => `<span class="chip ${s.cl}">${s.t}</span><span class="flecha">→</span>`).join("")}<span class="chip final">${p.n}</span></div>`;
    $("w_prueba").innerHTML = `<div class="tarjeta"><h4>🏁 Prueba recomendada: ${p.n}</h4><div class="cuerpo"><p><b>¿Para qué sirve?</b> ${p.para}</p><p><b>¿Cómo se informa?</b> ${p.rep}</p><p class="small gris">${p.donde}</p></div></div>`;
  }
  document.querySelectorAll('#es-guia input').forEach(i => i.addEventListener("change", dibujarEsquema));

  const CASOS = [
    { t: "Un equipo estudia si practicar deporte (sí/no) se asocia con tener insomnio (sí/no) en 200 universitarios.", ok: "chi", ex: "Dos variables categóricas y objetivo de asociación → chi-cuadrado (no requiere normalidad)." },
    { t: "Se analiza la relación entre las horas semanales de uso de redes sociales y la ansiedad (puntuación) en 120 adolescentes. Ambas variables cumplen la normalidad.", ok: "pearson", ex: "Dos cuantitativas, objetivo relacionar, normalidad sí → Pearson." },
    { t: "Relación entre el estrés laboral y la satisfacción laboral en 150 trabajadores. Kolmogorov-Smirnov: p = ,003 en estrés laboral.", ok: "spearman", ex: "Dos cuantitativas, objetivo relacionar, pero no se cumple la normalidad → Spearman." },
    { t: "Relación entre el nivel de estudios (primaria / secundaria / universitarios) y la satisfacción con la vida (puntuación 0–50).", ok: "spearman", ex: "Una variable es categórica ordinal y la otra cuantitativa: es la excepción del esquema → Spearman." },
    { t: "Se compara el estrés de enfermeras de turno de noche (n = 40) y de turno de día (n = 42). Shapiro-Wilk: p > ,05 en ambos grupos; Levene: p = ,41.", ok: "t_ind", ex: "Cuantitativa en dos grupos independientes, normalidad sí y homocedasticidad sí → t de Student para muestras independientes." },
    { t: "Se mide la ansiedad de 30 personas antes y después de un programa de mindfulness. La normalidad no se cumple (Shapiro-Wilk: p = ,012).", ok: "wilcoxon", ex: "Las mismas personas medidas dos veces (relacionadas) y sin normalidad → Wilcoxon." },
    { t: "Se mide la autoestima de 25 adolescentes antes y después de un taller. La normalidad se cumple (Shapiro-Wilk: p = ,48).", ok: "t_rel", ex: "Muestras relacionadas con normalidad → t de Student para muestras relacionadas." },
    { t: "Se compara el rendimiento académico de estudiantes con mentoría (n = 35) y sin mentoría (n = 38). Shapiro-Wilk: p = ,004 en el grupo con mentoría.", ok: "mann", ex: "Dos grupos independientes y no se cumple la normalidad → U de Mann-Whitney." },
    { t: "Se estudia si el tipo de centro (público/privado) se asocia con la presencia de sintomatología ansiosa elevada (sí/no) en 300 escolares.", ok: "chi", ex: "Dos variables categóricas → chi-cuadrado de Pearson y, si es significativo, residuos." }
  ];
  const orden = CASOS.map((_, i) => i).sort(() => Math.random() - .5);
  let casoI = 0;
  $("caso_resp").innerHTML = `<option value="">Elige una prueba…</option>` + Object.entries(PRUEBAS).map(([k, p]) => `<option value="${k}">${p.n}</option>`).join("");
  function mostrarCaso() {
    const c = CASOS[orden[casoI]];
    $("caso_txt").innerHTML = `<div class="pregunta" style="border-left:6px solid var(--azul)"><h6>Caso ${casoI + 1} de ${CASOS.length}</h6><p style="font-size:1.08rem;margin:0">${c.t}</p></div>`;
    $("caso_fb").innerHTML = ""; $("caso_resp").value = "";
  }
  $("caso_sig").addEventListener("click", () => { casoI = (casoI + 1) % CASOS.length; mostrarCaso(); });
  $("caso_comprobar").addEventListener("click", () => {
    const c = CASOS[orden[casoI]], r = $("caso_resp").value;
    if (!r) { $("caso_fb").innerHTML = `<div class="caja alerta">Elige primero una prueba.</div>`; return; }
    $("caso_fb").innerHTML = r === c.ok
      ? `<div class="caja exito"><span class="fb-ok">✔ ¡Correcto!</span> ${c.ex}</div>`
      : `<div class="caja alerta"><span class="fb-no">✖ No es esa.</span> La prueba adecuada es <b>${PRUEBAS[c.ok].n}</b>. ${c.ex}</div>`;
  });
  mostrarCaso();
  render.esquema = dibujarEsquema;

  // ==================================================================
  // 6 · CHI-CUADRADO (tablas de 2 × 2 a 3 × 3)
  // ==================================================================
  const CHI_EJ = {
    ciber: { nombre: "Red social y ciberacoso (diap. 5)", varF: "la red social más utilizada", varC: "haber sufrido ciberacoso", filas: ["Instagram", "Otras"], cols: ["Ciberacoso: sí", "Ciberacoso: no"], O: [[40, 60], [20, 80]] },
    nosig: { nombre: "Red social y ciberacoso, sin asociación (diap. 6)", varF: "la red social más utilizada", varC: "haber sufrido ciberacoso", filas: ["Instagram", "Otras"], cols: ["Ciberacoso: sí", "Ciberacoso: no"], O: [[32, 68], [28, 72]] },
    act1: { nombre: "Actividad 1 · Clima de aula y participación", varF: "el clima de aula percibido", varC: "la participación voluntaria", filas: Contenido.ACT1.filas, cols: Contenido.ACT1.cols, O: Contenido.ACT1.O },
    act2: { nombre: "Actividad 2 · Modalidad de trabajo y satisfacción", varF: "la modalidad de trabajo", varC: "la satisfacción laboral", filas: Contenido.ACT2.filas, cols: Contenido.ACT2.cols, O: Contenido.ACT2.O }
  };
  let chiCaso = null;
  function prepararTabla(caso) {
    chiCaso = JSON.parse(JSON.stringify(caso));
    $("x_caso").innerHTML = `<b>Caso:</b> ¿Se asocia ${caso.varF} con ${caso.varC}? (datos ${caso.nombre === "Al azar" ? "generados al azar" : "de las diapositivas, simulados o ficticios"})`;
    $("x_f").value = caso.filas.length; $("x_c").value = caso.cols.length;
    construirRejilla();
  }
  function construirRejilla() {
    const nf = +$("x_f").value, nc = +$("x_c").value, c = chiCaso;
    while (c.filas.length < nf) c.filas.push("Fila " + (c.filas.length + 1));
    while (c.cols.length < nc) c.cols.push("Columna " + (c.cols.length + 1));
    c.filas.length = nf; c.cols.length = nc;
    c.O = Array.from({ length: nf }, (_, i) => Array.from({ length: nc }, (_, j) => (c.O[i] && c.O[i][j] !== undefined) ? c.O[i][j] : 10));
    $("x_rejilla").innerHTML = `<tr><td></td>${c.cols.map((n, j) => `<td><input type="text" class="etq" data-c="${j}" value="${n}" aria-label="Nombre de la columna ${j + 1}"></td>`).join("")}</tr>` +
      c.filas.map((n, i) => `<tr><td><input type="text" class="etq" data-f="${i}" value="${n}" aria-label="Nombre de la fila ${i + 1}"></td>${c.O[i].map((v, j) => `<td><input type="number" min="0" step="1" data-i="${i}" data-j="${j}" value="${v}" aria-label="Frecuencia ${n}, ${c.cols[j]}"></td>`).join("")}</tr>`).join("");
    $("x_rejilla").querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => {
      if (inp.dataset.f !== undefined) c.filas[+inp.dataset.f] = inp.value || "Fila";
      else if (inp.dataset.c !== undefined) c.cols[+inp.dataset.c] = inp.value || "Columna";
      else c.O[+inp.dataset.i][+inp.dataset.j] = Math.round(parseFloat(inp.value));
      render.chi();
    }));
    render.chi();
  }
  $("x_ejemplo").innerHTML = Object.entries(CHI_EJ).map(([k, v]) => `<option value="${k}">${v.nombre}</option>`).join("") + `<option value="azar">Datos al azar (sin asociación real)</option>`;
  $("x_ejemplo").addEventListener("change", () => {
    const k = $("x_ejemplo").value;
    if (k === "azar") {
      const nf = +$("x_f").value, nc = +$("x_c").value;
      prepararTabla({ nombre: "Al azar", varF: "la variable de las filas", varC: "la variable de las columnas", filas: chiCaso.filas.slice(0, nf), cols: chiCaso.cols.slice(0, nc), O: Array.from({ length: nf }, () => Array.from({ length: nc }, () => 15 + E.rbinom1(40, .5))) });
    } else prepararTabla(CHI_EJ[k]);
  });
  ["x_f", "x_c"].forEach(id => $(id).addEventListener("change", construirRejilla));
  document.querySelectorAll('input[name="x_alpha"]').forEach(r => r.addEventListener("change", () => render.chi()));
  App.cargarChi = k => { if (CHI_EJ[k]) { $("x_ejemplo").value = k; prepararTabla(CHI_EJ[k]); } };

  render.chi = function () {
    if (!chiCaso) { prepararTabla(CHI_EJ.ciber); return; }
    if (!visible("x_cifras")) return;
    const c = chiCaso, O = c.O, nf = O.length, nc = O[0].length;
    const tf = O.map(r => r.reduce((s, v) => s + v, 0)), tcol = c.cols.map((_, j) => O.reduce((s, r) => s + r[j], 0));
    const ok = O.flat().every(x => isFinite(x) && x >= 0) && tf.every(t => t > 0) && tcol.every(t => t > 0);
    if (!ok) {
      $("x_cifras").innerHTML = `<div class="caja alerta" style="width:100%">Escribe frecuencias válidas (números enteros ≥ 0, sin filas ni columnas vacías).</div>`;
      ["x_obs", "x_esp", "x_res", "x_g1", "x_g2", "x_informe"].forEach(id => { $(id).innerHTML = ""; });
      return;
    }
    const a = parseFloat(radio("x_alpha")), zc = E.qnorm(1 - a / 2), r = E.chiCuadrado(O), sig = r.p <= a;
    const espOK = r.E.flat().every(e => e >= 5), V = Math.sqrt(r.chi / (r.N * (Math.min(nf, nc) - 1)));
    const red = x => pct(Math.round(x * 1000) / 1000);
    $("x_cifras").innerHTML =
      cifra("Estadístico", `χ²(${r.gl}, N = ${r.N}) = ${num(r.chi, 2)}`, `gl = (${nf} − 1) × (${nc} − 1)`, "azul") +
      cifra("Valor p", pTxt(r.p), "α = " + alfaTxt(a), "roja") +
      cifra("Decisión", sig ? "Se rechaza H₀" : "No se rechaza H₀", sig ? "hay evidencia de asociación" : "no hay evidencia de asociación", sig ? "roja" : "verde") +
      cifra("Esperadas ≥ 5", espOK ? "Sí" : "No", "supuesto de la prueba") +
      (sig ? cifra("V de Cramer", sinCero(num(V, 2)), "tamaño del efecto (complementario)") : "");

    const tabla = (fmt, clase, tot = true) => `<div class="tabla-scroll"><table class="t-ufv"><tr><th></th>${c.cols.map(n => `<th>${n}</th>`).join("")}${tot ? "<th>Total</th>" : ""}</tr>` +
      O.map((row, i) => `<tr><td class="fila">${c.filas[i]}</td>${row.map((_, j) => `<td class="${clase ? clase(i, j) : ""}">${fmt(i, j)}</td>`).join("")}${tot ? `<td>${num(tf[i], 0)}</td>` : ""}</tr>`).join("") +
      (tot ? `<tr><td class="fila">Total</td>${tcol.map(t => `<td>${num(t, 0)}</td>`).join("")}<td><b>${num(r.N, 0)}</b></td></tr>` : "") + `</table></div>`;
    $("x_obs").innerHTML = tabla((i, j) => `<b>${O[i][j]}</b><br><small>${red(O[i][j] / tf[i])} de la fila</small>`) + `<p class="small">Lo que realmente encontramos en la muestra.</p>`;
    $("x_esp").innerHTML = tabla((i, j) => num(r.E[i][j], 1)) + `<p class="small">E = (total fila × total columna) / N. Si las variables fueran independientes, cada fila tendría el mismo reparto que la fila «Total».</p>` +
      (espOK ? "" : `<div class="caja alerta">Hay frecuencias esperadas menores que 5: el supuesto de la prueba no se cumple bien.</div>`);
    $("x_res").innerHTML = tabla((i, j) => num(r.R[i][j], 2) + (r.R[i][j] > zc ? " ▲" : r.R[i][j] < -zc ? " ▼" : ""), (i, j) => r.R[i][j] > zc ? "mas" : r.R[i][j] < -zc ? "menos" : "neutro", false) +
      `<p class="small" style="margin-top:8px"><b style="color:#B0153A">▲ Z &gt; +${num(zc, 2)}</b>: más casos de los esperados · <b style="color:var(--azul)">▼ Z &lt; −${num(zc, 2)}</b>: menos casos de los esperados · entre ambos: sin diferencias significativas en esa casilla.</p>` +
      (sig ? "" : `<p class="small gris">Como el χ² no es significativo, no es necesario interpretar los residuos.</p>`);

    // Barras apiladas al 100 % por fila, con la fila «Total» como referencia de independencia
    const paleta = [COL.rojo, COL.medio, COL.ambar], filasG = c.filas.concat(["Total (esperado si son independientes)"]), tot = tf.concat([r.N]);
    const prop = filasG.map((_, i) => (i < nf ? O[i] : tcol).map(v => v / tot[i]));
    const alto = 70 + filasG.length * 46;
    const g = new Grafico("x_g1", { alto, xlim: [0, 1], ylim: [0.3, filasG.length + 0.7], ymarcas: filasG.map((_, i) => filasG.length - i), yetiq: v => { const t = filasG[filasG.length - v]; return t.length > 24 ? "Total (independencia)" : t; }, xetiq: ["0 %", "25 %", "50 %", "75 %", "100 %"], xmarcas: [0, .25, .5, .75, 1], margen: { l: 150 } });
    prop.forEach((ps, i) => {
      let x0 = 0; const y = filasG.length - i;
      ps.forEach((p, j) => {
        g.rect(x0, x0 + p, y - .32, y + .32, { color: paleta[j % 3], opacidad: i === nf ? .45 : .9, borde: "#fff", grosorBorde: 2 });
        if (p > .08) g.texto(x0 + p / 2, y, red(p), { dy: 4, color: "#fff", negrita: true, tam: 12 });
        x0 += p;
      });
    });
    leyenda("x_g1", c.cols.map((n, j) => [paleta[j % 3], n]));

    // Distribución chi-cuadrado
    const crit = E.qchisq(1 - a, r.gl), lim = Math.max(crit + 3, Math.min(r.chi + 2, 45)), xs = seq(0.15, lim, 600), dens = x => E.dchisq(x, r.gl);
    const ytop = r.gl === 1 ? .45 : Math.max(...xs.map(dens)) * 1.25;
    const g2 = new Grafico("x_g2", { alto: 280, xlim: [0, lim], ylim: [0, ytop], sinY: true, xlab: `Distribución χ² si H₀ es cierta (gl = ${r.gl})` });
    g2.area(xs.filter(x => x >= r.chi).map(x => [x, dens(x)]), { color: COL.ambar, opacidad: .6 });
    g2.area(xs.filter(x => x >= crit).map(x => [x, dens(x)]), { color: COL.rojo, opacidad: .75 });
    g2.linea(xs.map(x => [x, Math.min(dens(x), ytop * 1.3)]), { color: COL.azul });
    g2.vline(r.chi, { color: "#111", grosor: 2.5 });
    g2.texto(crit, ytop * .88, "valor crítico = " + num(crit, 2), { color: COL.rojo, ancla: "start", dx: 4, tam: 12 });
    g2.etiqueta(E.limitar(r.chi, lim * .12, lim * .88), ytop * .66, "tu χ² = " + num(r.chi, 2), { color: "#111", tam: 12 });
    leyenda("x_g2", [[COL.ambar, "Valor p"], [COL.rojo, "Zona de rechazo (α)"]]);

    // Informe en 3 pasos
    const celdasSig = [], mas = [];
    r.R.forEach((row, i) => row.forEach((z, j) => { if (Math.abs(z) > zc) { celdasSig.push(`${c.filas[i]}–${c.cols[j]} (Z = ${num(z, 2)})`); if (z > 0) mas.push(`${c.filas[i]} – ${c.cols[j]} (${red(O[i][j] / tf[i])})`); } }));
    const conclusion = sig
      ? `Existe una asociación estadísticamente significativa entre ${c.varF} y ${c.varC}. Hay más casos de los esperados en: ${mas.join("; ")}. Esta asociación no permite afirmar una relación causal.`
      : `No se ha encontrado evidencia estadísticamente significativa de asociación entre ${c.varF} y ${c.varC}. Esto no demuestra que sean independientes: los datos no bastan para afirmar que estén asociadas.`;
    $("x_informe").innerHTML =
      paso(1, "¿Por qué esta prueba?", `<p class="small">Dos variables categóricas (${c.varF}: ${c.filas.join(" / ")}; ${c.varC}: ${c.cols.join(" / ")}). Objetivo: analizar su asociación → chi-cuadrado de Pearson. No requiere normalidad ni homocedasticidad; comprobamos que las frecuencias esperadas sean ≥ 5 (${espOK ? "se cumple" : "no se cumple"}).</p>`) +
      paso(2, "¿Qué resultados obtengo?", `<p><b>χ²(${r.gl}, N = ${r.N}) = ${num(r.chi, 2)}, ${pTxt(r.p)}.</b></p><p class="small">${sig ? "Se rechaza H₀. Residuos significativos: " + (celdasSig.length ? celdasSig.join("; ") : "ninguno") + `. V de Cramer = ${sinCero(num(V, 2))}.` : "No se rechaza H₀. No se interpretan los residuos ni la magnitud."}</p>`) +
      paso(3, "¿Qué puedo concluir?", `<p class="small">${conclusion}</p>`);
  };

  // ==================================================================
  // 7 · CORRELACIONES
  // ==================================================================
  let cDatos = null;
  function generarCor() {
    const n = val("c_n"), r = val("c_r"), forma = radio("c_forma");
    const z1 = E.rnorm(n, 0, 1), z2 = E.rnorm(n, 0, 1);
    let x = z1.map(z => forma === "curva" ? 1.2 * Math.exp(0.85 * z) : 10 + 3.5 * z);
    let y = z1.map((z, i) => 6 + 1.5 * (r * z + Math.sqrt(1 - r * r) * z2[i]));
    if (forma === "atip") { x.push(max(x) + 6); y.push(r >= 0 ? 0.5 : 9.8); }
    cDatos = { x: x.map(v => Math.max(v, 0)), y: y.map(v => E.limitar(v, 0, 10)) };
  }
  $("c_go").addEventListener("click", () => { generarCor(); render.correlaciones(); });
  ["c_r", "c_n"].forEach(id => $(id).addEventListener("input", () => { generarCor(); render.correlaciones(); }));
  document.querySelectorAll('input[name="c_forma"]').forEach(r => r.addEventListener("change", () => { generarCor(); render.correlaciones(); }));
  document.querySelectorAll("[data-cor]").forEach(b => b.addEventListener("click", () => {
    const [r, n] = b.dataset.cor.split(",").map(Number);
    setRange("c_r", r); setRange("c_n", n); setRadio("c_forma", "lin"); generarCor(); render.correlaciones();
  }));
  const intensidad = v => { v = Math.abs(v); return v < .10 ? "muy débil" : v < .30 ? "débil" : v < .50 ? "moderada" : v < .70 ? "fuerte" : "muy fuerte"; };

  render.correlaciones = function () {
    if (!cDatos) generarCor();
    const d = cDatos, pe = E.pearson(d.x, d.y), sp = E.spearman(d.x, d.y), n = d.x.length;
    $("c_cifras").innerHTML =
      cifra("Pearson", `r(${pe.gl}) = ${sinCero(num(pe.r, 2))}`, pTxt(pe.p), "roja") +
      cifra("Spearman", `ρ(${sp.gl}) = ${sinCero(num(sp.rho, 2))}`, pTxt(sp.p), "azul") +
      cifra("Tamaño de la muestra", num(n, 0), `gl = n − 2 = ${pe.gl}`);
    const xl = [Math.max(0, min(d.x) - 1), max(d.x) + 1];
    const g = new Grafico("c_g1", { alto: 380, xlim: xl, ylim: [0, 10], xlab: "Horas de estudio semanales", ylab: "Nota del examen (0–10)" });
    d.x.forEach((x, i) => g.punto(x, d.y[i], { color: COL.azul, r: 4, opacidad: .65 }));
    g.linea([[xl[0], pe.a + pe.b * xl[0]], [xl[1], pe.a + pe.b * xl[1]]], { color: COL.rojo, grosor: 2.5 });

    const g2 = new Grafico("c_g2", { alto: 170, xlim: [0, 1], ylim: [-.9, 1.9], sinY: true, xmarcas: [0, .1, .3, .5, .7, 1], xetiq: ["0", ",10", ",30", ",50", ",70", "1"], rejillaX: false, margen: { l: 12, r: 12, b: 28 } });
    const tramos = [[0, .1, "M. débil", COL.claro, COL.azul], [.1, .3, "Débil", COL.suave, COL.azul], [.3, .5, "Moderada", "#6FA8E3", "#fff"], [.5, .7, "Fuerte", COL.medio, "#fff"], [.7, 1, "Muy fuerte", COL.azul, "#fff"]];
    tramos.forEach(([a, b, l, c, ct]) => { g2.rect(a, b, 0, 1, { color: c, borde: "#fff", grosorBorde: 2 }); g2.texto((a + b) / 2, .5, l, { dy: 4, color: ct, negrita: true, tam: 11 }); });
    g2.triangulo(Math.abs(pe.r), 1.3, true, { color: COL.rojo });
    g2.texto(Math.abs(pe.r), 1.62, "|r| Pearson", { color: COL.rojo, negrita: true, tam: 12 });
    g2.triangulo(Math.abs(sp.rho), -.3, false, { color: COL.ambar });
    g2.texto(Math.abs(sp.rho), -.68, "|ρ| Spearman", { color: COL.ambar, negrita: true, tam: 12 });

    const sig = pe.p <= .05;
    const dir = Math.abs(pe.r) < .10 ? "prácticamente nula" : pe.r > 0 ? "positiva (a más horas, mejor nota)" : "inversa (a más horas, peor nota)";
    $("c_interp").innerHTML = `<ul style="padding-left:18px;margin:8px 0">
        <li><b>Dirección:</b> ${dir}</li>
        <li><b>Intensidad (Pearson):</b> ${intensidad(pe.r)} (|r| = ${sinCero(num(Math.abs(pe.r), 2))})</li>
        <li><b>Significación:</b> ${pTxt(pe.p)} ${sig ? "→ significativa (se rechaza H₀: ρ = 0)" : "→ no significativa (no se rechaza H₀)"}</li></ul>` +
      (sig && Math.abs(pe.r) < .30 ? `<div class="caja alerta"><b>Significativa pero débil.</b> Con muestras grandes, relaciones pequeñas salen significativas.</div>`
        : !sig && Math.abs(pe.r) >= .40 ? `<div class="caja alerta"><b>Intensa pero no significativa.</b> Con tan pocos participantes no hay evidencia suficiente, aunque r parezca alto.</div>` : "") +
      (Math.abs(sp.rho - pe.r) > .12 ? `<div class="caja clave"><b>Pearson y Spearman difieren.</b> Pearson solo capta relaciones lineales y es sensible a los valores atípicos; Spearman trabaja con rangos y capta relaciones monótonas.</div>` : "");
  };

  // ==================================================================
  // 8 y 9 · COMPARAR MEDIAS (t de Student, U de Mann-Whitney, Wilcoxon)
  // ==================================================================
  function normalidadCriterio(x) {     // criterio de clase: n < 50 → Shapiro-Wilk; n ≥ 50 → K-S (Lilliefors)
    const n = x.length;
    if (n < 50) { const r = E.shapiroWilk(x); return { prueba: "Shapiro-Wilk", est: `W(${n}) = ${sinCero(num(r.W, 3))}`, p: r.p }; }
    const r = E.lilliefors(x); return { prueba: "K-S (Lilliefors)", est: `D(${n}) = ${sinCero(num(r.D, 3))}`, p: r.p };
  }
  const tamD = d => { const a = Math.abs(d); return a < .2 ? "muy pequeño" : a < .5 ? "pequeño" : a < .8 ? "mediano" : "grande"; };
  const ruido = forma => forma === "asim" ? (E.rgamma(1, 2, 1)[0] - 2) / Math.SQRT2 : E.rnorm1(0, 1);
  const chips = (pasos, final) => `<div class="camino-prueba">${pasos.map(([t, c]) => `<span class="chip ${c || ""}">${t}</span><span class="flecha">→</span>`).join("")}<span class="chip final">${final}</span></div>`;
  const filaSup = (nom, r) => `<tr><td class="fila">${nom}</td><td>${r.prueba}</td><td>${r.est}</td><td>${pTxt(r.p)}</td><td class="${r.p > .05 ? "" : "mas"}">${r.p > .05 ? "Se cumple" : "No se cumple"}</td></tr>`;
  const tarjetaRes = (titulo, lineas, recomendada) => `<div class="res-prueba ${recomendada ? "recomendada" : ""}">${recomendada ? '<span class="eti-rec">La que corresponde según el esquema</span>' : '<span class="eti-rec gris">Solo para comparar</span>'}<h5>${titulo}</h5>${lineas.map(l => `<p>${l}</p>`).join("")}</div>`;

  // --- Grupos independientes ---
  const CASOS_TI = {
    autoestima: { g: ["Chicas", "Chicos"], v: "autoestima", esc: "escala de 1 a 5", m: 3.6, sd: .8, min: 1, max: 5, dec: 2, dir: -1, d: .6, n: [50, 50], desc: "Autoestima de adolescentes en una escala de 1 a 5. Inspirado en el ejemplo de la diapositiva 14 (datos simulados)." },
    empatia: { g: ["Voluntariado", "Sin voluntariado"], v: "empatía", esc: "IRI, 0–84", m: 54, sd: 10, min: 0, max: 84, dec: 0, dir: -1, d: .15, n: [50, 50], desc: "Empatía de jóvenes que hacen voluntariado y que no lo hacen. Inspirado en la diapositiva 15 (datos simulados)." },
    ansiedad: { g: ["Psicología", "Criminología"], v: "ansiedad", esc: "0–60", m: 28, sd: 6, min: 0, max: 60, dec: 0, dir: 1, d: .5, n: [40, 35], desc: "Ansiedad de estudiantes de dos grados. Es el caso de homocedasticidad de la diapositiva 21 (datos simulados)." }
  };
  let tiDatos = null;
  function cargarCasoTI() {
    const c = CASOS_TI[$("ti_caso").value];
    setRange("ti_d", c.d); setRange("ti_n1", c.n[0]); setRange("ti_n2", c.n[1]); setRange("ti_ratio", 1); setRadio("ti_forma", "normal");
    $("ti_desc").textContent = c.desc; generarTI();
  }
  function generarTI() {
    const c = CASOS_TI[$("ti_caso").value], f = radio("ti_forma"), ratio = val("ti_ratio");
    const gen = (n, m, sd) => Array.from({ length: n }, () => +E.limitar(m + sd * ruido(f), c.min, c.max).toFixed(c.dec));
    tiDatos = { c, x: gen(val("ti_n1"), c.m, c.sd), y: gen(val("ti_n2"), c.m + c.dir * val("ti_d") * c.sd, c.sd * ratio),
      j1: E.runif(val("ti_n1"), -.14, .14), j2: E.runif(val("ti_n2"), -.14, .14) };
  }
  $("ti_caso").addEventListener("change", () => { cargarCasoTI(); render.independientes(); });
  ["ti_d", "ti_n1", "ti_n2", "ti_ratio"].forEach(id => $(id).addEventListener("input", () => { generarTI(); render.independientes(); }));
  document.querySelectorAll('input[name="ti_forma"]').forEach(r => r.addEventListener("change", () => { generarTI(); render.independientes(); }));
  $("ti_go").addEventListener("click", () => { generarTI(); render.independientes(); });

  render.independientes = function () {
    if (!tiDatos) { $("ti_desc").textContent = CASOS_TI.autoestima.desc; cargarCasoTI(); }
    if (!visible("ti_camino")) return;
    const { c, x, y } = tiDatos, [g1, g2] = c.g;
    const n1 = normalidadCriterio(x), n2 = normalidadCriterio(y), lev = E.levene([x, y]);
    const normOK = n1.p > .05 && n2.p > .05, levOK = lev.p > .05, usaT = normOK && levOK;
    const tt = E.tStudent(x, y, .95), mw = E.mannWhitney(x, y), dC = E.dCohen(x, y);
    const pasos = [["Cuantitativa"], ["Comparar"], ["Muestras independientes"], [`Normalidad: ${normOK ? "sí" : "no"}`, "supuesto"]];
    if (normOK) pasos.push([`Homocedasticidad: ${levOK ? "sí" : "no"}`, "supuesto"]);
    $("ti_camino").innerHTML = chips(pasos, usaT ? "t de Student para muestras independientes" : "U de Mann-Whitney");

    // Gráfico
    const todos = x.concat(y), lo = min(todos), hi = max(todos), pad = (hi - lo) * .06 || 1;
    const g = new Grafico("ti_g", { alto: 290, xlim: [lo - pad, hi + pad], ylim: [0.4, 2.6], ymarcas: [2, 1], yetiq: v => v === 2 ? g1 : g2, xlab: `${c.v[0].toUpperCase() + c.v.slice(1)} (${c.esc})`, margen: { l: 112 } });
    [[x, tiDatos.j1, COL.azul, 2], [y, tiDatos.j2, COL.rojo, 1]].forEach(([v, j, col, yy]) => {
      const q1 = E.cuantil(v, .25), q2 = E.cuantil(v, .5), q3 = E.cuantil(v, .75), iqr = q3 - q1;
      const wlo = min(v.filter(z => z >= q1 - 1.5 * iqr)), whi = max(v.filter(z => z <= q3 + 1.5 * iqr));
      g.segmento(wlo, yy, q1, yy, { color: col }); g.segmento(q3, yy, whi, yy, { color: col });
      g.rect(q1, q3, yy - .25, yy + .25, { color: "none", borde: col, grosorBorde: 2 });
      g.segmento(q2, yy - .25, q2, yy + .25, { color: col, grosor: 3 });
      v.forEach((z, i) => g.punto(z, yy + j[i], { color: col, r: 2.6, opacidad: .4 }));
      g.punto(E.media(v), yy, { color: "#fff", borde: col, grosorBorde: 3, r: 6 });
    });
    leyenda("ti_g", [[COL.gris, "Caja: mediana y cuartiles · Círculo blanco: media"]]);

    $("ti_sup").innerHTML = `<div class="tabla-scroll"><table class="t-ufv"><tr><th>Supuesto</th><th>Prueba</th><th>Estadístico</th><th>p</th><th>Decisión</th></tr>
      ${filaSup("Normalidad · " + g1, n1)}${filaSup("Normalidad · " + g2, n2)}
      ${filaSup("Homocedasticidad", { prueba: "Levene", est: `F(${lev.gl1}, ${lev.gl2}) = ${num(lev.F, 2)}`, p: lev.p })}</table></div>
      <p class="small gris">Criterio de clase: con menos de 50 personas por grupo, Shapiro-Wilk; con 50 o más, Kolmogorov-Smirnov. En los supuestos queremos p &gt; ,05.</p>`;

    const M = v => `M = ${num(E.media(v), 2)}; DT = ${num(E.dt(v), 2)}`, Md = v => `Mdn = ${num(E.mediana(v), 2)}`;
    $("ti_res").innerHTML =
      tarjetaRes("t de Student para muestras independientes", [`<b>t(${tt.gl}) = ${num(tt.t, 2)}, ${pTxt(tt.p)}</b>`, `${g1}: ${M(x)} · ${g2}: ${M(y)}`, `Diferencia de medias = ${num(tt.dif, 2)}; IC 95 % [${num(tt.ic[0], 2)} ; ${num(tt.ic[1], 2)}]`, `d de Cohen = ${num(Math.abs(dC), 2)} (efecto ${tamD(dC)})`], usaT) +
      tarjetaRes("U de Mann-Whitney", [`<b>U = ${num(mw.U, 1)}, z = ${num(mw.z, 2)}, ${pTxt(mw.p)}</b>`, `${g1}: ${Md(x)}; rango promedio = ${num(mw.rango1, 1)}`, `${g2}: ${Md(y)}; rango promedio = ${num(mw.rango2, 1)}`, `Compara los rangos (posiciones ordenadas), no las medias.`], !usaT);

    const p = usaT ? tt.p : mw.p, sig = p <= .05;
    const mayor = usaT ? (tt.dif > 0 ? g1 : g2) : (mw.rango1 > mw.rango2 ? g1 : g2), menor = mayor === g1 ? g2 : g1;
    const res = usaT ? `t(${tt.gl}) = ${num(tt.t, 2)}, ${pTxt(tt.p)}` : `U = ${num(mw.U, 1)}, z = ${num(mw.z, 2)}, ${pTxt(mw.p)}`;
    const desc = usaT ? `${g1} (M = ${num(E.media(x), 2)}, DT = ${num(E.dt(x), 2)}) y ${g2} (M = ${num(E.media(y), 2)}, DT = ${num(E.dt(y), 2)})` : `${g1} (Mdn = ${num(E.mediana(x), 2)}) y ${g2} (Mdn = ${num(E.mediana(y), 2)})`;
    $("ti_informe").innerHTML =
      paso(1, "¿Por qué esta prueba?", `<p class="small">Variable cuantitativa (${c.v}) comparada entre dos grupos independientes (${g1} / ${g2}). Objetivo: comparar. Normalidad: ${n1.prueba} en ${g1} (${pTxt(n1.p)}) y en ${g2} (${pTxt(n2.p)}): ${normOK ? "se cumple" : "no se cumple"}.${normOK ? ` Homocedasticidad (Levene, ${pTxt(lev.p)}): ${levOK ? "se cumple" : "no se cumple"}.` : ""} Prueba: <b>${usaT ? "t de Student para muestras independientes" : "U de Mann-Whitney"}</b>.</p>`) +
      paso(2, "¿Qué resultados obtengo?", `<p><b>${res}.</b></p><p class="small">${sig ? `Hay diferencias estadísticamente significativas. Descriptivos: ${desc}.${usaT ? ` Tamaño del efecto: d = ${num(Math.abs(dC), 2)} (${tamD(dC)}).` : ""}` : "No hay diferencias estadísticamente significativas: no se interpretan la dirección ni la magnitud."}</p>`) +
      paso(3, "¿Qué puedo concluir?", `<p class="small">${sig ? `En esta muestra, el grupo ${mayor} presenta puntuaciones de ${c.v} más altas que el grupo ${menor}. Como no es un diseño experimental, no podemos atribuir la diferencia a la pertenencia al grupo.` : `No hay evidencia suficiente de diferencias en ${c.v} entre ${g1} y ${g2}. Esto no demuestra que los dos grupos sean iguales.`}</p>`);
  };

  // --- Muestras relacionadas ---
  const CASOS_TR = {
    mindfulness: { v: "ansiedad", esc: "0–60", m: 32, sd: 8, r: .6, min: 0, max: 60, d: -.5, n: 30, desc: "Ansiedad de 30 personas antes y después de un programa de mindfulness (datos simulados). Un cambio negativo significa que la ansiedad baja." },
    taller: { v: "autoestima", esc: "10–40", m: 28.4, sd: 5, r: .6, min: 10, max: 40, d: .55, n: 25, desc: "Autoestima de 25 adolescentes antes y después de un taller (datos simulados). Un cambio positivo significa que la autoestima sube." }
  };
  let trDatos = null;
  function cargarCasoTR() {
    const c = CASOS_TR[$("tr_caso").value];
    setRange("tr_d", c.d); setRange("tr_n", c.n); setRadio("tr_forma", "normal"); $("tr_desc").textContent = c.desc; generarTR();
  }
  function generarTR() {
    const c = CASOS_TR[$("tr_caso").value], f = radio("tr_forma"), n = val("tr_n"), d = val("tr_d");
    const sdDif = c.sd * Math.sqrt(2 - 2 * c.r), antes = [], despues = [];
    for (let i = 0; i < n; i++) {
      const z1 = E.rnorm1(0, 1), z2 = f === "asim" ? ruido("asim") : E.rnorm1(0, 1);
      const a = c.m + c.sd * z1, b = c.m + d * sdDif + c.sd * (c.r * z1 + Math.sqrt(1 - c.r * c.r) * z2);
      antes.push(Math.round(E.limitar(a, c.min, c.max))); despues.push(Math.round(E.limitar(b, c.min, c.max)));
    }
    if (f === "atip") for (let k = 0; k < Math.min(2, n); k++) despues[k] = Math.round(E.limitar(antes[k] - Math.sign(d || 1) * 4.5 * sdDif, c.min, c.max));
    trDatos = { c, antes, despues };
  }
  $("tr_caso").addEventListener("change", () => { cargarCasoTR(); render.relacionadas(); });
  ["tr_d", "tr_n"].forEach(id => $(id).addEventListener("input", () => { generarTR(); render.relacionadas(); }));
  document.querySelectorAll('input[name="tr_forma"]').forEach(r => r.addEventListener("change", () => { generarTR(); render.relacionadas(); }));
  $("tr_go").addEventListener("click", () => { generarTR(); render.relacionadas(); });

  render.relacionadas = function () {
    if (!trDatos) cargarCasoTR();
    if (!visible("tr_camino")) return;
    const { c, antes, despues } = trDatos;
    const tr = E.tRelacionadas(antes, despues), w = E.wilcoxon(antes, despues), nd = normalidadCriterio(tr.d), usaT = nd.p > .05;
    $("tr_camino").innerHTML = chips([["Cuantitativa"], ["Comparar"], ["Muestras relacionadas"], [`Normalidad de las diferencias: ${usaT ? "sí" : "no"}`, "supuesto"]], usaT ? "t de Student para muestras relacionadas" : "Prueba de Wilcoxon");

    const todos = antes.concat(despues), lo = min(todos), hi = max(todos), pad = (hi - lo) * .08 || 1;
    const g = new Grafico("tr_g1", { alto: 300, xlim: [0.6, 2.4], ylim: [lo - pad, hi + pad], xmarcas: [1, 2], xetiq: ["Antes", "Después"], ylab: `${c.v[0].toUpperCase() + c.v.slice(1)} (${c.esc})`, rejillaX: false });
    antes.slice(0, 80).forEach((a, i) => { const b = despues[i]; g.segmento(1, a, 2, b, { color: b > a ? COL.medio : b < a ? COL.rojo : COL.gris, grosor: 1.2, opacidad: .35 }); });
    g.segmento(1, E.media(antes), 2, E.media(despues), { color: COL.azul, grosor: 4 });
    g.punto(1, E.media(antes), { color: COL.azul, r: 7 }); g.punto(2, E.media(despues), { color: COL.azul, r: 7 });
    g.texto(1, E.media(antes), "M = " + num(E.media(antes), 1), { ancla: "end", dx: -12, dy: 4, negrita: true, tam: 12 });
    g.texto(2, E.media(despues), "M = " + num(E.media(despues), 1), { ancla: "start", dx: 12, dy: 4, negrita: true, tam: 12 });
    leyenda("tr_g1", [[COL.medio, "Sube"], [COL.rojo, "Baja"], [COL.azul, "Medias"]]);

    const d = tr.d, dmn = min(d), dmx = max(d), bw = Math.max(1, Math.round((dmx - dmn) / 10)), h = histograma(d, dmn - .5, bw);
    const xs = seq(dmn - bw, dmx + bw, 200), curva = xs.map(v => [v, E.dnorm(v, E.media(d), E.dt(d)) * d.length * bw]);
    const g2 = new Grafico("tr_g2", { alto: 200, xlim: [dmn - bw, dmx + bw], ylim: [0, Math.max(max(h.map(b => b.n)), max(curva.map(q => q[1]))) * 1.12], xlab: "Diferencia (después − antes)", ylab: "Personas" });
    h.forEach(b => g2.rect(b.x0, b.x1, 0, b.n, { color: COL.suave, borde: "#fff" }));
    g2.linea(curva, { color: COL.rojo, grosor: 2 }); g2.vline(0, { color: COL.gris, trazo: "4 4", grosor: 1.2 });
    $("tr_sup").innerHTML = `<div class="tabla-scroll"><table class="t-ufv"><tr><th>Supuesto</th><th>Prueba</th><th>Estadístico</th><th>p</th><th>Decisión</th></tr>${filaSup("Normalidad de las diferencias", nd)}</table></div>
      <p class="small gris">Con las mismas personas, lo que analizamos es la diferencia de cada una entre las dos medidas; por eso comprobamos la normalidad de esas diferencias.</p>`;

    const Md = v => `Mdn = ${num(E.mediana(v), 1)}`;
    $("tr_res").innerHTML =
      tarjetaRes("t de Student para muestras relacionadas", [`<b>t(${tr.gl}) = ${num(tr.t, 2)}, ${pTxt(tr.p)}</b>`, `Antes: M = ${num(E.media(antes), 2)}; DT = ${num(E.dt(antes), 2)} · Después: M = ${num(E.media(despues), 2)}; DT = ${num(E.dt(despues), 2)}`, `Cambio medio = ${num(tr.mdif, 2)}; IC 95 % [${num(tr.ic[0], 2)} ; ${num(tr.ic[1], 2)}]`, `d = ${num(Math.abs(tr.dz), 2)} (efecto ${tamD(tr.dz)})`], usaT) +
      tarjetaRes("Prueba de Wilcoxon", [`<b>z = ${num(w.z, 2)}, ${pTxt(w.p)}</b>`, `Antes: ${Md(antes)} · Después: ${Md(despues)}`, `Suma de rangos positivos = ${num(w.Wpos, 1)}; negativos = ${num(w.Wneg, 1)}`, `Trabaja con los rangos de las diferencias, no con las medias.`], !usaT);

    const p = usaT ? tr.p : w.p, sig = p <= .05, sube = usaT ? tr.mdif > 0 : w.Wpos > w.Wneg;
    const res = usaT ? `t(${tr.gl}) = ${num(tr.t, 2)}, ${pTxt(tr.p)}` : `z = ${num(w.z, 2)}, ${pTxt(w.p)}`;
    $("tr_informe").innerHTML =
      paso(1, "¿Por qué esta prueba?", `<p class="small">Una variable cuantitativa (${c.v}) medida dos veces en las mismas ${antes.length} personas: muestras relacionadas. Objetivo: comparar. Normalidad de las diferencias (${nd.prueba}, ${pTxt(nd.p)}): ${usaT ? "se cumple" : "no se cumple"}. Prueba: <b>${usaT ? "t de Student para muestras relacionadas" : "Wilcoxon"}</b>.</p>`) +
      paso(2, "¿Qué resultados obtengo?", `<p><b>${res}.</b></p><p class="small">${sig ? `Hay un cambio estadísticamente significativo: la ${c.v} ${sube ? "sube" : "baja"} de ${usaT ? `M = ${num(E.media(antes), 2)} a M = ${num(E.media(despues), 2)}. Tamaño del efecto: d = ${num(Math.abs(tr.dz), 2)} (${tamD(tr.dz)})` : `Mdn = ${num(E.mediana(antes), 1)} a Mdn = ${num(E.mediana(despues), 1)}`}.` : "No hay un cambio estadísticamente significativo: no se interpretan la dirección ni la magnitud."}</p>`) +
      paso(3, "¿Qué puedo concluir?", `<p class="small">${sig ? `Tras la intervención, la ${c.v} ${sube ? "aumenta" : "disminuye"} de forma significativa. Ojo: sin un grupo control no podemos afirmar que el cambio se deba a la intervención (pueden influir el paso del tiempo u otros factores).` : `No hay evidencia suficiente de cambio en la ${c.v} entre las dos medidas. Esto no demuestra que no haya cambiado nada.`}</p>`);
  };

})();
