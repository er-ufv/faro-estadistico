/* =====================================================================
   contenido.js — TODO lo que el equipo docente puede editar sin tocar
   la lógica: grupos y docentes, diálogos de los avatares, conceptos que
   se siguen en el cuaderno y ejercicios de cada módulo.

   Fichas en los textos (se adaptan al docente y al estudiante):
     {la} / {La}   → «la» o «el»               {profe} → «profesora» o «profesor»
     {a}           → terminación a/o (contenta / contento)
     {docente}     → nombre del docente         {alumno} → nombre del estudiante
   Las cifras de las fichas de chi-cuadrado se CALCULAN a partir de la tabla.
   ===================================================================== */
(function (global) {
  "use strict";
  const E = global.Est;
  const fmt = (x, d = 2) => x.toFixed(d).replace(".", ",").replace("-", "−");

  // ------------------------------------------------------------------
  // Docentes, grupos y avatares
  //   Para añadir una animación pendiente: copia el archivo en img/avatares
  //   con el nombre <avatar>-<expresión>.webp (o .gif) y quita la expresión
  //   de «faltan». Si cambias la extensión, ajústala en «ext».
  // ------------------------------------------------------------------
  const DOCENTES = {
    miriam: { nombre: "Miriam", completo: "Miriam Granado Peinado", genero: "f", email: "miriam.granado@ufv.es", avatar: "miriam", ext: {}, faltan: [] },
    maria: { nombre: "María", completo: "María Masana", genero: "f", email: "maria.masana@ufv.es", avatar: "maria", ext: {}, faltan: [] },
    eduar: { nombre: "Eduar", completo: "Eduar Ramírez", genero: "m", email: "eduarstiven.ramirez@ufv.es", avatar: "eduar", ext: {}, faltan: [] },
    carolina: { nombre: "Carolina", completo: "Carolina Martín", genero: "f", email: "carolina.martin@ufv.es", avatar: "carolina", ext: {}, faltan: [] }
  };
  const GRUPOS = { "A": "miriam", "B": "miriam", "C": "maria", "D": "maria", "E": "eduar", "F": "carolina", "AP1": "carolina" };
  // Duración (ms) de una vuelta de cada animación
  // Gem de Gemini que hace de tutor socrático (ver gem_tutor_tema4.md).
  // Pega aquí el enlace para compartir del Gem; mientras esté vacío, el botón no aparece.
  // «Antonio IA»: en homenaje a Antonio Pardo Merino, autor de los manuales de análisis de datos de la asignatura.
  const GEM = { url: "https://gemini.google.com/gem/1D5CJB-Std2_chtal0JgEdr7_7qSznhwU?usp=sharing", nombre: "Antonio IA" };
  const DURACION = { hablando: 3000, celebrando: 2500, sorpresa: 2500, reflexivo: 3000, esperando: 4000 };

  // ------------------------------------------------------------------
  // Conceptos que se siguen en el cuaderno
  // ------------------------------------------------------------------
  const CONCEPTOS = {
    var_muestral: { nombre: "Variabilidad muestral", diap: "apartado «1 · Muestras»: caso del apoyo social percibido", modulo: "muestras", repaso: "Cada muestra da un resultado algo distinto aunque venga de la misma población: el estadístico varía, el parámetro no." },
    error_tipico: { nombre: "Error típico", diap: "apartado «1 · Muestras»: qué ocurre con el error típico al aumentar n", modulo: "muestras", repaso: "El error típico (DT / √n) mide cuánto varían las medias de una muestra a otra; disminuye al aumentar n." },
    ic_calculo: { nombre: "Cálculo del intervalo de confianza", diap: "apartado «2 · Intervalos»: IC del apoyo social percibido (M = 58, DT = 20, n = 100)", modulo: "intervalos", repaso: "IC = media ± valor crítico × error típico. Con un 95 %, el valor crítico es 1,96." },
    ic_interp: { nombre: "Interpretación del intervalo", diap: "apartado «2 · Intervalos»: satisfacción laboral con n = 25 frente a n = 400", modulo: "intervalos", repaso: "El 95 % se refiere al procedimiento: de cada 100 intervalos, unos 95 contienen el parámetro. Un intervalo más estrecho es más preciso." },
    confianza_alfa: { nombre: "Nivel de confianza y α", diap: "apartado «2 · Intervalos»: de dónde sale el 1,96", modulo: "intervalos", repaso: "1 − α es el nivel de confianza. Con α = ,05, queda un 2,5 % en cada cola y el valor crítico es 1,96." },
    valor_p: { nombre: "Valor p", diap: "apartado «3 · El juicio»: caso de la autoestima de chicas y chicos", modulo: "juicio", repaso: "p es la probabilidad de obtener un resultado tan extremo o más si H₀ fuera cierta. No es la probabilidad de que H₀ sea cierta." },
    decision_h0: { nombre: "Decisión sobre H₀", diap: "apartado «3 · El juicio»: analogía del juicio y las tres investigaciones con α = ,05", modulo: "juicio", repaso: "Si p ≤ α, rechazamos H₀. Si p > α, no la rechazamos (nunca la «aceptamos» ni la demostramos)." },
    errores: { nombre: "Errores tipo I y II", diap: "apartado «3 · El juicio»: errores tipo I y II", modulo: "juicio", repaso: "Error tipo I: rechazar H₀ siendo verdadera (condenar a un inocente, probabilidad α). Error tipo II: no rechazarla siendo falsa." },
    supuestos: { nombre: "Lógica de los supuestos", diap: "apartado «4 · Supuestos»: los casos de normalidad y homocedasticidad", modulo: "supuestos", repaso: "En normalidad y homocedasticidad, H₀ dice que el supuesto se cumple: queremos p > ,05." },
    eleccion_prueba: { nombre: "Elección de la prueba", diap: "apartado «5 · ¿Qué prueba?» y el esquema de decisión", modulo: "esquema", repaso: "Primero el tipo de variables, después el objetivo (asociar, relacionar, comparar) y por último los supuestos." },
    esperadas: { nombre: "Frecuencias esperadas", diap: "apartado «6 · Chi-cuadrado»: caso de la red social y el ciberacoso", modulo: "chi", repaso: "E = (total de fila × total de columna) / N: lo que esperaríamos si las variables fueran independientes." },
    residuos: { nombre: "Residuos corregidos", diap: "apartado «6 · Chi-cuadrado»: residuos del caso TDAH y problemas de sueño", modulo: "chi", repaso: "Z > +1,96: más casos de los esperados; Z < −1,96: menos; entre ambos, sin diferencia significativa en esa casilla." },
    apa: { nombre: "Redacción del resultado", diap: "las fichas de las Actividades 1 y 2 (redacción en 3 pasos)", modulo: "chi", repaso: "Tres pasos: justificación, resultados (APA: χ²(gl, N = …) = …, p = …) y conclusión sin afirmaciones causales." },
    comparar_medias: { nombre: "Comparar medias con la t de Student", diap: "apartados «8 · Grupos independientes» y «9 · Muestras relacionadas»", modulo: "independientes", repaso: "La t compara dos medias: grupos distintos (independientes, gl = n₁ + n₂ − 2) o las mismas personas dos veces (relacionadas, gl = n − 1)." },
    no_parametricas: { nombre: "Alternativas no paramétricas (U y Wilcoxon)", diap: "apartados «8 · Grupos independientes» y «9 · Muestras relacionadas» y el esquema de decisión", modulo: "independientes", repaso: "Sin normalidad: U de Mann-Whitney para grupos independientes y Wilcoxon para muestras relacionadas. Comparan rangos e informan de medianas." },
    correlacion: { nombre: "Dirección, intensidad y significación de r", diap: "apartado «7 · Correlaciones»: tabla de intensidad y caso de sueño e inatención", modulo: "correlaciones", repaso: "El signo indica la dirección, |r| la intensidad y p la significación: son tres preguntas distintas." }
  };

  // ------------------------------------------------------------------
  // Diálogos
  // ------------------------------------------------------------------
  const BIENVENIDA = [
    "¡Hola, {alumno}! Te doy la bienvenida a Faro estadístico. Soy {la} {profe} {docente} y voy a acompañarte en el Tema 4: el análisis inferencial.",
    "Faro estadístico tiene dos espacios: Fundamentos, con las ideas básicas, y Usar los estadísticos, donde aplicamos cada prueba. En cada módulo te explico la idea clave, exploras una simulación y practicas con ejercicios cortos basados en los casos de clase.",
    "Aquí no hay nota. Si te equivocas, te daré una pista y otra oportunidad: lo que me interesa es que entiendas el razonamiento.",
    "Al final tendrás tu cuaderno personal, con lo que ya dominas y lo que te conviene repasar. Y si te atascas en un ejercicio, puedes preguntarle a Antonio IA. Tu progreso se guarda solo en este navegador.",
    "Te recomiendo empezar por Fundamentos y después pasar a Usar los estadísticos, aunque puedes ir directamente a lo que estemos viendo en clase. ¡Vamos allá!"
  ];

  const MODULOS = {
    muestras: {
      titulo: "1 · Muestras", corto: "Muestras",
      explica: [
        "En investigación casi nunca podemos evaluar a toda la población. Por eso trabajamos con una muestra y calculamos un estadístico, como la media.",
        "Lo que queremos conocer es el parámetro de la población (μ). Es fijo, pero desconocido.",
        "El problema es que cada muestra da un resultado algo distinto. A eso lo llamamos variabilidad muestral, y su tamaño lo mide el error típico: DT / √n.",
        "En «Explora» vas a sacar muestras de una población simulada. Fíjate en qué le pasa a la nube de medias cuando aumentas n. Después, a practicar."
      ]
    },
    intervalos: {
      titulo: "2 · Intervalos", corto: "Intervalos",
      explica: [
        "Una sola media es una estimación puntual. Pero ya sabes que otra muestra daría otro valor… ¿cómo expresamos esa incertidumbre?",
        "Con un intervalo de confianza: media ± valor crítico × error típico. Con un 95 % de confianza, el valor crítico es 1,96.",
        "¿De dónde sale el 1,96? Si 1 − α = 95 %, queda un 5 % fuera, un 2,5 % en cada cola de la normal. El 1,96 es el valor que deja ese 2,5 % por encima.",
        "Ojo con la interpretación: el 95 % se refiere al procedimiento. De cada 100 intervalos, unos 95 contienen el parámetro. En «Explora» lo vas a ver con tus propios ojos."
      ]
    },
    juicio: {
      titulo: "3 · El juicio", corto: "El juicio",
      explica: [
        "El contraste de hipótesis funciona como un juicio. Partimos de la presunción de inocencia: H₀, «no hay diferencias» o «no hay relación».",
        "Antes de ver las pruebas fijamos la duda razonable, α, normalmente ,05. Es el riesgo de condenar a un inocente que aceptamos.",
        "El valor p responde a esto: si el acusado fuera inocente, ¿qué probabilidad habría de reunir pruebas así de incriminatorias? Si p ≤ α, lo condenamos: rechazamos H₀.",
        "Y si p > α, el veredicto es «no culpable», no «inocente». Nunca demostramos H₀. En «Explora» puedes celebrar un juicio o mil."
      ]
    },
    supuestos: {
      titulo: "4 · Supuestos", corto: "Supuestos",
      explica: [
        "Antes de algunas pruebas comprobamos dos supuestos: normalidad (Shapiro-Wilk o Kolmogorov-Smirnov) y homocedasticidad (Levene).",
        "Aquí la lógica se invierte: H₀ dice que el supuesto se cumple. Por eso lo que queremos es p > ,05, no encontrar pruebas de que se incumpla.",
        "Piensa en la ITV: el coche se presume en buen estado y esperamos que pase la inspección.",
        "En clase usamos esta pauta: con menos de 50 participantes, Shapiro-Wilk; con 50 o más, Kolmogorov-Smirnov con corrección de Lilliefors."
      ]
    },
    esquema: {
      titulo: "5 · ¿Qué prueba?", corto: "¿Qué prueba?",
      explica: [
        "Elegir la prueba es seguir el esquema de decisión, siempre en el mismo orden.",
        "Primero: ¿qué tipo de variables tengo? Segundo: ¿qué quiero hacer, asociar, relacionar o comparar? Tercero: ¿se cumplen los supuestos?",
        "Esa justificación es el paso 1 de todas las actividades: «¿Por qué esta prueba?». En «Explora» tienes el esquema guiado, y desde el mapa de «Usar los estadísticos» llegas a cada prueba."
      ]
    },
    chi: {
      titulo: "6 · Chi-cuadrado", corto: "Chi-cuadrado",
      explica: [
        "El chi-cuadrado analiza si dos variables categóricas están asociadas, por ejemplo, la red social más usada y haber sufrido ciberacoso.",
        "Compara lo que observamos con lo que esperaríamos si fueran independientes: E = total de fila × total de columna / N.",
        "Si el resultado es significativo, los residuos corregidos nos dicen dónde está la asociación: Z > +1,96, más casos de los esperados; Z < −1,96, menos.",
        "En «Practica» tienes ejercicios y las fichas de las Actividades 1 y 2 para comprobar lo que hayas hecho en papel en clase."
      ]
    },
    correlaciones: {
      titulo: "7 · Correlaciones", corto: "Correlaciones",
      explica: [
        "La correlación estudia la relación entre dos variables cuantitativas. Pearson, si hay normalidad; Spearman, si no la hay o hay variables ordinales.",
        "Hay que responder a tres preguntas distintas: dirección (el signo), intensidad (|r|, de 0 a 1) y significación (el valor p).",
        "Una correlación significativa puede ser débil, y una fuerte puede no ser significativa con muestras pequeñas. Y recuerda: correlación no implica causalidad."
      ]
    },
    independientes: {
      titulo: "8 · Grupos independientes", corto: "Grupos independientes",
      explica: [
        "Ahora comparamos una variable cuantitativa entre dos grupos de personas distintas: chicas y chicos, quienes hacen voluntariado y quienes no…",
        "Si se cumple la normalidad en cada grupo y también la homocedasticidad (Levene), usamos la t de Student para muestras independientes: compara las dos medias.",
        "Si no se cumple la normalidad, o en nuestro esquema tampoco la homocedasticidad, usamos la U de Mann-Whitney. No compara medias, sino rangos: la posición de cada persona al ordenar a todo el mundo.",
        "En «Explora» generas los dos grupos, compruebas los supuestos y verás qué prueba toca y cómo se redacta el resultado. Fíjate en que con la U informamos de medianas, no de medias."
      ]
    },
    relacionadas: {
      titulo: "9 · Muestras relacionadas", corto: "Muestras relacionadas",
      explica: [
        "Ahora medimos a las mismas personas dos veces: antes y después de un taller, por ejemplo. Eso son muestras relacionadas.",
        "Lo que analizamos es la diferencia de cada persona entre las dos medidas. Si esas diferencias siguen una distribución normal, usamos la t de Student para muestras relacionadas.",
        "Si no hay normalidad, usamos la prueba de Wilcoxon, que trabaja con los rangos de esas diferencias.",
        "Y un aviso importante: aunque el cambio sea significativo, sin un grupo control no podemos afirmar que se deba a la intervención."
      ]
    },
    repaso: {
      titulo: "Repaso final", corto: "Repaso",
      explica: [
        "Este es el repaso final: preguntas mezcladas de los nueve módulos.",
        "Úsalo antes del examen. Lo que falles aparecerá en tu cuaderno como algo que repasar."
      ]
    }
  };

  // Reacciones a las respuestas (se elige una al azar)
  const REACCIONES = {
    acierto: ["¡Genial! Muy bien razonado.", "¡Eso es!", "¡Muy bien! Lo has clavado.", "¡Perfecto, así se hace!", "¡Bien visto!"],
    racha: ["¡Tres seguidas, {alumno}! Estoy muy {contenta}.", "¡Vas como un tiro! Otra más bien resuelta."],
    segundo: ["¡Mira qué bien! A la segunda lo has conseguido.", "¡Eso es! La pista te ha venido de perlas."],
    fallo: ["Vale, paremos un momento y revisemos el razonamiento. Te dejo una pista.", "Casi. Dale otra vuelta con esta pista.", "Vamos a verlo con calma. Aquí tienes una pista."],
    fallo2: ["No pasa nada: te explico la solución y lo apunto en tu cuaderno para que lo repases.", "Veamos juntos la respuesta. Lo apunto en tu cuaderno para que le eches un ojo luego."],
    modulo: ["¡Has terminado el módulo! Puedes repetir los ejercicios que quieras o pasar al siguiente.", "¡Módulo completado! Echa un vistazo a tu cuaderno cuando te apetezca."]
  };

  // ------------------------------------------------------------------
  // Datos de las actividades de chi-cuadrado
  // ------------------------------------------------------------------
  const ACT1 = { // Clima de aula y participación voluntaria
    filas: ["Clima positivo", "Clima negativo"], cols: ["Participación alta", "Participación baja"],
    O: [[25, 35], [45, 15]]
  };
  ACT1.r = E.chiCuadrado(ACT1.O);
  const ACT2 = { // Modalidad de trabajo y satisfacción laboral
    filas: ["Presencial", "Híbrida", "Remota"], cols: ["Satisfacción baja", "Satisfacción media", "Satisfacción alta"],
    O: [[35, 30, 15], [12, 23, 45], [25, 30, 25]]
  };
  ACT2.r = E.chiCuadrado(ACT2.O);

  function tablaHTML(a, conPct) {
    const tf = a.O.map(r => r.reduce((s, v) => s + v, 0));
    const tc = a.cols.map((_, j) => a.O.reduce((s, r) => s + r[j], 0));
    return `<div class="tabla-scroll"><table class="t-ufv"><tr><th></th>${a.cols.map(c => `<th>${c}</th>`).join("")}<th>Total</th></tr>` +
      a.O.map((r, i) => `<tr><td class="fila">${a.filas[i]}</td>${r.map(v => `<td>${v}${conPct ? ` <small>(${fmt(100 * v / tf[i], 1)} %)</small>` : ""}</td>`).join("")}<td>${tf[i]}</td></tr>`).join("") +
      `<tr><td class="fila">Total</td>${tc.map(v => `<td>${v}</td>`).join("")}<td><b>${tf.reduce((s, v) => s + v, 0)}</b></td></tr></table></div>`;
  }
  const CIBER = `<div class="tabla-scroll"><table class="t-ufv"><tr><th></th><th>Ciberacoso: Sí</th><th>Ciberacoso: No</th><th>Total</th></tr><tr><td class="fila">Instagram</td><td>40</td><td>60</td><td>100</td></tr><tr><td class="fila">Otras</td><td>20</td><td>80</td><td>100</td></tr><tr><td class="fila">Total</td><td>60</td><td>140</td><td><b>200</b></td></tr></table></div>`;

  const RES = ["Más casos de los esperados", "Menos casos de los esperados", "Sin diferencia significativa"];
  const claseRes = z => z > 1.96 ? RES[0] : z < -1.96 ? RES[1] : RES[2];
  const PRUEBAS = ["Chi-cuadrado de Pearson", "Correlación de Pearson", "Correlación de Spearman", "t de Student (muestras independientes)", "t de Student (muestras relacionadas)", "U de Mann-Whitney", "Wilcoxon"];

  // ------------------------------------------------------------------
  // Ejercicios por módulo
  //   tipo: test | emparejar | clasificar | completar
  // ------------------------------------------------------------------
  const PRACTICA = {
    muestras: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "m1", tipo: "test", concepto: "var_muestral",
          enunciado: "Se sacan cuatro muestras de 100 jóvenes de la misma población y se mide el apoyo social percibido (0–100). Sus medias son 56, 59, 61 y 58. ¿Por qué son distintas?",
          opciones: ["Porque cada muestra incluye a personas distintas de la misma población.", "Porque alguna de las cuatro muestras se ha seleccionado de forma sesgada.", "Porque la media de la población cambia cada vez que se extrae una muestra."],
          correcta: 0, pista: "¿Qué cambia de una muestra a otra: la población o las personas que entran en la muestra?",
          explicacion: "La población (y su media μ) es la misma. Lo que cambia son las personas elegidas, y con ellas el estadístico: eso es la variabilidad muestral." },
        { id: "m2", tipo: "emparejar", concepto: "var_muestral",
          enunciado: "Empareja cada término con su definición.",
          pares: [["Parámetro", "Valor de la población, fijo y normalmente desconocido (μ)"], ["Estadístico", "Valor calculado en la muestra, como la media muestral"], ["Variabilidad muestral", "Diferencias entre los resultados de muestras distintas"], ["Error típico", "Desviación típica de las medias de muchas muestras"]],
          pista: "El parámetro pertenece a la población; el estadístico, a la muestra.",
          explicacion: "Parámetro → población; estadístico → muestra; variabilidad muestral → diferencias entre muestras; error típico → cuánto varían las medias (DT / √n)." },
        { id: "m3", tipo: "completar", concepto: "error_tipico",
          enunciado: "Una muestra de n = 100 tiene una DT de 20 puntos. Calcula el error típico de la media (EE = DT / √n).",
          campos: [{ etiqueta: "EE", valor: 2, tol: 0.05 }],
          pista: "√100 = 10.", explicacion: "EE = 20 / √100 = 20 / 10 = 2 puntos." },
        { id: "m4", tipo: "test", concepto: "error_tipico",
          enunciado: "Si la muestra pasa de n = 100 a n = 400 (con la misma DT), el error típico…",
          opciones: ["se reduce a la mitad.", "se reduce a la cuarta parte.", "se mantiene igual."],
          correcta: 0, pista: "El error típico depende de √n. ¿Cuánto vale √400 comparado con √100?",
          explicacion: "√400 = 20 y √100 = 10: el denominador se duplica, así que el error típico se reduce a la mitad (de 2 a 1)." }
      ]
    }],
    intervalos: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "i1", tipo: "completar", concepto: "ic_calculo",
          enunciado: "Apoyo social percibido en una muestra de estudiantes: M = 58, DT = 20, n = 100. Calcula el IC al 95 % (valor crítico 1,96).",
          campos: [{ etiqueta: "Límite inferior", valor: 54.08, tol: 0.1 }, { etiqueta: "Límite superior", valor: 61.92, tol: 0.1 }],
          pista: "Primero el error típico: 20 / √100 = 2. Después el margen: 1,96 × 2.",
          explicacion: "EE = 2; margen = 1,96 × 2 = 3,92; IC = 58 ± 3,92 = [54,08 ; 61,92]." },
        { id: "i2", tipo: "emparejar", concepto: "confianza_alfa",
          enunciado: "Empareja cada nivel de confianza con su α y su valor crítico.",
          pares: [["90 %", "α = ,10 · valor crítico 1,645"], ["95 %", "α = ,05 · valor crítico 1,96"], ["99 %", "α = ,01 · valor crítico 2,576"]],
          pista: "α = 1 − nivel de confianza. Cuanta más confianza, mayor es el valor crítico.",
          explicacion: "90 % → α = ,10 y 1,645; 95 % → α = ,05 y 1,96; 99 % → α = ,01 y 2,576." },
        { id: "i3", tipo: "completar", concepto: "confianza_alfa",
          enunciado: "Con un nivel de confianza del 95 %, ¿qué porcentaje queda en CADA cola de la distribución normal?",
          campos: [{ etiqueta: "En cada cola", valor: 2.5, tol: 0.01, unidad: "%" }],
          pista: "Fuera del 95 % queda un 5 %, y se reparte entre dos colas.",
          explicacion: "α = 5 %, repartido en dos colas: 2,5 % en cada una. El valor que deja un 2,5 % por encima es 1,96." },
        { id: "i4", tipo: "test", concepto: "ic_interp",
          enunciado: "Obtienes un IC al 95 % de [54,1 ; 61,9]. ¿Qué afirmación es correcta?",
          opciones: ["De muchos intervalos calculados así, cerca del 95 % contendría μ.", "Hay un 95 % de probabilidad de que μ esté entre 54,1 y 61,9.", "El 95 % de los participantes puntúa entre 54,1 y 61,9 puntos."],
          correcta: 0, pista: "¿El 95 % habla de un intervalo concreto o del procedimiento repetido muchas veces?",
          explicacion: "El 95 % describe el procedimiento: la proporción de intervalos que aciertan a la larga. μ es fija; lo que cambia de una muestra a otra es el intervalo." },
        { id: "i5", tipo: "test", concepto: "confianza_alfa",
          enunciado: "Con los mismos datos, calculas un IC al 95 % y otro al 99 %. ¿Cuál es más amplio?",
          opciones: ["El del 99 %.", "El del 95 %.", "Los dos tienen la misma amplitud."],
          correcta: 0, pista: "Para acertar más a menudo, ¿necesitas un «aro» más grande o más pequeño?",
          explicacion: "El del 99 %: su valor crítico es 2,576 en lugar de 1,96. Más confianza implica menos precisión con los mismos datos." },
        { id: "i6", tipo: "test", concepto: "ic_interp",
          enunciado: "Satisfacción laboral: dos muestras con media 60 y DT 20. Con n = 25, el IC al 95 % es [52,2 ; 67,8]; con n = 400, es [58,0 ; 62,0]. ¿Cuál estima con más precisión?",
          opciones: ["La de n = 400, porque su intervalo es más estrecho.", "La de n = 25, porque su intervalo abarca más valores.", "Ninguna, porque las dos tienen la misma media y DT."],
          correcta: 0, pista: "Precisión = intervalo estrecho. ¿Qué le pasa al error típico con más participantes?",
          explicacion: "Con n = 400 el error típico es menor (20 / 20 = 1 frente a 20 / 5 = 4) y el intervalo, más estrecho: la estimación es más precisa." }
      ]
    }],
    juicio: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "j1", tipo: "emparejar", concepto: ["errores", "decision_h0"],
          enunciado: "Empareja cada elemento del juicio con su equivalente en el contraste de hipótesis.",
          pares: [["Presunción de inocencia", "H₀"], ["Duda razonable fijada antes del juicio", "α"], ["Probabilidad de reunir pruebas así si fuera inocente", "Valor p"], ["Condenar a un inocente", "Error tipo I"], ["Absolver a un culpable", "Error tipo II"]],
          pista: "Repasa la tabla de «La analogía» en Explora.",
          explicacion: "Inocencia → H₀; duda razonable → α; probabilidad de las pruebas si fuera inocente → valor p; condenar a un inocente → error tipo I; absolver a un culpable → error tipo II." },
        { id: "j2", tipo: "clasificar", concepto: "decision_h0",
          enunciado: "Tres investigaciones distintas analizadas con α = ,05. ¿Qué decisión tomas en cada una?",
          categorias: ["Se rechaza H₀", "No se rechaza H₀"],
          items: [["Empatía y voluntariado: t(98) = 0,83; p = ,409", "No se rechaza H₀"], ["Estrés y satisfacción laboral: r = −,41; p < ,001", "Se rechaza H₀"], ["Autoconfianza y práctica deportiva: t(118) = 1,12; p = ,265", "No se rechaza H₀"]],
          pista: "Compara cada p con ,05: si p ≤ ,05, se rechaza H₀.",
          explicacion: ",409 y ,265 son mayores que ,05: no se rechaza H₀. p < ,001 es menor que ,05: se rechaza H₀." },
        { id: "j3", tipo: "test", concepto: "decision_h0",
          enunciado: "Autoestima en adolescentes, comparando chicas y chicos: chicas M = 3,6; chicos M = 3,1; t = −2,89; p = ,004. Con α = ,05, ¿qué decides?",
          opciones: ["Rechazo H₀: la diferencia es estadísticamente significativa.", "No rechazo H₀: una diferencia de 0,5 puntos es pequeña.", "Acepto H₀: las dos medias son prácticamente iguales."],
          correcta: 0, pista: "¿,004 es mayor o menor que ,05?",
          explicacion: ",004 ≤ ,05: unas diferencias así serían muy improbables si no las hubiera en la población. Rechazamos H₀." },
        { id: "j4", tipo: "test", concepto: "valor_p",
          enunciado: "¿Qué es exactamente el valor p?",
          opciones: ["La probabilidad de un resultado igual o más extremo si H₀ fuera cierta.", "La probabilidad de que H₀ sea cierta a la vista de los datos obtenidos.", "La probabilidad de que el resultado se deba únicamente al azar."],
          correcta: 0, pista: "El valor p se calcula suponiendo algo. ¿Qué?",
          explicacion: "p se calcula suponiendo que H₀ es cierta. No mide la probabilidad de H₀ ni el tamaño del efecto." },
        { id: "j5", tipo: "test", concepto: "decision_h0",
          enunciado: "Empatía y voluntariado: p = ,409. ¿Qué podemos concluir?",
          opciones: ["No hay evidencia suficiente de diferencias: no se rechaza H₀.", "Queda demostrado que los dos grupos tienen la misma empatía.", "Hay un 40,9 % de probabilidad de que H₀ sea cierta."],
          correcta: 0, pista: "Recuerda el veredicto del jurado cuando faltan pruebas.",
          explicacion: "Es un «no culpable por falta de pruebas»: no rechazamos H₀, pero tampoco la demostramos." },
        { id: "j6", tipo: "test", concepto: "errores",
          enunciado: "Si H₀ es cierta y trabajamos con α = ,05, ¿en qué proporción de estudios la rechazaríamos por error a largo plazo?",
          opciones: ["En torno al 5 %.", "En torno al 95 %.", "En ningún caso."],
          correcta: 0, pista: "Prueba «Mil juicios» en Explora con diferencia real 0.",
          explicacion: "α es precisamente la probabilidad de error tipo I: rechazar H₀ cuando es verdadera, alrededor del 5 % de las veces." }
      ]
    }],
    supuestos: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "s1", tipo: "test", concepto: "supuestos",
          enunciado: "Al comprobar la normalidad o la homocedasticidad, ¿qué resultado deseamos?",
          opciones: ["p > ,05: no hay evidencia de que el supuesto se incumpla.", "p ≤ ,05: hay evidencia de que el supuesto se cumple.", "Ninguno: en los supuestos no se interpreta el valor p."],
          correcta: 0, pista: "¿Qué dice H₀ en una prueba de supuestos?",
          explicacion: "H₀ dice que el supuesto se cumple. Queremos no rechazarla: p > ,05." },
        { id: "s2", tipo: "clasificar", concepto: "supuestos",
          enunciado: "Seis comprobaciones de supuestos (α = ,05). ¿Se cumple el supuesto?",
          categorias: ["Se cumple", "No se cumple"],
          items: [["Autoestima, normalidad: W(60) = ,974; p = ,228", "Se cumple"], ["Ansiedad, normalidad: D(45) = ,187; p = ,021", "No se cumple"], ["Satisfacción académica, Levene: F(1, 101) = 0,936; p = ,336", "Se cumple"], ["Estrés laboral, Levene: F(1, 78) = 5,21; p = ,025", "No se cumple"], ["Horas de estudio, normalidad: W(120) = ,989; p = ,704", "Se cumple"], ["Autoeficacia, Levene: F(1, 110) = 4,17; p = ,043", "No se cumple"]],
          pista: "p > ,05 → se cumple. p ≤ ,05 → no se cumple.",
          explicacion: "Se cumplen los de p = ,228, ,336 y ,704. No se cumplen los de p = ,021, ,025 y ,043." },
        { id: "s3", tipo: "clasificar", concepto: "supuestos",
          enunciado: "Con el criterio de clase, ¿qué prueba de normalidad interpretarías?",
          categorias: ["Shapiro-Wilk", "Kolmogorov-Smirnov (Lilliefors)"],
          items: [["Autoestima, 30 participantes", "Shapiro-Wilk"], ["Ansiedad, 120 participantes", "Kolmogorov-Smirnov (Lilliefors)"], ["Un grupo de 49 personas", "Shapiro-Wilk"], ["Un grupo de 50 personas", "Kolmogorov-Smirnov (Lilliefors)"]],
          pista: "La frontera está en 50 participantes por grupo.",
          explicacion: "Menos de 50 → Shapiro-Wilk; 50 o más → Kolmogorov-Smirnov con corrección de Lilliefors." },
        { id: "s4", tipo: "test", concepto: "supuestos",
          enunciado: "La prueba de Levene sirve para comprobar…",
          opciones: ["si las varianzas de los grupos son similares.", "si las medias de los grupos son iguales.", "si la variable sigue una distribución normal."],
          correcta: 0, pista: "Homocedasticidad = igualdad de…",
          explicacion: "Levene contrasta la igualdad de varianzas (homocedasticidad), no de medias." }
      ]
    }],
    esquema: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "e1", tipo: "emparejar", concepto: "eleccion_prueba",
          enunciado: "Empareja cada situación con la prueba del esquema de 1.º.",
          pares: [["Dos variables categóricas", "Chi-cuadrado de Pearson"], ["Dos cuantitativas que cumplen normalidad (relacionar)", "Correlación de Pearson"], ["Dos cuantitativas sin normalidad (relacionar)", "Correlación de Spearman"], ["Las mismas personas medidas dos veces, con normalidad", "t de Student (muestras relacionadas)"], ["Dos grupos independientes sin normalidad", "U de Mann-Whitney"]],
          pista: "Primero mira el tipo de variables y el objetivo; después, la normalidad.",
          explicacion: "Categóricas → chi-cuadrado; relacionar con normalidad → Pearson, sin ella → Spearman; mismas personas con normalidad → t relacionadas; grupos independientes sin normalidad → U de Mann-Whitney." },
        { id: "e2", tipo: "test", concepto: "eleccion_prueba",
          enunciado: "Diagnóstico de TDAH (sí/no) y problemas de sueño (sí/no) en 461 adultos. ¿Qué prueba usamos?",
          opciones: ["Chi-cuadrado de Pearson", "Correlación de Spearman", "t de Student (muestras independientes)"],
          correcta: 0, pista: "¿Las dos variables son categóricas o cuantitativas?",
          explicacion: "Dos variables categóricas dicotómicas y objetivo de asociación → chi-cuadrado." },
        { id: "e3", tipo: "test", concepto: "eleccion_prueba",
          enunciado: "Horas de sueño a la semana y puntuación de inatención en adultos con TDAH. Ambas cumplen la normalidad. ¿Qué prueba usamos?",
          opciones: ["Correlación de Pearson", "Correlación de Spearman", "t de Student (muestras relacionadas)"],
          correcta: 0, pista: "Dos cuantitativas, objetivo relacionar… ¿y la normalidad?",
          explicacion: "Dos variables cuantitativas, objetivo relacionar y normalidad → Pearson." },
        { id: "e4", tipo: "clasificar", concepto: "eleccion_prueba",
          enunciado: "¿Qué prueba elegirías en cada caso?",
          categorias: PRUEBAS,
          items: [["¿Se asocia practicar deporte (sí/no) con tener insomnio (sí/no)?", "Chi-cuadrado de Pearson"], ["Estrés de enfermeras de noche y de día; normalidad sí y Levene p = ,41", "t de Student (muestras independientes)"], ["Ansiedad de 30 personas antes y después de un programa; Shapiro-Wilk p = ,012", "Wilcoxon"], ["Nivel de estudios (primaria/secundaria/universitarios) y satisfacción con la vida", "Correlación de Spearman"]],
          pista: "En el último caso, una de las variables es ordinal: es la excepción del esquema.",
          explicacion: "Deporte-insomnio → chi-cuadrado; enfermeras → t independientes; antes/después sin normalidad → Wilcoxon; variable ordinal + cuantitativa → Spearman." }
      ]
    }],
    chi: [
      { id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "x1", tipo: "completar", concepto: "esperadas",
          enunciado: "Red social más utilizada (Instagram/otras) y haber sufrido ciberacoso (sí/no). Calcula las frecuencias esperadas de la fila Instagram si las variables fueran independientes.",
          contexto: CIBER,
          campos: [{ etiqueta: "Instagram – Sí", valor: 30, tol: 0.05 }, { etiqueta: "Instagram – No", valor: 70, tol: 0.05 }],
          pista: "E = total de fila × total de columna / N. Para Instagram–Sí: 100 × 60 / 200.",
          explicacion: "Instagram–Sí: 100 × 60 / 200 = 30. Instagram–No: 100 × 140 / 200 = 70." },
        { id: "x2", tipo: "test", concepto: "esperadas",
          enunciado: "Las frecuencias esperadas representan…",
          opciones: ["lo que observaríamos si las variables fueran independientes.", "lo que el investigador espera encontrar según su hipótesis.", "las frecuencias reales que hay en la población de estudio."],
          correcta: 0, pista: "Se calculan suponiendo H₀.",
          explicacion: "Son las frecuencias bajo independencia (H₀). El χ² compara las observadas con ellas." },
        { id: "x3", tipo: "test", concepto: "residuos",
          enunciado: "TDAH y problemas de sueño en 461 adultos: en la casilla «TDAH – sí tiene problemas de sueño», el residuo corregido es z = 10,1. ¿Qué significa?",
          opciones: ["Hay muchos más casos de los esperados en esa casilla.", "Hay muchos menos casos de los esperados en esa casilla.", "No se interpreta, porque supera el límite de 1,96."],
          correcta: 0, pista: "Mira el signo y compáralo con +1,96.",
          explicacion: "z = 10,1 > +1,96: en esa casilla hay significativamente más casos de los esperados bajo independencia." },
        { id: "x4", tipo: "clasificar", concepto: "residuos",
          enunciado: "Interpreta estos residuos corregidos (α = ,05).",
          categorias: RES,
          items: [["Z = 3,70", RES[0]], ["Z = −3,70", RES[1]], ["Z = 1,20", RES[2]], ["Z = −2,50", RES[1]], ["Z = −0,95", RES[2]]],
          pista: "Los límites son +1,96 y −1,96.",
          explicacion: "Por encima de +1,96, más casos; por debajo de −1,96, menos; entre ambos, sin diferencia significativa." },
        { id: "x5", tipo: "test", concepto: "apa",
          enunciado: "¿Qué resultado está bien escrito según las normas APA 7?",
          opciones: ["χ²(1, N = 461) = 102,43, p < ,001", "χ²(461) = 102,43, p < ,001", "χ²(1, N = 461) = 102,43, p = ,000"],
          correcta: 0, pista: "Entre paréntesis van los grados de libertad y el tamaño de la muestra.",
          explicacion: "Formato: χ²(gl, N = …) = valor, p = … Entre paréntesis van los grados de libertad y el tamaño muestral, y nunca se escribe p = ,000: se pone p < ,001." }
      ] },
      { id: "act1", titulo: "Ficha · Actividad 1", descripcion: "Clima de aula percibido y participación voluntaria en clase (120 estudiantes universitarios). Hipótesis: los estudiantes que perciben un clima de aula positivo presentarán una alta participación voluntaria. Vuelca aquí lo que hiciste en papel.",
        contexto: tablaHTML(ACT1, true), ejercicios: [
        { id: "a1_11", tipo: "clasificar", concepto: "eleccion_prueba",
          enunciado: "1.1 ¿Qué variables tenemos?", categorias: ["Categórica nominal", "Categórica ordinal", "Cuantitativa"],
          items: [["Clima de aula percibido (positivo/negativo)", "Categórica nominal"], ["Participación voluntaria (alta/baja)", "Categórica ordinal"]],
          pista: "Positivo/negativo no tiene orden de cantidad; alta/baja sí.",
          explicacion: "Clima: categórica nominal dicotómica. Participación: categórica ordinal dicotómica." },
        { id: "a1_12", tipo: "test", concepto: "eleccion_prueba", enunciado: "1.2 ¿Qué queremos analizar?",
          opciones: ["Asociar", "Relacionar", "Comparar", "Predecir"], correcta: 0,
          pista: "Con dos variables categóricas hablamos de…", explicacion: "Con dos variables categóricas, el objetivo es analizar su asociación." },
        { id: "a1_13", tipo: "test", concepto: "esperadas", enunciado: "1.3 ¿Qué supuestos comprobamos?",
          opciones: ["Independencia de las observaciones y esperadas ≥ 5.", "Normalidad y homocedasticidad de las dos variables.", "Normalidad de las variables y esperadas ≥ 5."], correcta: 0,
          pista: "El chi-cuadrado no exige normalidad.", explicacion: "Independencia de las observaciones y frecuencias esperadas ≥ 5. No se exige normalidad ni homocedasticidad." },
        { id: "a1_14", tipo: "test", concepto: "eleccion_prueba", enunciado: "1.4 ¿Qué prueba seleccionamos?",
          opciones: ["Chi-cuadrado de Pearson", "Correlación de Spearman", "t de Student (muestras independientes)"], correcta: 0,
          pista: "Asociación entre dos variables categóricas.", explicacion: "Chi-cuadrado de independencia de Pearson." },
        { id: "a1_e", tipo: "completar", concepto: "esperadas", enunciado: "Comprueba una frecuencia esperada: Clima positivo – Participación alta.",
          campos: [{ etiqueta: "Esperada", valor: ACT1.r.E[0][0], tol: 0.05 }],
          pista: "60 × 70 / 120.", explicacion: `E = 60 × 70 / 120 = ${fmt(ACT1.r.E[0][0], 0)}. Se observaron 25: menos de los esperados.` },
        { id: "a1_22", tipo: "completar", concepto: "apa", enunciado: "2.2 Reporta el estadístico de contraste (χ² de la tabla de la actividad).",
          campos: [{ etiqueta: "χ²", valor: ACT1.r.chi, tol: 0.05 }, { etiqueta: "gl", valor: ACT1.r.gl, tol: 0 }, { etiqueta: "N", valor: ACT1.r.N, tol: 0 }],
          pista: "gl = (filas − 1) × (columnas − 1).", explicacion: `χ²(1, N = 120) = ${fmt(ACT1.r.chi)}, p < ,001.` },
        { id: "a1_21", tipo: "test", concepto: "decision_h0", enunciado: "2.1 ¿El resultado es estadísticamente significativo?",
          opciones: ["Sí: hay una asociación estadísticamente significativa.", "No: no hay una asociación estadísticamente significativa.", "No se puede saber sin calcular antes la V de Cramer."], correcta: 0,
          pista: "p < ,001 comparado con α = ,05.", explicacion: "p < ,001 ≤ ,05: se rechaza H₀ de independencia." },
        { id: "a1_23", tipo: "clasificar", concepto: "residuos", enunciado: "2.3 Interpreta los residuos corregidos de la columna «Participación alta».",
          categorias: RES,
          items: [[`Clima positivo – Participación alta (Z = ${fmt(ACT1.r.R[0][0])})`, claseRes(ACT1.r.R[0][0])], [`Clima negativo – Participación alta (Z = ${fmt(ACT1.r.R[1][0])})`, claseRes(ACT1.r.R[1][0])]],
          pista: "Fíjate en el signo de cada residuo.", explicacion: "Hay más casos de participación alta de los esperados con clima negativo (Z = 3,70) y menos con clima positivo (Z = −3,70)." },
        { id: "a1_31", tipo: "test", concepto: "apa", enunciado: "3.1 ¿Los resultados apoyan la hipótesis de investigación?",
          opciones: ["No: hay asociación significativa, pero en sentido contrario.", "Sí: hay asociación estadísticamente significativa (p < ,001).", "No: el resultado no es estadísticamente significativo."], correcta: 0,
          pista: "La hipótesis decía que el clima POSITIVO se asocia con participación alta. ¿Qué dicen los porcentajes (41,7 % frente a 75,0 %)?",
          explicacion: "Hay asociación significativa, pero la participación alta es más frecuente con clima negativo (75,0 %) que con clima positivo (41,7 %). La hipótesis direccional no se apoya." },
        { id: "a1_32", tipo: "test", concepto: "apa", enunciado: "3.2 ¿Qué conclusión es coherente con el diseño?",
          opciones: ["La participación alta es más frecuente con clima negativo; no implica causalidad.", "Un clima de aula negativo provoca que el alumnado participe más en las clases.", "El clima de aula no guarda relación con la participación voluntaria."], correcta: 0,
          pista: "¿Permite un estudio así hablar de causas?", explicacion: "Describimos la asociación encontrada sin afirmaciones causales: el diseño no las permite." }
      ] },
      { id: "act2", titulo: "Ficha · Actividad 2", descripcion: "Modalidad de trabajo y satisfacción laboral (240 trabajadores). Hipótesis: quienes trabajan en modalidad híbrida presentarán una mayor proporción de satisfacción alta que quienes trabajan de forma presencial o en remoto. Las cifras se calculan a partir de la tabla.",
        contexto: tablaHTML(ACT2, true), ejercicios: [
        { id: "a2_11", tipo: "clasificar", concepto: "eleccion_prueba", enunciado: "1.1 ¿Qué variables tenemos?",
          categorias: ["Categórica nominal", "Categórica ordinal", "Cuantitativa"],
          items: [["Modalidad de trabajo (presencial/híbrida/remota)", "Categórica nominal"], ["Satisfacción laboral (baja/media/alta)", "Categórica ordinal"]],
          pista: "¿Alguna de las dos tiene un orden natural?", explicacion: "Modalidad: nominal de tres categorías. Satisfacción: ordinal de tres categorías." },
        { id: "a2_gl", tipo: "completar", concepto: "apa", enunciado: "2.2 Calcula los grados de libertad y anota el χ² obtenido.",
          campos: [{ etiqueta: "gl", valor: ACT2.r.gl, tol: 0 }, { etiqueta: "χ²", valor: ACT2.r.chi, tol: 0.05 }],
          pista: "gl = (3 − 1) × (3 − 1). El χ² lo tienes en la ficha de clase o en «Explora» cargando la Actividad 2.",
          explicacion: `gl = 2 × 2 = 4; χ²(4, N = 240) = ${fmt(ACT2.r.chi)}, p < ,001.` },
        { id: "a2_21", tipo: "test", concepto: "decision_h0", enunciado: "2.1 ¿El resultado es estadísticamente significativo (α = ,05)?",
          opciones: ["Sí: hay una asociación estadísticamente significativa.", "No: no hay una asociación estadísticamente significativa.", "No se puede saber sin calcular antes la V de Cramer."], correcta: 0,
          pista: "p < ,001.", explicacion: "p < ,001: existe asociación significativa entre la modalidad de trabajo y la satisfacción laboral." },
        { id: "a2_23", tipo: "clasificar", concepto: "residuos", enunciado: "2.3 Interpreta estos residuos corregidos.",
          categorias: RES,
          items: [[`Híbrida – Satisfacción alta (Z = ${fmt(ACT2.r.R[1][2])})`, claseRes(ACT2.r.R[1][2])], [`Presencial – Satisfacción alta (Z = ${fmt(ACT2.r.R[0][2])})`, claseRes(ACT2.r.R[0][2])], [`Presencial – Satisfacción baja (Z = ${fmt(ACT2.r.R[0][0])})`, claseRes(ACT2.r.R[0][0])], [`Remota – Satisfacción alta (Z = ${fmt(ACT2.r.R[2][2])})`, claseRes(ACT2.r.R[2][2])]],
          pista: "Compara cada Z con ±1,96.",
          explicacion: "Satisfacción alta: más casos de los esperados en híbrida y menos en presencial. Presencial también tiene más satisfacción baja de la esperada. En remota no hay diferencia significativa." },
        { id: "a2_31", tipo: "test", concepto: "apa", enunciado: "3.1 ¿Los resultados apoyan la hipótesis?",
          opciones: ["Sí: la satisfacción alta es más frecuente en la modalidad híbrida.", "No: con tres categorías no se puede valorar la dirección.", "No: la satisfacción alta es más frecuente en la modalidad presencial."], correcta: 0,
          pista: "Mira los porcentajes por fila de la columna «Satisfacción alta».", explicacion: "Sí. Y, como siempre, sin afirmar que la modalidad híbrida cause mayor satisfacción." }
      ] },
      { id: "reflexion", titulo: "Reflexión · Actividades 3 y 4", ejercicios: [
        { id: "r3", tipo: "test", concepto: "decision_h0",
          enunciado: "Actividad 3: ¿qué cambiaría en la Actividad 1 si el resultado hubiera sido χ²(1, N = 120) = 3,75; p = ,053?",
          opciones: ["No se rechaza H₀ y no se interpretan residuos ni dirección.", "Solo cambia el valor p que se escribe en el apartado 2.2.", "Se rechaza H₀, porque ,053 está muy cerca del límite de ,05."], correcta: 0,
          pista: "¿,053 es mayor o menor que ,05? ¿Qué pasos dependen de que haya significación?",
          explicacion: "p = ,053 > ,05: no hay evidencia de asociación. Los apartados 2.3 y 2.4 quedan vacíos y la conclusión cambia. «Casi significativo» no existe en la decisión." },
        { id: "r4", tipo: "test", concepto: "apa",
          enunciado: "Actividad 4: en la Actividad 2, si el resultado fuera χ²(4, N = 240) = 5,16; p = ,267, ¿qué escribirías en los apartados 2.3 y 2.4?",
          opciones: ["Nada: sin significación no se interpretan dirección ni magnitud.", "Los residuos más altos y la V de Cramer, igual que antes.", "Que la modalidad híbrida tiene más satisfacción alta."], correcta: 0,
          pista: "Piensa qué se informa cuando el χ² no es significativo: ¿tiene sentido hablar de dirección o de magnitud?",
          explicacion: "Si no se rechaza H₀, no se informa de dirección ni de magnitud: los apartados 2.3 y 2.4 quedan vacíos." }
      ] }
    ],
    correlaciones: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "c1", tipo: "emparejar", concepto: "correlacion",
          enunciado: "Empareja cada coeficiente con el diagrama de dispersión que le corresponde.",
          pares: [["r = 1,00", "Todos los puntos sobre una recta ascendente"], ["r = −1,00", "Todos los puntos sobre una recta descendente"], ["r = ,62", "Nube ascendente: a más horas de estudio, mejor nota"], ["r = −,65", "Nube descendente: a más horas de sueño, menos ansiedad"], ["r = ,00", "Nube sin ningún patrón"]],
          pista: "El signo dice hacia dónde va la nube; |r| = 1 significa que todos los puntos están en la recta.",
          explicacion: "±1: relación perfecta (recta). Positivo: ascendente; negativo: descendente; 0: sin patrón lineal." },
        { id: "c2", tipo: "clasificar", concepto: "correlacion",
          enunciado: "Clasifica la intensidad con la tabla de referencia de clase (,10 / ,30 / ,50 / ,70).",
          categorias: ["Muy débil", "Débil", "Moderada", "Fuerte", "Muy fuerte"],
          items: [["r = ,08", "Muy débil"], ["r = −,25", "Débil"], ["r = −,41", "Moderada"], ["r = ,58", "Fuerte"], ["r = ,85", "Muy fuerte"]],
          pista: "Fíjate en |r|, sin el signo: 0–,10, ,10–,30, ,30–,50, ,50–,70 y ,70–1.",
          explicacion: "La intensidad depende del valor absoluto: ,08 muy débil; ,25 débil; ,41 moderada; ,58 fuerte; ,85 muy fuerte." },
        { id: "c3", tipo: "test", concepto: "correlacion",
          enunciado: "Horas de sueño e inatención en 461 adultos con TDAH: r(459) = −,46; p < ,001. ¿Cómo se describe esta relación?",
          opciones: ["Inversa, moderada y estadísticamente significativa.", "Positiva, fuerte y estadísticamente significativa.", "Inversa, débil y sin significación estadística."],
          correcta: 0, pista: "Signo → dirección; |r| → intensidad; p → significación.",
          explicacion: "Signo negativo → inversa; |r| = ,46 → moderada (entre ,30 y ,50); p < ,001 → significativa: a más horas de sueño, menos inatención." },
        { id: "c4", tipo: "test", concepto: "correlacion",
          enunciado: "Confianza en la policía y empatía: p = ,274. ¿Qué se informa?",
          opciones: ["No hay relación significativa; no se informan dirección ni magnitud.", "Hay una relación débil y positiva entre ambas variables.", "Queda demostrado que no existe relación entre ambas variables."],
          correcta: 0, pista: "Si no se rechaza H₀, ¿se interpretan la dirección y la magnitud?",
          explicacion: "p = ,274 > ,05: no se rechaza H₀ y no se reportan dirección ni magnitud." },
        { id: "c5", tipo: "test", concepto: "correlacion",
          enunciado: "Obtienes r = ,12; p < ,001 con n = 1.000. ¿Cómo se describe esta relación?",
          opciones: ["Positiva, débil y estadísticamente significativa.", "Positiva, muy fuerte y estadísticamente significativa.", "Nula, porque r es menor que ,30."],
          correcta: 0, pista: "Significación e intensidad son preguntas distintas.",
          explicacion: "|r| = ,12 es débil (entre ,10 y ,30), aunque con 1.000 participantes sea significativa: significación ≠ intensidad." },
        { id: "c6", tipo: "test", concepto: "correlacion",
          enunciado: "Estrés laboral y satisfacción laboral: r = −,41; p < ,001. ¿Qué conclusión es correcta?",
          opciones: ["A más estrés, menos satisfacción, sin poder afirmar causalidad.", "El estrés laboral causa una menor satisfacción laboral.", "A más estrés laboral, mayor satisfacción con el propio trabajo."],
          correcta: 0, pista: "¿Una correlación permite hablar de causas?",
          explicacion: "Relación inversa, moderada y significativa. La correlación no implica causalidad." }
      ]
    }],
    independientes: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "ti1", tipo: "test", concepto: "eleccion_prueba",
          enunciado: "Se compara la ansiedad de 40 estudiantes de Psicología y 35 de Criminología. ¿Qué tipo de muestras son?",
          opciones: ["Independientes: son personas distintas en cada grupo.", "Relacionadas: se mide la misma variable en los dos.", "Relacionadas: los dos grupos son de la misma universidad."],
          correcta: 0, pista: "¿Alguien aparece en los dos grupos?",
          explicacion: "Cada persona pertenece a un solo grupo: son muestras independientes. Medir la misma variable no las convierte en relacionadas." },
        { id: "ti2", tipo: "clasificar", concepto: ["eleccion_prueba", "no_parametricas"],
          enunciado: "Según el esquema de clase, ¿qué prueba corresponde en cada caso (dos grupos independientes)?",
          categorias: ["t de Student (muestras independientes)", "U de Mann-Whitney"],
          items: [["Normalidad: p > ,05 en los dos grupos; Levene: p = ,41", "t de Student (muestras independientes)"], ["Shapiro-Wilk: p = ,004 en uno de los grupos", "U de Mann-Whitney"], ["Normalidad: p > ,05 en los dos grupos; Levene: p = ,02", "U de Mann-Whitney"], ["Normalidad: p = ,32 y p = ,18; Levene: p = ,57", "t de Student (muestras independientes)"]],
          pista: "Primero la normalidad de cada grupo; si se cumple, después Levene.",
          explicacion: "Con normalidad y homocedasticidad → t de Student. Si falla la normalidad, o según nuestro esquema la homocedasticidad → U de Mann-Whitney." },
        { id: "ti3", tipo: "completar", concepto: "comparar_medias",
          enunciado: "Empatía y voluntariado: 50 jóvenes hacen voluntariado y 50 no. ¿Cuántos grados de libertad tiene la t de Student?",
          campos: [{ etiqueta: "gl", valor: 98, tol: 0 }],
          pista: "En muestras independientes, gl = n₁ + n₂ − 2.",
          explicacion: "gl = 50 + 50 − 2 = 98. Por eso el resultado se escribe t(98) = 0,83, p = ,409." },
        { id: "ti4", tipo: "test", concepto: "comparar_medias",
          enunciado: "Autoestima de chicas y chicos: chicas M = 3,6; chicos M = 3,1; t = −2,89; p = ,004. ¿Qué conclusión es correcta?",
          opciones: ["Las chicas tienen una autoestima media significativamente mayor.", "Los chicos tienen una autoestima media significativamente mayor.", "No hay diferencias significativas entre chicas y chicos."],
          correcta: 0, pista: "Primero mira p; después, qué media es mayor. El signo de t solo depende del orden en que se introducen los grupos.",
          explicacion: "p = ,004 ≤ ,05: hay diferencias significativas, y la media de las chicas (3,6) es mayor que la de los chicos (3,1)." },
        { id: "ti5", tipo: "test", concepto: "no_parametricas",
          enunciado: "La U de Mann-Whitney compara…",
          opciones: ["los rangos (posiciones ordenadas) de los dos grupos.", "las medias aritméticas de los dos grupos.", "las varianzas de los dos grupos."],
          correcta: 0, pista: "Es una prueba no paramétrica: no usa las puntuaciones tal cual.",
          explicacion: "Ordena a todas las personas y compara los rangos de cada grupo. Por eso se acompaña de medianas, no de medias." },
        { id: "ti6", tipo: "test", concepto: "apa",
          enunciado: "¿Qué resultado de la t de Student está bien escrito?",
          opciones: ["t(98) = 0,83, p = ,409", "t = 0,83 (98), p = 0,409", "t(100) = 0,83, p = ,409"],
          correcta: 0, pista: "Entre paréntesis van los grados de libertad, y p sin el cero inicial.",
          explicacion: "Formato: t(gl) = valor, p = … Con 50 + 50 personas, gl = 98, no 100." }
      ]
    }],
    relacionadas: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "tr1", tipo: "test", concepto: "eleccion_prueba",
          enunciado: "Se mide la ansiedad de 30 personas antes y después de un programa de mindfulness. ¿Qué diseño es?",
          opciones: ["Muestras relacionadas: las mismas personas, dos medidas.", "Muestras independientes: «antes» y «después» son dos grupos.", "No se puede comparar sin un grupo de control."],
          correcta: 0, pista: "¿Son las mismas personas en las dos medidas?",
          explicacion: "Las mismas personas medidas dos veces: muestras relacionadas. El grupo control mejora la interpretación causal, pero no es necesario para comparar." },
        { id: "tr2", tipo: "clasificar", concepto: ["eleccion_prueba", "no_parametricas"],
          enunciado: "¿Qué prueba corresponde en cada caso (las mismas personas medidas dos veces)?",
          categorias: ["t de Student (muestras relacionadas)", "Wilcoxon"],
          items: [["Mindfulness: normalidad de las diferencias, Shapiro-Wilk p = ,012", "Wilcoxon"], ["Taller de autoestima: Shapiro-Wilk p = ,48", "t de Student (muestras relacionadas)"], ["Sueño antes y después de una terapia: K-S p = ,003", "Wilcoxon"], ["Estrés antes y después de un examen: Shapiro-Wilk p = ,21", "t de Student (muestras relacionadas)"]],
          pista: "Con normalidad (p > ,05) → t; sin normalidad → Wilcoxon.",
          explicacion: "p > ,05 en la normalidad → t de Student para muestras relacionadas; p ≤ ,05 → Wilcoxon." },
        { id: "tr3", tipo: "completar", concepto: "comparar_medias",
          enunciado: "Se mide la autoestima de 25 adolescentes antes y después de un taller. ¿Cuántos grados de libertad tiene la t para muestras relacionadas?",
          campos: [{ etiqueta: "gl", valor: 24, tol: 0 }],
          pista: "En muestras relacionadas, gl = n − 1 (n = número de personas).",
          explicacion: "gl = 25 − 1 = 24: hay 25 diferencias, una por persona." },
        { id: "tr4", tipo: "test", concepto: "comparar_medias",
          enunciado: "Taller de autoestima (datos simulados): antes M = 28,4; después M = 31,2; t(24) = 3,10; p = ,005. ¿Qué concluyes?",
          opciones: ["La autoestima media aumentó de forma significativa tras el taller.", "La autoestima media disminuyó de forma significativa tras el taller.", "No hay un cambio significativo en la autoestima media."],
          correcta: 0, pista: "Mira p y, después, qué media es mayor.",
          explicacion: "p = ,005 ≤ ,05 y la media pasa de 28,4 a 31,2: aumento significativo." },
        { id: "tr5", tipo: "test", concepto: "comparar_medias",
          enunciado: "En el mismo taller, ¿podemos afirmar que el taller causó la mejora?",
          opciones: ["No con seguridad: sin grupo control, otros factores podrían explicarla.", "Sí, porque el resultado es estadísticamente significativo.", "Sí, porque se ha medido a las mismas personas dos veces."],
          correcta: 0, pista: "¿Qué otras cosas pueden cambiar entre las dos medidas, aparte del taller?",
          explicacion: "Sin grupo control, el cambio podría deberse al paso del tiempo, a la maduración o a otros factores. La significación no demuestra causalidad." },
        { id: "tr6", tipo: "test", concepto: "no_parametricas",
          enunciado: "La prueba de Wilcoxon trabaja con…",
          opciones: ["los rangos de las diferencias de cada persona.", "las medias de dos grupos distintos de personas.", "las frecuencias observadas y las esperadas."],
          correcta: 0, pista: "Es la alternativa no paramétrica a la t para muestras relacionadas.",
          explicacion: "Calcula la diferencia de cada persona, ordena sus valores absolutos y compara la suma de rangos positivos y negativos." }
      ]
    }],
    repaso: [{
      id: "final", titulo: "Repaso final", ejercicios: [
        { id: "f1", tipo: "test", concepto: "var_muestral", enunciado: "La media de una muestra es…", opciones: ["un estadístico.", "un parámetro.", "un error típico."], correcta: 0, pista: "¿Se calcula en la muestra o en la población?", explicacion: "Se calcula en la muestra: es un estadístico. El parámetro es la media de la población." },
        { id: "f2", tipo: "test", concepto: "ic_calculo", enunciado: "Con M = 60, DT = 20 y n = 25, ¿cuál es el IC al 95 %?", opciones: ["[52,2 ; 67,8]", "[56,0 ; 64,0]", "[58,4 ; 61,6]"], correcta: 0, pista: "Margen = 1,96 × 4.", explicacion: "EE = 20 / √25 = 4; margen = 1,96 × 4 = 7,84; IC = 60 ± 7,84 = [52,16 ; 67,84]. [56 ; 64] olvida el valor crítico (60 ± 4) y [58,4 ; 61,6] divide entre n en lugar de √n." },
        { id: "f3", tipo: "test", concepto: "confianza_alfa", enunciado: "Si α = ,01, el nivel de confianza es…", opciones: ["99 %", "1 %", "95 %"], correcta: 0, pista: "Nivel de confianza = 1 − α.", explicacion: "1 − ,01 = ,99 → 99 %." },
        { id: "f4", tipo: "test", concepto: "decision_h0", enunciado: "p = ,03 con α = ,05. ¿Qué decides?", opciones: ["Rechazo H₀.", "No rechazo H₀.", "Acepto H₀."], correcta: 0, pista: "¿,03 ≤ ,05?", explicacion: ",03 ≤ ,05: se rechaza H₀." },
        { id: "f5", tipo: "test", concepto: "errores", enunciado: "Si en un estudio usamos α = ,10 en lugar de α = ,05…", opciones: ["es más fácil rechazar H₀ y aumenta el riesgo de error tipo I.", "es más difícil rechazar H₀ y baja el riesgo de error tipo I.", "cambia el valor p que se obtiene con los mismos datos."], correcta: 0, pista: "α es el umbral con el que comparamos p y, a la vez, el riesgo de error tipo I que aceptamos.", explicacion: "Con α = ,10 rechazamos H₀ con pruebas menos fuertes: aumenta la probabilidad de condenar a un inocente (error tipo I). El valor p no cambia: depende de los datos, no de α." },
        { id: "f6", tipo: "test", concepto: "errores", enunciado: "Concluir que existen diferencias cuando en realidad no las hay es…", opciones: ["Un error tipo I.", "Un error tipo II.", "Un acierto."], correcta: 0, pista: "Es condenar a un inocente.", explicacion: "Rechazar H₀ siendo verdadera es un error tipo I." },
        { id: "f7", tipo: "test", concepto: "supuestos", enunciado: "Levene: F(1, 78) = 5,21; p = ,025. ¿Se cumple la homocedasticidad?", opciones: ["No: hay evidencia de que las varianzas son distintas.", "Sí: el resultado es estadísticamente significativo.", "No se sabe: Levene compara medias, no varianzas."], correcta: 0, pista: "En los supuestos queremos p > ,05.", explicacion: "p ≤ ,05 → se rechaza la igualdad de varianzas: no se cumple el supuesto." },
        { id: "f8", tipo: "test", concepto: "eleccion_prueba", enunciado: "Quieres comparar la ansiedad de dos grupos independientes y no se cumple la normalidad. Usarías…", opciones: ["U de Mann-Whitney", "t de Student (muestras independientes)", "Wilcoxon"], correcta: 0, pista: "Alternativa no paramétrica para dos grupos independientes.", explicacion: "Sin normalidad y con grupos independientes → U de Mann-Whitney." },
        { id: "f9", tipo: "test", concepto: "residuos", enunciado: "Un residuo corregido de −2,40 en una casilla indica…", opciones: ["menos casos de los esperados.", "más casos de los esperados.", "ninguna diferencia significativa."], correcta: 0, pista: "Compáralo con −1,96.", explicacion: "−2,40 < −1,96: menos casos de los esperados." },
        { id: "f11", tipo: "test", concepto: "no_parametricas", enunciado: "Comparas el estrés de las mismas 20 personas antes y después de un examen y no se cumple la normalidad. Usarías…", opciones: ["Wilcoxon", "U de Mann-Whitney", "t de Student (muestras relacionadas)"], correcta: 0, pista: "Mismas personas y sin normalidad.", explicacion: "Muestras relacionadas sin normalidad → Wilcoxon. La U de Mann-Whitney es para grupos independientes." },
        { id: "f12", tipo: "test", concepto: "comparar_medias", enunciado: "En una t de Student para muestras independientes con 30 y 28 personas, los grados de libertad son…", opciones: ["56", "58", "29"], correcta: 0, pista: "gl = n₁ + n₂ − 2.", explicacion: "30 + 28 − 2 = 56." },
        { id: "f10", tipo: "test", concepto: "correlacion", enunciado: "r = ,50 con n = 8 y p = ,21. ¿Qué concluyes?", opciones: ["No hay evidencia suficiente de relación en la población.", "Hay una relación fuerte y estadísticamente significativa.", "Queda demostrado que no hay relación entre las variables."], correcta: 0, pista: "Mira el valor p y el tamaño de la muestra.", explicacion: "p = ,21 > ,05: con tan pocos participantes no hay evidencia suficiente." }
      ]
    }]
  };

  global.Contenido = { DOCENTES, GRUPOS, GEM, DURACION, CONCEPTOS, BIENVENIDA, MODULOS, REACCIONES, PRACTICA, ACT1, ACT2 };
})(window);
