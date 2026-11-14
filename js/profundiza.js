/* =====================================================================
   profundiza.js — Pestaña «Para profundizar» de cada módulo
   Fórmulas, un ejemplo resuelto paso a paso (con datos editables) y las
   tablas de valores críticos. No guarda nada: no afecta al progreso.
   Todos los datos son simulados con fines docentes.
   ===================================================================== */
(function () {
  "use strict";
  const E = window.Est;

  // ------------------------------------------------------------------
  // Formato
  // ------------------------------------------------------------------
  const f = (v, d = 2) => isFinite(v) ? v.toFixed(d).replace(".", ",").replace(/^-/, "−") : "—";
  const ft = (v, d = 2) => isFinite(v) ? v.toFixed(d).replace(".", "{,}") : "?";          // para TeX
  const sinCero = s => s.replace(/^(−?)0,/, "$1,");
  const pA = p => p < .001 ? "p < ,001" : "p = " + sinCero(f(p, 3));
  const fn = v => Number.isInteger(v) ? String(v).replace(/^-/, "−") : f(v, 2);                                // dato tal cual
  const ftn = v => Number.isInteger(v) ? String(v) : ft(v, 2);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const tex = (s, display) => `<span class="fx${display ? " fx-d" : ""}" data-tex="${esc(s)}">${esc(s)}</span>`;
  const T = s => tex(s, true);
  const t = s => tex(s, false);
  const suma = a => a.reduce((x, y) => x + y, 0);
  const media = a => suma(a) / a.length;
  const qt = (p, gl) => E.qt(p, gl);
  const intensidad = r => { const a = Math.abs(r); return a < .1 ? "muy débil" : a < .3 ? "débil" : a < .5 ? "moderada" : a < .7 ? "fuerte" : "muy fuerte"; };
  const tamD = d => { const a = Math.abs(d); return a < .2 ? "muy pequeño" : a < .5 ? "pequeño" : a < .8 ? "mediano" : "grande"; };

  function renderTex(raiz) {
    if (!window.katex) { window.addEventListener("load", () => renderTex(raiz), { once: true }); return; }
    raiz.querySelectorAll(".fx").forEach(el => {   // si KaTeX no ha cargado, queda el texto TeX legible
      try { katex.render(el.dataset.tex, el, { displayMode: el.classList.contains("fx-d"), throwOnError: false }); } catch (e) { /* se queda el texto */ }
    });
  }

  // Tabla HTML sencilla
  const tabla = (cab, filas, pie, clase = "") => `<div class="tabla-scroll"><table class="t-ufv t-prof ${clase}"><tr>${cab.map(c => `<th>${c}</th>`).join("")}</tr>` +
    filas.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("") +
    (pie ? `<tr class="t-suma">${pie.map(c => `<td>${c}</td>`).join("")}</tr>` : "") + `</table></div>`;
  const paso = (n, titulo, cuerpo) => `<div class="prof-paso"><span class="prof-n">${n}</span><div><h4>${titulo}</h4>${cuerpo}</div></div>`;
  const decision = (sig, si, no) => `<div class="caja ${sig ? "prof-si" : "prof-no"}">${sig ? si : no}</div>`;

  // Rangos con empates promediados
  function rangos(x) {
    const idx = x.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]), r = new Array(x.length);
    for (let i = 0; i < idx.length;) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1; i = j + 1; }
    return r;
  }
  const hayEmpates = x => new Set(x).size < x.length;

  // ------------------------------------------------------------------
  // Curva normal en SVG (sombreado: izq | colas | centro)
  // ------------------------------------------------------------------
  function curva(z, modo, etiqueta) {
    const W = 340, H = 130, x0 = 20, x1 = W - 20, y0 = H - 24, ESC = 260;
    const X = v => x0 + (v + 3.6) / 7.2 * (x1 - x0), Y = d => y0 - d * ESC;
    const pts = [];
    for (let v = -3.6; v <= 3.6001; v += .05) pts.push([X(v), Y(E.dnorm(v))]);
    const zona = (a, b) => { a = Math.max(a, -3.6); b = Math.min(b, 3.6); if (b <= a) return ""; let d = `M${X(a)},${y0}`; for (let v = a; v <= b + 1e-9; v += .02) d += `L${X(v)},${Y(E.dnorm(v))}`; return d + `L${X(b)},${y0}Z`; };
    const za = Math.min(Math.abs(z), 3.6);
    let sombra = "";
    if (modo === "izq") sombra = `<path d="${zona(-3.6, Math.max(-3.6, Math.min(z, 3.6)))}" class="sv-area"/>`;
    if (modo === "colas") sombra = `<path d="${zona(-3.6, -za)}" class="sv-cola"/><path d="${zona(za, 3.6)}" class="sv-cola"/>`;
    if (modo === "centro") sombra = `<path d="${zona(-za, za)}" class="sv-area"/>`;
    const marcas = [-3, -2, -1, 0, 1, 2, 3].map(v => `<line x1="${X(v)}" x2="${X(v)}" y1="${y0}" y2="${y0 + 4}" class="sv-eje"/><text x="${X(v)}" y="${y0 + 16}" class="sv-txt">${v}</text>`).join("");
    const zm = Math.max(-3.6, Math.min(z, 3.6));
    return `<svg viewBox="0 0 ${W} ${H}" class="prof-curva" role="img" aria-label="${esc(etiqueta || "Curva normal")}">
      ${sombra}<polyline points="${pts.map(p => p.join(",")).join(" ")}" class="sv-linea"/>
      <line x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}" class="sv-eje"/>${marcas}
      <line x1="${X(zm)}" x2="${X(zm)}" y1="${y0}" y2="${Y(E.dnorm(zm)) - 8}" class="sv-z"/>
      <text x="${X(zm)}" y="${Y(E.dnorm(zm)) - 12}" class="sv-txt sv-zt">z = ${f(z, 2)}</text></svg>`;
  }

  // ------------------------------------------------------------------
  // Tablas de valores críticos (calculadas al vuelo y comprobadas)
  // ------------------------------------------------------------------
  function tablaNormal(zMarca) {
    const fila = zMarca != null && isFinite(zMarca) && Math.abs(zMarca) < 3.5 ? Math.floor(Math.round(Math.abs(zMarca) * 100) / 10) / 10 : null;
    const col = fila != null ? Math.round(Math.abs(zMarca) * 100) % 10 : null;
    let h = `<div class="tabla-scroll"><table class="t-ufv t-prof t-gauss"><tr><th>z</th>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => `<th${c === col ? ' class="marca-col"' : ""}>,0${c}</th>`).join("")}</tr>`;
    for (let r = 0; r <= 34; r++) {
      const zr = r / 10, esF = fila != null && Math.abs(zr - fila) < 1e-9;
      h += `<tr${esF ? ' class="marca-fila"' : ""}><th>${f(zr, 1)}</th>`;
      for (let c = 0; c <= 9; c++) h += `<td${esF && c === col ? ' class="marca"' : ""}>${sinCero(f(E.pnorm(zr + c / 100), 4))}</td>`;
      h += `</tr>`;
    }
    return h + `</table></div><p class="small gris">Cada celda es Φ(z) = P(Z ≤ z): el área a la izquierda de z. Fila = entero y primer decimal; columna = segundo decimal. Para z negativos: Φ(−z) = 1 − Φ(z).</p>`;
  }
  function tablaT(glMarca) {
    const gls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 40, 60, 100];
    const cerca = glMarca ? gls.reduce((a, g) => g <= glMarca ? g : a, 1) : null;
    return `<div class="tabla-scroll"><table class="t-ufv t-prof t-crit"><tr><th>gl</th><th>α = ,05</th><th>α = ,01</th></tr>${gls.map(g => `<tr${g === cerca ? ' class="marca-fila"' : ""}><th>${g}</th><td>${f(qt(.975, g), 3)}</td><td>${f(qt(.995, g), 3)}</td></tr>`).join("")}</table></div>
      <p class="small gris">Valores críticos de t, contraste bilateral. Si tus gl no aparecen, usa los gl más próximos por debajo (es la opción más exigente).</p>`;
  }
  function tablaChi(glMarca) {
    return `<div class="tabla-scroll"><table class="t-ufv t-prof t-crit"><tr><th>gl</th><th>α = ,05</th><th>α = ,01</th></tr>${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => `<tr${g === glMarca ? ' class="marca-fila"' : ""}><th>${g}</th><td>${f(E.qchisq(.95, g), 3)}</td><td>${f(E.qchisq(.99, g), 3)}</td></tr>`).join("")}</table></div>
      <p class="small gris">Valores críticos de χ². Se rechaza H₀ si el χ² obtenido es <b>mayor</b> que el valor de la tabla.</p>`;
  }
  // U de Mann-Whitney, bilateral α = ,05 (valores exactos)
  const U_CRIT = { 4: [0, 1, 2, 3, 4, 4, 5], 5: [1, 2, 3, 5, 6, 7, 8], 6: [2, 3, 5, 6, 8, 10, 11], 7: [3, 5, 6, 8, 10, 12, 14], 8: [4, 6, 8, 10, 13, 15, 17], 9: [4, 7, 10, 12, 15, 17, 20], 10: [5, 8, 11, 14, 17, 20, 23] };
  function tablaU(n1, n2) {
    const ns = [4, 5, 6, 7, 8, 9, 10];
    return `<div class="tabla-scroll"><table class="t-ufv t-prof t-crit"><tr><th>n₁ \\ n₂</th>${ns.map(n => `<th${n === n2 ? ' class="marca-col"' : ""}>${n}</th>`).join("")}</tr>${ns.map(a => `<tr${a === n1 ? ' class="marca-fila"' : ""}><th>${a}</th>${U_CRIT[a].map((v, i) => `<td${a === n1 && ns[i] === n2 ? ' class="marca"' : ""}>${v}</td>`).join("")}</tr>`).join("")}</table></div>
      <p class="small gris">Valores críticos de U (bilateral, α = ,05). Se rechaza H₀ si U es <b>menor o igual</b> que el valor de la tabla.</p>`;
  }
  // T de Wilcoxon, bilateral α = ,05 (valores exactos)
  const W_CRIT = { 6: 0, 7: 2, 8: 3, 9: 5, 10: 8, 11: 10, 12: 13, 13: 17, 14: 21, 15: 25, 16: 29, 17: 34, 18: 40, 19: 46, 20: 52 };
  function tablaW(n) {
    const ns = Object.keys(W_CRIT).map(Number);
    return `<div class="tabla-scroll"><table class="t-ufv t-prof t-crit"><tr><th>n</th>${ns.map(k => `<th${k === n ? ' class="marca-col"' : ""}>${k}</th>`).join("")}</tr><tr><th>T crítico</th>${ns.map(k => `<td${k === n ? ' class="marca"' : ""}>${W_CRIT[k]}</td>`).join("")}</tr></table></div>
      <p class="small gris">Valores críticos de T de Wilcoxon (bilateral, α = ,05). n = diferencias distintas de cero. Se rechaza H₀ si T es <b>menor o igual</b> que el valor de la tabla.</p>`;
  }
  const desplegable = (titulo, html, abierto) => `<details class="prof-tabla"${abierto ? " open" : ""}><summary>${titulo}</summary>${html}</details>`;

  // ------------------------------------------------------------------
  // Editores de datos
  // ------------------------------------------------------------------
  // filas: [{k: clave, etiqueta}], cada clave es un vector en d
  function editorVectores(d, filas) {
    return `<div class="tabla-scroll"><table class="t-ufv t-prof t-editor">${filas.map(r => `<tr><th>${r.etiqueta}</th>${d[r.k].map((v, i) => `<td><input type="number" step="any" inputmode="decimal" data-k="${r.k}" data-i="${i}" value="${v}" aria-label="${esc(r.etiqueta)} ${i + 1}"></td>`).join("")}</tr>`).join("")}</table></div>`;
  }
  function editorCampos(d, campos) {
    return `<div class="prof-campos">${campos.map(c => c.opciones
      ? `<label>${c.etiqueta}<select data-k="${c.k}">${c.opciones.map(o => `<option value="${o[0]}"${String(o[0]) === String(d[c.k]) ? " selected" : ""}>${o[1]}</option>`).join("")}</select></label>`
      : `<label>${c.etiqueta}<input type="number" step="any" inputmode="decimal" data-k="${c.k}" value="${d[c.k]}"${c.min != null ? ` min="${c.min}"` : ""}></label>`).join("")}</div>`;
  }
  function leer(cont, d) {
    const n = JSON.parse(JSON.stringify(d));
    cont.querySelectorAll("[data-k]").forEach(el => {
      const v = el.tagName === "SELECT" ? el.value : parseFloat(String(el.value).replace(",", "."));
      if (el.dataset.i != null) n[el.dataset.k][+el.dataset.i] = v; else n[el.dataset.k] = el.tagName === "SELECT" ? (isNaN(+v) ? v : +v) : v;
    });
    return n;
  }
  const valido = d => Object.values(d).every(v => Array.isArray(v) ? v.every(x => Array.isArray(x) ? x.every(isFinite) : isFinite(x)) : (typeof v === "string" || isFinite(v)));

  // ==================================================================
  // CONTENIDO DE CADA MÓDULO
  // ==================================================================
  const M = {};

  // ---------------------------------------------------------------- MUESTRAS
  M.muestras = {
    intro: "¿De dónde sale el <b>error típico</b>? Aquí calculas a mano la media, la desviación típica y el error típico de una muestra pequeña.",
    formulas: `<div class="rejilla c3 prof-fx">
        <div><h4>Media</h4>${T("\\bar{x} = \\dfrac{\\sum x_i}{n}")}</div>
        <div><h4>Desviación típica (muestra)</h4>${T("s = \\sqrt{\\dfrac{\\sum (x_i-\\bar{x})^2}{n-1}}")}</div>
        <div><h4>Error típico de la media</h4>${T("EE = \\dfrac{s}{\\sqrt{n}}")}<p class="small gris">Si conocemos σ de la población: ${t("\\sigma_{\\bar{x}} = \\sigma/\\sqrt{n}")}</p></div></div>
      <p class="small">Dividimos entre <b>n − 1</b> (y no entre n) porque usamos la media de la propia muestra: así la varianza muestral no infravalora la de la población.</p>`,
    contexto: "Apoyo social percibido (0–100) de cinco jóvenes de un programa de reinserción.",
    datos: { x: [62, 70, 55, 68, 75] },
    editor: d => editorVectores(d, [{ k: "x", etiqueta: "Apoyo social" }]),
    calcular(d) {
      const x = d.x, n = x.length, m = media(x), dv = x.map(v => v - m), ss = suma(dv.map(v => v * v)), s2 = ss / (n - 1), s = Math.sqrt(s2), ee = s / Math.sqrt(n);
      return paso(1, "Calcula la media", T(`\\bar{x} = \\dfrac{${x.map(ftn).join("+")}}{${n}} = \\dfrac{${ftn(suma(x))}}{${n}} = ${ft(m)}`)) +
        paso(2, "Desviaciones respecto a la media y sus cuadrados", tabla(["Persona", "x", "x − x̄", "(x − x̄)²"], x.map((v, i) => [i + 1, fn(v), f(dv[i]), f(dv[i] * dv[i])]), ["Suma", fn(suma(x)), f(0), f(ss)])) +
        paso(3, "Varianza y desviación típica", T(`s^2 = \\dfrac{${ft(ss)}}{${n}-1} = ${ft(s2)} \\qquad s = \\sqrt{${ft(s2)}} = ${ft(s)}`)) +
        paso(4, "Error típico de la media", T(`EE = \\dfrac{${ft(s)}}{\\sqrt{${n}}} = ${ft(ee)}`) +
          `<p>Si repitiéramos el estudio muchas veces con 5 personas, las medias se separarían de μ, por término medio, unos <b>${f(ee)}</b> puntos.</p>`) +
        paso(5, "¿Y si la muestra fuera más grande?", `<p>Con σ = 15 en la población:</p>` + tabla(["n", "√n", "EE = 15 / √n"], [[25, 5, "3,00"], [100, 10, "1,50"], [400, 20, "0,75"]]) +
          `<p class="small">Para reducir el error típico <b>a la mitad</b> hay que <b>cuadruplicar</b> n: el error baja con la raíz de n, no con n.</p>`);
    },
    pensar: "Cambia uno de los cinco datos por un valor muy alejado (por ejemplo, 20). ¿Qué le pasa a s y al error típico? ¿Por qué?"
  };

  // ---------------------------------------------------------------- INTERVALOS (curva normal)
  M.intervalos = {
    intro: "La curva normal y su tabla (tabla de Gauss): de dónde sale el <b>1,96</b> y cómo se construye un intervalo de confianza a mano.",
    formulas: `<div class="rejilla c2 prof-fx">
        <div><h4>Puntuación típica z</h4>${T("z = \\dfrac{x-\\mu}{\\sigma}")}<p class="small gris">Cuántas desviaciones típicas se aleja x de la media.</p></div>
        <div><h4>Intervalo de confianza para la media</h4>${T("IC = \\bar{x} \\pm z_{\\alpha/2}\\cdot \\dfrac{s}{\\sqrt{n}}")}<p class="small gris">Para el 95 %: ${t("z_{\\alpha/2} = 1{,}96")}</p></div></div>`,
    fijo: () => `<h3 class="prof-h">A · Usa la tabla de la curva normal</h3>
      <div class="prof-lupa"><div class="prof-campos"><label>Escribe un valor de z<input type="number" step="0.01" id="pz_z" value="1.96"></label>
        <label>Área que quieres<select id="pz_modo"><option value="izq">A la izquierda de z</option><option value="der">A la derecha de z</option><option value="centro">Entre −z y +z</option></select></label></div>
        <div id="pz_res"></div></div>
      <h3 class="prof-h">B · Tres ejercicios resueltos</h3>
      <div class="rejilla c3 prof-ej">
        <div class="tarjeta"><h4>1 · ¿Qué porcentaje está por debajo?</h4><div class="cuerpo"><p>Una escala de ansiedad tiene μ = 50 y σ = 10. ¿Qué porcentaje de personas puntúa por debajo de 65?</p>
          ${T("z = \\dfrac{65-50}{10} = 1{,}50")}<p>Tabla: fila <b>1,5</b>, columna <b>,00</b> → Φ(1,50) = <b>,9332</b>.</p><p>El <b>93,32 %</b> puntúa por debajo de 65.</p></div></div>
        <div class="tarjeta"><h4>2 · ¿Qué porcentaje está entre dos valores?</h4><div class="cuerpo"><p>Con la misma escala, ¿qué porcentaje puntúa entre 40 y 60?</p>
          ${T("z_1 = \\dfrac{40-50}{10} = -1")}${T("z_2 = \\dfrac{60-50}{10} = 1")}<p>Φ(1) = ,8413 y Φ(−1) = 1 − ,8413 = ,1587.</p><p>,8413 − ,1587 = <b>,6827</b> → el <b>68,27 %</b>.</p></div></div>
        <div class="tarjeta"><h4>3 · ¿De dónde sale el 1,96?</h4><div class="cuerpo"><p>Queremos el 95 % central: quedan <b>2,5 %</b> en cada cola.</p>
          <p>Buscamos en la tabla el valor ,9750 (95 % + 2,5 % de la izquierda): está en la fila <b>1,9</b> y la columna <b>,06</b>.</p><p>Por eso ${t("z_{,025} = 1{,}96")}. Para el 99 %, Φ = ,9950 → <b>2,58</b>.</p></div></div>
      </div>
      <h3 class="prof-h">C · Calcula tu intervalo de confianza</h3>`,
    contexto: "Bienestar emocional (0–100) en una muestra de estudiantes. Cambia los valores y observa cómo cambia el intervalo.",
    datos: { m: 72, s: 12, n: 36, conf: 0.95 },
    editor: d => editorCampos(d, [{ k: "m", etiqueta: "Media muestral (x̄)" }, { k: "s", etiqueta: "Desviación típica (s)", min: 0 }, { k: "n", etiqueta: "Tamaño (n)", min: 2 },
      { k: "conf", etiqueta: "Confianza", opciones: [[0.9, "90 %"], [0.95, "95 %"], [0.99, "99 %"]] }]),
    calcular(d) {
      const n = Math.round(d.n); if (n < 2 || d.s <= 0) return `<div class="caja aviso">Revisa los datos: n debe ser al menos 2 y s mayor que 0.</div>`;
      const a = 1 - d.conf, z = E.qnorm(1 - a / 2), ee = d.s / Math.sqrt(n), lo = d.m - z * ee, hi = d.m + z * ee;
      const tc = qt(1 - a / 2, n - 1), lt = d.m - tc * ee, ht = d.m + tc * ee;
      return paso(1, "Error típico", T(`EE = \\dfrac{${ftn(d.s)}}{\\sqrt{${n}}} = ${ft(ee, 3)}`)) +
        paso(2, `Valor crítico para el ${f(d.conf * 100, 0)} %`, `<p>Dejamos ${f(a / 2 * 100, 1)} % en cada cola → buscamos Φ(z) = ${sinCero(f(1 - a / 2, 4))} en la tabla → <b>z = ${f(z, 2)}</b>.</p>`) +
        paso(3, "Margen de error y límites", T(`${ft(d.m)} \\pm ${ft(z)}\\cdot ${ft(ee, 3)} = ${ft(d.m)} \\pm ${ft(z * ee)}`) +
          `<p class="prof-grande">IC ${f(d.conf * 100, 0)} % = [${f(lo)} ; ${f(hi)}]</p>`) +
        `<div class="caja clave"><b>Cómo se lee.</b> Si repitiéramos el muestreo muchas veces, el ${f(d.conf * 100, 0)} % de los intervalos construidos así contendrían la media real de la población. No significa que μ tenga un ${f(d.conf * 100, 0)} % de probabilidad de estar en <i>este</i> intervalo.</div>` +
        `<p class="small gris">Con σ desconocida se usa, en rigor, la <i>t</i> de Student con n − 1 gl (es lo que hace «Explora» con muestras pequeñas): t = ${f(tc, 3)} → [${f(lt)} ; ${f(ht)}]. Con n grande, t y z casi coinciden.</p>`;
    },
    alMontar(cont) {
      const pinta = () => {
        const z = parseFloat(String(cont.querySelector("#pz_z").value).replace(",", ".")), modo = cont.querySelector("#pz_modo").value, r = cont.querySelector("#pz_res");
        if (!isFinite(z)) { r.innerHTML = ""; return; }
        const phi = E.pnorm(z), za = Math.abs(z);
        const area = modo === "izq" ? phi : modo === "der" ? 1 - phi : 2 * E.pnorm(za) - 1;
        const como = modo === "izq" ? `Φ(${f(z)}) = <b>${sinCero(f(phi, 4))}</b>`
          : modo === "der" ? `1 − Φ(${f(z)}) = 1 − ${sinCero(f(phi, 4))} = <b>${sinCero(f(1 - phi, 4))}</b>`
          : `Φ(${f(za)}) − Φ(−${f(za)}) = ${sinCero(f(E.pnorm(za), 4))} − ${sinCero(f(1 - E.pnorm(za), 4))} = <b>${sinCero(f(area, 4))}</b>`;
        r.innerHTML = `<div class="prof-lupa-res">${curva(modo === "der" ? z : z, modo === "centro" ? "centro" : "izq", "Área bajo la curva normal")}
          <div><p>${como}</p><p class="prof-grande">${f(area * 100, 2)} % del área</p>
          ${z < 0 ? `<p class="small">z es negativo: en la tabla buscas ${f(za)} y haces 1 − Φ(${f(za)}).</p>` : ""}
          ${modo === "der" ? `<p class="small gris">El dibujo sombrea la izquierda; el área que buscas es la parte blanca de la derecha.</p>` : ""}</div></div>` +
          desplegable("Ver la tabla de la curva normal (se marca tu valor)", tablaNormal(z), true);
        const celda = r.querySelector("td.marca"), caja = r.querySelector(".prof-tabla .tabla-scroll");
        if (celda && caja) caja.scrollTop = Math.max(0, celda.offsetTop - caja.clientHeight / 2);
      };
      cont.querySelector("#pz_z").addEventListener("input", pinta);
      cont.querySelector("#pz_modo").addEventListener("change", pinta);
      pinta();
    },
    pensar: "¿Qué le pasa a la anchura del intervalo si pasas del 95 % al 99 % de confianza? ¿Y si cuadruplicas n?"
  };

  // ---------------------------------------------------------------- JUICIO (contraste z)
  M.juicio = {
    intro: "El contraste de hipótesis hecho a mano: del dato al estadístico z, del estadístico al valor <i>p</i> y del valor <i>p</i> a la decisión sobre H₀.",
    formulas: `<div class="rejilla c2 prof-fx">
        <div><h4>Estadístico de contraste</h4>${T("z = \\dfrac{\\bar{x}-\\mu_0}{\\sigma/\\sqrt{n}}")}<p class="small gris">μ₀ es el valor que afirma H₀. Mide a cuántos errores típicos está nuestra media de lo que esperaba H₀.</p></div>
        <div><h4>Valor p (bilateral)</h4>${T("p = 2\\cdot\\left[1-\\Phi(|z|)\\right]")}<p class="small gris">Probabilidad de obtener un resultado tan extremo o más <b>si H₀ fuera cierta</b>.</p></div></div>`,
    contexto: "Una escala de bienestar tiene en la población universitaria μ = 50 y σ = 10. Medimos a un grupo de estudiantes que practica mindfulness. ¿Su media difiere de la de la población?",
    datos: { mu: 50, sigma: 10, n: 25, m: 54, alfa: 0.05 },
    editor: d => editorCampos(d, [{ k: "mu", etiqueta: "μ₀ (según H₀)" }, { k: "sigma", etiqueta: "σ de la población", min: 0 }, { k: "n", etiqueta: "Tamaño (n)", min: 2 }, { k: "m", etiqueta: "Media obtenida (x̄)" },
      { k: "alfa", etiqueta: "α", opciones: [[0.05, ",05"], [0.01, ",01"], [0.1, ",10"]] }]),
    calcular(d) {
      const n = Math.round(d.n); if (n < 2 || d.sigma <= 0) return `<div class="caja aviso">Revisa los datos: n debe ser al menos 2 y σ mayor que 0.</div>`;
      const ee = d.sigma / Math.sqrt(n), z = (d.m - d.mu) / ee, phi = E.pnorm(Math.abs(z)), p = 2 * (1 - phi), zc = E.qnorm(1 - d.alfa / 2), sig = p <= d.alfa;
      return paso(1, "Plantea las hipótesis", `<p>H₀: μ = ${fn(d.mu)} (no hay diferencia) · H₁: μ ≠ ${fn(d.mu)} (sí la hay). α = ${sinCero(f(d.alfa, 2))}.</p>`) +
        paso(2, "Calcula el estadístico z", T(`z = \\dfrac{${ftn(d.m)}-${ftn(d.mu)}}{${ftn(d.sigma)}/\\sqrt{${n}}} = \\dfrac{${ft(d.m - d.mu)}}{${ft(ee, 3)}} = ${ft(z)}`)) +
        paso(3, "Busca el valor p con la tabla", `<p>Tabla de la curva normal: Φ(${f(Math.abs(z))}) = ${sinCero(f(phi, 4))}.</p>` +
          T(`p = 2\\cdot(1-${ft(phi, 4)}) = ${ft(p, 4)}`) + `<div class="prof-centro">${curva(Math.abs(z), "colas", "Colas del contraste bilateral")}</div><p class="small gris">Las zonas rojas son el valor p: la probabilidad, bajo H₀, de un resultado al menos tan alejado como el nuestro.</p>`) +
        paso(4, "Decide", `<p>Dos caminos equivalentes: comparar <b>p con α</b> (${pA(p)} ${sig ? "≤" : ">"} ${sinCero(f(d.alfa, 2))}) o comparar <b>|z| con el valor crítico</b> (|z| = ${f(Math.abs(z))} ${Math.abs(z) >= zc ? "≥" : "<"} ${f(zc, 2)}).</p>` +
          decision(sig, `<b>Se rechaza H₀.</b> La media del grupo (${fn(d.m)}) difiere significativamente de ${fn(d.mu)}. Ojo: no hay asignación aleatoria, así que no podemos afirmar que la diferencia se deba al mindfulness.`,
            `<b>No se rechaza H₀.</b> No hay evidencia suficiente de que la media del grupo difiera de ${fn(d.mu)}. No significa que H₀ sea verdadera: el «inocente» queda absuelto por falta de pruebas.`));
    },
    pensar: "Deja la misma diferencia (x̄ = 54) y cambia n a 9 y después a 100. ¿Qué ocurre con z y con p? ¿Qué dice esto del tamaño muestral?"
  };

  // ---------------------------------------------------------------- SUPUESTOS (Levene)
  M.supuestos = {
    intro: "¿Qué calcula la prueba de <b>Levene</b>? Compara cuánto se alejan de su media las puntuaciones de cada grupo. Aquí lo ves con dos grupos de cuatro personas.",
    formulas: `<div class="rejilla c2 prof-fx">
        <div><h4>Paso previo: desviaciones absolutas</h4>${T("Z_{ij} = \\left|x_{ij}-\\bar{x}_j\\right|")}<p class="small gris">Distancia de cada persona a la media de su grupo.</p></div>
        <div><h4>Estadístico de Levene</h4>${T("F = \\dfrac{N-k}{k-1}\\cdot\\dfrac{\\sum_j n_j\\,(\\bar{Z}_j-\\bar{Z})^2}{\\sum_j\\sum_i (Z_{ij}-\\bar{Z}_j)^2}")}<p class="small gris">k = número de grupos; N = total de personas. Es un análisis de varianza sobre las distancias Z.</p></div></div>
      <div class="caja clave"><b>Recuerda:</b> en los supuestos queremos <b>p &gt; ,05</b>. Aquí H₀ dice «las varianzas son iguales»; si no la rechazamos, se cumple la homocedasticidad.</div>`,
    contexto: "Ansiedad ante los exámenes en dos grupos de cuatro estudiantes.",
    datos: { a: [4, 6, 8, 10], b: [2, 6, 10, 14] },
    editor: d => editorVectores(d, [{ k: "a", etiqueta: "Grupo A" }, { k: "b", etiqueta: "Grupo B" }]),
    calcular(d) {
      const g = [d.a, d.b], N = 8, k = 2, ms = g.map(media), Z = g.map((x, j) => x.map(v => Math.abs(v - ms[j]))), mz = Z.map(media), mzT = media(Z.flat());
      const scE = suma(Z.map((z, j) => z.length * (mz[j] - mzT) ** 2)), scD = suma(Z.map((z, j) => suma(z.map(v => (v - mz[j]) ** 2))));
      if (scD === 0) return `<div class="caja aviso">Con estos datos las distancias son idénticas dentro de cada grupo y F no se puede calcular. Cambia algún valor.</div>`;
      const F = (N - k) / (k - 1) * scE / scD, p = 1 - E.pf(F, k - 1, N - k), sig = p <= .05, v = g.map(x => E.varianza(x));
      return paso(1, "Media y varianza de cada grupo", `<p>Grupo A: x̄ = ${f(ms[0])}, s² = ${f(v[0])} · Grupo B: x̄ = ${f(ms[1])}, s² = ${f(v[1])}</p>`) +
        paso(2, "Distancias absolutas a la media de cada grupo", tabla(["Grupo", "x", "Z = |x − x̄|"], g.flatMap((x, j) => x.map((val, i) => [j ? "B" : "A", fn(val), f(Z[j][i])]))) +
          `<p>Media de Z: A = ${f(mz[0])}, B = ${f(mz[1])}; media global ${t("\\bar{Z}")} = ${f(mzT)}.</p>`) +
        paso(3, "Variabilidad entre grupos y dentro de los grupos", T(`\\textstyle\\sum n_j(\\bar{Z}_j-\\bar{Z})^2 = 4(${ft(mz[0])}-${ft(mzT)})^2+4(${ft(mz[1])}-${ft(mzT)})^2 = ${ft(scE)}`) +
          `<p>Suma de cuadrados dentro de los grupos (cada Z frente a la media de su grupo) = <b>${f(scD)}</b>.</p>`) +
        paso(4, "Estadístico F y decisión", T(`F = \\dfrac{8-2}{2-1}\\cdot\\dfrac{${ft(scE)}}{${ft(scD)}} = ${ft(F)}`) +
          `<p>Con gl = (1, 6), el programa da <b>${pA(p)}</b>.</p>` +
          decision(!sig, `<b>p &gt; ,05: no se rechaza H₀.</b> Se cumple el supuesto de homocedasticidad (aunque la varianza de B parezca mayor, con tan pocas personas no hay evidencia suficiente).`,
            `<b>p ≤ ,05: se rechaza H₀.</b> Las varianzas difieren: no se cumple la homocedasticidad. Para dos grupos independientes, el esquema de clase lleva a la U de Mann-Whitney.`)) +
        `<div class="caja"><b>¿Y la normalidad?</b> Shapiro-Wilk (n &lt; 50) compara los datos ordenados con los que esperaríamos de una distribución normal: ${t("W = \\dfrac{(\\sum a_i\\,x_{(i)})^2}{\\sum (x_i-\\bar{x})^2}")}. Los coeficientes ${t("a_i")} salen de tablas especiales, así que se calcula con el programa. W cerca de 1 → datos compatibles con la normalidad.</div>`;
    },
    pensar: "Haz que los dos grupos tengan exactamente la misma dispersión (por ejemplo, B = 5, 7, 9, 11). ¿Cuánto vale F? ¿Por qué?"
  };

  // ---------------------------------------------------------------- ESQUEMA (formulario)
  M.esquema = {
    intro: "Formulario del tema: el estadístico de cada prueba, sus grados de libertad, cómo se decide y cómo se redacta. Útil para repasar antes del examen.",
    fijo: () => `<div class="tabla-scroll"><table class="t-ufv t-prof t-formulario"><tr><th>Prueba</th><th>¿Cuándo?</th><th>Estadístico</th><th>gl / tabla</th><th>Formato APA</th></tr>
      <tr><td><b>Chi-cuadrado</b></td><td>Dos variables categóricas</td><td>${t("\\chi^2=\\sum \\frac{(O-E)^2}{E}")}</td><td>(f − 1)(c − 1) · tabla χ²</td><td>χ²(gl, N = …) = …, p = …</td></tr>
      <tr><td><b>Pearson</b></td><td>Relacionar dos cuantitativas con normalidad</td><td>${t("r=\\frac{\\sum(x-\\bar{x})(y-\\bar{y})}{\\sqrt{\\sum(x-\\bar{x})^2\\sum(y-\\bar{y})^2}}")}</td><td>n − 2 · tabla t</td><td>r(gl) = …, p = …</td></tr>
      <tr><td><b>Spearman</b></td><td>Relacionar sin normalidad u ordinales</td><td>${t("\\rho=1-\\frac{6\\sum d^2}{n(n^2-1)}")}</td><td>n − 2</td><td>ρ(gl) = …, p = …</td></tr>
      <tr><td><b>t independientes</b></td><td>Comparar dos grupos; normalidad y homocedasticidad</td><td>${t("t=\\frac{\\bar{x}_1-\\bar{x}_2}{\\sqrt{s_p^2(\\frac{1}{n_1}+\\frac{1}{n_2})}}")}</td><td>n₁ + n₂ − 2 · tabla t</td><td>t(gl) = …, p = …</td></tr>
      <tr><td><b>U de Mann-Whitney</b></td><td>Comparar dos grupos sin normalidad u homocedasticidad</td><td>${t("U=n_1n_2+\\frac{n_1(n_1+1)}{2}-R_1")}</td><td>tabla U</td><td>U = …, z = …, p = …</td></tr>
      <tr><td><b>t relacionadas</b></td><td>Mismas personas, dos medidas, con normalidad</td><td>${t("t=\\frac{\\bar{d}}{s_d/\\sqrt{n}}")}</td><td>n − 1 · tabla t</td><td>t(gl) = …, p = …</td></tr>
      <tr><td><b>Wilcoxon</b></td><td>Mismas personas, dos medidas, sin normalidad</td><td>T = menor suma de rangos con signo</td><td>tabla T</td><td>z = …, p = …</td></tr>
      </table></div>
      <p class="small gris">En todas: si <b>p ≤ α</b> se rechaza H₀. En los supuestos (Shapiro-Wilk, K-S, Levene) queremos lo contrario: <b>p &gt; ,05</b>.</p>
      <h3 class="prof-h">Tablas de valores críticos</h3>
      ${desplegable("Curva normal (tabla de Gauss)", tablaNormal(null))}
      ${desplegable("t de Student", tablaT(null))}
      ${desplegable("Chi-cuadrado", tablaChi(null))}
      ${desplegable("U de Mann-Whitney", tablaU(null, null))}
      ${desplegable("T de Wilcoxon", tablaW(null))}
      <p class="small">En cada módulo de prueba, la pestaña «Para profundizar» tiene un ejemplo resuelto paso a paso.</p>`
  };

  // ---------------------------------------------------------------- CHI-CUADRADO
  M.chi = {
    intro: "De las frecuencias observadas al χ², los residuos corregidos y la V de Cramer, con una tabla 2 × 2.",
    formulas: `<div class="rejilla c3 prof-fx">
        <div><h4>Frecuencia esperada</h4>${T("E = \\dfrac{\\text{total fila}\\cdot\\text{total columna}}{N}")}<p class="small gris">Lo que esperaríamos si las variables fueran independientes (H₀).</p></div>
        <div><h4>Chi-cuadrado</h4>${T("\\chi^2 = \\sum \\dfrac{(O-E)^2}{E}")}<p class="small gris">gl = (filas − 1)(columnas − 1)</p></div>
        <div><h4>Residuo corregido</h4>${T("R = \\dfrac{O-E}{\\sqrt{E\\,(1-\\frac{f}{N})(1-\\frac{c}{N})}}")}<p class="small gris">f y c: totales de su fila y su columna. |R| &gt; 1,96 → celda significativa.</p></div></div>`,
    contexto: "¿Se asocia practicar deporte con el nivel de ansiedad? 80 estudiantes. Escribe las frecuencias observadas (O).",
    datos: { o: [[10, 30], [25, 15]] },
    editor(d) {
      const c = (i, j) => `<input type="number" min="0" step="1" data-k="o${i}${j}" value="${d.o[i][j]}" aria-label="Frecuencia fila ${i + 1} columna ${j + 1}">`;
      return `<div class="tabla-scroll"><table class="t-ufv t-prof t-editor"><tr><th></th><th>Ansiedad alta</th><th>Ansiedad baja</th></tr><tr><th>Hace deporte</th><td>${c(0, 0)}</td><td>${c(0, 1)}</td></tr><tr><th>No hace deporte</th><td>${c(1, 0)}</td><td>${c(1, 1)}</td></tr></table></div>`;
    },
    leer(cont, d) { const o = [[0, 0], [0, 0]]; cont.querySelectorAll("[data-k^='o']").forEach(el => { const k = el.dataset.k; o[+k[1]][+k[2]] = Math.max(0, Math.round(parseFloat(el.value))); }); return { o }; },
    calcular(d) {
      const O = d.o, fil = O.map(suma), col = [O[0][0] + O[1][0], O[0][1] + O[1][1]], N = suma(fil);
      if (!N || fil.includes(0) || col.includes(0)) return `<div class="caja aviso">Cada fila y cada columna necesita al menos una persona.</div>`;
      const Ee = O.map((r, i) => r.map((_, j) => fil[i] * col[j] / N)), C = O.map((r, i) => r.map((o, j) => (o - Ee[i][j]) ** 2 / Ee[i][j])), chi = suma(C.flat());
      const R = O.map((r, i) => r.map((o, j) => (o - Ee[i][j]) / Math.sqrt(Ee[i][j] * (1 - fil[i] / N) * (1 - col[j] / N))));
      const p = 1 - E.pchisq(chi, 1), sig = p <= .05, V = Math.sqrt(chi / N);
      const filasN = ["Hace deporte", "No hace deporte"], colN = ["Alta", "Baja"];
      const t2 = (M, d2) => tabla(["", "Ansiedad alta", "Ansiedad baja"], M.map((r, i) => [`<b>${filasN[i]}</b>`, ...r.map(v => typeof v === "string" ? v : f(v, d2))]));
      const pocos = Ee.flat().some(v => v < 5);
      return paso(1, "Totales y frecuencias esperadas", t2(O.map((r, i) => r.map(String).concat([])), 0).replace("</table>", `<tr class="t-suma"><td>Total</td><td>${col[0]}</td><td>${col[1]}</td></tr></table>`) +
          `<p>Totales de fila: ${fil[0]} y ${fil[1]} · N = ${N}. Por ejemplo, la primera celda: ${t(`E = \\frac{${fil[0]}\\cdot ${col[0]}}{${N}} = ${ft(Ee[0][0])}`)}</p>` + t2(Ee, 2) +
          (pocos ? `<div class="caja aviso">Hay frecuencias esperadas menores que 5: con tablas tan pequeñas el χ² puede no ser fiable.</div>` : "")) +
        paso(2, "Contribución de cada celda y χ²", t2(C, 3) + T(`\\chi^2 = ${C.flat().map(v => ft(v, 3)).join("+")} = ${ft(chi, 3)}`)) +
        paso(3, "Grados de libertad y decisión", `<p>gl = (2 − 1)(2 − 1) = 1. Valor crítico (α = ,05): <b>3,841</b>. El programa da ${pA(p)}.</p>` +
          desplegable("Ver la tabla de χ²", tablaChi(1)) +
          decision(sig, `<b>${f(chi, 2)} &gt; 3,841: se rechaza H₀.</b> Hay asociación significativa: χ²(1, N = ${N}) = ${f(chi, 2)}, ${pA(p)}.`, `<b>${f(chi, 2)} ≤ 3,841: no se rechaza H₀.</b> No hay evidencia de asociación: χ²(1, N = ${N}) = ${f(chi, 2)}, ${pA(p)}. Sin significación no se interpretan residuos ni V de Cramer.`)) +
        (sig ? paso(4, "¿Dónde está la asociación? Residuos corregidos", `<p>Primera celda:</p>${T(`R = \\dfrac{${ftn(O[0][0])}-${ft(Ee[0][0])}}{\\sqrt{${ft(Ee[0][0])}(1-\\frac{${fil[0]}}{${N}})(1-\\frac{${col[0]}}{${N}})}} = ${ft(R[0][0])}`)}` +
            t2(R.map(r => r.map(v => `${f(v)}${Math.abs(v) > 1.96 ? " ★" : ""}`)), 2) + `<p class="small">★ |R| &gt; 1,96: hay más (R positivo) o menos (R negativo) casos de los esperados si no hubiera relación.</p>`) +
          paso(5, "Tamaño del efecto: V de Cramer", T(`V = \\sqrt{\\dfrac{\\chi^2}{N\\,(k-1)}} = \\sqrt{\\dfrac{${ft(chi, 3)}}{${N}\\cdot 1}} = ${ft(V, 3)}`) + `<p class="small gris">k = el menor entre número de filas y de columnas.</p>`) : "");
    },
    pensar: "Escribe una tabla en la que las proporciones de ansiedad alta sean iguales en las dos filas. ¿Cuánto vale χ²? ¿Por qué?"
  };

  // ---------------------------------------------------------------- CORRELACIONES
  M.correlaciones = {
    intro: "De dónde salen la <b>r de Pearson</b> y la <b>ρ de Spearman</b>: con seis personas puedes hacer todo el cálculo a mano.",
    formulas: `<div class="rejilla c2 prof-fx">
        <div><h4>Pearson</h4>${T("r = \\dfrac{\\sum (x-\\bar{x})(y-\\bar{y})}{\\sqrt{\\sum (x-\\bar{x})^2\\;\\sum (y-\\bar{y})^2}}")}<p class="small gris">El numerador mide si x e y se mueven juntas; el denominador lo escala entre −1 y 1.</p></div>
        <div><h4>Spearman</h4>${T("\\rho = 1-\\dfrac{6\\sum d^2}{n\\,(n^2-1)}")}<p class="small gris">d = diferencia entre el rango de x y el de y. Es Pearson aplicado a los rangos.</p></div></div>
      <div class="prof-fx">${T("t = \\dfrac{r\\sqrt{n-2}}{\\sqrt{1-r^2}} \\qquad gl = n-2")}<p class="small gris centro">Con este t (o directamente con el valor p del programa) decidimos si la correlación es significativa.</p></div>`,
    contexto: "Horas de sueño (x) y puntuación en una prueba de atención (y) de seis estudiantes.",
    datos: { x: [4, 5, 6, 7, 8, 9], y: [10, 14, 12, 18, 20, 19] },
    editor: d => editorVectores(d, [{ k: "x", etiqueta: "Horas de sueño (x)" }, { k: "y", etiqueta: "Atención (y)" }]),
    calcular(d) {
      const x = d.x, y = d.y, n = x.length, mx = media(x), my = media(y), dx = x.map(v => v - mx), dy = y.map(v => v - my);
      const sxy = suma(dx.map((v, i) => v * dy[i])), sxx = suma(dx.map(v => v * v)), syy = suma(dy.map(v => v * v));
      if (!sxx || !syy) return `<div class="caja aviso">Una de las variables no varía (todos los valores son iguales) y la correlación no se puede calcular.</div>`;
      const r = sxy / Math.sqrt(sxx * syy), tt = Math.abs(r) < 1 ? r * Math.sqrt(n - 2) / Math.sqrt(1 - r * r) : Infinity, pe = E.pearson(x, y), sig = pe.p <= .05, tc = qt(.975, n - 2);
      const rx = rangos(x), ry = rangos(y), dd = rx.map((v, i) => v - ry[i]), sd2 = suma(dd.map(v => v * v)), rhoF = 1 - 6 * sd2 / (n * (n * n - 1)), sp = E.spearman(x, y), emp = hayEmpates(x) || hayEmpates(y);
      return `<h3 class="prof-h">Pearson</h3>` +
        paso(1, "Medias", `<p>${t(`\\bar{x} = ${ft(mx)}`)} · ${t(`\\bar{y} = ${ft(my)}`)}</p>`) +
        paso(2, "Tabla de cálculo", tabla(["x", "y", "x − x̄", "y − ȳ", "(x − x̄)(y − ȳ)", "(x − x̄)²", "(y − ȳ)²"],
          x.map((v, i) => [fn(v), fn(y[i]), f(dx[i]), f(dy[i]), f(dx[i] * dy[i]), f(dx[i] ** 2), f(dy[i] ** 2)]), ["", "", "", "Suma", f(sxy), f(sxx), f(syy)])) +
        paso(3, "Coeficiente r", T(`r = \\dfrac{${ft(sxy)}}{\\sqrt{${ft(sxx)}\\cdot ${ft(syy)}}} = ${ft(r, 3)}`) +
          `<p>Dirección <b>${r >= 0 ? "positiva" : "negativa"}</b> e intensidad <b>${intensidad(r)}</b> (|r| = ${sinCero(f(Math.abs(r), 2))}).</p>`) +
        paso(4, "¿Es significativa?", T(`t = \\dfrac{${ft(r, 3)}\\sqrt{${n}-2}}{\\sqrt{1-${ft(r, 3)}^2}} = ${ft(tt)}`) +
          `<p>gl = ${n - 2}; valor crítico (α = ,05): <b>${f(tc, 3)}</b>. El programa da ${pA(pe.p)}.</p>` + desplegable("Ver la tabla de t", tablaT(n - 2)) +
          decision(sig, `<b>Correlación significativa:</b> r(${n - 2}) = ${sinCero(f(r, 2))}, ${pA(pe.p)}. Recuerda: correlación no implica causalidad.`, `<b>No significativa:</b> r(${n - 2}) = ${sinCero(f(r, 2))}, ${pA(pe.p)}. Sin significación no se interpretan dirección ni intensidad.`)) +
        `<h3 class="prof-h">Spearman</h3>` +
        paso(1, "Convierte los datos en rangos y calcula d", tabla(["x", "Rango x", "y", "Rango y", "d", "d²"], x.map((v, i) => [fn(v), fn(rx[i]), fn(y[i]), fn(ry[i]), fn(dd[i]), fn(dd[i] ** 2)]), ["", "", "", "", "Suma", fn(sd2)]) +
          `<p class="small gris">El valor más bajo recibe el rango 1. Si hay empates, cada valor empatado recibe la media de los rangos que ocupan.</p>`) +
        paso(2, "Coeficiente ρ", T(`\\rho = 1-\\dfrac{6\\cdot ${ftn(sd2)}}{${n}\\,(${n}^2-1)} = ${ft(rhoF, 3)}`) +
          (emp ? `<p class="small">Hay empates: la fórmula con d² es una aproximación. El programa calcula ρ = ${sinCero(f(sp.rho, 3))} (Pearson sobre los rangos).</p>` : "") +
          `<p>El programa da ${pA(sp.p)} → ${sp.p <= .05 ? "correlación significativa" : "no significativa"}: ρ(${n - 2}) = ${sinCero(f(sp.rho, 2))}, ${pA(sp.p)}.</p>`);
    },
    pensar: "Cambia el último valor de atención por 2 (un valor atípico). ¿Cuánto cambia Pearson? ¿Y Spearman? ¿Por qué Spearman resiste mejor?"
  };

  // ---------------------------------------------------------------- GRUPOS INDEPENDIENTES
  M.independientes = {
    intro: "La <b>t de Student para muestras independientes</b> y la <b>U de Mann-Whitney</b> calculadas a mano con dos grupos de cinco personas.",
    formulas: `<div class="rejilla c2 prof-fx">
        <div><h4>t de Student</h4>${T("s_p^2 = \\dfrac{(n_1-1)s_1^2+(n_2-1)s_2^2}{n_1+n_2-2}")}${T("t = \\dfrac{\\bar{x}_1-\\bar{x}_2}{\\sqrt{s_p^2\\left(\\frac{1}{n_1}+\\frac{1}{n_2}\\right)}} \\qquad gl = n_1+n_2-2")}</div>
        <div><h4>U de Mann-Whitney</h4>${T("U_1 = n_1 n_2+\\dfrac{n_1(n_1+1)}{2}-R_1")}${T("U = \\min(U_1,\\,U_2) \\qquad U_2 = n_1n_2-U_1")}<p class="small gris">R₁ = suma de los rangos del grupo 1 cuando ordenamos a todas las personas juntas.</p></div></div>`,
    contexto: "Empatía (0–12) en jóvenes que hacen voluntariado (grupo 1) y que no lo hacen (grupo 2).",
    datos: { a: [7, 8, 6, 9, 10], b: [5, 6, 4, 7, 8] },
    editor: d => editorVectores(d, [{ k: "a", etiqueta: "Voluntariado" }, { k: "b", etiqueta: "Sin voluntariado" }]),
    calcular(d) {
      const a = d.a, b = d.b, n1 = a.length, n2 = b.length, m1 = media(a), m2 = media(b), v1 = E.varianza(a), v2 = E.varianza(b), gl = n1 + n2 - 2;
      const sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / gl;
      if (!sp2) return `<div class="caja aviso">No hay variabilidad dentro de los grupos: la t no se puede calcular.</div>`;
      const ee = Math.sqrt(sp2 * (1 / n1 + 1 / n2)), tt = (m1 - m2) / ee, p = 2 * E.pt(-Math.abs(tt), gl), tc = qt(.975, gl), sig = p <= .05, dC = (m1 - m2) / Math.sqrt(sp2);
      const todos = a.concat(b), rg = rangos(todos), r1 = rg.slice(0, n1), r2 = rg.slice(n1), R1 = suma(r1), R2 = suma(r2);
      const U1 = n1 * n2 + n1 * (n1 + 1) / 2 - R1, U2 = n1 * n2 - U1, U = Math.min(U1, U2), uc = U_CRIT[n1] ? U_CRIT[n1][n2 - 4] : null, mw = E.mannWhitney(a, b);
      const ord = todos.map((v, i) => ({ v, g: i < n1 ? "1" : "2", r: rg[i] })).sort((x, y) => x.v - y.v);
      return `<h3 class="prof-h">t de Student</h3>` +
        paso(1, "Medias y varianzas", tabla(["", "n", "x̄", "s²"], [["Voluntariado", n1, f(m1), f(v1)], ["Sin voluntariado", n2, f(m2), f(v2)]])) +
        paso(2, "Varianza combinada", T(`s_p^2 = \\dfrac{${n1 - 1}\\cdot ${ft(v1)}+${n2 - 1}\\cdot ${ft(v2)}}{${gl}} = ${ft(sp2, 3)}`)) +
        paso(3, "Estadístico t", T(`t = \\dfrac{${ft(m1)}-${ft(m2)}}{\\sqrt{${ft(sp2, 3)}\\left(\\frac{1}{${n1}}+\\frac{1}{${n2}}\\right)}} = \\dfrac{${ft(m1 - m2)}}{${ft(ee, 3)}} = ${ft(tt, 3)}`)) +
        paso(4, "Decisión", `<p>gl = ${gl}; valor crítico (α = ,05): <b>${f(tc, 3)}</b>. |t| = ${f(Math.abs(tt), 3)}. El programa da ${pA(p)}.</p>` + desplegable("Ver la tabla de t", tablaT(gl)) +
          decision(sig, `<b>Diferencia significativa:</b> t(${gl}) = ${f(tt, 2)}, ${pA(p)}. Tamaño del efecto: d = ${f(Math.abs(dC), 2)} (${tamD(dC)}).`,
            `<b>No significativa:</b> t(${gl}) = ${f(tt, 2)}, ${pA(p)}. Aunque las medias difieren en ${f(Math.abs(m1 - m2))} puntos, con grupos tan pequeños no hay evidencia suficiente.`)) +
        `<h3 class="prof-h">U de Mann-Whitney</h3>` +
        paso(1, "Ordena a todas las personas juntas y asigna rangos", tabla(["Valor", "Grupo", "Rango"], ord.map(o => [fn(o.v), o.g === "1" ? "Voluntariado" : "Sin voluntariado", fn(o.r)])) +
          `<p>R₁ (voluntariado) = ${r1.map(fn).join(" + ")} = <b>${fn(R1)}</b> · R₂ = <b>${fn(R2)}</b></p>`) +
        paso(2, "Estadístico U", T(`U_1 = ${n1}\\cdot ${n2}+\\dfrac{${n1}\\cdot ${n1 + 1}}{2}-${ftn(R1)} = ${ftn(U1)} \\qquad U_2 = ${n1 * n2}-${ftn(U1)} = ${ftn(U2)}`) + `<p>U = el menor = <b>${fn(U)}</b>.</p>`) +
        paso(3, "Decisión con la tabla", (uc != null ? `<p>Valor crítico para n₁ = ${n1}, n₂ = ${n2}: <b>${uc}</b>. U = ${fn(U)} ${U <= uc ? "≤" : ">"} ${uc}.</p>` + desplegable("Ver la tabla de U", tablaU(n1, n2)) +
          decision(U <= uc, `<b>Se rechaza H₀:</b> las distribuciones difieren. Medianas: ${f(E.mediana(a))} y ${f(E.mediana(b))}.`, `<b>No se rechaza H₀.</b> Medianas: ${f(E.mediana(a))} y ${f(E.mediana(b))}.`) : "") +
          `<p class="small gris">Con muestras grandes el programa usa una aproximación normal: z = ${f(mw.z)}, ${pA(mw.p)}.</p>`);
    },
    pensar: "Suma 3 puntos a todas las personas del grupo de voluntariado. ¿Qué cambia antes, la t o la U? ¿Y si multiplicas por 3 el número de personas manteniendo los valores?"
  };

  // ---------------------------------------------------------------- MUESTRAS RELACIONADAS
  M.relacionadas = {
    intro: "La <b>t para muestras relacionadas</b> y la <b>prueba de Wilcoxon</b>: todo se basa en las <b>diferencias</b> de cada persona entre las dos medidas.",
    formulas: `<div class="rejilla c2 prof-fx">
        <div><h4>t para muestras relacionadas</h4>${T("d_i = x_{\\text{antes}}-x_{\\text{después}}")}${T("t = \\dfrac{\\bar{d}}{s_d/\\sqrt{n}} \\qquad gl = n-1")}</div>
        <div><h4>Wilcoxon</h4><p>Ordena las diferencias por su valor absoluto (sin contar las que valen 0), asigna rangos y devuélveles su signo.</p>${T("T = \\min(W^+,\\,W^-)")}<p class="small gris">W⁺ y W⁻: suma de rangos de las diferencias positivas y negativas.</p></div></div>`,
    contexto: "Ansiedad (0–30) de seis estudiantes antes y después de un taller de relajación.",
    datos: { a: [20, 18, 25, 22, 19, 24], b: [17, 16, 20, 21, 15, 20] },
    editor: d => editorVectores(d, [{ k: "a", etiqueta: "Antes" }, { k: "b", etiqueta: "Después" }]),
    calcular(d) {
      const a = d.a, b = d.b, n = a.length, dd = a.map((v, i) => v - b[i]), md = media(dd), sd = Math.sqrt(E.varianza(dd)), gl = n - 1;
      if (!sd) return `<div class="caja aviso">Todas las diferencias son iguales: s_d = 0 y la t no se puede calcular.</div>`;
      const ee = sd / Math.sqrt(n), tt = md / ee, p = 2 * E.pt(-Math.abs(tt), gl), tc = qt(.975, gl), sig = p <= .05;
      const nz = dd.map((v, i) => ({ v, i })).filter(o => o.v !== 0), rg = rangos(nz.map(o => Math.abs(o.v)));
      let wp = 0, wn = 0; nz.forEach((o, k) => { if (o.v > 0) wp += rg[k]; else wn += rg[k]; });
      const Tw = Math.min(wp, wn), nw = nz.length, tcW = W_CRIT[nw], wil = E.wilcoxon(a, b);
      return `<h3 class="prof-h">t para muestras relacionadas</h3>` +
        paso(1, "Diferencias de cada persona", tabla(["Persona", "Antes", "Después", "d", "d − d̄", "(d − d̄)²"], dd.map((v, i) => [i + 1, fn(a[i]), fn(b[i]), fn(v), f(v - md), f((v - md) ** 2)]),
          ["Suma", "", "", fn(suma(dd)), f(0), f(suma(dd.map(v => (v - md) ** 2)))])) +
        paso(2, "Media y desviación típica de las diferencias", T(`\\bar{d} = \\dfrac{${ftn(suma(dd))}}{${n}} = ${ft(md, 3)} \\qquad s_d = \\sqrt{\\dfrac{${ft(suma(dd.map(v => (v - md) ** 2)), 3)}}{${gl}}} = ${ft(sd, 3)}`)) +
        paso(3, "Estadístico t", T(`t = \\dfrac{${ft(md, 3)}}{${ft(sd, 3)}/\\sqrt{${n}}} = \\dfrac{${ft(md, 3)}}{${ft(ee, 3)}} = ${ft(tt, 3)}`)) +
        paso(4, "Decisión", `<p>gl = ${gl}; valor crítico (α = ,05): <b>${f(tc, 3)}</b>. El programa da ${pA(p)}.</p>` + desplegable("Ver la tabla de t", tablaT(gl)) +
          decision(sig, `<b>Cambio significativo:</b> t(${gl}) = ${f(tt, 2)}, ${pA(p)}. La ansiedad media pasó de ${f(media(a))} a ${f(media(b))}. Sin grupo control, no podemos atribuir el cambio al taller.`,
            `<b>No significativo:</b> t(${gl}) = ${f(tt, 2)}, ${pA(p)}. No hay evidencia suficiente de cambio.`)) +
        `<h3 class="prof-h">Wilcoxon</h3>` +
        paso(1, "Rangos de las diferencias (en valor absoluto)", tabla(["Persona", "d", "|d|", "Rango", "Rango con signo"], nz.map((o, k) => [o.i + 1, fn(o.v), fn(Math.abs(o.v)), fn(rg[k]), (o.v > 0 ? "+" : "−") + fn(rg[k])])) +
          (nz.length < n ? `<p class="small">Se excluyen ${n - nz.length} diferencias iguales a 0.</p>` : "")) +
        paso(2, "Sumas de rangos y T", `<p>W⁺ = <b>${fn(wp)}</b> · W⁻ = <b>${fn(wn)}</b> → T = el menor = <b>${fn(Tw)}</b> (n = ${nw}).</p>`) +
        paso(3, "Decisión con la tabla", (tcW != null ? `<p>Valor crítico para n = ${nw}: <b>${tcW}</b>. T = ${fn(Tw)} ${Tw <= tcW ? "≤" : ">"} ${tcW}.</p>` + desplegable("Ver la tabla de T de Wilcoxon", tablaW(nw)) +
            decision(Tw <= tcW, `<b>Se rechaza H₀:</b> hay un cambio significativo. Medianas: ${f(E.mediana(a))} antes y ${f(E.mediana(b))} después.`, `<b>No se rechaza H₀.</b> Medianas: ${f(E.mediana(a))} antes y ${f(E.mediana(b))} después.`)
          : `<p>Con menos de 6 diferencias distintas de cero, la prueba no puede alcanzar la significación con α = ,05 bilateral.</p>`) +
          `<p class="small gris">El programa informa de la aproximación normal: z = ${f(wil.z)}, ${pA(wil.p)}.</p>`);
    },
    pensar: "Haz que una persona empeore mucho (por ejemplo, después = 30). ¿Qué le pasa a la t? ¿Y a la T de Wilcoxon?"
  };

  // ==================================================================
  // TEMA 3 · ESTADÍSTICA DESCRIPTIVA
  // ==================================================================
  // Cuantil tipo 7 paso a paso: posición = 1 + (n − 1)·p
  function cuantilPasos(s, p) {
    const pos = 1 + (s.length - 1) * p, lo = Math.floor(pos), fr = pos - lo, a = s[lo - 1], b = s[Math.min(lo, s.length - 1)];
    return { pos, lo, fr, a, b, v: a + fr * (b - a) };
  }
  const ordenarN = a => a.slice().sort((x, y) => x - y);
  const ORD_T3 = window.DatosT3 ? window.DatosT3.contar("ansiedad_examenes", window.DatosT3.NIVELES.ansiedad_examenes) : [10, 40, 50, 20];

  M.variables = {
    intro: "Cómo se construye una <b>tabla de frecuencias</b> (absolutas, relativas y acumuladas) y cómo se calculan los porcentajes de una tabla de contingencia.",
    formulas: `<div class="rejilla c2 prof-fx">
        <div><h4>Frecuencias de cada categoría</h4>${T("n_i = \\dfrac{f_i}{n} \\qquad \\%_i = n_i \\cdot 100")}<p class="small gris">f<sub>i</sub> = recuento de la categoría; n = total de personas. Las n<sub>i</sub> suman 1 (100 %).</p></div>
        <div><h4>Frecuencias acumuladas</h4>${T("F_i = f_1 + f_2 + \\dots + f_i \\qquad N_i = \\dfrac{F_i}{n}")}<p class="small gris">Solo tienen sentido si las categorías tienen orden (ordinal o cuantitativa).</p></div></div>
      <div class="prof-fx">${T("\\%\\ \\text{por columna} = \\dfrac{f_{ij}}{\\text{total de la columna } j}\\cdot 100")}<p class="small gris centro">En una tabla de contingencia, el porcentaje se calcula dentro del grupo que quieres comparar.</p></div>`,
    contexto: "Ansiedad ante los exámenes en la clase simulada. Cambia cuántas personas hay en cada categoría.",
    datos: { f: ORD_T3.slice() },
    editor: d => editorVectores(d, [{ k: "f", etiqueta: "Nada · Poco · Bastante · Mucho" }]),
    calcular(d) {
      const cat = ["Nada", "Poco", "Bastante", "Mucho"], fi = d.f.map(v => Math.max(0, Math.round(v))), n = suma(fi);
      if (!n) return `<div class="caja aviso">Pon al menos una persona en alguna categoría.</div>`;
      let F = 0; const filas = cat.map((c, i) => { F += fi[i]; return [c, fi[i], sinCero(f(fi[i] / n, 3)), f(100 * fi[i] / n, 1) + " %", F, f(100 * F / n, 1) + " %"]; });
      const mx = Math.max(...fi), moda = cat.filter((_, i) => fi[i] === mx), pos = n / 2;
      let acc = 0, med = null; for (let i = 0; i < 4; i++) { acc += fi[i]; if (acc >= pos && med === null) med = cat[i]; }
      return paso(1, "Tabla de frecuencias", tabla(["Categoría", "f<sub>i</sub>", "n<sub>i</sub>", "%", "F<sub>i</sub>", "N<sub>i</sub>"], filas, ["Total", n, "1", "100 %", "", ""])) +
        paso(2, "Un cálculo de ejemplo", T(`n_{\\text{Poco}} = \\dfrac{${fi[1]}}{${n}} = ${ft(fi[1] / n, 3)} \\;\\rightarrow\\; ${ft(100 * fi[1] / n, 1)}\\ \\%`) + T(`F_{\\text{Bastante}} = ${fi[0]} + ${fi[1]} + ${fi[2]} = ${fi[0] + fi[1] + fi[2]}`)) +
        paso(3, "Moda y mediana a partir de la tabla", `<p><b>Moda:</b> la categoría con mayor f<sub>i</sub> → «${moda.join("» y «")}» (${mx} personas).</p><p><b>Mediana:</b> la categoría de la persona que ocupa el centro (posición n / 2 = ${f(pos, 1)}). Mira la columna N<sub>i</sub>: la primera categoría que alcanza el 50 % es <b>«${med}»</b>.</p>`);
    },
    pensar: "¿Qué tendría que pasar para que la mediana fuera «Nada»? Pruébalo cambiando las frecuencias."
  };

  M.central = {
    intro: "Media, mediana y moda calculadas a mano, y por qué la media se deja arrastrar por un valor extremo.",
    formulas: `<div class="rejilla c3 prof-fx">
        <div><h4>Media</h4>${T("\\bar{x} = \\dfrac{\\sum x_i}{n}")}</div>
        <div><h4>Posición de la mediana</h4>${T("\\text{pos} = \\dfrac{n+1}{2}")}<p class="small gris">Con n par cae entre dos datos: se hace su media.</p></div>
        <div><h4>Moda</h4><p>El valor (o categoría) con mayor frecuencia. Puede haber más de una o ninguna.</p></div></div>`,
    contexto: "Minutos en TikTok ayer de seis amigas. Prueba a cambiar el último valor.",
    datos: { x: [20, 35, 40, 40, 55, 250] },
    editor: d => editorVectores(d, [{ k: "x", etiqueta: "Minutos" }]),
    calcular(d) {
      const x = d.x, n = x.length, s = ordenarN(x), m = media(x), pos = (n + 1) / 2;
      const md = Number.isInteger(pos) ? s[pos - 1] : (s[Math.floor(pos) - 1] + s[Math.ceil(pos) - 1]) / 2;
      const c = new Map(); x.forEach(v => c.set(v, (c.get(v) || 0) + 1)); const mx = Math.max(...c.values()), modas = mx > 1 ? [...c].filter(e => e[1] === mx).map(e => e[0]) : [];
      const debajo = x.filter(v => v < m).length;
      return paso(1, "Media", T(`\\bar{x} = \\dfrac{${x.map(ftn).join("+")}}{${n}} = \\dfrac{${ftn(suma(x))}}{${n}} = ${ft(m)}`)) +
        paso(2, "Mediana: ordena y busca el centro", `<p>Ordenados: ${s.map((v, i) => (i + 1 === Math.floor(pos) || i + 1 === Math.ceil(pos)) ? `<b class="marca-t">${fn(v)}</b>` : fn(v)).join(", ")}</p>` +
          T(`\\text{pos} = \\dfrac{${n}+1}{2} = ${ft(pos, 1)}`) + `<p>${Number.isInteger(pos) ? `La mediana es el dato que ocupa la posición ${pos}: <b>${fn(md)}</b>.` : `Cae entre las posiciones ${Math.floor(pos)} y ${Math.ceil(pos)}: (${fn(s[Math.floor(pos) - 1])} + ${fn(s[Math.ceil(pos) - 1])}) / 2 = <b>${f(md)}</b>.`}</p>`) +
        paso(3, "Moda", `<p>${modas.length ? `El valor que más se repite: <b>${modas.map(fn).join(" y ")}</b> (${mx} veces).` : "Ningún valor se repite: no hay moda."}</p>`) +
        paso(4, "¿Qué medida describe mejor al grupo?", `<p>${debajo} de las ${n} personas están por debajo de la media.</p>` +
          (Math.abs(m - md) > .2 * Math.abs(md || 1) ? `<div class="caja clave">Media (${f(m)}) y mediana (${f(md)}) se separan: hay valores alejados que arrastran la media. La mediana describe mejor a la persona típica.</div>` : `<div class="caja clave">Media y mediana están cerca: los datos están bastante equilibrados y la media es una buena descripción.</div>`));
    },
    pensar: "Sustituye el 250 por 2.500. ¿Cuánto cambia la media? ¿Y la mediana? ¿Por qué?"
  };

  M.posicion = {
    intro: "Cómo se calculan los <b>cuartiles</b> y los <b>percentiles</b> y cómo se dibuja el diagrama de caja, con sus valores atípicos.",
    formulas: `<div class="rejilla c2 prof-fx">
        <div><h4>Posición del percentil k</h4>${T("\\text{pos} = 1 + (n-1)\\cdot\\dfrac{k}{100}")}<p class="small gris">Si la posición no es entera, se interpola entre los dos datos vecinos. Es el método de esta aplicación (y de R); SPSS usa por defecto (n + 1)·k / 100, así que puede dar valores algo distintos.</p></div>
        <div><h4>Rango intercuartílico y atípicos</h4>${T("RIC = Q_3 - Q_1")}${T("\\text{valla inferior} = Q_1 - 1{,}5\\cdot RIC")}${T("\\text{valla superior} = Q_3 + 1{,}5\\cdot RIC")}<p class="small gris">Los datos fuera de las vallas son atípicos.</p></div></div>`,
    contexto: "Cafés (o bebidas energéticas) a la semana de ocho compañeras.",
    datos: { x: [9, 2, 0, 4, 2, 5, 1, 3] },
    editor: d => editorVectores(d, [{ k: "x", etiqueta: "Cafés" }]),
    calcular(d) {
      const s = ordenarN(d.x), n = s.length, q = [.25, .5, .75].map(p => cuantilPasos(s, p)), ric = q[2].v - q[0].v, li = q[0].v - 1.5 * ric, ls = q[2].v + 1.5 * ric;
      const atip = s.filter(v => v < li || v > ls);
      const fila = (nom, k, c) => [nom, `1 + ${n - 1} · ${sinCero(f(k, 2))} = ${f(c.pos, 2)}`, c.fr ? `${fn(c.a)} + ${sinCero(f(c.fr, 2))} · (${fn(c.b)} − ${fn(c.a)})` : `dato n.º ${c.lo}`, `<b>${f(c.v)}</b>`];
      return paso(1, "Ordena los datos", tabla(["Posición", ...s.map((_, i) => i + 1)], [["Dato", ...s.map(fn)]])) +
        paso(2, "Cuartiles", tabla(["", "Posición", "Cálculo", "Valor"], [fila("Q1 (P25)", .25, q[0]), fila("Q2 (P50)", .5, q[1]), fila("Q3 (P75)", .75, q[2])])) +
        paso(3, "Rango intercuartílico y vallas", T(`RIC = ${ft(q[2].v)} - ${ft(q[0].v)} = ${ft(ric)}`) +
          `<p>Valla inferior: ${f(q[0].v)} − 1,5 · ${f(ric)} = <b>${f(li)}</b> · Valla superior: ${f(q[2].v)} + 1,5 · ${f(ric)} = <b>${f(ls)}</b></p>` +
          `<p>${atip.length ? `<b>Valores atípicos:</b> ${atip.map(fn).join(", ")}. En el diagrama de caja aparecen como puntos sueltos.` : "No hay valores atípicos."}</p>`) +
        paso(4, "El diagrama de caja", cajaSVG(s, q.map(c => c.v), li, ls) + `<p class="small gris">La caja va de Q1 a Q3 (el 50 % central); la línea gruesa es la mediana; los bigotes llegan al dato más extremo dentro de las vallas.</p>`);
    },
    pensar: "Cambia el 9 por un 5. ¿Sigue habiendo algún atípico? ¿Cambia la mediana?"
  };
  function cajaSVG(s, q, li, ls) {
    const W = 340, H = 90, x0 = 20, x1 = W - 20, lo = Math.min(s[0], li), hi = Math.max(s[s.length - 1], ls), X = v => x0 + (v - lo) / ((hi - lo) || 1) * (x1 - x0), y = 40;
    const dentro = s.filter(v => v >= li && v <= ls), bmin = Math.min(...dentro), bmax = Math.max(...dentro);
    let g = `<line x1="${X(bmin)}" x2="${X(q[0])}" y1="${y}" y2="${y}" class="sv-eje"/><line x1="${X(q[2])}" x2="${X(bmax)}" y1="${y}" y2="${y}" class="sv-eje"/>`;
    g += `<rect x="${X(q[0])}" y="${y - 16}" width="${Math.max(1, X(q[2]) - X(q[0]))}" height="32" class="sv-area" stroke="#003865"/><line x1="${X(q[1])}" x2="${X(q[1])}" y1="${y - 16}" y2="${y + 16}" stroke="#003865" stroke-width="3"/>`;
    g += `<line x1="${X(bmin)}" x2="${X(bmin)}" y1="${y - 8}" y2="${y + 8}" class="sv-eje"/><line x1="${X(bmax)}" x2="${X(bmax)}" y1="${y - 8}" y2="${y + 8}" class="sv-eje"/>`;
    s.filter(v => v < li || v > ls).forEach(v => g += `<circle cx="${X(v)}" cy="${y}" r="4" fill="none" stroke="#E5254B" stroke-width="2"/>`);
    [["Q1", q[0]], ["Mdn", q[1]], ["Q3", q[2]]].forEach(([t2, v], i) => g += `<text x="${X(v)}" y="${i === 1 ? y - 22 : y + 32}" class="sv-txt">${t2} = ${f(v)}</text>`);
    return `<svg viewBox="0 0 ${W} ${H}" class="prof-curva" role="img" aria-label="Diagrama de caja">${g}</svg>`;
  }

  M.dispersion = {
    intro: "Rango, varianza y desviación típica paso a paso, con la fórmula de clase (÷ N) y la que usan SPSS y jamovi (÷ n − 1).",
    formulas: `<div class="rejilla c3 prof-fx">
        <div><h4>Rango</h4>${T("R = x_{\\max} - x_{\\min}")}</div>
        <div><h4>Varianza y DT (clase)</h4>${T("\\sigma^2 = \\dfrac{\\sum (x_i-\\mu)^2}{N} \\qquad \\sigma = \\sqrt{\\sigma^2}")}</div>
        <div><h4>DT muestral (SPSS, jamovi)</h4>${T("s = \\sqrt{\\dfrac{\\sum (x_i-\\bar{x})^2}{n-1}}")}</div></div>
      <p class="small">Elevamos al cuadrado para que las distancias negativas no cancelen a las positivas. La raíz final devuelve el resultado a las unidades originales.</p>`,
    contexto: "Horas en redes sociales ayer de seis amigos (grupo B).",
    datos: { x: [0, 1, 2, 4, 5, 6] },
    editor: d => editorVectores(d, [{ k: "x", etiqueta: "Horas" }]),
    calcular(d) {
      const x = d.x, n = x.length, m = media(x), dv = x.map(v => v - m), sc = suma(dv.map(v => v * v)), v2 = sc / n, sd = Math.sqrt(v2), s = Math.sqrt(sc / (n - 1));
      return paso(1, "Media y rango", `<p>${t(`\\mu = \\frac{${ftn(suma(x))}}{${n}} = ${ft(m)}`)} · ${t(`R = ${ftn(Math.max(...x))} - ${ftn(Math.min(...x))} = ${ftn(Math.max(...x) - Math.min(...x))}`)}</p>`) +
        paso(2, "Desviaciones y cuadrados", tabla(["x", "x − μ", "(x − μ)²"], x.map((v, i) => [fn(v), f(dv[i]), f(dv[i] ** 2)]), ["Suma", f(0), f(sc)])) +
        paso(3, "Varianza y desviación típica (clase, ÷ N)", T(`\\sigma^2 = \\dfrac{${ft(sc)}}{${n}} = ${ft(v2)}\\ h^2 \\qquad \\sigma = \\sqrt{${ft(v2)}} = ${ft(sd)}\\ h`) +
          `<p>De media, cada persona se aleja unas <b>${f(sd)} h</b> de la media del grupo.</p>`) +
        paso(4, "La que te dará SPSS o jamovi (÷ n − 1)", T(`s = \\sqrt{\\dfrac{${ft(sc)}}{${n}-1}} = ${ft(s)}\\ h`) + `<p class="small gris">Algo mayor porque divide entre ${n - 1} en lugar de ${n}. Con muestras grandes, la diferencia es pequeña.</p>`);
    },
    pensar: "Escribe seis valores iguales. ¿Cuánto valen la varianza y la DT? ¿Puede la DT ser negativa?"
  };

  M.forma = {
    intro: "Puntuaciones <b>z</b> y la <b>tabla de la curva normal</b> para pasar de una puntuación a un percentil, y cómo se calculan la asimetría y la curtosis.",
    formulas: `<div class="rejilla c3 prof-fx">
        <div><h4>Puntuación típica</h4>${T("z = \\dfrac{x-\\bar{x}}{s}")}<p class="small gris">A cuántas DT está x de la media.</p></div>
        <div><h4>Asimetría (SPSS)</h4>${T("g_1 = \\dfrac{n}{(n-1)(n-2)}\\sum z_i^3")}<p class="small gris">Los cubos conservan el signo: la cola larga pesa más.</p></div>
        <div><h4>Exceso de curtosis (SPSS)</h4>${T("g_2 = \\tfrac{n(n+1)}{(n-1)(n-2)(n-3)}\\sum z_i^4 - \\tfrac{3(n-1)^2}{(n-2)(n-3)}")}<p class="small gris">La normal vale 0.</p></div></div>`,
    fijo: () => {
      const x = [80, 90, 95, 100, 110, 120, 120, 130, 140, 600], n = x.length, m = media(x), s = Math.sqrt(E.varianza(x)), z = x.map(v => (v - m) / s);
      const s3 = suma(z.map(v => v ** 3)), s4 = suma(z.map(v => v ** 4)), g1 = n / ((n - 1) * (n - 2)) * s3, g2 = n * (n + 1) / ((n - 1) * (n - 2) * (n - 3)) * s4 - 3 * (n - 1) ** 2 / ((n - 2) * (n - 3));
      return `<h3 class="prof-h">A · Ejemplo resuelto: asimetría y curtosis</h3>
        <p>Gasto en el último festival de diez amigas (€): ${x.join(", ")}. La décima se compró el glamping.</p>` +
        paso(1, "Media, desviación típica y puntuaciones z", `<p>${t(`\\bar{x} = ${ft(m)}`)} · ${t(`s = ${ft(s)}`)}</p>` +
          tabla(["x", "z", "z³", "z⁴"], x.map((v, i) => [v, f(z[i]), f(z[i] ** 3, 3), f(z[i] ** 4, 3)]), ["Suma", "", f(s3, 3), f(s4, 3)])) +
        paso(2, "Asimetría", T(`g_1 = \\dfrac{${n}}{${n - 1}\\cdot ${n - 2}}\\cdot ${ft(s3, 3)} = ${ft(g1)}`) + `<p>Positiva y muy por encima de 0,5: <b>cola a la derecha</b>, la que forma la amiga del glamping.</p>`) +
        paso(3, "Curtosis", T(`g_2 = \\dfrac{${n}\\cdot ${n + 1}}{${n - 1}\\cdot ${n - 2}\\cdot ${n - 3}}\\cdot ${ft(s4, 3)} - \\dfrac{3\\cdot ${n - 1}^2}{${n - 2}\\cdot ${n - 3}} = ${ft(g2)}`) + `<p>Positiva: <b>leptocúrtica</b>. Un solo valor muy alejado da mucho peso a la cola.</p>`) +
        `<h3 class="prof-h">B · De la puntuación al percentil con la tabla de la curva normal</h3>`;
    },
    contexto: "Una prueba de atención sigue aproximadamente una distribución normal. Cambia la media, la DT o la puntuación.",
    datos: { m: 50, s: 10, x: 63 },
    editor: d => editorCampos(d, [{ k: "m", etiqueta: "Media (M)" }, { k: "s", etiqueta: "DT", min: 0 }, { k: "x", etiqueta: "Puntuación (x)" }]),
    calcular(d) {
      if (!(d.s > 0)) return `<div class="caja aviso">La DT debe ser mayor que 0.</div>`;
      const z = (d.x - d.m) / d.s, zr = Math.round(z * 100) / 100, phi = E.pnorm(zr), za = Math.abs(zr);
      return paso(1, "Calcula z (con dos decimales)", T(`z = \\dfrac{${ftn(d.x)}-${ftn(d.m)}}{${ftn(d.s)}} = ${ft(zr)}`)) +
        paso(2, "Busca z en la tabla", za >= 3.5 ? `<p>|z| ≥ 3,5: fuera de la tabla. Prácticamente ${z > 0 ? "nadie supera" : "nadie queda por debajo de"} esa puntuación.</p>` :
          `<p>Fila <b>${f(Math.floor(za * 10) / 10, 1)}</b>, columna <b>,0${Math.round(za * 100) % 10}</b> → Φ(${f(za)}) = <b>${sinCero(f(E.pnorm(za), 4))}</b>${zr < 0 ? ` · Como z es negativa: Φ(${f(zr)}) = 1 − ${sinCero(f(E.pnorm(za), 4))} = <b>${sinCero(f(phi, 4))}</b>` : ""}.</p>` +
          desplegable("Ver la tabla de la curva normal (se marca tu valor)", tablaNormal(zr), true)) +
        paso(3, "Interpreta", `<div class="prof-centro">${curva(zr, "izq", "Área bajo la curva normal hasta z")}</div><p class="prof-grande">Percentil ≈ ${Math.round(100 * phi)}</p><p>El ${f(100 * phi, 1)} % de las personas puntúa igual o menos que ${fn(d.x)}, y el ${f(100 * (1 - phi), 1)} % puntúa más.</p>`);
    },
    alMontar(cont) { const c = cont.querySelector(".prof-tabla .tabla-scroll"), m = cont.querySelector("td.marca"); if (c && m) c.scrollTop = Math.max(0, m.offsetTop - c.clientHeight / 2); },
    pensar: "¿Qué puntuación hace falta para estar en el percentil 95 si M = 50 y DT = 10? Pista: busca ,9500 dentro de la tabla."
  };

  M.graficos = {
    intro: "Cómo se construye un <b>histograma</b>: cuántos intervalos usar, qué amplitud darles y cómo contar las frecuencias de cada uno.",
    formulas: `<div class="rejilla c2 prof-fx">
        <div><h4>Número de intervalos (regla de Sturges)</h4>${T("k \\approx 1 + 3{,}3\\cdot\\log_{10} n")}<p class="small gris">Es una orientación: los programas usan reglas parecidas.</p></div>
        <div><h4>Amplitud de cada intervalo</h4>${T("a = \\dfrac{x_{\\max}-x_{\\min}}{k}")}<p class="small gris">Cada dato cuenta en el intervalo [inicio, fin); el último incluye el máximo.</p></div></div>`,
    contexto: "Horas de sueño entre semana de 15 estudiantes.",
    datos: { x: [6.5, 7, 7.5, 5, 8, 7, 6, 7.5, 9, 6.5, 7, 4.5, 8.5, 7, 6] },
    editor: d => editorVectores(d, [{ k: "x", etiqueta: "Horas" }]),
    calcular(d) {
      const x = d.x, n = x.length, lo = Math.min(...x), hi = Math.max(...x), kS = 1 + 3.3 * Math.log10(n), k = Math.max(1, Math.round(kS)), a = (hi - lo) / k || 1;
      const c = Array(k).fill(0); x.forEach(v => c[Math.min(k - 1, Math.floor((v - lo) / a + 1e-9))]++);
      const mx = Math.max(...c), W = 340, H = 150, x0 = 30, x1 = W - 10, y1 = 120, bw = (x1 - x0) / k;
      let g = c.map((v, i) => `<rect x="${x0 + i * bw + 1}" y="${y1 - v / mx * 100}" width="${bw - 2}" height="${v / mx * 100}" class="sv-area" stroke="#003865"/><text x="${x0 + i * bw + bw / 2}" y="${y1 - v / mx * 100 - 4}" class="sv-txt">${v}</text>`).join("");
      g += `<line x1="${x0}" x2="${x1}" y1="${y1}" y2="${y1}" class="sv-eje"/>` + c.map((_, i) => `<text x="${x0 + i * bw}" y="${y1 + 14}" class="sv-txt">${f(lo + i * a, 1)}</text>`).join("") + `<text x="${x1}" y="${y1 + 14}" class="sv-txt">${f(hi, 1)}</text>`;
      return paso(1, "¿Cuántos intervalos?", T(`k \\approx 1 + 3{,}3\\cdot\\log_{10} ${n} = ${ft(kS)} \\;\\rightarrow\\; ${k}`)) +
        paso(2, "Amplitud", T(`a = \\dfrac{${ftn(hi)} - ${ftn(lo)}}{${k}} = ${ft(a, 3)}`)) +
        paso(3, "Cuenta cuántos datos caen en cada intervalo", tabla(["Intervalo", "f<sub>i</sub>"], c.map((v, i) => [`[${f(lo + i * a)} ; ${f(lo + (i + 1) * a)}${i === k - 1 ? "]" : ")"}`, v]), ["Total", n])) +
        paso(4, "Dibuja las barras pegadas", `<div class="prof-centro"><svg viewBox="0 0 ${W} ${H}" class="prof-curva" role="img" aria-label="Histograma">${g}</svg></div><p class="small gris">En un histograma las barras van pegadas porque la variable es continua. Con otro número de intervalos, la forma que «ves» cambia.</p>`);
    },
    pensar: "Añade un valor muy extremo cambiando un dato por 14 h. ¿Qué les pasa a la amplitud y al resto de intervalos?"
  };

  // ==================================================================
  // Pintar una pestaña
  // ==================================================================
  function pintar(mod, cont) {
    const P = M[mod]; if (!P) return;
    const editable = !!P.calcular;
    cont.innerHTML = `<div class="prof">
      <div class="prof-cab"><span class="prof-eti">Para profundizar</span><h2 class="titulo-mod">${(window.Contenido && Contenido.MODULOS[mod] ? Contenido.MODULOS[mod].titulo : "")}</h2>
        <p>${P.intro}</p><p class="small gris">Contenido de ampliación: Jamovi y SPSS hacen estos cálculos por ti; aquí ves de dónde salen. Datos simulados.</p></div>
      ${P.formulas ? `<h3 class="prof-h">Las fórmulas</h3>${P.formulas}` : ""}
      ${P.fijo ? P.fijo() : ""}
      ${editable ? `${mod === "intervalos" ? "" : `<h3 class="prof-h">Ejemplo resuelto paso a paso</h3>`}
        <div class="prof-datos"><p><b>Datos:</b> ${P.contexto}</p>${P.editor(P.datos)}
        <p class="small gris">Puedes cambiar los datos: todos los pasos se recalculan. <button type="button" class="enlace-ej prof-reset">Volver al ejemplo</button></p></div>
        <div class="prof-res"></div>` : ""}
      ${P.pensar ? `<div class="caja reto"><b>Para pensar:</b> ${P.pensar}</div>` : ""}
    </div>`;
    if (editable) {
      const datos = cont.querySelector(".prof-datos"), res = cont.querySelector(".prof-res");
      const recalcular = () => {
        const d = P.leer ? P.leer(datos, P.datos) : leer(datos, P.datos);
        if (!valido(d)) { res.innerHTML = `<div class="caja aviso">Completa todas las casillas con números.</div>`; return; }
        res.innerHTML = P.calcular(d); renderTex(res);
      };
      datos.addEventListener("input", recalcular);
      datos.addEventListener("change", recalcular);
      cont.querySelector(".prof-reset").addEventListener("click", () => { datos.querySelector(".tabla-scroll, .prof-campos").outerHTML = P.editor(P.datos); recalcular(); });
      recalcular();
    }
    if (P.alMontar) P.alMontar(cont);
    renderTex(cont);
  }

  window.Profundiza = { tiene: mod => !!M[mod], pintar, _M: M };
})();
