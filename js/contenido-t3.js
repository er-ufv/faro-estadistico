/* =====================================================================
   contenido-t3.js — Tema 3 · Estadística descriptiva
   Módulos, diálogos del docente, ejercicios y conceptos del cuaderno.
   Se añade a window.Contenido (contenido.js) sin tocar el Tema 4.
   Los ejercicios proceden del laboratorio «¿Qué dicen tus datos?».
   Datos simulados (datos-t3.js).
   ===================================================================== */
(function (global) {
  "use strict";
  const C = global.Contenido, T = global.DatosT3, V = T.V;
  const f = (x, d = 1) => Number(x).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });

  // ------------------------------------------------------------------
  // Conceptos del cuaderno
  // ------------------------------------------------------------------
  Object.assign(C.CONCEPTOS, {
    t3_tipos: { nombre: "Tipos de variables", diap: "Tema 3: tipos de variables y escalas de medida", modulo: "variables", repaso: "Nominal (categorías sin orden), ordinal (con orden), cuantitativa discreta (se cuenta) y continua (admite decimales). El tipo decide qué medidas y gráficos tienen sentido." },
    t3_frecuencias: { nombre: "Frecuencias y tablas de contingencia", diap: "Tema 3: tablas de frecuencias y de contingencia", modulo: "variables", repaso: "fi = recuento; ni = fi / n. Para comparar grupos de distinto tamaño, porcentajes dentro de cada grupo y siempre con el n." },
    t3_central: { nombre: "Media, mediana y moda", diap: "Tema 3: medidas de tendencia central", modulo: "central", repaso: "La media se deja arrastrar por los valores extremos; la mediana no. Nominal → moda; ordinal → mediana; cuantitativa → media (o mediana si hay asimetría)." },
    t3_posicion: { nombre: "Cuartiles y percentiles", diap: "Tema 3: medidas de posición", modulo: "posicion", repaso: "Un percentil es una posición relativa: en el P80 tu valor es igual o superior al de ≈80 % del grupo. No es una nota ni un porcentaje de aciertos." },
    t3_dispersion: { nombre: "Rango, varianza y desviación típica", diap: "Tema 3: medidas de dispersión", modulo: "dispersion", repaso: "La DT resume cuánto se alejan los datos de la media, en sus mismas unidades. Nunca es negativa. La media sola no cuenta la historia: da M y DT." },
    t3_forma: { nombre: "Asimetría y curtosis", diap: "Tema 3: medidas de forma", modulo: "forma", repaso: "Asimetría positiva = cola a la derecha (media > mediana). Curtosis positiva = colas más pesadas que la normal (leptocúrtica)." },
    t3_z: { nombre: "Curva normal y puntuaciones z", diap: "Tema 3: la curva normal y las puntuaciones típicas", modulo: "forma", repaso: "z = (x − M) / DT: a cuántas DT estás de la media. Entre ±1 DT queda ≈68 % y entre ±2 DT, ≈95 %." },
    t3_graficos: { nombre: "Elección de gráficos", diap: "Tema 3: representación gráfica", modulo: "graficos", repaso: "Cualitativa → barras; una cuantitativa → histograma; cuantitativa por grupos → cajas; tiempo → líneas; dos cuantitativas → dispersión. Eje de las barras desde 0." }
  });

  // ------------------------------------------------------------------
  // Módulos y diálogos
  // ------------------------------------------------------------------
  Object.assign(C.MODULOS, {
    variables: {
      titulo: "1 · Variables y frecuencias", corto: "Variables",
      explica: [
        "Bienvenido al Tema 3, {alumno}. Antes de calcular nada hay que preguntarse: ¿qué tipo de dato tengo? Una variable es cualquier cosa que cambia de una persona a otra.",
        "Si se responde con categorías es cualitativa: nominal si no hay orden (Instagram, TikTok…) u ordinal si lo hay (nada, poco, bastante, mucho).",
        "Si son números de verdad es cuantitativa: discreta si se cuenta (número de tatuajes) y continua si admite decimales (horas de sueño). Ojo: un código numérico no convierte una categoría en cantidad.",
        "Una tabla de frecuencias cuenta cuántas personas hay en cada opción (fi) y qué proporción suponen (ni). Y si cruzamos dos variables, tenemos una tabla de contingencia.",
        "En «Explora» trabajarás con una clase simulada de 120 estudiantes. Fíjate en sobre qué total calculas cada porcentaje."
      ]
    },
    central: {
      titulo: "2 · Tendencia central", corto: "Tendencia central",
      explica: [
        "Las medidas de tendencia central intentan responder con un solo número a «¿qué es lo típico en este grupo?».",
        "La media es lo que tocaría a cada persona si lo repartiéramos todo a partes iguales. Funciona como el punto de equilibrio de un balancín.",
        "La mediana es el valor de la persona que queda justo en el medio si ponemos al grupo en fila. Y la moda, la respuesta que más se repite.",
        "Cuando hay valores muy alejados, la media se deja arrastrar y la mediana no. Con categorías sin orden solo sirve la moda; con categorías ordenadas, la mediana.",
        "En «Explora» vas a mover los datos tú: la amiga que pasa 250 minutos en TikTok, la que se compra el glamping… Mira qué medida se mueve y cuál se queda quieta."
      ]
    },
    posicion: {
      titulo: "3 · Posición", corto: "Posición",
      explica: [
        "Un dato solo se interpreta comparándolo con un grupo. Las medidas de posición dicen en qué puesto quedas si ponemos a todo el grupo en fila.",
        "Los cuartiles dividen los datos en cuatro partes: Q1, Q2 (la mediana) y Q3. Los percentiles, en cien: Q1 = P25, Q2 = P50 y Q3 = P75.",
        "Estar en el percentil 80 significa que tu valor es igual o superior al de aproximadamente el 80 % del grupo. No es tu nota ni tu porcentaje de aciertos.",
        "En «Explora» puedes escribir tu propio valor y ver en qué percentil quedas dentro de la clase simulada, sobre un diagrama de caja."
      ]
    },
    dispersion: {
      titulo: "4 · Dispersión", corto: "Dispersión",
      explica: [
        "Dos grupos pueden tener la misma media y ser muy distintos por dentro. La dispersión dice cuánto se parecen, o no, las personas de un grupo.",
        "El rango es la distancia entre el valor más alto y el más bajo, pero solo mira los dos extremos.",
        "La desviación típica resume cuánto se alejan las personas de la media, «de media», en las mismas unidades que los datos. La varianza es su cuadrado.",
        "En clase la calculamos dividiendo entre N; SPSS y jamovi dividen entre n − 1, por eso su resultado es algo mayor. En «Explora» construirás tu propio grupo para cumplir unos retos."
      ]
    },
    forma: {
      titulo: "5 · Forma y curva normal", corto: "Forma",
      explica: [
        "La forma es el dibujo que hacen los datos en un histograma. ¿Se amontonan en el centro? ¿Hay una cola, un lado largo con pocas personas?",
        "La asimetría indica hacia dónde va la cola: positiva si va a la derecha, negativa si va a la izquierda. Con cola a la derecha, la media queda por encima de la mediana.",
        "La curtosis indica cuánto pesan los valores muy alejados del centro, comparando con la curva normal: la campana simétrica que usamos como modelo.",
        "La puntuación z dice a cuántas desviaciones típicas estás de la media. Esta idea será clave en el Tema 4. En «Explora» adivinarás la forma antes de ver el histograma."
      ]
    },
    graficos: {
      titulo: "6 · Gráficos", corto: "Gráficos",
      explica: [
        "Cada tipo de dato tiene su gráfico: barras para categorías; histograma o caja para números; líneas para cambios en el tiempo; dispersión para ver si dos variables van juntas.",
        "Pero los mismos datos se pueden contar de forma honesta… o tramposa. El truco más común es cortar el eje de un gráfico de barras para exagerar una diferencia.",
        "Y recuerda: que dos cosas vayan juntas en un gráfico de dispersión no demuestra que una cause la otra.",
        "En «Explora» verás los gráficos con los datos de la clase y cazarás un gráfico tramposo."
      ]
    },
    repaso3: { titulo: "★ · Reto final del Tema 3", corto: "Reto Tema 3", explica: [
      "Este es el reto final del Tema 3: un caso nuevo, el de las apuestas online, y preguntas mezcladas de todos los módulos.",
      "No hay explicación previa: usa lo que has practicado. Lo que falles aparecerá en tu cuaderno como algo que repasar."
    ] }
  });

  // ------------------------------------------------------------------
  // Ejercicios
  // ------------------------------------------------------------------
  const TIPOS = ["Cualitativa nominal", "Cualitativa ordinal", "Cuantitativa discreta", "Cuantitativa continua"];
  const GRAF = ["Barras", "Histograma", "Caja y bigotes por grupos", "Líneas", "Diagrama de dispersión"];

  Object.assign(C.PRACTICA, {
    variables: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "d1_tipos", tipo: "clasificar", concepto: "t3_tipos",
          enunciado: "Clasifica cada variable según su tipo.",
          categorias: TIPOS,
          items: [["Número de tatuajes que tienes", "Cuantitativa discreta"], ["Posición de tu equipo al acabar la liga (1.º, 2.º, 3.º…)", "Cualitativa ordinal"], ["Red social favorita, codificada como 1 = Instagram, 2 = TikTok…", "Cualitativa nominal"], ["Horas de sueño entre semana", "Cuantitativa continua"]],
          pista: "Pregúntate: ¿se responde con categorías o con cantidades? Si son categorías, ¿tienen orden? Si son cantidades, ¿se cuentan o se miden?",
          explicacion: "Tatuajes: se cuentan (discreta). Posición en la liga: hay orden, pero no distancias iguales (ordinal). Red social: el número es solo una etiqueta (nominal). Horas de sueño: admite decimales (continua)." },
        { id: "d1_codigo", tipo: "test", concepto: "t3_tipos",
          enunciado: "En la base de datos, la red social favorita está codificada como 1 = Instagram, 2 = TikTok, 3 = WhatsApp… ¿Tiene sentido calcular la «red social media» (por ejemplo, 2,4)?",
          opciones: ["No: los números son etiquetas de categorías sin orden; solo sirve la moda.", "Sí: al estar codificada con números ya es una variable cuantitativa.", "Sí, pero solo si se redondea al entero más cercano."],
          correcta: 0, pista: "¿TikTok es «el doble» de Instagram?",
          explicacion: "Un código numérico no convierte la variable en cuantitativa. Es nominal: se resume con la moda y con frecuencias." },
        { id: "d1_ni", tipo: "completar", concepto: "t3_frecuencias",
          enunciado: `En la clase simulada (n = 120), ${V.fiTikTok} personas eligen TikTok como red favorita. ¿Qué porcentaje de la clase es? (frecuencia relativa en %, un decimal)`,
          campos: [{ etiqueta: "ni", valor: +V.niTikTok.toFixed(1), tol: 0.15, unidad: "%" }],
          pista: "Divide la frecuencia absoluta entre el total y multiplica por 100.",
          explicacion: `ni = ${V.fiTikTok} / 120 = ${f(V.fiTikTok / 120, 3)} → ${f(V.niTikTok, 1)} %.` },
        { id: "d1_acum", tipo: "test", concepto: "t3_frecuencias",
          enunciado: "¿Con qué variable tienen sentido las frecuencias acumuladas (las que vas sumando fila a fila)?",
          opciones: ["Ansiedad ante los exámenes (nada, poco, bastante, mucho).", "Red social favorita.", "Género musical favorito."],
          correcta: 0, pista: "Acumular exige que las categorías tengan un orden.",
          explicacion: "Solo con categorías ordenadas (o cuantitativas) tiene sentido decir «nada o poco», «hasta bastante»… En una variable nominal el orden de las filas es arbitrario." },
        { id: "d1_pct", tipo: "test", concepto: "t3_frecuencias",
          enunciado: `En la clase hay ${V.mujer.n} mujeres y ${V.hombre.n} hombres. Para comparar qué modelo de relación prefieren, ¿qué porcentajes debes mirar en la tabla Modelo de relación × Sexo (sexo en columnas)?`,
          opciones: ["Porcentajes dentro de cada sexo (% por columna).", "Porcentajes dentro de cada modelo de relación (% por fila).", "Porcentajes sobre el total de la clase.", "Los recuentos directamente."],
          correcta: 0, pista: "Quieres responder «de los hombres, ¿qué % prefiere…?». ¿Cuál es el total de esa frase?",
          explicacion: "Con grupos de tamaño muy distinto, el porcentaje se calcula dentro de cada grupo que se compara: aquí, por columna. Con recuentos, las mujeres «ganan» en casi todo solo porque son más." },
        { id: "d1_conc", tipo: "test", concepto: "t3_frecuencias",
          enunciado: `Prefiere pareja monógama el ${f(V.pctMonoM, 0)} % de las mujeres y el ${f(V.pctMonoH, 0)} % de los hombres. ¿Qué conclusión es correcta?`,
          opciones: [`En ambos grupos la opción mayoritaria es la misma; la diferencia (unos ${f(V.pctMonoM - V.pctMonoH, 0)} puntos) describe a los grupos, no a cada persona.`, "A los chicos no les interesan las relaciones estables.", "Las mujeres la prefieren porque son más románticas.", "Todas las chicas de la clase prefieren una pareja monógama."],
          correcta: 0, pista: "¿Es una minoría el porcentaje de hombres? ¿Dicen los datos algo sobre las causas?",
          explicacion: "La pareja monógama es la opción mayoritaria en los dos grupos. Un porcentaje describe a un grupo, y una tabla descriptiva no explica el porqué: atribuir causas o rasgos a todo un grupo es crear un estereotipo." },
        { id: "d1_n4", tipo: "test", concepto: "t3_frecuencias",
          enunciado: "El grupo «Otro / prefiere no decirlo» tiene 4 personas y el 25 % prefiere «otros modelos». ¿Qué precaución hay que tener?",
          opciones: ["Con n = 4, una sola persona cambia el porcentaje 25 puntos: hay que dar el n e interpretarlo con mucha cautela.", "Ninguna: un porcentaje es un porcentaje.", "Hay que eliminar ese grupo del análisis."],
          correcta: 0, pista: "¿Cuánto cambia el porcentaje si una sola persona responde otra cosa?",
          explicacion: "Con grupos tan pequeños los porcentajes son muy inestables. No se elimina a nadie: se informa del n y se evitan conclusiones fuertes." }
      ]
    }],
    central: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "d2_med", tipo: "completar", concepto: "t3_central",
          enunciado: "Minutos en TikTok ayer de 6 amigas: 20, 35, 40, 40, 55 y 250. Calcula la media (un decimal) y la mediana.",
          campos: [{ etiqueta: "Media", valor: 73.3, tol: 0.1, unidad: "min" }, { etiqueta: "Mediana", valor: 40, tol: 0.01, unidad: "min" }],
          pista: "La suma es 440. Con 6 datos (número par), la mediana es la media de los valores 3.º y 4.º ya ordenados.",
          explicacion: "M = 440 / 6 ≈ 73,3 min. Ordenados: 20, 35, 40, 40, 55, 250 → Mdn = (40 + 40) / 2 = 40 min." },
        { id: "d2_tipica", tipo: "test", concepto: "t3_central",
          enunciado: "Con esos datos (M = 73,3 min; Mdn = 40 min), ¿qué número describe mejor a una amiga «normal» del grupo?",
          opciones: ["La mediana (40 min).", "La media (73,3 min).", "Las dos por igual."],
          correcta: 0, pista: "¿Cuántas amigas pasan más de 73,3 min en TikTok?",
          explicacion: "La media se va hacia el 250 y no se parece a nadie: 5 de las 6 amigas están por debajo. La mediana describe mejor a la amiga típica." },
        { id: "d2_cola", tipo: "test", concepto: "t3_central",
          enunciado: "En un examen muy difícil casi todo el mundo saca notas bajas y solo unas pocas personas sacan notas altas. ¿Dónde quedará la media?",
          opciones: ["Por encima de la mediana.", "Por debajo de la mediana.", "En el mismo sitio que la mediana."],
          correcta: 0, pista: "Recuerda a la amiga del glamping: ¿qué medida se movía con los valores alejados?",
          explicacion: "Las pocas notas altas forman una cola a la derecha que tira de la media hacia arriba. La mediana solo mira quién queda en el medio de la fila." },
        { id: "d2_medida", tipo: "emparejar", concepto: "t3_central",
          enunciado: "Empareja cada variable con la medida de tendencia central más informativa que puedes usar bien.",
          pares: [["Género musical favorito (urbano, pop, indie…)", "Moda"], ["Ansiedad ante los exámenes (nada, poco, bastante, mucho)", "Mediana"], ["Horas de sueño, distribución simétrica", "Media"], ["Seguidores en Instagram: 150, 200, 210, 300 y 48.000", "Mediana (hay un valor extremo)"]],
          pista: "Nominal: no se puede ni sumar ni ordenar. Ordinal: se puede ordenar, pero no sumar.",
          explicacion: "Nominal → moda; ordinal → mediana; cuantitativa simétrica → media; cuantitativa con un valor muy extremo → mediana, que no se deja arrastrar." }
      ]
    }],
    posicion: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "d3_p90", tipo: "test", concepto: "t3_posicion",
          enunciado: "Tu nota de admisión (PAU) está en el P90 de tu clase. ¿Qué significa?",
          opciones: ["Que tu nota es igual o superior a la de ≈90 % de la clase.", "Que acertaste el 90 % del examen.", "Que sacaste un 9.", "Que el 90 % de la clase sacó más nota que tú."],
          correcta: 0, pista: "Un percentil compara tu dato con los del grupo.",
          explicacion: "El percentil es una posición relativa. No dice qué nota sacaste ni cuántas preguntas acertaste: en una clase muy buena, el P90 podría ser un 13." },
        { id: "d3_q2", tipo: "completar", concepto: "t3_posicion",
          enunciado: "Cafés a la semana de 8 compañeras: 9, 2, 0, 4, 2, 5, 1, 3. Calcula Q2 (la mediana).",
          campos: [{ etiqueta: "Q2", valor: 2.5, tol: 0.01, unidad: "cafés" }],
          pista: "Primero ordena. Con n = 8 (par), Q2 es la media de los valores en 4.ª y 5.ª posición.",
          explicacion: "Ordenados: 0, 1, 2, 2, 3, 4, 5, 9 → Q2 = (2 + 3) / 2 = 2,5 cafés." },
        { id: "d3_conj", tipo: "test", concepto: "t3_posicion",
          enunciado: `En la clase, el P80 de horas de videojuegos es ${f(V.p80Gaming, 0)} h y el de horas de móvil es ${f(V.p80Movil, 1)} h. ¿Podemos decir que el 80 % juega ${f(V.p80Gaming, 0)} h o menos y, a la vez, usa el móvil ${f(V.p80Movil, 1)} h o menos?`,
          opciones: ["No: cada percentil describe una variable por separado.", "Sí, porque ambos son el P80.", "Solo si las dos variables tienen la misma media."],
          correcta: 0, pista: "¿Las personas por debajo del P80 en videojuegos son necesariamente las mismas que en móvil?",
          explicacion: "Cada percentil se calcula por separado; no da información conjunta sobre las mismas personas." },
        { id: "d3_sueno", tipo: "test", concepto: "t3_posicion",
          enunciado: "Estar en el P25 de horas de sueño significa…",
          opciones: ["que ≈25 % de la clase duerme igual o menos que tú.", "que ≈25 % duerme más que tú.", "que duermes el 25 % de la noche."],
          correcta: 0, pista: "El percentil indica qué parte del grupo queda en tu valor o por debajo.",
          explicacion: "El P25 deja aproximadamente el 25 % de los casos en ese valor o por debajo. Un percentil alto no es siempre «bueno»: depende de la variable." }
      ]
    }],
    dispersion: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "d4_sc", tipo: "completar", concepto: "t3_dispersion",
          enunciado: "Horas de redes del grupo B: 0, 1, 2, 4, 5, 6 (M = 3 h). Calcula la suma de las diferencias al cuadrado y la desviación típica de clase (dividiendo entre N = 6, dos decimales).",
          campos: [{ etiqueta: "Σ(x − M)²", valor: 28, tol: 0.01, unidad: "h²" }, { etiqueta: "DT", valor: 2.16, tol: 0.02, unidad: "h" }],
          pista: "Las diferencias son −3, −2, −1, 1, 2, 3. Eleva cada una al cuadrado y súmalas; después divide entre 6 y haz la raíz.",
          explicacion: "9 + 4 + 1 + 1 + 4 + 9 = 28 h² → σ² = 28 / 6 ≈ 4,67 h² → σ ≈ 2,16 h. El grupo A (2, 3, 3, 3, 3, 4) tenía la misma media y DT = 0,58 h." },
        { id: "d4_spss", tipo: "test", concepto: "t3_dispersion",
          enunciado: "SPSS da para el grupo B una DT de 2,37 h, algo mayor que la calculada en clase (2,16 h). ¿Por qué?",
          opciones: ["SPSS divide entre n − 1 (DT muestral) y en clase dividimos entre N.", "Es un error de redondeo del programa.", "SPSS elimina el valor más bajo."],
          correcta: 0, pista: "Fíjate en el denominador de la varianza.",
          explicacion: "El software supone que los datos son una muestra y divide entre n − 1: √(28 / 5) ≈ 2,37 h. Con muestras grandes la diferencia es pequeña." },
        { id: "d4_grupos", tipo: "test", concepto: "t3_dispersion",
          enunciado: "Dos grupos tienen la misma nota media en Fundamentos (M = 7). En A, DT = 0,5; en B, DT = 2. ¿En qué grupo es más probable encontrar a la vez un 3 y un 10?",
          opciones: ["En el grupo B.", "En el grupo A.", "Igual en los dos: tienen la misma media."],
          correcta: 0, pista: "¿Qué indica una DT grande sobre lo lejos que están los datos de la media?",
          explicacion: "Con DT = 2 las notas se separan mucho más de la media. La media no informa de la dispersión: por eso se da siempre M y DT." },
        { id: "d4_neg", tipo: "test", concepto: "t3_dispersion",
          enunciado: "¿Puede la desviación típica ser negativa?",
          opciones: ["No: es la raíz de una media de cuadrados; como mínimo vale 0.", "Sí, si la mayoría de datos están por debajo de la media.", "Solo con variables que tienen valores negativos."],
          correcta: 0, pista: "¿Qué pasa al elevar al cuadrado un número negativo?",
          explicacion: "Las diferencias al cuadrado nunca son negativas. La DT vale 0 solo si todos los datos son iguales." },
        { id: "d4_rango", tipo: "test", concepto: "t3_dispersion",
          enunciado: "Dos grupos tienen el mismo rango (6 h) pero DT muy distintas. ¿Qué te dice esto?",
          opciones: ["El rango solo usa los dos extremos; la DT usa todos los datos.", "Que alguno de los dos cálculos está mal.", "Que los dos grupos tienen la misma dispersión."],
          correcta: 0, pista: "¿Cuántos datos intervienen en el cálculo del rango?",
          explicacion: "El rango es muy sensible a un único caso extremo y no informa de cómo se reparte el resto del grupo." }
      ]
    }],
    forma: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "d5_asim", tipo: "test", concepto: "t3_forma",
          enunciado: `En la clase, la media del gasto en festivales es ${f(V.mediaFest, 0)} € y la mediana ${f(V.medianaFest, 0)} €. ¿Qué forma esperas?`,
          opciones: ["Asimetría positiva: cola a la derecha.", "Asimetría negativa: cola a la izquierda.", "Simétrica."],
          correcta: 0, pista: "¿Hacia dónde arrastra la cola a la media?",
          explicacion: `Unas pocas personas gastan muchísimo y tiran de la media hacia arriba (media > mediana). Por eso solo el ${f(V.pctSobre, 0)} % de la clase gastó más que la media.` },
        { id: "d5_curt", tipo: "test", concepto: "t3_forma",
          enunciado: "Casi todo el mundo duerme unas 7 h, pero unas pocas personas duermen 3 h u 11 h. Comparado con la normal, ¿qué curtosis esperas?",
          opciones: ["Leptocúrtica: más peso en valores muy alejados.", "Mesocúrtica: igual que la normal.", "Platicúrtica: menos peso en los extremos."],
          correcta: 0, pista: "La curtosis se fija sobre todo en el peso de los valores muy alejados del centro.",
          explicacion: "Pocos valores muy alejados dan colas pesadas: exceso de curtosis positivo (leptocúrtica)." },
        { id: "d5_68", tipo: "test", concepto: "t3_z",
          enunciado: "Prueba de atención con M = 50 y DT = 10 (aproximadamente normal). ¿Qué porcentaje aproximado puntúa entre 40 y 60?",
          opciones: ["≈ 68 %", "≈ 34 %", "≈ 50 %", "≈ 95 %"],
          correcta: 0, pista: "40 y 60 están a una DT de la media.",
          explicacion: "Entre M ± 1 DT queda ≈68 % y entre M ± 2 DT (30 y 70), ≈95 %. El 34 % es solo un lado (de 50 a 60)." },
        { id: "d5_z", tipo: "completar", concepto: "t3_z",
          enunciado: "Con M = 50 y DT = 10, alguien saca 70 puntos y otra persona 35. Calcula sus puntuaciones z.",
          campos: [{ etiqueta: "z (70)", valor: 2, tol: 0.01 }, { etiqueta: "z (35)", valor: -1.5, tol: 0.01 }],
          pista: "z = (puntuación − media) / DT. Puede ser negativa.",
          explicacion: "z = (70 − 50) / 10 = 2 (≈ percentil 98) y z = (35 − 50) / 10 = −1,5 (≈ percentil 7)." },
        { id: "d5_z2", tipo: "test", concepto: "t3_z",
          enunciado: "Con M = 100 y DT = 15, una puntuación de 130 tiene z =",
          opciones: ["2", "1", "30"], correcta: 0, pista: "z = (x − M) / DT.",
          explicacion: "z = (130 − 100) / 15 = 2: dos desviaciones típicas por encima de la media." }
      ]
    }],
    graficos: [{
      id: "basicos", titulo: "Ejercicios", ejercicios: [
        { id: "d6_graf", tipo: "clasificar", concepto: "t3_graficos",
          enunciado: "¿Qué gráfico usarías para responder a cada pregunta?",
          categorias: GRAF,
          items: [["¿Qué red social prefiere la clase?", "Barras"], ["¿Cómo se distribuyen las horas de sueño?", "Histograma"], ["¿Usan más el móvil quienes hacen «previa» que quienes no?", "Caja y bigotes por grupos"], ["¿Cómo cambia el estrés medio semana a semana?", "Líneas"], ["¿Duermen menos quienes más usan el móvil?", "Diagrama de dispersión"]],
          pista: "Piensa en cuántas variables hay y de qué tipo son. ¿Interviene el tiempo?",
          explicacion: "Nominal → barras; una cuantitativa → histograma; cuantitativa por grupos → cajas; evolución en el tiempo → líneas; dos cuantitativas → dispersión." },
        { id: "d6_trampa", tipo: "test", concepto: "t3_graficos",
          enunciado: "Un gráfico de barras compara la asistencia a festivales: Psicología 62 % y ADE 58 %. El eje vertical empieza en 56 % y la barra de Psicología parece el triple de alta. ¿Qué lo hace engañoso?",
          opciones: ["El eje no empieza en 0 y exagera una diferencia de 4 puntos.", "Los colores de las barras.", "Que usa barras en lugar de sectores.", "Nada: los datos son correctos."],
          correcta: 0, pista: "Mira dónde empieza el eje vertical.",
          explicacion: "Los datos pueden ser correctos y el gráfico, engañoso. En un gráfico de barras el eje empieza en 0." },
        { id: "d6_hist", tipo: "test", concepto: "t3_graficos",
          enunciado: "¿Qué gráfico NO es adecuado para «artista favorito»?",
          opciones: ["Histograma.", "Barras.", "Sectores con pocas categorías."],
          correcta: 0, pista: "¿Qué tipo de variable necesita un histograma?",
          explicacion: "El histograma requiere una variable cuantitativa; «artista favorito» es nominal." },
        { id: "d6_causa", tipo: "test", concepto: "t3_graficos",
          enunciado: "Un diagrama de dispersión muestra que quienes usan más el móvil duermen menos. ¿Qué puedes concluir?",
          opciones: ["Que las dos variables van asociadas, sin poder afirmar cuál causa cuál.", "Que el móvil causa que se duerma menos.", "Que dormir poco causa usar más el móvil."],
          correcta: 0, pista: "Asociación no es lo mismo que causalidad.",
          explicacion: "Puede que el móvil reste horas de sueño, que quien duerme mal use más el móvil o que un tercer factor (estrés) explique ambas." }
      ]
    }],
    repaso3: [{
      id: "reto", titulo: "Reto: el titular de las apuestas",
      descripcion: "Preguntamos a 15 personas cuánto gastaron en apuestas online el último mes (€): <b>0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 20, 400</b>. Datos inventados. Usa lo que has practicado.",
      ejercicios: [
        { id: "d7_media", tipo: "completar", concepto: "t3_central",
          enunciado: "Calcula la media y la mediana.",
          campos: [{ etiqueta: "Media", valor: 29, tol: 0.05, unidad: "€" }, { etiqueta: "Mediana", valor: 0, tol: 0.01, unidad: "€" }],
          pista: "La suma es 435. Con 15 datos, la mediana ocupa la posición (15 + 1) / 2 = 8.",
          explicacion: "M = 435 / 15 = 29 €. La mediana es el 8.º valor ordenado: 0 €. Al menos la mitad del grupo no gastó nada." },
        { id: "d7_titular", tipo: "test", concepto: "t3_central",
          enunciado: "Un medio titula: «Los jóvenes se gastan 29 € al mes en apuestas». ¿Cuál es el principal problema?",
          opciones: ["La media está inflada por una sola persona; la mayoría gasta 0 € y la mediana es 0 €.", "Ninguno: 29 € es la media correcta.", "Deberían haber usado la moda, que es 400 €.", "Deberían haber dado la varianza en lugar de la media."],
          correcta: 0, pista: "¿Cuántas personas gastaron 29 € o más?",
          explicacion: "Una persona explica casi todo el total. La mediana (0 €) y el porcentaje de quienes apuestan (4 de 15) describen mejor la situación." },
        { id: "d7_forma", tipo: "test", concepto: "t3_forma",
          enunciado: "¿Qué forma tiene esta distribución?",
          opciones: ["Muy asimétrica positiva.", "Simétrica.", "Asimétrica negativa."],
          correcta: 0, pista: "¿Dónde se amontonan los datos y hacia dónde va la cola?",
          explicacion: "Casi todos los datos están en 0 y una cola larga se extiende hacia la derecha (400 €): asimetría positiva." },
        { id: "d7_informe", tipo: "test", concepto: "t3_dispersion",
          enunciado: "¿Cómo describirías mejor estos datos en un informe?",
          opciones: ["Mediana (0 €), rango o cuartiles, y el porcentaje que apostó algo (27 %), sin eliminar el caso de 400 €.", "Solo la media (29 €), que usa todos los datos.", "La media sin el caso de 400 €, porque es un error."],
          correcta: 0, pista: "Piensa en una medida robusta y en qué hacer con el valor extremo.",
          explicacion: "Con una asimetría tan fuerte, mejor medidas robustas. El caso de 400 € es un dato real y relevante (quizá un patrón de riesgo): no se borra." },
        { id: "d7_hermanos", tipo: "test", concepto: "t3_tipos",
          enunciado: "Número de hermanos: ¿qué tipo de variable es?",
          opciones: ["Cuantitativa discreta", "Cuantitativa continua", "Cualitativa ordinal", "Cualitativa nominal"],
          correcta: 0, pista: "¿Se cuenta o se mide?", explicacion: "Se cuenta (0, 1, 2…): cuantitativa discreta." },
        { id: "d7_curt", tipo: "test", concepto: "t3_forma",
          enunciado: "Un exceso de curtosis de +3 indica…",
          opciones: ["colas más pesadas que la normal.", "una distribución simétrica.", "una cola a la izquierda."],
          correcta: 0, pista: "La curtosis habla de los extremos, no del lado de la cola.",
          explicacion: "Curtosis positiva: leptocúrtica, más peso de los valores extremos que en la normal." },
        { id: "d7_n", tipo: "test", concepto: "t3_frecuencias",
          enunciado: "«El 60 % de las chicas de la clase tiene pareja». ¿Qué falta para interpretarlo bien?",
          opciones: ["El n del grupo y con qué se compara.", "Nada.", "La media de edad."],
          correcta: 0, pista: "¿Son 10 chicas o 900?",
          explicacion: "Un porcentaje sin el n y sin referencia es difícil de interpretar." }
      ]
    }]
  });
})(window);
