/* =====================================================================
   estadistica.js — Funciones estadísticas sin dependencias externas
   Tema 4 · Análisis inferencial · Fundamentos de Investigación en Psicología (UFV)

   Distribuciones (normal, t, chi-cuadrado, F), generadores aleatorios y
   pruebas: t de Student, chi-cuadrado, Shapiro-Wilk (algoritmo de Royston,
   como en R), Kolmogorov-Smirnov con corrección de Lilliefors (como en el
   paquete nortest de R), Levene (centrada en la media, como SPSS),
   correlaciones de Pearson y Spearman.
   ===================================================================== */
(function (global) {
  "use strict";

  // ------------------------------------------------------------------
  // Generadores aleatorios
  // ------------------------------------------------------------------
  function semilla(s) {                       // mulberry32: aleatorio reproducible
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  let _rand = Math.random;
  let _normGuardada = null;
  function runif1(a, b) { return a + (b - a) * _rand(); }
  function rnorm1(m, s) {
    if (_normGuardada !== null) { const z = _normGuardada; _normGuardada = null; return m + s * z; }
    let u, v, r;
    do { u = 2 * _rand() - 1; v = 2 * _rand() - 1; r = u * u + v * v; } while (r >= 1 || r === 0);
    const f = Math.sqrt(-2 * Math.log(r) / r);
    _normGuardada = v * f;
    return m + s * u * f;
  }
  function rnorm(n, m, s) { const x = new Array(n); for (let i = 0; i < n; i++) x[i] = rnorm1(m, s); return x; }
  function runif(n, a, b) { const x = new Array(n); for (let i = 0; i < n; i++) x[i] = runif1(a, b); return x; }
  function rgamma1(forma, escala) {            // Marsaglia y Tsang (forma >= 1)
    if (forma < 1) { const u = _rand(); return rgamma1(1 + forma, escala) * Math.pow(u, 1 / forma); }
    const d = forma - 1 / 3, c = 1 / Math.sqrt(9 * d);
    for (;;) {
      let x, v;
      do { x = rnorm1(0, 1); v = 1 + c * x; } while (v <= 0);
      v = v * v * v; const u = _rand();
      if (u < 1 - 0.0331 * x * x * x * x) return d * v * escala;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * escala;
    }
  }
  function rgamma(n, forma, escala) { const x = new Array(n); for (let i = 0; i < n; i++) x[i] = rgamma1(forma, escala); return x; }
  function rbinom1(n, p) { let k = 0; for (let i = 0; i < n; i++) if (_rand() < p) k++; return k; }
  function muestra(v, n) {                      // muestreo sin reposición
    const a = v.slice(), out = new Array(n);
    for (let i = 0; i < n; i++) { const j = i + Math.floor(_rand() * (a.length - i)); const t = a[i]; a[i] = a[j]; a[j] = t; out[i] = a[i]; }
    return out;
  }
  function conSemilla(s, f) { const prev = _rand; _rand = semilla(s); _normGuardada = null; try { return f(); } finally { _rand = prev; _normGuardada = null; } }

  // ------------------------------------------------------------------
  // Descriptivos
  // ------------------------------------------------------------------
  const suma = x => { let s = 0; for (let i = 0; i < x.length; i++) s += x[i]; return s; };
  const media = x => suma(x) / x.length;
  function varianza(x) { const m = media(x); let s = 0; for (let i = 0; i < x.length; i++) s += (x[i] - m) * (x[i] - m); return s / (x.length - 1); }
  const dt = x => Math.sqrt(varianza(x));
  const ordenar = x => x.slice().sort((a, b) => a - b);
  function cuantil(x, p) {                      // tipo 7 (el de R por defecto)
    const s = ordenar(x), h = (s.length - 1) * p, lo = Math.floor(h), hi = Math.ceil(h);
    return s[lo] + (h - lo) * (s[hi] - s[lo]);
  }
  function rangos(x) {                          // rangos con empates promediados
    const idx = x.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
    const r = new Array(x.length);
    for (let i = 0; i < idx.length;) {
      let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
      const rm = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) r[idx[k][1]] = rm;
      i = j + 1;
    }
    return r;
  }
  const limitar = (v, a, b) => Math.min(Math.max(v, a), b);

  // ------------------------------------------------------------------
  // Funciones especiales
  // ------------------------------------------------------------------
  function lgamma(x) {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
      -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }
  function betacf(a, b, x) {
    const MAXIT = 300, EPS = 3e-16, FPMIN = 1e-300;
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d; let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; const del = d * c; h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }
  function ibeta(x, a, b) {                      // beta incompleta regularizada
    if (x <= 0) return 0; if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return (x < (a + 1) / (a + b + 2)) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function gammaP(a, x) {                        // gamma incompleta regularizada inferior
    if (x <= 0) return 0;
    if (x < a + 1) {
      let ap = a, sum = 1 / a, del = sum;
      for (let n = 0; n < 1000; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-16) break; }
      return sum * Math.exp(-x + a * Math.log(x) - lgamma(a));
    }
    let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (let i = 1; i < 1000; i++) {
      const an = -i * (i - a); b += 2;
      d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-16) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
  }

  // ------------------------------------------------------------------
  // Distribuciones
  // ------------------------------------------------------------------
  function pnorm(z, m = 0, s = 1) {              // Hart (1968), precisión doble
    z = (z - m) / s;
    const xa = Math.abs(z); let c;
    if (xa > 37) c = 0;
    else {
      const e = Math.exp(-xa * xa / 2);
      if (xa < 7.07106781186547) {
        let b = 3.52624965998911e-02 * xa + 0.700383064443688;
        b = b * xa + 6.37396220353165; b = b * xa + 33.912866078383; b = b * xa + 112.079291497871;
        b = b * xa + 221.213596169931; b = b * xa + 220.206867912376; c = e * b;
        b = 8.83883476483184e-02 * xa + 1.75566716318264;
        b = b * xa + 16.064177579207; b = b * xa + 86.7807322029461; b = b * xa + 296.564248779674;
        b = b * xa + 637.333633378831; b = b * xa + 793.826512519948; b = b * xa + 440.413735824752;
        c = c / b;
      } else {
        let b = xa + 0.65; b = xa + 4 / b; b = xa + 3 / b; b = xa + 2 / b; b = xa + 1 / b;
        c = e / b / 2.506628274631;
      }
    }
    return z > 0 ? 1 - c : c;
  }
  const dnorm = (x, m = 0, s = 1) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  function qnorm(p) {                            // Acklam + un paso de refinamiento
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const pl = 0.02425; let q, r, x;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    else if (p <= 1 - pl) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    const e = pnorm(x) - p, u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
  }
  function pt(t, gl) {
    if (!isFinite(gl)) return pnorm(t);
    const x = gl / (gl + t * t), p = 0.5 * ibeta(x, gl / 2, 0.5);
    return t > 0 ? 1 - p : p;
  }
  function dtdens(x, gl) {
    if (!isFinite(gl)) return dnorm(x);
    return Math.exp(lgamma((gl + 1) / 2) - lgamma(gl / 2) - 0.5 * Math.log(gl * Math.PI) - (gl + 1) / 2 * Math.log(1 + x * x / gl));
  }
  function biseccion(f, objetivo, lo, hi) {
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (f(mid) < objetivo) lo = mid; else hi = mid; if (hi - lo < 1e-12) break; }
    return (lo + hi) / 2;
  }
  function qt(p, gl) {
    if (!isFinite(gl)) return qnorm(p);
    return biseccion(t => pt(t, gl), p, -1e4, 1e4);
  }
  const pchisq = (x, k) => gammaP(k / 2, x / 2);
  function dchisq(x, k) {
    if (x <= 0) return 0;
    return Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.log(2) - lgamma(k / 2));
  }
  const qchisq = (p, k) => biseccion(x => pchisq(x, k), p, 0, 1e4);
  const pf = (f, d1, d2) => f <= 0 ? 0 : ibeta(d1 * f / (d1 * f + d2), d1 / 2, d2 / 2);

  // ------------------------------------------------------------------
  // Pruebas
  // ------------------------------------------------------------------
  // t de Student para muestras independientes (varianzas iguales), como t.test(x, y, var.equal = TRUE)
  function tStudent(x, y, conf) {
    const n1 = x.length, n2 = y.length, gl = n1 + n2 - 2;
    const m1 = media(x), m2 = media(y);
    const sp2 = ((n1 - 1) * varianza(x) + (n2 - 1) * varianza(y)) / gl;
    const ee = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
    const t = (m1 - m2) / ee;
    const p = 2 * pt(-Math.abs(t), gl);
    const crit = qt(1 - (1 - conf) / 2, gl);
    return { t, gl, p, m1, m2, dif: m1 - m2, ic: [m1 - m2 - crit * ee, m1 - m2 + crit * ee], tcrit: crit };
  }

  // Chi-cuadrado de Pearson sin corrección de continuidad, con residuos estandarizados corregidos
  function chiCuadrado(O) {
    const f = O.length, c = O[0].length;
    const tf = O.map(r => suma(r)), tc = O[0].map((_, j) => suma(O.map(r => r[j]))), N = suma(tf);
    const E = O.map((r, i) => r.map((_, j) => tf[i] * tc[j] / N));
    let chi = 0;
    for (let i = 0; i < f; i++) for (let j = 0; j < c; j++) chi += (O[i][j] - E[i][j]) ** 2 / E[i][j];
    const R = O.map((r, i) => r.map((o, j) => (o - E[i][j]) / Math.sqrt(E[i][j] * (1 - tf[i] / N) * (1 - tc[j] / N))));
    const gl = (f - 1) * (c - 1);
    return { chi, gl, p: 1 - pchisq(chi, gl), E, R, N };
  }

  // Shapiro-Wilk: traducción del algoritmo AS R94 (Royston, 1995) tal como lo implementa R (swilk.c)
  function shapiroWilk(xin) {
    const x = ordenar(xin), n = x.length;
    if (n < 3 || n > 5000) return null;
    const small = 1e-19;
    const poly = (cc, x0) => { let r = cc[0]; if (cc.length > 1) { let p = x0 * cc[cc.length - 1]; for (let j = cc.length - 2; j > 0; j--) p = (p + cc[j]) * x0; r += p; } return r; };
    const g = [-2.273, .459];
    const c1 = [0, .221157, -.147981, -2.07119, 4.434685, -2.706056];
    const c2 = [0, .042981, -.293762, -1.752461, 5.682633, -3.582633];
    const c3 = [.544, -.39978, .025054, -6.714e-4];
    const c4 = [1.3822, -.77857, .062767, -.0020322];
    const c5 = [-1.5861, -.31082, -.083751, .0038915];
    const c6 = [-.4803, -.082676, .0030302];
    const nn2 = Math.floor(n / 2), an = n;
    const a = new Array(nn2 + 1).fill(0);
    if (n === 3) a[1] = Math.SQRT1_2;
    else {
      const an25 = an + .25, m = new Array(nn2 + 1);
      let summ2 = 0;
      for (let i = 1; i <= nn2; i++) { m[i] = qnorm((i - .375) / an25); summ2 += m[i] * m[i]; }
      summ2 *= 2;
      const ssumm2 = Math.sqrt(summ2), rsn = 1 / Math.sqrt(an);
      const a1 = poly(c1, rsn) - m[1] / ssumm2;
      let i1, fac;
      if (n > 5) {
        i1 = 3;
        const a2 = -m[2] / ssumm2 + poly(c2, rsn);
        fac = Math.sqrt((summ2 - 2 * m[1] * m[1] - 2 * m[2] * m[2]) / (1 - 2 * a1 * a1 - 2 * a2 * a2));
        a[2] = a2;
      } else {
        i1 = 2;
        fac = Math.sqrt((summ2 - 2 * m[1] * m[1]) / (1 - 2 * a1 * a1));
      }
      a[1] = a1;
      for (let i = i1; i <= nn2; i++) a[i] = -m[i] / fac;
    }
    const range = x[n - 1] - x[0];
    if (range < small) return null;
    let xx = x[0] / range, sx = xx, sa = -a[1];
    for (let i = 1, j = n - 1; i < n; j--) {
      const xi = x[i] / range;
      sx += xi; i++;
      if (i !== j) sa += Math.sign(i - j) * a[Math.min(i, j)];
      xx = xi;
    }
    sa /= n; sx /= n;
    let ssa = 0, ssx = 0, sax = 0;
    for (let i = 0, j = n - 1; i < n; i++, j--) {
      const asa = (i !== j) ? Math.sign(i - j) * a[1 + Math.min(i, j)] - sa : -sa;
      const xsx = x[i] / range - sx;
      ssa += asa * asa; ssx += xsx * xsx; sax += asa * xsx;
    }
    const ssassx = Math.sqrt(ssa * ssx);
    const w1 = (ssassx - sax) * (ssassx + sax) / (ssa * ssx);
    const w = 1 - w1;
    let pw;
    if (n === 3) {
      pw = 1.90985931710274 * (Math.asin(Math.sqrt(w)) - 1.04719755119660);
      return { W: w, p: Math.max(pw, 0) };
    }
    let y = Math.log(w1);
    const lxx = Math.log(an);
    let mm, s;
    if (n <= 11) {
      const gamma = poly(g, an);
      if (y >= gamma) return { W: w, p: 1e-99 };
      y = -Math.log(gamma - y);
      mm = poly(c3, an); s = Math.exp(poly(c4, an));
    } else {
      mm = poly(c5, lxx); s = Math.exp(poly(c6, lxx));
    }
    pw = 1 - pnorm(y, mm, s);
    return { W: w, p: pw };
  }

  // Kolmogorov-Smirnov con corrección de Lilliefors (como nortest::lillie.test)
  function lilliefors(xin) {
    const x = ordenar(xin), n = x.length;
    if (n < 5) return null;
    const m = media(x), s = dt(x);
    let Dp = -Infinity, Dm = -Infinity;
    for (let i = 0; i < n; i++) {
      const p = pnorm((x[i] - m) / s);
      Dp = Math.max(Dp, (i + 1) / n - p);
      Dm = Math.max(Dm, p - i / n);
    }
    const K = Math.max(Dp, Dm);
    let Kd, nd;
    if (n <= 100) { Kd = K; nd = n; } else { Kd = K * Math.pow(n / 100, 0.49); nd = 100; }
    let p = Math.exp(-7.01256 * Kd * Kd * (nd + 2.78019) + 2.99587 * Kd * Math.sqrt(nd + 2.78019) - 0.122119 + 0.974598 / Math.sqrt(nd) + 1.67997 / nd);
    if (p > 0.1) {
      const KK = (Math.sqrt(n) - 0.01 + 0.85 / Math.sqrt(n)) * K;
      if (KK <= 0.302) p = 1;
      else if (KK <= 0.5) p = 2.76773 - 19.828315 * KK + 80.709644 * KK ** 2 - 138.55152 * KK ** 3 + 81.218052 * KK ** 4;
      else if (KK <= 0.9) p = -4.901232 + 40.662806 * KK - 97.490286 * KK ** 2 + 94.029866 * KK ** 3 - 32.355711 * KK ** 4;
      else if (KK <= 1.31) p = 6.198765 - 19.558097 * KK + 18.737584 * KK ** 2 - 5.802919 * KK ** 3 + 0.008042 * KK ** 4;
      else p = 0;
    }
    return { D: K, p };
  }

  // Levene centrada en la media (como SPSS), para dos o más grupos
  function levene(grupos) {
    const z = grupos.map(g => { const m = media(g); return g.map(v => Math.abs(v - m)); });
    const todos = [].concat(...z), N = todos.length, k = grupos.length, mg = media(todos);
    let ssb = 0, ssw = 0;
    z.forEach(g => { const m = media(g); ssb += g.length * (m - mg) ** 2; g.forEach(v => { ssw += (v - m) ** 2; }); });
    const gl1 = k - 1, gl2 = N - k, F = (ssb / gl1) / (ssw / gl2);
    return { F, gl1, gl2, p: 1 - pf(F, gl1, gl2) };
  }

  function pearson(x, y) {
    const mx = media(x), my = media(y); let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < x.length; i++) { const dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
    const r = sxy / Math.sqrt(sxx * syy), gl = x.length - 2;
    const t = r * Math.sqrt(gl / (1 - r * r));
    return { r, gl, p: Math.abs(r) >= 1 ? 0 : 2 * pt(-Math.abs(t), gl), b: sxy / sxx, a: my - (sxy / sxx) * mx };
  }
  function spearman(x, y) { const k = pearson(rangos(x), rangos(y)); return { rho: k.r, gl: k.gl, p: k.p }; }


  // Mediana
  const mediana = x => E_cuantil(x, .5);
  function E_cuantil(x, p) { const s = ordenar(x), h = (s.length - 1) * p, lo = Math.floor(h), hi = Math.ceil(h); return s[lo] + (h - lo) * (s[hi] - s[lo]); }

  // t de Student para muestras relacionadas (diferencias = despues − antes), como t.test(despues, antes, paired = TRUE)
  function tRelacionadas(antes, despues, conf = 0.95) {
    const d = despues.map((v, i) => v - antes[i]), n = d.length, gl = n - 1;
    const md = media(d), sd = dt(d), ee = sd / Math.sqrt(n), t = md / ee;
    const crit = qt(1 - (1 - conf) / 2, gl);
    return { t, gl, p: 2 * pt(-Math.abs(t), gl), mdif: md, sdif: sd, ic: [md - crit * ee, md + crit * ee], dz: md / sd, d };
  }

  // U de Mann-Whitney con aproximación normal y corrección por empates (como SPSS; R: wilcox.test(exact = FALSE, correct = FALSE))
  function mannWhitney(x, y) {
    const n1 = x.length, n2 = y.length, N = n1 + n2, r = rangos(x.concat(y));
    const R1 = suma(r.slice(0, n1)), R2 = suma(r.slice(n1));
    const U1 = R1 - n1 * (n1 + 1) / 2, U2 = n1 * n2 - U1;
    const cuenta = {}; x.concat(y).forEach(v => { cuenta[v] = (cuenta[v] || 0) + 1; });
    const emp = Object.values(cuenta).reduce((s, t) => s + (t * t * t - t), 0);
    const sigma = Math.sqrt(n1 * n2 / 12 * ((N + 1) - emp / (N * (N - 1))));
    const z = (U1 - n1 * n2 / 2) / sigma;
    return { U: Math.min(U1, U2), U1, z, p: 2 * (1 - pnorm(Math.abs(z))), rango1: R1 / n1, rango2: R2 / n2, r: Math.abs(z) / Math.sqrt(N) };
  }

  // Wilcoxon de rangos con signo (diferencias = despues − antes), aproximación normal con corrección por empates
  // (R: wilcox.test(despues, antes, paired = TRUE, exact = FALSE, correct = FALSE); V = W+)
  function wilcoxon(antes, despues) {
    const d = despues.map((v, i) => v - antes[i]).filter(v => Math.abs(v) > 1e-12), n = d.length;
    const r = rangos(d.map(Math.abs));
    let Wpos = 0, Wneg = 0; d.forEach((v, i) => { if (v > 0) Wpos += r[i]; else Wneg += r[i]; });
    const cuenta = {}; d.forEach(v => { const k = Math.abs(v).toFixed(10); cuenta[k] = (cuenta[k] || 0) + 1; });
    const emp = Object.values(cuenta).reduce((s, t) => s + (t * t * t - t), 0);
    const mu = n * (n + 1) / 4, sigma = Math.sqrt(n * (n + 1) * (2 * n + 1) / 24 - emp / 48);
    const z = (Wpos - mu) / sigma;
    return { Wpos, Wneg, W: Math.min(Wpos, Wneg), n, z, p: 2 * (1 - pnorm(Math.abs(z))), r: Math.abs(z) / Math.sqrt(n) };
  }

  // d de Cohen para dos grupos independientes (DT combinada)
  function dCohen(x, y) {
    const n1 = x.length, n2 = y.length, sp = Math.sqrt(((n1 - 1) * varianza(x) + (n2 - 1) * varianza(y)) / (n1 + n2 - 2));
    return (media(x) - media(y)) / sp;
  }

  global.Est = {
    semilla, conSemilla, rnorm, runif, rgamma, rbinom1, muestra, rnorm1,
    suma, media, varianza, dt, ordenar, cuantil, rangos, limitar,
    pnorm, dnorm, qnorm, pt, dtdens, qt, pchisq, dchisq, qchisq, pf,
    tStudent, chiCuadrado, shapiroWilk, lilliefors, levene, pearson, spearman,
    mediana, tRelacionadas, mannWhitney, wilcoxon, dCohen
  };
})(typeof window !== "undefined" ? window : globalThis);
