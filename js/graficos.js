/* =====================================================================
   graficos.js — Mini-librería de gráficos SVG (sin dependencias)
   Crea gráficos con ejes, rejilla, áreas, líneas, puntos y etiquetas.
   Los números de los ejes usan coma decimal.
   ===================================================================== */
(function (global) {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";

  const COL = {
    azul: "#003865", medio: "#1F6FD1", suave: "#BFDDF7", claro: "#EBF5FE",
    rojo: "#E5254B", rosa: "#FEEEEF", verde: "#1E9E63", ambar: "#E8A33D", gris: "#5B6770"
  };

  function el(tag, attrs, padre) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(e);
    return e;
  }

  function numEje(v) {
    const a = Math.abs(v);
    let d = a === 0 ? 0 : a >= 100 ? 0 : a >= 10 ? 1 : a >= 1 ? 1 : 2;
    let s = v.toFixed(d);
    if (s.indexOf(".") >= 0) s = s.replace(/\.?0+$/, "");
    return s.replace(".", ",").replace(/^-/, "−");
  }

  function marcas(min, max, n) {
    const rango = max - min;
    if (rango <= 0) return [min];
    const paso0 = rango / (n || 5), mag = Math.pow(10, Math.floor(Math.log10(paso0)));
    const err = paso0 / mag;
    const paso = (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1) * mag;
    const out = [];
    for (let v = Math.ceil(min / paso) * paso; v <= max + paso * 1e-9; v += paso) out.push(Math.round(v / paso) * paso);
    return out;
  }

  class Grafico {
    /**
     * @param {HTMLElement|string} cont  contenedor
     * @param {object} o  {alto, xlim, ylim, xlab, ylab, xmarcas, ymarcas, xetiq, sinY, sinX, margen, rejillaY}
     */
    constructor(cont, o) {
      this.cont = typeof cont === "string" ? document.getElementById(cont) : cont;
      this.cont.innerHTML = "";
      this.o = o;
      let anchoCont = 0;
      if (this.cont.clientWidth) { const cs = getComputedStyle(this.cont); anchoCont = this.cont.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); }
      this.W = o.ancho || Math.max(300, Math.round(anchoCont) || 700); this.H = o.alto || 320;
      const m = Object.assign({ t: 18, r: 22, b: o.xlab ? 52 : 34, l: o.sinY ? 18 : (o.ylab ? 62 : 46) }, o.margen || {});
      this.m = m;
      this.svg = el("svg", { viewBox: `0 0 ${this.W} ${this.H}`, class: "grafico", role: "img" }, this.cont);
      if (o.titulo) el("title", {}, this.svg).textContent = o.titulo;
      this.pw = this.W - m.l - m.r; this.ph = this.H - m.t - m.b;
      this.xlim = o.xlim; this.ylim = o.ylim;
      this.gFondo = el("g", {}, this.svg);
      this.gDatos = el("g", {}, this.svg);
      const clip = "c" + Math.random().toString(36).slice(2);
      const cp = el("clipPath", { id: clip }, this.svg);
      el("rect", { x: m.l, y: m.t - 2, width: this.pw, height: this.ph + 4 }, cp);
      this.gRec = el("g", { "clip-path": `url(#${clip})` }, this.gDatos);
      this.gTexto = el("g", {}, this.svg);
      this.ejes();
    }
    x(v) { return this.m.l + (v - this.xlim[0]) / (this.xlim[1] - this.xlim[0]) * this.pw; }
    y(v) { return this.m.t + this.ph - (v - this.ylim[0]) / (this.ylim[1] - this.ylim[0]) * this.ph; }

    ejes() {
      const o = this.o, g = this.gFondo;
      if (!o.sinX) {
        const xm = o.xmarcas || marcas(this.xlim[0], this.xlim[1], o.nx || 6);
        xm.forEach((v, i) => {
          const X = this.x(v);
          if (o.rejillaX !== false) el("line", { x1: X, x2: X, y1: this.m.t, y2: this.m.t + this.ph, class: "rejilla" }, g);
          const t = el("text", { x: X, y: this.m.t + this.ph + 18, class: "marca" + (o.xmarcaClase ? " " + o.xmarcaClase : ""), "text-anchor": "middle" }, g);
          t.textContent = o.xetiq ? o.xetiq[i] : numEje(v);
        });
      }
      if (!o.sinY) {
        const ym = o.ymarcas || marcas(this.ylim[0], this.ylim[1], o.ny || 5);
        ym.forEach(v => {
          const Y = this.y(v);
          el("line", { x1: this.m.l, x2: this.m.l + this.pw, y1: Y, y2: Y, class: "rejilla" }, g);
          const t = el("text", { x: this.m.l - 8, y: Y + 4, class: "marca", "text-anchor": "end" }, g);
          t.textContent = o.yetiq ? o.yetiq(v) : numEje(v);
        });
      }
      el("line", { x1: this.m.l, x2: this.m.l + this.pw, y1: this.m.t + this.ph, y2: this.m.t + this.ph, class: "eje" }, g);
      if (o.xlab) { const t = el("text", { x: this.m.l + this.pw / 2, y: this.H - 10, class: "titulo-eje", "text-anchor": "middle" }, g); t.textContent = o.xlab; }
      if (o.ylab) { const t = el("text", { x: 16, y: this.m.t + this.ph / 2, class: "titulo-eje", "text-anchor": "middle", transform: `rotate(-90 16 ${this.m.t + this.ph / 2})` }, g); t.textContent = o.ylab; }
    }

    // ---- primitivas ----
    linea(pts, a = {}) {
      const d = pts.map((p, i) => (i ? "L" : "M") + this.x(p[0]).toFixed(2) + "," + this.y(p[1]).toFixed(2)).join("");
      return el("path", { d, fill: "none", stroke: a.color || COL.azul, "stroke-width": a.grosor || 2, "stroke-dasharray": a.trazo, opacity: a.opacidad }, this.gRec);
    }
    area(pts, a = {}) {
      if (pts.length < 2) return;
      const base = a.base !== undefined ? a.base : this.ylim[0];
      let d = "M" + this.x(pts[0][0]) + "," + this.y(base);
      pts.forEach(p => { d += "L" + this.x(p[0]).toFixed(2) + "," + this.y(p[1]).toFixed(2); });
      d += "L" + this.x(pts[pts.length - 1][0]) + "," + this.y(base) + "Z";
      return el("path", { d, fill: a.color || COL.suave, opacity: a.opacidad !== undefined ? a.opacidad : 1, stroke: "none" }, this.gRec);
    }
    rect(x0, x1, y0, y1, a = {}) {
      const X0 = this.x(Math.min(x0, x1)), X1 = this.x(Math.max(x0, x1)), Y0 = this.y(Math.max(y0, y1)), Y1 = this.y(Math.min(y0, y1));
      return el("rect", { x: X0, y: Y0, width: Math.max(0, X1 - X0), height: Math.max(0, Y1 - Y0), fill: a.color || COL.suave, opacity: a.opacidad, stroke: a.borde || "none", "stroke-width": a.grosorBorde || 1, rx: a.rx }, a.sinRecorte ? this.gDatos : this.gRec);
    }
    segmento(x0, y0, x1, y1, a = {}) {
      return el("line", { x1: this.x(x0), y1: this.y(y0), x2: this.x(x1), y2: this.y(y1), stroke: a.color || COL.azul, "stroke-width": a.grosor || 2, "stroke-dasharray": a.trazo, "stroke-linecap": a.extremo || "butt", opacity: a.opacidad }, a.sinRecorte ? this.gDatos : this.gRec);
    }
    vline(v, a = {}) { return this.segmento(v, this.ylim[0], v, this.ylim[1], a); }
    hline(v, a = {}) { return this.segmento(this.xlim[0], v, this.xlim[1], v, a); }
    punto(x, y, a = {}) {
      return el("circle", { cx: this.x(x), cy: this.y(y), r: a.r || 3, fill: a.color || COL.azul, opacity: a.opacidad, stroke: a.borde, "stroke-width": a.grosorBorde }, a.sinRecorte ? this.gDatos : this.gRec);
    }
    triangulo(x, y, abajo, a = {}) {
      const X = this.x(x), Y = this.y(y), s = a.tam || 9;
      const d = abajo ? `M${X - s},${Y - s}L${X + s},${Y - s}L${X},${Y + s * .6}Z` : `M${X - s},${Y + s}L${X + s},${Y + s}L${X},${Y - s * .6}Z`;
      return el("path", { d, fill: a.color || COL.rojo }, this.gDatos);
    }
    texto(x, y, txt, a = {}) {
      const t = el("text", { x: this.x(x) + (a.dx || 0), y: this.y(y) + (a.dy || 0), "text-anchor": a.ancla || "middle", class: "texto-graf", fill: a.color || COL.azul, "font-size": a.tam || 13, "font-weight": a.negrita ? 700 : 400 }, this.gTexto);
      String(txt).split("\n").forEach((linea, i) => { const ts = el("tspan", { x: this.x(x) + (a.dx || 0), dy: i ? "1.2em" : 0 }, t); ts.textContent = linea; });
      return t;
    }
    etiqueta(x, y, txt, a = {}) {
      const t = this.texto(x, y, txt, a);
      try {
        const b = t.getBBox();
        const r = el("rect", { x: b.x - 5, y: b.y - 3, width: b.width + 10, height: b.height + 6, rx: 4, fill: "white", stroke: a.color || COL.azul, "stroke-width": 1, opacity: .95 });
        this.gTexto.insertBefore(r, t);
      } catch (e) { /* sin getBBox (fuera de pantalla) */ }
      return t;
    }
  }

  // Leyenda HTML bajo el gráfico
  function leyenda(cont, items) {
    const c = typeof cont === "string" ? document.getElementById(cont) : cont;
    const d = document.createElement("div"); d.className = "leyenda";
    d.innerHTML = items.map(([color, txt, forma]) =>
      `<span><i style="background:${color};${forma === "linea" ? "height:3px;border-radius:0;" : ""}"></i>${txt}</span>`).join("");
    c.appendChild(d);
  }

  function histograma(x, inicio, ancho) {
    const conteo = new Map();
    x.forEach(v => { const k = Math.floor((v - inicio) / ancho + 1e-9); conteo.set(k, (conteo.get(k) || 0) + 1); });
    return [...conteo.entries()].map(([k, n]) => ({ x0: inicio + k * ancho, x1: inicio + (k + 1) * ancho, n }));
  }

  function vacio(cont, txt, alto) {
    const c = typeof cont === "string" ? document.getElementById(cont) : cont;
    c.innerHTML = `<div class="graf-vacio" style="height:${alto || 300}px">${txt}</div>`;
  }

  global.Graf = { Grafico, COL, leyenda, histograma, marcas, numEje, vacio };
})(window);
