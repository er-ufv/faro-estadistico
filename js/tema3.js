/* =====================================================================
   tema3.js — «Explora» del Tema 3 (estadística descriptiva)
   Laboratorios adaptados de «¿Qué dicen tus datos?» (E. Ramírez, UFV).
   Datos simulados: datos-t3.js.
   ===================================================================== */
(function () {
  "use strict";
  const App = window.App, T = window.DatosT3, E = window.Est;
  const { D, N, NIVELES, CUANTI, V, contar } = T;
  const $ = s => document.querySelector(s);
  const sum = a => a.reduce((s, v) => s + v, 0);
  const mean = a => sum(a) / a.length;
  const sorted = a => [...a].sort((x, y) => x - y);
  const quantile = (a, p) => T.cuantil(a, p);
  const median = a => quantile(a, .5);
  const sdPob = a => { const m = mean(a); return Math.sqrt(mean(a.map(v => (v - m) ** 2))); };
  const sdMue = a => { const m = mean(a); return Math.sqrt(sum(a.map(v => (v - m) ** 2)) / (a.length - 1)); };
  function asimetria(a) { const k = a.length, m = mean(a), m2 = mean(a.map(v => (v - m) ** 2)), m3 = mean(a.map(v => (v - m) ** 3)); return (m3 / m2 ** 1.5) * Math.sqrt(k * (k - 1)) / (k - 2); }
  function curtosis(a) { const k = a.length, m = mean(a), m2 = mean(a.map(v => (v - m) ** 2)), m4 = mean(a.map(v => (v - m) ** 4)), g2 = m4 / m2 ** 2 - 3; return ((k + 1) * g2 + 6) * (k - 1) / ((k - 2) * (k - 3)); }
  const pnorm = z => E.pnorm(z), qnorm = p => E.qnorm(p);
  const fmt = (x, d = 2) => Number(x).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const visible = el => el && el.offsetParent !== null;
  const fb = (cl, html) => `<div class="caja ${cl}">${html}</div>`;

  /* ---------------- Gráficos SVG (del laboratorio original) ---------------- */
let W = 520;
function ancho(el) { W = Math.round(Math.max(320, Math.min(640, el.clientWidth || 520))); }
function niceTicks(lo, hi, n = 5) {
  const span = hi - lo || 1, step0 = span / n, mag = 10 ** Math.floor(Math.log10(step0)), r = step0 / mag;
  const step = (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag; const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}
function svgWrap(h, inner, label) { return `<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(label)}">${inner}</svg>`; }
function ejeX(sc, lo, hi, y, x0, x1, titulo) {
  let s = `<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="#98a2b3"/>`;
  niceTicks(lo, hi).forEach(t => { const x = sc(t); if (x < x0 - 1 || x > x1 + 1) return; s += `<line x1="${x}" x2="${x}" y1="${y}" y2="${y + 5}" stroke="#98a2b3"/><text x="${x}" y="${y + 19}" font-size="13" text-anchor="middle" fill="#475467">${fmt(t, Number.isInteger(t) ? 0 : 1)}</text>`; });
  if (titulo) s += `<text x="${(x0 + x1) / 2}" y="${y + 38}" font-size="13.5" text-anchor="middle" fill="#1d2939">${esc(titulo)}</text>`;
  return s;
}
function lineaV(x, y0, y1, tipo) { return `<line x1="${x}" x2="${x}" y1="${y0}" y2="${y1}" stroke="${tipo === "media" ? "#0b4f8a" : "#b45309"}" stroke-width="3" ${tipo === "mediana" ? 'stroke-dasharray="7 5"' : ""}/>`; }

function barras(el, labels, counts, titulo, destacar = []) {
  ancho(el);
  const fila = 34, h = 16 + labels.length * fila + 10, lw = Math.min(170, W * .38), x0 = lw + 8, x1 = W - 128, tot = sum(counts);
  const pct = counts.map(c => 100 * c / tot), mx = Math.max(...pct), sx = v => x0 + v / mx * (x1 - x0);
  let s = `<line x1="${x0}" x2="${x0}" y1="8" y2="${h - 8}" stroke="#98a2b3"/>`;
  labels.forEach((l, i) => { const y = 14 + i * fila;
    s += `<text x="${x0 - 8}" y="${y + 17}" font-size="13" text-anchor="end" fill="#1d2939">${esc(l.length > 24 ? l.slice(0, 23) + "…" : l)}</text>`;
    const d = destacar.includes(i); s += `<rect x="${x0}" y="${y + 3}" width="${Math.max(1, sx(pct[i]) - x0)}" height="${fila - 10}" fill="${d ? "#003865" : "#6f9bcb"}"/><text x="${sx(pct[i]) + 6}" y="${y + 17}" font-size="12.5" fill="#344054" font-weight="${d ? 700 : 400}">${fmt(pct[i], 1)} % (${counts[i]})${d ? " · moda" : ""}</text>`; });
  el.innerHTML = svgWrap(h, s, titulo || "Gráfico de barras");
}
function histograma(el, a, bins, titulo, lineas = true) {
  ancho(el);
  const h = 290, x0 = 46, x1 = W - 12, y0 = 14, y1 = h - 56, lo = Math.min(...a), hi = Math.max(...a), bw = (hi - lo) / bins || 1;
  const c = Array(bins).fill(0); a.forEach(v => c[Math.min(bins - 1, Math.floor((v - lo) / bw))]++);
  const mx = Math.max(...c) * 1.1, sx = v => x0 + (v - lo) / (hi - lo || 1) * (x1 - x0), sy = v => y1 - v / mx * (y1 - y0);
  let s = `<line x1="${x0}" x2="${x0}" y1="${y0}" y2="${y1}" stroke="#98a2b3"/>`;
  niceTicks(0, mx, 4).forEach(t => s += `<text x="${x0 - 6}" y="${sy(t) + 4}" font-size="12" text-anchor="end" fill="#475467">${t}</text><line x1="${x0}" x2="${x1}" y1="${sy(t)}" y2="${sy(t)}" stroke="#eef0f3"/>`);
  c.forEach((v, i) => s += `<rect x="${sx(lo + i * bw) + .5}" y="${sy(v)}" width="${Math.max(1, sx(lo + (i + 1) * bw) - sx(lo + i * bw) - 1)}" height="${y1 - sy(v)}" fill="#6f9bcb"/>`);
  if (lineas) s += lineaV(sx(mean(a)), y0, y1, "media") + lineaV(sx(median(a)), y0, y1, "mediana");
  s += ejeX(sx, lo, hi, y1, x0, x1, titulo);
  s += `<text x="12" y="${(y0 + y1) / 2}" font-size="12.5" fill="#475467" transform="rotate(-90 12 ${(y0 + y1) / 2})" text-anchor="middle">Frecuencia</text>`;
  el.innerHTML = svgWrap(h, s, "Histograma de " + titulo);
}
function cajas(el, grupos, titulo, tu = null) {
  ancho(el);
  const nombres = Object.keys(grupos), filas = nombres.length, alto = 62, h = 60 + filas * alto, x0 = nombres.length > 1 ? 70 : 20, x1 = W - 16;
  const todos = nombres.flatMap(k => grupos[k]); let lo = Math.min(...todos), hi = Math.max(...todos);
  if (tu !== null && isFinite(tu)) { lo = Math.min(lo, tu); hi = Math.max(hi, tu); }
  const sx = v => x0 + (v - lo) / (hi - lo || 1) * (x1 - x0); let s = "";
  nombres.forEach((k, i) => {
    const a = grupos[k], q1 = quantile(a, .25), q2 = quantile(a, .5), q3 = quantile(a, .75), iqr = q3 - q1;
    const wlo = Math.min(...a.filter(v => v >= q1 - 1.5 * iqr)), whi = Math.max(...a.filter(v => v <= q3 + 1.5 * iqr)), cy = 20 + i * alto + alto / 2;
    if (filas > 1) s += `<text x="${x0 - 8}" y="${cy + 4}" font-size="13" text-anchor="end" fill="#1d2939">${esc(k)}</text>`;
    s += `<line x1="${sx(wlo)}" x2="${sx(q1)}" y1="${cy}" y2="${cy}" stroke="#344054"/><line x1="${sx(q3)}" x2="${sx(whi)}" y1="${cy}" y2="${cy}" stroke="#344054"/>`;
    s += `<line x1="${sx(wlo)}" x2="${sx(wlo)}" y1="${cy - 9}" y2="${cy + 9}" stroke="#344054"/><line x1="${sx(whi)}" x2="${sx(whi)}" y1="${cy - 9}" y2="${cy + 9}" stroke="#344054"/>`;
    s += `<rect x="${sx(q1)}" y="${cy - 18}" width="${Math.max(1, sx(q3) - sx(q1))}" height="36" fill="#dbe7f5" stroke="#003865"/><line x1="${sx(q2)}" x2="${sx(q2)}" y1="${cy - 18}" y2="${cy + 18}" stroke="#003865" stroke-width="3.5"/>`;
    a.filter(v => v < wlo || v > whi).forEach(v => s += `<circle cx="${sx(v)}" cy="${cy}" r="3.5" fill="none" stroke="#344054"/>`);
  });
  if (tu !== null && isFinite(tu)) { const x = sx(tu); s += `<path d="M${x} ${20 + alto / 2 - 26} l-8 -12 h16 z" fill="#b42318"/><text x="${x}" y="${20 + alto / 2 - 41}" font-size="13" font-weight="700" text-anchor="middle" fill="#b42318">Tú</text><line x1="${x}" x2="${x}" y1="${20 + alto / 2 - 24}" y2="${20 + alto / 2 + 24}" stroke="#b42318" stroke-width="2"/>`; }
  s += ejeX(sx, lo, hi, 20 + filas * alto, x0, x1, titulo);
  el.innerHTML = svgWrap(h, s, "Diagrama de caja de " + titulo);
}
function puntos(el, a, lo, hi, titulo, conMediana = true) {
  ancho(el);
  const h = 190, x0 = 20, x1 = W - 16, yb = 120, sx = v => x0 + (v - lo) / (hi - lo) * (x1 - x0), apil = new Map(); let s = "";
  a.forEach(v => { const k = Math.round(sx(v) / 12); const n = apil.get(k) || 0; apil.set(k, n + 1); s += `<circle cx="${sx(v)}" cy="${yb - 9 - n * 15}" r="6.5" fill="#344054"/>`; });
  s += lineaV(sx(mean(a)), 14, yb, "media"); if (conMediana) s += lineaV(sx(median(a)), 14, yb, "mediana");
  s += ejeX(sx, lo, hi, yb, x0, x1, titulo);
  el.innerHTML = svgWrap(h, s, "Gráfico de puntos de " + titulo);
}
function dispersion(el, x, y, tx, ty) {
  ancho(el);
  const h = 320, x0 = 50, x1 = W - 12, y0 = 12, y1 = h - 56, lx = Math.min(...x), hx = Math.max(...x), ly = Math.min(...y), hy = Math.max(...y);
  const sx = v => x0 + (v - lx) / (hx - lx) * (x1 - x0), sy = v => y1 - (v - ly) / (hy - ly) * (y1 - y0);
  let s = `<line x1="${x0}" x2="${x0}" y1="${y0}" y2="${y1}" stroke="#98a2b3"/>`;
  niceTicks(ly, hy, 4).forEach(t => s += `<text x="${x0 - 6}" y="${sy(t) + 4}" font-size="12" text-anchor="end" fill="#475467">${fmt(t, Number.isInteger(t) ? 0 : 1)}</text>`);
  x.forEach((v, i) => s += `<circle cx="${sx(v)}" cy="${sy(y[i])}" r="4.5" fill="#0b4f8a" fill-opacity=".55"/>`);
  s += ejeX(sx, lx, hx, y1, x0, x1, tx) + `<text x="12" y="${(y0 + y1) / 2}" font-size="12.5" fill="#475467" transform="rotate(-90 12 ${(y0 + y1) / 2})" text-anchor="middle">${esc(ty)}</text>`;
  el.innerHTML = svgWrap(h, s, `Diagrama de dispersión de ${tx} y ${ty}`);
}


  const COL_MO = "#5b3fa8";
  function modaInfo(a) { const c = new Map(); a.forEach(v => c.set(v, (c.get(v) || 0) + 1)); const mx = Math.max(...c.values()); return { mx, modas: mx > 1 ? [...c].filter(e => e[1] === mx).map(e => e[0]) : [] }; }
  const txtModa = (a, ud) => { const m = modaInfo(a); return m.modas.length ? m.modas.map(v => fmt(v, 0)).join(" y ") + " " + ud + (m.modas.length > 1 ? " (dos o más modas)" : "") : "no hay (ningún valor se repite)"; };

  /* Gráfico de puntos sobre un balancín: la media es el punto de equilibrio */
  function tcPlot(el, a, lo, hi, titulo) {
    ancho(el);
    const x0 = 24, x1 = W - 16, step = 14, sx = v => x0 + (Math.min(Math.max(v, lo), hi) - lo) / (hi - lo) * (x1 - x0), clave = v => Math.round(sx(v) / 13);
    const cuenta = new Map(); a.forEach(v => cuenta.set(clave(v), (cuenta.get(clave(v)) || 0) + 1));
    const maxN = Math.max(...cuenta.values()), yb = Math.max(130, 62 + maxN * step), h = yb + 88;
    const pil = new Map(); let s = "";
    sorted(a).forEach(v => { const k = clave(v), n = pil.get(k) || 0; pil.set(k, n + 1); s += `<circle cx="${sx(v)}" cy="${yb - 9 - n * step}" r="6.5" fill="#344054"/>`; });
    const m = mean(a), md = median(a), xm = sx(m), xmd = sx(md), cerca = Math.abs(xm - xmd) < 70;
    s += `<line x1="${x0}" x2="${x1}" y1="${yb + 1}" y2="${yb + 1}" stroke="#667085" stroke-width="3"/>`;
    s += `<polygon points="${xm},${yb + 3} ${xm - 11},${yb + 22} ${xm + 11},${yb + 22}" fill="#0b4f8a"/>`;
    s += `<line x1="${xmd}" x2="${xmd}" y1="34" y2="${yb}" stroke="#b45309" stroke-width="3" stroke-dasharray="7 5"/><text x="${xmd}" y="${cerca ? 14 : 28}" font-size="13" font-weight="700" text-anchor="${xmd < x0 + 40 ? "start" : "middle"}" fill="#b45309">Mdn ${fmt(md, 1)}</text>`;
    s += `<line x1="${xm}" x2="${xm}" y1="34" y2="${yb}" stroke="#0b4f8a" stroke-width="3"/><text x="${xm}" y="28" font-size="13" font-weight="700" text-anchor="${xm < x0 + 40 ? "start" : "middle"}" fill="#0b4f8a">M ${fmt(m, 1)}</text>`;
    const mo = modaInfo(a), hechos = new Set();
    if (mo.modas.length && mo.modas.length <= 3) mo.modas.forEach(v => { const k = clave(v); if (hechos.has(k)) return; hechos.add(k);
      s += `<text x="${sx(v) + 11}" y="${yb - 9 - (cuenta.get(k) - 1) * step + 4}" font-size="12.5" font-weight="700" fill="${COL_MO}">Mo</text>`; });
    s += ejeX(sx, lo, hi, yb + 30, x0, x1, titulo);
    el.innerHTML = svgWrap(h, s, "Gráfico de puntos con la media como punto de equilibrio: " + titulo);
  }

  /* ================================================================ 1 · VARIABLES */
  function t3Frec() {
    const v = $("#t3Var").value, niv = NIVELES[v], fi = contar(v, niv), acum = $("#t3Acum").checked;
    let F = 0, html = `<table class="t-ufv"><tr><th>Categoría</th><th>fi</th><th>ni (%)</th>${acum ? "<th>Fi</th><th>Ni (%)</th>" : ""}</tr>`;
    niv.forEach((l, i) => { F += fi[i]; html += `<tr><td class="fila">${esc(l)}</td><td>${fi[i]}</td><td>${fmt(100 * fi[i] / N, 1)}</td>${acum ? `<td>${F}</td><td>${fmt(100 * F / N, 1)}</td>` : ""}</tr>`; });
    html += `<tr class="t-suma"><td class="fila"><b>Total</b></td><td><b>${N}</b></td><td><b>100,0</b></td>${acum ? "<td></td><td></td>" : ""}</tr></table>`;
    $("#t3Tabla").innerHTML = html;
    $("#t3Aviso").innerHTML = acum && v !== "ansiedad_examenes" ? fb("aviso", "<b>Cuidado:</b> esta variable es nominal; el orden de las categorías es arbitrario, así que las frecuencias acumuladas no significan nada.") : "";
    barras($("#t3Barras"), niv, fi, "Distribución de " + $("#t3Var").selectedOptions[0].text);
  }
  function t3Conting() {
    const rel = $("#t3Cruce").value === "rel";
    const fv = rel ? "relacion_preferida" : "ansiedad_examenes", cv = rel ? "sexo" : "estudia_y_trabaja";
    const filas = NIVELES[fv], cols = rel ? ["Mujer", "Hombre", "Otro / prefiere no decirlo"] : ["Sí", "No"];
    const t = filas.map(f => cols.map(c => D[fv].filter((x, i) => x === f && D[cv][i] === c).length));
    const totC = cols.map((_, j) => sum(t.map(r => r[j]))), totF = t.map(r => sum(r)), modo = $("#t3Pct").value;
    const val = (i, j) => modo === "rec" ? t[i][j] : fmt(100 * t[i][j] / (modo === "col" ? totC[j] : modo === "fila" ? totF[i] : N), 1) + " %";
    let h = `<table class="t-ufv"><tr><th>${rel ? "Modelo de relación \\ Sexo" : "Ansiedad \\ ¿Estudia y trabaja?"}</th>${cols.map(c => `<th>${esc(c)}</th>`).join("")}${modo === "fila" || modo === "rec" ? "<th>Total fila</th>" : ""}</tr>`;
    filas.forEach((f, i) => h += `<tr><td class="fila">${esc(f)}</td>${cols.map((_, j) => `<td>${val(i, j)}</td>`).join("")}${modo === "rec" ? `<td>${totF[i]}</td>` : modo === "fila" ? "<td>100 %</td>" : ""}</tr>`);
    h += `<tr class="t-suma"><td class="fila"><em>n del grupo</em></td>${totC.map(x => `<td><em>${x}</em></td>`).join("")}${modo === "fila" || modo === "rec" ? `<td><em>${N}</em></td>` : ""}</tr></table>`;
    $("#t3Conting").innerHTML = h;
  }
  function descargarCSV() {
    const cols = Object.keys(D), q = v => typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v;
    const csv = "﻿" + [cols.join(",")].concat(D.id.map((_, i) => cols.map(c => q(D[c][i])).join(","))).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = "encuesta_genz_simulada.csv";
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ================================================================ 2 · TENDENCIA CENTRAL */
  const TIKTOK0 = [20, 35, 40, 40, 55, 250];
  function t3Tiktok() {
    const a = TIKTOK0.map((_, i) => +$("#t3x" + i).value); a.forEach((v, i) => $("#t3xv" + i).textContent = v);
    tcPlot($("#t3TkPlot"), a, 0, 300, "Minutos en TikTok ayer");
    const m = mean(a), md = median(a);
    $("#t3TkStats").innerHTML = `<b>Media:</b> ${fmt(m, 1)} min · <b>Mediana:</b> ${fmt(md, 1)} min · <b>Moda:</b> ${txtModa(a, "min")}`;
    const reto = document.querySelector("input[name=t3Reto]:checked").value, mo = modaInfo(a);
    const ok = { a: Math.abs(m - md) < .5, b: m > 100 && md < 50, c: mo.modas.length === 2 }[reto];
    const pista = { a: "Coloca los datos de forma equilibrada a los dos lados del centro, por ejemplo 20, 30, 40, 50, 60 y 70.", b: "Deja a cuatro amigas con pocos minutos y sube muchísimo a una o dos.", c: "Pon dos parejas de amigas con los mismos minutos, y que no haya ningún otro valor repetido tantas veces." }[reto];
    $("#t3TkReto").innerHTML = ok ? fb("prof-si", `<b>¡Reto conseguido!</b> ${reto === "b" ? "¿Ves cómo la media puede describir a alguien que no existe en el grupo?" : reto === "a" ? "Cuando los datos están equilibrados a los dos lados, la media y la mediana coinciden." : "Un grupo puede tener más de una moda."}`)
      : fb("aviso", `<b>Aún no.</b> <em>Pista:</em> ${pista}`);
  }
  const BASE_FEST = [80, 90, 95, 100, 110, 120, 120, 130, 140];
  function t3Glamping() {
    const e = +$("#t3Ext").value, a = [...BASE_FEST, e]; $("#t3ExtVal").textContent = fmt(e, 0);
    tcPlot($("#t3GlPlot"), a, 50, 2050, "Gasto en el festival (€)");
    $("#t3GlStats").innerHTML = `<b>Media:</b> ${fmt(mean(a), 1)} € · <b>Mediana:</b> ${fmt(median(a), 1)} € · <b>Moda:</b> ${txtModa(a, "€")}`;
    $("#t3GlFb").innerHTML = e < 300 ? `<p class="small gris">Mueve el deslizador hacia la derecha y observa el triángulo de equilibrio.</p>`
      : fb("clave", "<b>¿Lo ves?</b> Una sola persona muy alejada arrastra la media: el triángulo se desplaza para que el balancín no se caiga. La mediana y la moda casi no se mueven, porque solo miran quién está en el medio de la fila y qué valor se repite.");
  }
  function notasSesgo(s) {
    const n = 200, a = s * .8, out = [];
    for (let i = 0; i < n; i++) { const z = qnorm((i + .5) / n), g = Math.abs(a) < 1e-6 ? z : (Math.exp(a * z) - 1) / a; out.push(Math.min(100, Math.max(0, 50 - 15 * s + 10 * g))); }
    return out;
  }
  function t3Sesgo() {
    const s = +$("#t3S").value, a = notasSesgo(s), el = $("#t3SPlot");
    $("#t3SVal").textContent = s > .15 ? "difícil" : s < -.15 ? "fácil" : "equilibrado";
    ancho(el);
    const h = 280, x0 = 40, x1 = W - 12, y0 = 52, y1 = h - 56, bins = 25, bw = 4, c = Array(bins).fill(0);
    a.forEach(v => c[Math.min(bins - 1, Math.floor(v / bw))]++);
    const k = c.indexOf(Math.max(...c)), mo = k * bw + bw / 2, m = mean(a), md = median(a);
    const mx = Math.max(...c) * 1.05, sx = v => x0 + v / 100 * (x1 - x0), sy = v => y1 - v / mx * (y1 - y0);
    let sv = "";
    c.forEach((v, i) => sv += `<rect x="${sx(i * bw) + .5}" y="${sy(v)}" width="${sx(bw) - sx(0) - 1}" height="${y1 - sy(v)}" fill="${i === k ? "#9e8bd1" : "#6f9bcb"}"/>`);
    sv += `<line x1="${sx(mo)}" x2="${sx(mo)}" y1="${y0 - 8}" y2="${y1}" stroke="${COL_MO}" stroke-width="3" stroke-dasharray="2 4"/><text x="${sx(mo)}" y="40" font-size="13" font-weight="700" text-anchor="middle" fill="${COL_MO}">Mo</text>`;
    sv += `<line x1="${sx(md)}" x2="${sx(md)}" y1="${y0 - 22}" y2="${y1}" stroke="#b45309" stroke-width="3" stroke-dasharray="7 5"/><text x="${sx(md)}" y="26" font-size="13" font-weight="700" text-anchor="middle" fill="#b45309">Mdn</text>`;
    sv += `<line x1="${sx(m)}" x2="${sx(m)}" y1="${y0 - 36}" y2="${y1}" stroke="#0b4f8a" stroke-width="3"/><text x="${sx(m)}" y="12" font-size="13" font-weight="700" text-anchor="middle" fill="#0b4f8a">M</text>`;
    sv += ejeX(sx, 0, 100, y1, x0, x1, "Nota del examen");
    el.innerHTML = svgWrap(h, sv, "Histograma de notas con media, mediana y moda");
    const orden = s > .15 ? `<b>Examen difícil:</b> la mayoría saca notas bajas y unas pocas personas sacan notas altas (cola hacia la derecha). Orden: <b>moda &lt; mediana &lt; media</b>. La cola «tira» de la media hacia arriba.`
      : s < -.15 ? `<b>Examen fácil:</b> la mayoría saca notas altas y unas pocas suspenden con notas muy bajas (cola hacia la izquierda). El orden se invierte: <b>media &lt; mediana &lt; moda</b>.`
      : `<b>Examen equilibrado:</b> las notas se reparten casi igual a los dos lados, así que <b>media, mediana y moda casi coinciden</b>.`;
    $("#t3SStats").innerHTML = `Media = ${fmt(m, 1)} · Mediana = ${fmt(md, 1)} · Moda ≈ ${fmt(mo, 0)} (centro de la barra más alta)<br>${orden}`;
  }
  const ORD0 = contar("ansiedad_examenes", NIVELES.ansiedad_examenes);
  function t3Ord() {
    const lab = NIVELES.ansiedad_examenes, c = lab.map((_, i) => +$("#t3o" + i).value), n = sum(c), el = $("#t3OrdPlot");
    c.forEach((v, i) => $("#t3ov" + i).textContent = v);
    if (!n) { el.innerHTML = ""; $("#t3OrdTxt").innerHTML = fb("aviso", "Pon al menos una persona en alguna categoría."); return; }
    ancho(el);
    const x0 = 10, x1 = W - 10, h = 150, col = ["#dbe7f5", "#a9c4e4", "#5f8fc4", "#003865"], txt = ["#1d2939", "#1d2939", "#fff", "#fff"], sx = p => x0 + p * (x1 - x0);
    let acc = 0, s = "";
    c.forEach((v, i) => { const a0 = acc / n, a1 = (acc + v) / n; acc += v; const w = sx(a1) - sx(a0);
      if (v) s += `<rect x="${sx(a0)}" y="40" width="${w}" height="54" fill="${col[i]}" stroke="#fff" stroke-width="1.5"/>`;
      if (w > 58) s += `<text x="${(sx(a0) + sx(a1)) / 2}" y="63" font-size="12.5" font-weight="700" text-anchor="middle" fill="${txt[i]}">${lab[i]}</text><text x="${(sx(a0) + sx(a1)) / 2}" y="81" font-size="12" text-anchor="middle" fill="${txt[i]}">${fmt(100 * v / n, 0)} %</text>`; });
    s += `<line x1="${sx(.5)}" x2="${sx(.5)}" y1="26" y2="104" stroke="#b42318" stroke-width="3" stroke-dasharray="6 4"/><text x="${sx(.5)}" y="18" font-size="13" font-weight="700" text-anchor="middle" fill="#b42318">50 %: la persona del medio</text>`;
    [0, .25, .5, .75, 1].forEach(p => s += `<text x="${sx(p)}" y="124" font-size="12" text-anchor="${p === 0 ? "start" : p === 1 ? "end" : "middle"}" fill="#475467">${p * 100} %</text>`);
    s += `<text x="${sx(0)}" y="142" font-size="12" fill="#475467">← nada de ansiedad</text><text x="${sx(1)}" y="142" font-size="12" text-anchor="end" fill="#475467">mucha ansiedad →</text>`;
    el.innerHTML = svgWrap(h, s, "Barra apilada de la ansiedad con la línea del 50 %");
    const cat = pos => { let a = 0; for (let i = 0; i < c.length; i++) { a += c[i]; if (pos <= a) return lab[i]; } };
    const p1 = n % 2 ? (n + 1) / 2 : n / 2, p2 = n % 2 ? p1 : n / 2 + 1, m1 = cat(p1), m2c = cat(p2);
    const mx = Math.max(...c), modas = lab.filter((_, i) => c[i] === mx);
    const medTxt = m1 === m2c ? `<b>Mediana: «${m1}».</b> Con ${n} personas en fila, ${n % 2 ? `la del medio es la n.º ${p1}` : `las del medio son la n.º ${p1} y la n.º ${p2}`}, y ${n % 2 ? "está" : "están"} en «${m1}».`
      : `<b>Mediana: entre «${m1}» y «${m2c}».</b> Las dos personas del medio (n.º ${p1} y ${p2}) caen en categorías distintas.`;
    $("#t3OrdTxt").innerHTML = `<p>${medTxt} <b>Moda:</b> «${modas.join("» y «")}» (${mx} personas).</p><p class="small gris">Con categorías no se puede calcular la media: no podemos sumar «poco» + «mucho». La mediana sí funciona porque solo necesita poder ordenar.</p>`;
  }
  function t3Moda() { const niv = NIVELES.genero_musical, c = contar("genero_musical", niv), mx = Math.max(...c); barras($("#t3ModaPlot"), niv, c, "Género musical favorito", c.map((v, i) => v === mx ? i : -1).filter(i => i >= 0)); }

  /* ================================================================ 3 · POSICIÓN */
  const P_VARS = ["horas_movil_dia", "horas_sueno", "minutos_trayecto", "cafes_semana", "horas_gaming_sem"];
  function t3Pos(reset) {
    const v = $("#t3PVar").value, a = D[v];
    if (reset || !$("#t3PVal").value) $("#t3PVal").value = String(Math.round(median(a))).replace(".", ",");
    const tu = parseFloat(String($("#t3PVal").value).replace(",", "."));
    cajas($("#t3PBox"), { "": a }, CUANTI[v].et, isFinite(tu) ? tu : null);
    $("#t3PCuart").innerHTML = `<b>Q1 (P25)</b> = ${fmt(quantile(a, .25), 1)} · <b>Q2 (P50)</b> = ${fmt(quantile(a, .5), 1)} · <b>Q3 (P75)</b> = ${fmt(quantile(a, .75), 1)}`;
    if (isFinite(tu)) { const pr = Math.round(100 * a.filter(x => x <= tu).length / a.length);
      $("#t3PTexto").innerHTML = fb("clave", `<b>Estás aproximadamente en el percentil ${pr}.</b> Con ${fmt(tu, 1)} ${CUANTI[v].ud}, tu valor es igual o superior al de ≈${pr} % de la clase.`); }
    else $("#t3PTexto").innerHTML = "";
  }

  /* ================================================================ 4 · DISPERSIÓN */
  const GRUPOS = { A: [2, 3, 3, 3, 3, 4], B: [0, 1, 2, 4, 5, 6] };
  function t3Disp() {
    const x = [...document.querySelectorAll("#t3DInputs input")].map(i => parseFloat(i.value.replace(",", ".")));
    if (x.some(v => !isFinite(v))) { $("#t3DEstado").innerHTML = fb("aviso", "Rellena los seis valores."); return; }
    const m = mean(x), s = sdPob(x), r = Math.max(...x) - Math.min(...x), reto = document.querySelector("input[name=t3DReto]:checked").value;
    puntos($("#t3DPlot"), x, Math.min(0, ...x), Math.max(8, ...x), "Horas en redes ayer", false);
    $("#t3DTabla").innerHTML = `<table class="t-ufv"><tr><th>Media</th><th>Rango</th><th>Varianza (clase, ÷ N)</th><th>DT (clase, ÷ N)</th><th>DT de SPSS/jamovi (÷ n − 1)</th></tr><tr><td>${fmt(m)}</td><td>${fmt(r)}</td><td>${fmt(s * s)}</td><td>${fmt(s)}</td><td>${fmt(sdMue(x))}</td></tr></table>`;
    const m3ok = Math.abs(m - 3) < .005;
    const cond = { r1: m3ok && s < .005, r2: m3ok && s > 2.5, r3: m3ok && Math.abs(r - 6) < .005 && s < 1.8 }[reto];
    const pista = { r1: "Si todos tienen exactamente el mismo valor, nadie se aleja de la media.", r2: "Lleva a la mitad del grupo a un extremo y a la otra mitad al otro, manteniendo la suma en 18.", r3: "Pon un 0 y un 6 para fijar el rango; el resto, lo más cerca posible de la media." }[reto];
    $("#t3DEstado").innerHTML = cond ? fb("prof-si", "<b>¡Reto conseguido!</b> Prueba el siguiente o explica por qué funciona.")
      : fb("aviso", `<b>Aún no.</b> ${m3ok ? "" : `La media es ${fmt(m)}; la suma debe ser 18. `}<em>Pista:</em> ${pista}`);
  }
  function cargarGrupo(k) { document.querySelectorAll("#t3DInputs input").forEach((inp, i) => inp.value = GRUPOS[k][i]); t3Disp(); }

  /* ================================================================ 5 · FORMA */
  let prediccion = null;
  function t3Fest() {
    const md = median(D.gasto_festivales);
    $("#t3FRes").innerHTML = prediccion === null ? "" : `<div class="caja clave"><p>La media del gasto es <b>${fmt(V.mediaFest, 0)} €</b>, pero la mediana es <b>${fmt(md, 0)} €</b>. Solo el <b>${fmt(V.pctSobre, 0)} %</b> de la clase gastó más que la media.</p><p>Tu predicción fue <b>${prediccion} %</b>. ${Math.abs(prediccion - V.pctSobre) <= 8 ? "¡Muy cerca!" : "Mucha gente responde «50 %» porque confunde la media con la mediana: el 50 % está por encima de la <i>mediana</i>, no de la media."}</p></div>`;
    const box = $("#t3FHist"); box.parentElement.classList.toggle("oculto", prediccion === null);
    if (prediccion !== null) histograma(box, D.gasto_festivales, 20, CUANTI.gasto_festivales.et);
  }
  const DESC = {
    gasto_festivales: "Mucha gente gasta poco (o una sola entrada) y unas pocas personas van a todos los festivales del verano.",
    nota_pau: "Nota de admisión de quienes han entrado en Psicología: hay una nota de corte y el máximo es 14.",
    horas_sueno: "Horas de sueño entre semana: la mayoría duerme alrededor de 7 h.",
    horas_gaming_sem: "Horas de videojuegos a la semana: bastantes personas no juegan nada y unas pocas juegan muchísimo.",
    minutos_trayecto: "Minutos de trayecto a la universidad: casi nadie tarda menos de 15 min; algunas personas vienen desde muy lejos."
  };
  let formaRevelada = false;
  function t3FormaReset() { $("#t3FoDesc").textContent = DESC[$("#t3FoVar").value]; formaRevelada = false; $("#t3FoBox").classList.add("oculto"); $("#t3FoRes").innerHTML = ""; document.querySelectorAll("input[name=t3FoPred]").forEach(r => r.checked = false); }
  function t3FormaRevelar() {
    const pred = document.querySelector("input[name=t3FoPred]:checked")?.value;
    if (!pred) { $("#t3FoRes").innerHTML = fb("aviso", "Primero haz tu predicción."); return; }
    const a = D[$("#t3FoVar").value], g1 = asimetria(a), g2 = curtosis(a), real = g1 > .5 ? "pos" : g1 < -.5 ? "neg" : "sim";
    const nom = { pos: "positiva", sim: "aproximadamente simétrica", neg: "negativa" }, ok = pred === real;
    $("#t3FoRes").innerHTML = fb(ok ? "prof-si" : "prof-no", `<b>${ok ? "Bien predicho." : "Tu predicción no coincide."}</b> Asimetría = ${fmt(g1)} → ${nom[real]}. Exceso de curtosis = ${fmt(g2)}. Media = ${fmt(mean(a), 1)}; mediana = ${fmt(median(a), 1)}.${ok ? "" : " Recuerda: el signo lo marca la cola (el lado largo y poco poblado), no el lado donde se amontonan los datos."}`);
    formaRevelada = true; $("#t3FoBox").classList.remove("oculto"); t3FormaHist();
  }
  function t3FormaHist() { if (!formaRevelada) return; const b = +$("#t3FoBins").value; $("#t3FoBinsVal").textContent = b; histograma($("#t3FoHist"), D[$("#t3FoVar").value], b, CUANTI[$("#t3FoVar").value].et); }
  function t3Normal() {
    const x = +$("#t3NX").value; $("#t3NXVal").textContent = x; ancho($("#t3NPlot"));
    const h = 230, x0 = 20, x1 = W - 20, yb = 175, sx = v => x0 + (v - 15) / 70 * (x1 - x0), dn = v => Math.exp(-(((v - 50) / 10) ** 2) / 2), sy = v => yb - dn(v) * 150;
    let pts = [], area = [`${sx(15)},${yb}`];
    for (let v = 15; v <= 85.01; v += .5) { pts.push(`${sx(v)},${sy(v)}`); if (v <= x) area.push(`${sx(v)},${sy(v)}`); }
    area.push(`${sx(x)},${sy(x)}`, `${sx(x)},${yb}`);
    let s = `<polygon points="${area.join(" ")}" fill="#c9daee"/><polyline points="${pts.join(" ")}" fill="none" stroke="#003865" stroke-width="2.5"/>`;
    s += `<line x1="${sx(50)}" x2="${sx(50)}" y1="${yb}" y2="${sy(50)}" stroke="#667085" stroke-dasharray="3 4"/><line x1="${sx(x)}" x2="${sx(x)}" y1="${yb}" y2="${sy(x) - 10}" stroke="#b42318" stroke-width="2.5"/>`;
    [20, 30, 40, 50, 60, 70, 80].forEach(t => s += `<line x1="${sx(t)}" x2="${sx(t)}" y1="${yb}" y2="${yb + 5}" stroke="#98a2b3"/><text x="${sx(t)}" y="${yb + 19}" font-size="13" text-anchor="middle" fill="#475467">${t}</text>`);
    s += `<line x1="${x0}" x2="${x1}" y1="${yb}" y2="${yb}" stroke="#98a2b3"/><text x="${W / 2}" y="${yb + 40}" font-size="13.5" text-anchor="middle">Puntuación en atención (M = 50, DT = 10)</text>`;
    $("#t3NPlot").innerHTML = svgWrap(h, s, "Curva normal con el área por debajo de la puntuación elegida");
    const z = (x - 50) / 10, pc = 100 * pnorm(z);
    $("#t3NZ").innerHTML = `<b>z</b> = (${x} − 50) / 10 = ${fmt(z)} · <b>Área sombreada:</b> ≈ ${fmt(pc, 1)} % puntúa igual o menos (percentil ≈ ${Math.round(pc)}).`;
  }

  /* ================================================================ 6 · GRÁFICOS */
  function t3Graf() {
    const t = $("#t3GTipo").value, el = $("#t3GPlot");
    if (t === "barras") barras(el, NIVELES.red_favorita, contar("red_favorita", NIVELES.red_favorita), "Red social favorita");
    if (t === "hist") histograma(el, D.horas_sueno, 12, "Horas de sueño entre semana", false);
    if (t === "caja") cajas(el, { "Previa: sí": D.horas_movil_dia.filter((_, i) => D.hace_previa[i] === "Sí"), "Previa: no": D.horas_movil_dia.filter((_, i) => D.hace_previa[i] === "No") }, "Horas de móvil al día");
    if (t === "disp") dispersion(el, D.horas_movil_dia, D.horas_sueno, "Horas de móvil al día", "Horas de sueño");
    const NOTA = { barras: "Una variable nominal: barras con frecuencias o porcentajes.", hist: "Una variable cuantitativa: el histograma muestra centro, dispersión y forma.", caja: "Una cuantitativa comparada entre grupos: cajas en paralelo. La línea gruesa es la mediana; la caja, el 50 % central.", disp: "Dos variables cuantitativas: cada punto es una persona. Que vayan juntas no demuestra que una cause la otra." };
    $("#t3GNota").textContent = NOTA[t];
  }
  let eje = "trunc";
  function t3Trampa() {
    const el = $("#t3Trampa"); ancho(el); const v = [["Psicología", 62], ["ADE", 58]], h = 260, x0 = 60, y0 = 34, y1 = 220, lo = eje === "trunc" ? 56 : 0, hi = eje === "trunc" ? 63 : 100, sy = val => y1 - (val - lo) / (hi - lo) * (y1 - y0);
    let s = `<text x="${W / 2}" y="20" font-size="16" font-weight="700" text-anchor="middle" fill="#1d2939">${eje === "trunc" ? "¡Psicología arrasa!" : "Los mismos datos, eje desde 0"}</text><line x1="${x0}" x2="${x0}" y1="${y0}" y2="${y1}" stroke="#98a2b3"/>`;
    (eje === "trunc" ? [56, 57, 58, 59, 60, 61, 62, 63] : [0, 20, 40, 60, 80, 100]).forEach(t => s += `<text x="${x0 - 8}" y="${sy(t) + 4}" font-size="12.5" text-anchor="end" fill="#475467">${t} %</text>`);
    v.forEach(([l, val], i) => { const bw = (W - x0 - 20) / 2, x = x0 + bw * (i + .2), w = bw * .6; s += `<rect x="${x}" y="${sy(val)}" width="${w}" height="${y1 - sy(val)}" fill="${i ? "#98a2b3" : "#003865"}"/><text x="${x + w / 2}" y="${y1 + 20}" font-size="14" text-anchor="middle">${l}</text><text x="${x + w / 2}" y="${sy(val) - 6}" font-size="13" text-anchor="middle">${val} %</text>`; });
    s += `<line x1="${x0}" x2="${W - 10}" y1="${y1}" y2="${y1}" stroke="#98a2b3"/>`;
    el.innerHTML = svgWrap(h, s, "Gráfico de barras sobre asistencia a festivales");
  }

  /* ================================================================ Montaje y eventos */
  function montar() {
    $("#t3MediaFest").textContent = fmt(V.mediaFest, 0);
    // 1
    $("#t3Var").addEventListener("change", t3Frec); $("#t3Acum").addEventListener("change", t3Frec);
    $("#t3Cruce").addEventListener("change", t3Conting); $("#t3Pct").addEventListener("change", t3Conting);
    document.querySelectorAll("[data-t3-csv]").forEach(b => b.addEventListener("click", descargarCSV));
    // 2
    $("#t3TkSliders").innerHTML = TIKTOK0.map((v, i) => `<div class="control"><label for="t3x${i}">Amiga ${i + 1}: <b><span id="t3xv${i}">${v}</span> min</b></label><input type="range" id="t3x${i}" min="0" max="300" step="5" value="${v}"></div>`).join("");
    document.querySelectorAll("#t3TkSliders input").forEach(el => el.addEventListener("input", t3Tiktok));
    document.querySelectorAll("input[name=t3Reto]").forEach(el => el.addEventListener("change", t3Tiktok));
    $("#t3TkReset").addEventListener("click", () => { TIKTOK0.forEach((v, i) => $("#t3x" + i).value = v); t3Tiktok(); });
    $("#t3Ext").addEventListener("input", t3Glamping);
    $("#t3S").addEventListener("input", t3Sesgo);
    $("#t3OrdSliders").innerHTML = NIVELES.ansiedad_examenes.map((l, i) => `<div class="control"><label for="t3o${i}">${l}: <b><span id="t3ov${i}">${ORD0[i]}</span> personas</b></label><input type="range" id="t3o${i}" min="0" max="80" step="1" value="${ORD0[i]}"></div>`).join("");
    document.querySelectorAll("#t3OrdSliders input").forEach(el => el.addEventListener("input", t3Ord));
    // 3
    $("#t3PVar").innerHTML = P_VARS.map(v => `<option value="${v}">${CUANTI[v].et}</option>`).join("");
    $("#t3PVar").addEventListener("change", () => t3Pos(true)); $("#t3PVal").addEventListener("input", () => t3Pos(false));
    // 4
    $("#t3DInputs").innerHTML = GRUPOS.A.map((v, i) => `<label>Amigo ${i + 1}<input type="text" inputmode="decimal" value="${v}" data-i="${i}"></label>`).join("");
    document.querySelectorAll("#t3DInputs input").forEach(el => el.addEventListener("input", t3Disp));
    document.querySelectorAll("input[name=t3DReto]").forEach(el => el.addEventListener("change", t3Disp));
    document.querySelectorAll("[data-t3-grupo]").forEach(b => b.addEventListener("click", () => cargarGrupo(b.dataset.t3Grupo)));
    // 5
    $("#t3PredF").addEventListener("input", e => $("#t3PredFVal").textContent = e.target.value + " %");
    $("#t3GuardarPred").addEventListener("click", () => { prediccion = +$("#t3PredF").value; t3Fest(); });
    $("#t3FoVar").innerHTML = Object.keys(DESC).map(v => `<option value="${v}">${CUANTI[v].et}</option>`).join("");
    $("#t3FoVar").addEventListener("change", t3FormaReset); $("#t3FoRevelar").addEventListener("click", t3FormaRevelar); $("#t3FoBins").addEventListener("input", t3FormaHist);
    t3FormaReset();
    $("#t3NX").addEventListener("input", t3Normal);
    // 6
    $("#t3GTipo").addEventListener("change", t3Graf);
    $("#t3Eje").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; eje = b.dataset.eje; [...$("#t3Eje").children].forEach(x => x.classList.toggle("activo", x === b)); t3Trampa(); });
    document.querySelectorAll("[data-ir-t3]").forEach(b => b.addEventListener("click", () => App.irA(b.dataset.irT3)));
  }

  // Dibuja solo lo que está a la vista (al cambiar de pestaña, subpestaña o tamaño)
  const si = (id, f) => { if (visible($(id))) f(); };
  App.render.variables = () => { si("#t3Tabla", t3Frec); si("#t3Conting", t3Conting); };
  App.render.central = () => { si("#t3TkPlot", t3Tiktok); si("#t3GlPlot", t3Glamping); si("#t3SPlot", t3Sesgo); si("#t3OrdPlot", t3Ord); si("#t3ModaPlot", t3Moda); };
  App.render.posicion = () => si("#t3PBox", () => t3Pos(false));
  App.render.dispersion = () => si("#t3DPlot", t3Disp);
  App.render.forma = () => { si("#t3FRes", t3Fest); si("#t3FoHist", t3FormaHist); si("#t3NPlot", t3Normal); };
  App.render.graficos = () => { si("#t3GPlot", t3Graf); si("#t3Trampa", t3Trampa); };

  window.Tema3 = { descargarCSV, asimetria, curtosis };
  montar();
})();
