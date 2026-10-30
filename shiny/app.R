# =====================================================================
#  TEMA 4 · ANÁLISIS INFERENCIAL DE LOS DATOS — Recurso interactivo
#  Fundamentos de Investigación en Psicología · 1.º de Psicología · UFV
#
#  Todos los datos de esta aplicación son SIMULADOS con fines docentes.
#  Esquema de decisión adaptado de Pardo et al. (2009) y
#  Pardo y San Martín (2010), tal como aparece en las diapositivas del tema.
#
#  Paquetes necesarios: shiny, bslib, ggplot2  (opcional: nortest)
#  install.packages(c("shiny", "bslib", "ggplot2", "nortest"))
#  El logo debe estar en la carpeta  www/Logo_ufv.png  junto a este archivo.
# =====================================================================

library(shiny)
library(bslib)
library(ggplot2)

tiene_nortest <- requireNamespace("nortest", quietly = TRUE)

# Negrita y cursiva sin espacios extra delante de los signos de puntuación
strong <- function(...) tags$strong(..., .noWS = "outside")
em     <- function(...) tags$em(..., .noWS = "outside")

# ---------------------------------------------------------------------
# Colores institucionales y auxiliares
# ---------------------------------------------------------------------
UFV_AZUL   <- "#003865"   # azul institucional UFV (logo)
AZUL_MEDIO <- "#1F6FD1"
AZUL_SUAVE <- "#BFDDF7"
AZUL_CLARO <- "#EBF5FE"
ROJO       <- "#E5254B"
ROSA       <- "#FEEEEF"
VERDE      <- "#1E9E63"
AMBAR      <- "#E8A33D"
GRIS       <- "#5B6770"

# ---------------------------------------------------------------------
# Utilidades de formato (coma decimal, estilo APA en español)
# ---------------------------------------------------------------------
num <- function(x, d = 2) {
  formatC(round(x, d), format = "f", digits = d, decimal.mark = ",", big.mark = ".")
}
sin_cero <- function(s) sub("^(-?)0,", "\\1,", s)          # 0,004 -> ,004
p_txt <- function(p) if (p < .001) "p < ,001" else paste0("p = ", sin_cero(num(p, 3)))
alfa_txt <- function(a) sin_cero(num(a, ifelse(a < .01, 3, 2)))
pct <- function(x) {
  s <- formatC(x * 100, format = "f", digits = 2, decimal.mark = ",")
  paste0(sub(",?0+$", "", s), " %")
}

tema_graf <- theme_minimal(base_size = 14) +
  theme(
    plot.title = element_text(face = "bold", colour = UFV_AZUL),
    panel.grid.minor = element_blank(),
    axis.title = element_text(colour = GRIS),
    legend.position = "bottom",
    plot.background = element_rect(fill = "white", colour = NA)
  )

graf_vacio <- function(texto) {
  ggplot() + annotate("text", x = 0, y = 0, label = texto, size = 5, colour = GRIS) +
    theme_void()
}

# renderPlot con coma decimal en los ejes (solo mientras se dibuja el gráfico,
# para no alterar el resto de la aplicación)
renderPlotC <- function(expr, ..., env = parent.frame(), quoted = FALSE) {
  if (!quoted) expr <- substitute(expr)
  f <- shiny::exprToFunction(expr, env, quoted = TRUE)
  renderPlot({
    g <- f()
    op <- options(OutDec = ",")
    on.exit(options(op))
    print(g)
  }, ...)
}

# Componentes de interfaz reutilizables
clave  <- function(...) div(class = "caja clave", ...)
alerta <- function(...) div(class = "caja alerta", ...)
reto   <- function(...) div(class = "caja reto", icon("lightbulb"), " ", ...)
cifra  <- function(titulo, valor, sub = NULL, tipo = "") {
  div(class = paste("cifra", tipo),
      div(class = "cifra-t", titulo),
      div(class = "cifra-v", valor),
      if (!is.null(sub)) div(class = "cifra-s", sub))
}
fila_cifras <- function(...) div(class = "fila-cifras", ...)

# ---------------------------------------------------------------------
# Hoja de estilos
# ---------------------------------------------------------------------
css <- "
body{background:#F5F8FC;}
.navbar{background:#ffffff !important;border-bottom:4px solid #003865;box-shadow:0 2px 8px rgba(0,56,101,.08);}
.navbar .nav-link{color:#003865 !important;font-weight:600;font-size:.86rem;padding:.45rem .5rem !important;}
@media (max-width:1500px){.marca-txt,.marca-sep{display:none;}}
.navbar .nav-link.active{color:#E5254B !important;border-bottom:3px solid #E5254B;}
.navbar-brand{display:flex;align-items:center;gap:12px;color:#003865 !important;font-weight:700;}
.marca-sep{border-left:2px solid #BFDDF7;height:30px;}
.card{border:1px solid #DCE6F0;border-radius:14px;box-shadow:0 1px 4px rgba(0,56,101,.05);}
.card-header{background:#EBF5FE !important;color:#003865;font-weight:700;border-bottom:1px solid #DCE6F0;}
.nav-tabs .nav-link{color:#003865;font-weight:600;}
.nav-tabs .nav-link.active{color:#E5254B;border-top:3px solid #E5254B;}
.bslib-sidebar-layout>.sidebar{background:#ffffff;}
.caja{padding:12px 16px;border-radius:10px;margin:10px 0;line-height:1.5;}
.clave{background:#EBF5FE;border-left:6px solid #003865;}
.alerta{background:#FEEEEF;border-left:6px solid #E5254B;}
.reto{background:#FFF7EA;border-left:6px solid #E8A33D;font-size:.92rem;}
.reto .fa-lightbulb{color:#E8A33D;}
.fila-cifras{display:flex;flex-wrap:wrap;gap:12px;margin:6px 0 12px;}
.cifra{flex:1 1 170px;background:#fff;border:1px solid #DCE6F0;border-radius:12px;padding:10px 14px;border-top:4px solid #1F6FD1;}
.cifra.roja{border-top-color:#E5254B;} .cifra.verde{border-top-color:#1E9E63;} .cifra.azul{border-top-color:#003865;}
.cifra-t{font-size:.8rem;text-transform:uppercase;letter-spacing:.03em;color:#5B6770;font-weight:600;}
.cifra-v{font-size:1.45rem;font-weight:800;color:#003865;}
.cifra-s{font-size:.85rem;color:#5B6770;}
.hero{background:linear-gradient(135deg,#003865 0%,#0B4F8F 70%,#1F6FD1 100%);color:#fff;border-radius:18px;padding:30px 34px;margin-bottom:18px;}
.hero h1{font-weight:800;font-size:2.1rem;margin-bottom:6px;}
.hero p{opacity:.92;margin:0;}
.modulo{background:#fff;border-radius:14px;border:1px solid #DCE6F0;padding:16px;height:100%;border-top:5px solid #003865;}
.modulo .n{display:inline-block;width:30px;height:30px;line-height:30px;border-radius:50%;background:#E5254B;color:#fff;text-align:center;font-weight:800;margin-right:8px;}
.modulo h5{color:#003865;font-weight:700;display:inline;}
.modulo p{margin:8px 0 0;color:#36404a;font-size:.93rem;}
.paso{background:#fff;border:1px solid #DCE6F0;border-radius:12px;padding:12px 14px;height:100%;}
.paso h6{color:#003865;font-weight:800;margin-bottom:6px;}
.paso .bola{display:inline-block;width:26px;height:26px;line-height:26px;border-radius:50%;background:#E5254B;color:#fff;text-align:center;font-weight:800;margin-right:6px;font-size:.9rem;}
.paso .grande{font-size:1.25rem;font-weight:800;color:#003865;}
.veredicto{border-radius:14px;padding:16px 20px;color:#fff;margin:12px 0;}
.veredicto h3{font-weight:800;margin:0 0 4px;font-size:1.5rem;}
.veredicto.culpable{background:#E5254B;} .veredicto.absuelto{background:#003865;}
.realidad{background:rgba(255,255,255,.18);border-radius:8px;padding:6px 10px;margin-top:8px;display:inline-block;}
.resultado-ic{background:#003865;color:#fff;border-radius:14px;padding:14px 20px;margin-bottom:12px;}
.resultado-ic h3{margin:0;font-weight:800;}
.chip{display:inline-block;background:#EBF5FE;color:#003865;border:1px solid #BFDDF7;border-radius:999px;padding:5px 14px;margin:3px;font-weight:600;}
.chip.supuesto{background:#FEEEEF;color:#B0153A;border-color:#F7C3CE;}
.chip.final{background:#003865;color:#fff;border-color:#003865;font-size:1.05rem;}
.flecha{color:#5B6770;margin:0 2px;}
table.t-ufv{width:100%;border-collapse:collapse;font-size:.95rem;}
table.t-ufv th{background:#003865;color:#fff;padding:7px;text-align:center;}
table.t-ufv td{border:1px solid #DCE6F0;padding:7px;text-align:center;}
table.t-ufv td.fila{background:#EBF5FE;font-weight:700;color:#003865;text-align:left;}
td.mas{background:#FEEEEF;color:#B0153A;font-weight:800;}
td.menos{background:#DCEBFB;color:#003865;font-weight:800;}
td.neutro{color:#5B6770;}
table.analogia{width:100%;border-collapse:separate;border-spacing:0 8px;}
table.analogia th{color:#003865;font-size:1.05rem;padding:4px 12px;}
table.analogia td{background:#fff;padding:10px 14px;border-top:1px solid #DCE6F0;border-bottom:1px solid #DCE6F0;vertical-align:top;}
table.analogia td:first-child{border-left:6px solid #E5254B;border-radius:10px 0 0 10px;width:44%;}
table.analogia td:last-child{border-right:1px solid #DCE6F0;border-radius:0 10px 10px 0;}
.tabla-input td{padding:3px;text-align:center;font-weight:600;color:#003865;font-size:.85rem;}
.tabla-input .form-group{margin-bottom:0;}
.tabla-input input{text-align:center;font-weight:700;}
.pregunta{background:#fff;border:1px solid #DCE6F0;border-radius:12px;padding:14px 18px;margin-bottom:12px;}
.pregunta h6{color:#003865;font-weight:700;}
.fb-ok{color:#1E7A4E;font-weight:600;} .fb-no{color:#B0153A;font-weight:600;}
.pie{font-size:.8rem;color:#5B6770;text-align:center;padding:14px;}
.btn-primary{background:#003865;border-color:#003865;}
.btn-outline-primary{color:#003865;border-color:#003865;}
.btn-danger{background:#E5254B;border-color:#E5254B;}
.irs--shiny .irs-bar,.irs--shiny .irs-single{background:#003865;border-color:#003865;}
"

tema_ufv <- bs_theme(
  version = 5,
  primary = UFV_AZUL, danger = ROJO, success = VERDE, warning = AMBAR,
  base_font = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  "border-radius" = "10px"
)

marca <- tags$span(
  class = "navbar-brand",
  tags$img(src = "Logo_ufv.png", height = "38px", alt = "Universidad Francisco de Vitoria"),
  tags$span(class = "marca-sep"),
  tags$span(class = "marca-txt", "Tema 4 · Inferencia")
)

# =====================================================================
#  INTERFAZ
# =====================================================================

# ---------- Inicio ----------------------------------------------------
modulos_inicio <- list(
  c("1", "Muestras", "¿Por qué cada muestra da un resultado distinto?"),
  c("2", "Intervalos de confianza", "¿Cómo estimamos la media de la población sin evaluar a todo el mundo? ¿De dónde sale el 1,96?"),
  c("3", "El juicio", "La lógica del contraste de hipótesis: H₀, α, el valor p y el veredicto."),
  c("4", "Supuestos", "Normalidad y homocedasticidad: aquí queremos p > ,05."),
  c("5", "¿Qué prueba?", "El esquema de toma de decisiones, paso a paso, y casos para practicar."),
  c("6", "Chi-cuadrado", "Asociación entre dos variables categóricas y residuos corregidos."),
  c("7", "Correlaciones", "Pearson y Spearman: dirección, intensidad y significación."),
  c("8", "Autoevaluación", "Comprueba si tienes claros los conceptos clave.")
)

ui_inicio <- nav_panel(
  "Inicio", icon = icon("house"),
  div(class = "container-xl py-3",
      div(class = "hero",
          h1("De la muestra a la población"),
          p("Recurso interactivo del Tema 4 · Análisis inferencial de los datos"),
          p("Fundamentos de Investigación en Psicología · 1.º de Psicología")),
      layout_columns(
        col_widths = c(6, 6),
        div(class = "modulo",
            h5("Tema 3 · Análisis descriptivo"),
            p("Organiza, resume y presenta los datos de la muestra: frecuencias, porcentajes, medias, desviaciones típicas y gráficos. ",
              strong("No permite, por sí solo, generalizar los resultados a la población."))),
        div(class = "modulo", style = "border-top-color:#E5254B;",
            h5("Tema 4 · Análisis inferencial"),
            p("Permite extraer conclusiones sobre una ", strong("población"), " a partir de los datos de una ", strong("muestra"),
              ": estima parámetros (intervalos de confianza) y contrasta hipótesis (pruebas estadísticas)."))
      ),
      h4("Itinerario", style = "color:#003865;font-weight:800;margin-top:22px;"),
      do.call(layout_columns, c(
        list(col_widths = rep(3, 8)),
        lapply(modulos_inicio, function(m) {
          div(class = "modulo", span(class = "n", m[1]), h5(m[2]), p(m[3]))
        })
      )),
      clave(strong("Cómo usar este recurso. "),
            "Cada apartado tiene controles a la izquierda y una caja ", strong("«Prueba esto»"),
            " con preguntas para experimentar. Mueve los controles, pulsa los botones varias veces y fíjate en qué cambia y qué no. ",
            "Todos los datos son ", strong("simulados"), " con fines docentes.")
  )
)

# ---------- 1 · Muestras ----------------------------------------------
ui_muestras <- nav_panel(
  "1 · Muestras", icon = icon("users"),
  layout_sidebar(
    sidebar = sidebar(
      width = 320, title = "Controles",
      p(class = "small", "Población simulada de 5.000 jóvenes de 18 a 25 años en programas de reinserción. ",
        "Variable: ", strong("apoyo social percibido (0–100)"), "."),
      sliderInput("m_n", "Tamaño de cada muestra (n)", min = 10, max = 400, value = 100, step = 10),
      actionButton("m_una", "Extraer 1 muestra", icon = icon("hand-pointer"), class = "btn-primary w-100"),
      actionButton("m_cien", "Extraer 100 muestras", icon = icon("layer-group"), class = "btn-outline-primary w-100"),
      actionButton("m_reset", "Reiniciar", icon = icon("eraser"), class = "btn-link w-100"),
      checkboxInput("m_mu", "Mostrar la media real de la población (μ)", TRUE),
      reto(strong("Prueba esto: "), "extrae 100 muestras con n = 20. Después cambia a n = 400 y repite. ",
           "¿Qué le pasa a la nube de medias de la derecha?")
    ),
    clave(strong("Idea clave. "), "La media de la población (", em("parámetro"), ", μ) es fija pero desconocida. ",
          "Cada muestra da una media algo distinta (", em("estadístico"), "): es la ", strong("variabilidad muestral"), ". ",
          "La dispersión de esas medias se llama ", strong("error típico"), " y se hace más pequeña cuanto mayor es n."),
    uiOutput("m_cifras"),
    layout_columns(
      col_widths = c(6, 6),
      card(card_header("Tu última muestra"), plotOutput("m_plot_muestra", height = 320)),
      card(card_header("Las medias de todas tus muestras"), plotOutput("m_plot_medias", height = 320))
    ),
    uiOutput("m_mensaje")
  )
)

# ---------- 2 · Intervalos de confianza -------------------------------
ui_ic <- nav_panel(
  "2 · Intervalos", icon = icon("arrows-left-right"),
  navset_card_tab(
    nav_panel(
      "Calcula un IC",
      layout_sidebar(
        sidebar = sidebar(
          width = 320,
          numericInput("ic_media", "Media de la muestra", 58),
          numericInput("ic_dt", "Desviación típica (DT)", 20, min = 0.1),
          numericInput("ic_n", "Tamaño de la muestra (n)", 100, min = 2),
          radioButtons("ic_conf", "Nivel de confianza (1 − α)",
                       choices = c("90 %" = "0.90", "95 %" = "0.95", "99 %" = "0.99", "99,9 %" = "0.999"),
                       selected = "0.95", inline = TRUE),
          checkboxInput("ic_t", "Usar la t de Student en lugar de z", FALSE),
          tags$hr(),
          strong("Ejemplos de las diapositivas"), br(),
          actionLink("ic_ej1", "Apoyo social (n = 100; M = 58; DT = 20)"), br(),
          actionLink("ic_ej2", "Satisfacción laboral, muestra pequeña (n = 25)"), br(),
          actionLink("ic_ej3", "Satisfacción laboral, muestra grande (n = 400)"),
          reto(strong("Prueba esto: "), "cambia de 95 % a 99 %. ¿Qué pasa con el valor crítico y con la anchura del intervalo?")
        ),
        uiOutput("ic_resultado"),
        layout_columns(
          col_widths = c(6, 6),
          card(card_header("¿De dónde sale el 1,96? El valor crítico"),
               plotOutput("ic_curva", height = 300), uiOutput("ic_curva_txt")),
          card(card_header("Mismos datos, distintos niveles de confianza"),
               plotOutput("ic_niveles", height = 300),
               p(class = "small", "Más confianza → intervalo más amplio → estimación menos precisa (con los mismos datos)."))
        ),
        layout_columns(
          col_widths = c(6, 6),
          clave(strong("Interpretación correcta. "),
                "Si repitiéramos el muestreo muchas veces y calculáramos un intervalo en cada ocasión, ",
                "aproximadamente el 95 % de esos intervalos contendría la verdadera media de la población. ",
                "El 95 % se refiere al ", strong("procedimiento"), "."),
          alerta(strong("Interpretación incorrecta. "),
                 "«Hay un 95 % de probabilidad de que μ esté dentro de este intervalo concreto». ",
                 "La media poblacional es fija: lo que cambia de una muestra a otra son los límites del intervalo.")
        )
      )
    ),
    nav_panel(
      "100 intervalos",
      layout_sidebar(
        sidebar = sidebar(
          width = 320,
          p(class = "small", "Repetimos el mismo estudio muchas veces. En esta simulación sabemos que la media real es ",
            strong("μ = 60"), " (en la vida real, nadie la conoce)."),
          sliderInput("ci_n", "Tamaño de cada muestra (n)", 30, 400, 100, 10),
          radioButtons("ci_conf", "Nivel de confianza",
                       choices = c("90 %" = "0.90", "95 %" = "0.95", "99 %" = "0.99"), selected = "0.95", inline = TRUE),
          actionButton("ci_go", "Repetir 100 estudios", icon = icon("rotate"), class = "btn-primary w-100"),
          actionButton("ci_reset", "Reiniciar el recuento", icon = icon("eraser"), class = "btn-link w-100"),
          checkboxInput("ci_ocultar", "Ocultar μ (como en la vida real)", FALSE),
          reto(strong("Prueba esto: "), "pulsa varias veces «Repetir 100 estudios» y mira el porcentaje acumulado. ",
               "Después cambia a 99 %: ¿qué pasa con la anchura y con los fallos?")
        ),
        uiOutput("ci_cifras"),
        card(plotOutput("ci_plot", height = 560)),
        clave(strong("La analogía del aro. "),
              "Lanzar un intervalo es como lanzar un aro a una estaca que no vemos. Con un 95 % de confianza, nuestra técnica acierta ",
              "en 95 de cada 100 lanzamientos. Pero de un lanzamiento concreto (nuestro estudio) no sabemos si es de los que aciertan. ",
              "Marca «Ocultar μ» para verlo como lo ve un investigador.")
      )
    ),
    nav_panel(
      "Tamaño muestral y precisión",
      layout_sidebar(
        sidebar = sidebar(
          width = 320,
          p(class = "small", "Una empresa mide la ", strong("satisfacción laboral (0–100)"),
            ". Las dos muestras tienen ", strong("media = 60 y DT = 20"), "."),
          sliderInput("pr_n1", "Muestra A: n", 10, 1000, 25, 5),
          sliderInput("pr_n2", "Muestra B: n", 10, 1000, 400, 5),
          radioButtons("pr_conf", "Nivel de confianza",
                       choices = c("90 %" = "0.90", "95 %" = "0.95", "99 %" = "0.99"), selected = "0.95", inline = TRUE),
          reto(strong("Prueba esto: "), "busca qué n necesitas para que el margen de error sea de ±2 puntos. ",
               "¿Y para ±1? ¿Cuántas veces más participantes hacen falta?")
        ),
        card(card_header("Dos muestras con la misma media: ¿cuál estima con más precisión?"),
             plotOutput("pr_plot", height = 220)),
        card(card_header("Margen de error según el tamaño de la muestra"),
             plotOutput("pr_curva", height = 300)),
        clave(strong("Idea clave. "), "Con más participantes el error típico (DT / √n) es menor y el intervalo, más estrecho. ",
              "Como depende de la ", strong("raíz"), " de n, para reducir el margen de error a la mitad hace falta ",
              strong("cuatro veces"), " más participantes.")
      )
    )
  )
)

# ---------- 3 · El juicio ---------------------------------------------
analogia <- list(
  c("<b>Presunción de inocencia:</b> el acusado es inocente mientras no se demuestre lo contrario.",
    "<b>H₀ (hipótesis nula):</b> no hay diferencia o relación en la población. Partimos de suponer que es cierta."),
  c("<b>La acusación</b> sostiene que es culpable.",
    "<b>H₁ (hipótesis alternativa):</b> sí hay diferencia o relación. Normalmente es nuestra hipótesis de investigación."),
  c("<b>Las pruebas</b> que se presentan en el juicio.",
    "<b>Los datos de la muestra</b>, resumidos en un estadístico (t, χ², r…)."),
  c("Antes del juicio se fija qué es estar <b>«más allá de toda duda razonable»</b>.",
    "Antes del análisis fijamos <b>α</b> (normalmente ,05): el riesgo de condenar a un inocente que estamos dispuestos a asumir. Su complemento, <b>1 − α</b>, es el nivel de confianza (95 %)."),
  c("¿Qué probabilidad habría de reunir pruebas tan incriminatorias <b>si el acusado fuera inocente</b>?",
    "<b>El valor p:</b> probabilidad de obtener un resultado tan extremo como el observado, o más, <b>si H₀ fuera cierta</b>."),
  c("Veredicto: <b>culpable</b>.",
    "<b>p ≤ α</b> → rechazamos H₀. Resultado estadísticamente significativo: evidencia a favor de H₁."),
  c("Veredicto: <b>no culpable</b> (por falta de pruebas).",
    "<b>p > α</b> → no rechazamos H₀. <b>No demuestra que H₀ sea cierta</b>: solo que no hay pruebas suficientes.")
)

ui_juicio <- nav_panel(
  "3 · El juicio", icon = icon("gavel"),
  navset_card_tab(
    nav_panel(
      "La analogía",
      div(class = "container-xl",
          clave(strong("El contraste de hipótesis funciona como un juicio. "),
                "No podemos «ver» la población (lo que realmente pasó), solo las pruebas que aporta la muestra. ",
                "Con ellas tenemos que decidir, sabiendo que podemos equivocarnos."),
          tags$table(
            class = "analogia",
            tags$tr(tags$th(icon("scale-balanced"), " En un juicio"), tags$th(icon("chart-simple"), " En el contraste de hipótesis")),
            lapply(analogia, function(a) tags$tr(tags$td(HTML(a[1])), tags$td(HTML(a[2]))))
          ),
          h5("Los dos errores posibles", style = "color:#003865;font-weight:800;margin-top:18px;"),
          tags$table(
            class = "t-ufv",
            tags$tr(tags$th(""), tags$th("Realidad: inocente (H₀ verdadera)"), tags$th("Realidad: culpable (H₀ falsa)")),
            tags$tr(tags$td(class = "fila", "Veredicto: culpable (rechazo H₀)"),
                    tags$td(class = "mas", HTML("Error tipo I<br><small>condenar a un inocente · probabilidad = α</small>")),
                    tags$td(HTML("Acierto<br><small>potencia = 1 − β</small>"))),
            tags$tr(tags$td(class = "fila", "Veredicto: no culpable (no rechazo H₀)"),
                    tags$td(HTML("Acierto<br><small>probabilidad = 1 − α</small>")),
                    tags$td(class = "menos", HTML("Error tipo II<br><small>absolver a un culpable · probabilidad = β</small>"))))
          ,
          layout_columns(
            col_widths = c(6, 6),
            alerta(strong("Un jurado nunca declara «inocente». "),
                   "Declara «no culpable». Del mismo modo, en estadística nunca «aceptamos» ni «demostramos» H₀: como mucho, ",
                   strong("no la rechazamos"), "."),
            alerta(strong("El valor p NO es "), "la probabilidad de que H₀ sea cierta, ni la probabilidad de que el resultado se deba al azar. ",
                   "Es la probabilidad de unos datos así ", em("suponiendo"), " que H₀ es cierta.")
          )
      )
    ),
    nav_panel(
      "Celebra un juicio",
      layout_sidebar(
        sidebar = sidebar(
          width = 330,
          p(class = "small", strong("Caso: "), "¿Existen diferencias en autoestima (0–10) entre chicas y chicos adolescentes? (datos simulados)"),
          sliderInput("j_dif", "Realidad oculta: diferencia real chicas − chicos en la población", 0, 1.5, 0.5, 0.05),
          helpText("Si la diferencia real es 0, el acusado es inocente (H₀ es verdadera)."),
          sliderInput("j_n", "Participantes por grupo", 10, 300, 50, 5),
          radioButtons("j_alpha", "Nivel de significación α (duda razonable)",
                       choices = c(",10" = "0.10", ",05" = "0.05", ",01" = "0.01", ",001" = "0.001"),
                       selected = "0.05", inline = TRUE),
          actionButton("j_go", "Celebrar un nuevo juicio", icon = icon("gavel"), class = "btn-danger w-100"),
          checkboxInput("j_revelar", "Revelar la realidad después del veredicto", FALSE),
          reto(strong("Prueba esto: "), "1) pon la diferencia real en 0 y celebra 20 juicios: ¿cuántas veces condenas a un inocente? ",
               "2) Con diferencia 0,5, compara n = 20 y n = 200. 3) Cambia α a ,001: ¿eres más o menos exigente?")
        ),
        uiOutput("j_pasos"),
        uiOutput("j_veredicto"),
        layout_columns(
          col_widths = c(7, 5),
          card(card_header("¿Serían sorprendentes estas pruebas si el acusado fuera inocente?"),
               plotOutput("j_plot_t", height = 330), uiOutput("j_plot_txt")),
          card(card_header("Las pruebas: los datos de la muestra"),
               plotOutput("j_plot_datos", height = 330))
        ),
        card(card_header("Dos caras de la misma moneda: el intervalo de confianza de la diferencia"),
             plotOutput("j_plot_ic", height = 150), uiOutput("j_ic_txt"))
      )
    ),
    nav_panel(
      "Mil juicios",
      layout_sidebar(
        sidebar = sidebar(
          width = 330,
          p(class = "small", "Celebramos 1.000 juicios iguales (1.000 estudios con muestras distintas) y contamos los veredictos."),
          sliderInput("mj_dif", "Diferencia real en la población", 0, 1.5, 0, 0.05),
          sliderInput("mj_n", "Participantes por grupo", 10, 300, 50, 5),
          radioButtons("mj_alpha", "α", choices = c(",10" = "0.10", ",05" = "0.05", ",01" = "0.01", ",001" = "0.001"),
                       selected = "0.05", inline = TRUE),
          actionButton("mj_go", "Celebrar 1.000 juicios", icon = icon("people-group"), class = "btn-danger w-100"),
          reto(strong("Prueba esto: "), "1) Con diferencia 0, cambia α y observa el porcentaje de inocentes condenados. ",
               "2) Con diferencia 0,3, sube n de 20 a 300: ¿qué le pasa al error tipo II?")
        ),
        uiOutput("mj_cifras"),
        card(card_header("Cada cuadrado es un juicio"), plotOutput("mj_plot", height = 330)),
        uiOutput("mj_mensaje")
      )
    )
  )
)

# ---------- 4 · Supuestos ---------------------------------------------
ui_supuestos <- nav_panel(
  "4 · Supuestos", icon = icon("clipboard-check"),
  alerta(strong("¡Atención: aquí la lógica se invierte! "),
         "En la comprobación de supuestos, H₀ dice que la condición ", strong("se cumple"),
         " (los datos son normales / las varianzas son iguales). Por eso aquí el resultado deseable es ", strong("p > ,05"),
         ": no encontrar pruebas de que el supuesto se incumpla. Piensa en la ITV: el coche se presume en buen estado (H₀) y esperamos que pase la inspección."),
  navset_card_tab(
    nav_panel(
      "Normalidad",
      layout_sidebar(
        sidebar = sidebar(
          width = 320,
          p(class = "small", "Variable: ", strong("autoestima"), " (puntuación cuantitativa). Elige cómo es la población de la que sacamos la muestra."),
          radioButtons("n_forma", "Forma de la población",
                       choices = c("Normal" = "normal", "Asimétrica positiva" = "asimpos",
                                   "Asimétrica negativa" = "asimneg", "Normal con valores atípicos" = "atipicos",
                                   "Plana (uniforme)" = "unif")),
          sliderInput("n_n", "Tamaño de la muestra (n)", 10, 300, 60, 5),
          actionButton("n_go", "Nueva muestra", icon = icon("rotate"), class = "btn-primary w-100"),
          clave(strong("Criterio de clase: "), "n < 50 → Shapiro-Wilk; n ≥ 50 → Kolmogorov-Smirnov (corrección de Lilliefors). ",
                "Es una pauta didáctica, no una regla universal: Shapiro-Wilk suele tener más potencia."),
          reto(strong("Prueba esto: "), "con la forma asimétrica, compara n = 15 y n = 200 varias veces. ",
               "¿La prueba detecta siempre la falta de normalidad? ¿Y con la forma normal y n = 300?")
        ),
        uiOutput("n_resultado"),
        layout_columns(
          col_widths = c(6, 6),
          card(card_header("Histograma y curva normal de referencia"), plotOutput("n_hist", height = 300)),
          card(card_header("Gráfico Q-Q: si es normal, los puntos siguen la recta"), plotOutput("n_qq", height = 300))
        )
      )
    ),
    nav_panel(
      "Homocedasticidad",
      layout_sidebar(
        sidebar = sidebar(
          width = 320,
          p(class = "small", strong("Caso: "), "comparamos la ansiedad de estudiantes de Psicología y de Criminología. ",
            "Antes de la t de Student comprobamos si las varianzas son iguales (prueba de Levene)."),
          sliderInput("h_ratio", "¿Cuántas veces más dispersa es Criminología que Psicología? (razón de DT)", 0.5, 3, 1, 0.1),
          sliderInput("h_n1", "n Psicología", 10, 200, 40, 5),
          sliderInput("h_n2", "n Criminología", 10, 200, 35, 5),
          actionButton("h_go", "Nueva muestra", icon = icon("rotate"), class = "btn-primary w-100"),
          reto(strong("Prueba esto: "), "con razón 1, ¿sale siempre p > ,05? Sube la razón poco a poco: ",
               "¿a partir de cuándo Levene detecta la diferencia con n = 40? ¿Y con n = 200?")
        ),
        uiOutput("h_resultado"),
        card(card_header("Distribución de la ansiedad en cada grupo"), plotOutput("h_plot", height = 320)),
        clave(strong("Ojo: "), "homocedasticidad significa ", strong("variabilidad parecida"), ", no medias parecidas. ",
              "En esta simulación las medias son distintas a propósito: Levene solo mira la dispersión.")
      )
    )
  )
)

# ---------- 5 · ¿Qué prueba? ------------------------------------------
ui_esquema <- nav_panel(
  "5 · ¿Qué prueba?", icon = icon("diagram-project"),
  navset_card_tab(
    nav_panel(
      "Esquema guiado (1.º curso)",
      layout_sidebar(
        sidebar = sidebar(
          width = 380,
          radioButtons("w_tipo", "1. ¿Qué tienes y qué quieres hacer?",
                       choices = c("Dos variables categóricas: ¿están asociadas?" = "cat",
                                   "Dos variables cuantitativas: quiero RELACIONARLAS" = "rel",
                                   "Una variable cuantitativa en dos grupos o dos momentos: quiero COMPARAR" = "comp")),
          conditionalPanel(
            "input.w_tipo == 'rel'",
            checkboxInput("w_ordinal", "Al menos una de las variables es ordinal", FALSE),
            conditionalPanel("!input.w_ordinal",
                             radioButtons("w_norm_rel", "2. ¿Se cumple la normalidad? (p > ,05)",
                                          choices = c("Sí" = "si", "No" = "no"), inline = TRUE))
          ),
          conditionalPanel(
            "input.w_tipo == 'comp'",
            radioButtons("w_muestras", "2. ¿Cómo son las muestras?",
                         choices = c("Independientes (personas distintas en cada grupo)" = "ind",
                                     "Relacionadas (las mismas personas medidas dos veces)" = "rel")),
            radioButtons("w_norm_comp", "3. ¿Se cumple la normalidad? (p > ,05)",
                         choices = c("Sí" = "si", "No" = "no"), inline = TRUE),
            conditionalPanel("input.w_muestras == 'ind' && input.w_norm_comp == 'si'",
                             radioButtons("w_lev", "4. ¿Se cumple la homocedasticidad? (Levene: p > ,05)",
                                          choices = c("Sí" = "si", "No" = "no"), inline = TRUE))
          )
        ),
        h5("Tu camino por el esquema", style = "color:#003865;font-weight:800;"),
        uiOutput("w_camino"),
        uiOutput("w_prueba"),
        clave(strong("La secuencia de trabajo en todas las actividades: "),
              "1) ", strong("¿Por qué esta prueba?"), " (justificación: tipo de variables, objetivo y supuestos) → ",
              "2) ", strong("¿Qué resultados obtengo?"), " → 3) ", strong("¿Qué puedo concluir?")),
        p(class = "small", style = "color:#5B6770;",
          "Fuente del esquema: adaptación de Pardo et al. (2009) y Pardo y San Martín (2010), según las diapositivas del tema.")
      )
    ),
    nav_panel(
      "Practica con casos",
      div(class = "container-lg",
          uiOutput("caso_txt"),
          layout_columns(
            col_widths = c(6, 3, 3),
            selectInput("caso_resp", "¿Qué prueba utilizarías?", choices = NULL, width = "100%"),
            div(style = "padding-top:30px;", actionButton("caso_comprobar", "Comprobar", icon = icon("check"), class = "btn-primary w-100")),
            div(style = "padding-top:30px;", actionButton("caso_sig", "Siguiente caso", icon = icon("forward"), class = "btn-outline-primary w-100"))
          ),
          uiOutput("caso_fb"))
    )
  )
)

# ---------- 6 · Chi-cuadrado ------------------------------------------
celda <- function(id, valor) numericInput(id, NULL, valor, min = 0, step = 1, width = "86px")

ui_chi <- nav_panel(
  "6 · Chi-cuadrado", icon = icon("table-cells"),
  layout_sidebar(
    sidebar = sidebar(
      width = 340,
      p(class = "small", strong("Caso: "), "¿Se asocia la red social más utilizada con haber sufrido ciberacoso en el último año? (estudiantes, datos ficticios)"),
      strong("Escribe las frecuencias observadas"),
      tags$table(
        class = "tabla-input",
        tags$tr(tags$td(""), tags$td("Ciberacoso: Sí"), tags$td("Ciberacoso: No")),
        tags$tr(tags$td("Instagram"), tags$td(celda("x11", 40)), tags$td(celda("x12", 60))),
        tags$tr(tags$td("Otras"), tags$td(celda("x21", 20)), tags$td(celda("x22", 80)))
      ),
      radioButtons("x_alpha", "Nivel de significación α", choices = c(",05" = "0.05", ",01" = "0.01", ",001" = "0.001"),
                   selected = "0.05", inline = TRUE),
      strong("Ejemplos"), br(),
      actionLink("x_ej1", "Diapositiva: resultado significativo"), br(),
      actionLink("x_ej2", "Diapositiva: resultado no significativo"), br(),
      actionLink("x_ej3", "Datos al azar (sin asociación real)"),
      reto(strong("Prueba esto: "), "baja poco a poco el 40 de Instagram-Sí (y sube el 60 para mantener 100). ",
           "¿En qué momento deja de ser significativo? ¿Qué pasa con los residuos?")
    ),
    uiOutput("x_cifras"),
    layout_columns(
      col_widths = c(4, 4, 4),
      card(card_header("1 · Frecuencias observadas"), uiOutput("x_obs")),
      card(card_header("2 · Esperadas si fueran independientes"), uiOutput("x_esp")),
      card(card_header("3 · Residuos estandarizados corregidos (Z)"), uiOutput("x_res"))
    ),
    layout_columns(
      col_widths = c(6, 6),
      card(card_header("Porcentaje con ciberacoso en cada grupo"), plotOutput("x_plot_bar", height = 280)),
      card(card_header("¿Sería sorprendente este χ² si fueran independientes?"), plotOutput("x_plot_chi", height = 280))
    ),
    card(card_header("Redacta el resultado en 3 pasos"), uiOutput("x_informe"))
  )
)

# ---------- 7 · Correlaciones -----------------------------------------
ui_cor <- nav_panel(
  "7 · Correlaciones", icon = icon("chart-line"),
  layout_sidebar(
    sidebar = sidebar(
      width = 330,
      p(class = "small", strong("Caso: "), "relación entre las horas de estudio semanales y la nota del examen (datos simulados)."),
      sliderInput("c_r", "Relación real en la población", -1, 1, 0.5, 0.05),
      sliderInput("c_n", "Tamaño de la muestra (n)", 5, 500, 50, 1),
      radioButtons("c_forma", "Forma de la relación",
                   choices = c("Lineal" = "lin", "Monótona pero curva" = "curva", "Lineal con un valor atípico" = "atip")),
      actionButton("c_go", "Nueva muestra", icon = icon("rotate"), class = "btn-primary w-100"),
      tags$hr(),
      strong("Retos rápidos"), br(),
      actionLink("c_ej1", "Débil pero significativa (r = ,15; n = 500)"), br(),
      actionLink("c_ej2", "Fuerte pero no significativa (r = ,50; n = 8)"), br(),
      actionLink("c_ej3", "Sin relación (r = 0; n = 50)"), br(),
      actionLink("c_ej4", "Inversa (r = −,65; n = 60)")
    ),
    uiOutput("c_cifras"),
    layout_columns(
      col_widths = c(7, 5),
      card(card_header("Diagrama de dispersión"), plotOutput("c_plot", height = 390)),
      card(card_header("Interpretación"), plotOutput("c_intens", height = 170), uiOutput("c_interp"))
    ),
    clave(strong("Tres preguntas distintas: "), strong("dirección"), " (signo: positiva o inversa), ",
          strong("intensidad"), " (|r| de 0 a 1) y ", strong("significación"), " (p ≤ α). ",
          "Una correlación significativa no tiene por qué ser fuerte, y ", strong("correlación no implica causalidad"), ".")
  )
)

# ---------- 8 · Autoevaluación ----------------------------------------
preguntas <- list(
  list(q = "Obtienes un IC al 95 % de [54,1 ; 61,9] para el apoyo social medio. ¿Qué afirmación es correcta?",
       op = c("Hay un 95 % de probabilidad de que la media poblacional esté entre 54,1 y 61,9.",
              "Si repitiéramos el procedimiento muchas veces, alrededor del 95 % de los intervalos contendría la media poblacional.",
              "El 95 % de los participantes puntúa entre 54,1 y 61,9."),
       ok = 2, ex = "El 95 % describe el procedimiento (la proporción de intervalos que aciertan), no un intervalo concreto ni a las personas."),
  list(q = "Con los mismos datos, pasas de un nivel de confianza del 95 % al 99 %. El intervalo…",
       op = c("se estrecha.", "se ensancha.", "no cambia."),
       ok = 2, ex = "Para acertar más a menudo hay que lanzar un «aro» más grande: el valor crítico pasa de 1,96 a 2,576."),
  list(q = "Dos muestras tienen la misma media y DT, pero una tiene n = 25 y otra n = 400. ¿Cuál estima con más precisión?",
       op = c("La de n = 25.", "La de n = 400.", "Las dos igual, porque tienen la misma media."),
       ok = 2, ex = "El error típico es DT/√n: con más participantes es menor y el intervalo, más estrecho."),
  list(q = "¿De dónde sale el 1,96 del intervalo de confianza al 95 %?",
       op = c("Es el valor de la normal estándar que deja un 2,5 % en cada cola (α/2).",
              "Es la desviación típica habitual en Psicología.",
              "Es el número de participantes mínimo dividido entre 100."),
       ok = 1, ex = "Con 1 − α = 95 %, el 5 % restante se reparte entre las dos colas (2,5 % + 2,5 %). ±1,96 delimita el 95 % central."),
  list(q = "En la analogía del juicio, α = ,05 representa…",
       op = c("la probabilidad de que el acusado sea culpable.",
              "el riesgo que aceptamos de condenar a un inocente (rechazar H₀ siendo verdadera).",
              "la probabilidad de absolver a un culpable."),
       ok = 2, ex = "α es la probabilidad de error tipo I, que fijamos antes de ver los datos."),
  list(q = "Una t de Student da p = ,004 con α = ,05. ¿Qué decides?",
       op = c("No rechazo H₀.", "Rechazo H₀: la diferencia es estadísticamente significativa.", "Acepto H₀."),
       ok = 2, ex = ",004 ≤ ,05: las pruebas serían muy improbables si H₀ fuera cierta, así que la rechazamos."),
  list(q = "Una t de Student da p = ,409. ¿Qué podemos concluir?",
       op = c("Queda demostrado que los grupos tienen la misma media.",
              "No hay evidencia suficiente de diferencias; no rechazamos H₀.",
              "Hay un 40,9 % de probabilidad de que H₀ sea cierta."),
       ok = 2, ex = "Un resultado no significativo es un «no culpable por falta de pruebas», no una demostración de inocencia."),
  list(q = "¿Qué es exactamente el valor p?",
       op = c("La probabilidad de que H₀ sea verdadera.",
              "La probabilidad de obtener un resultado tan extremo como el observado, o más, si H₀ fuera cierta.",
              "La importancia práctica del resultado."),
       ok = 2, ex = "p se calcula suponiendo que H₀ es cierta; no mide la probabilidad de H₀ ni el tamaño del efecto."),
  list(q = "Shapiro-Wilk: W(60) = ,974, p = ,228. ¿Se cumple la normalidad?",
       op = c("Sí: no se rechaza H₀, no hay evidencia de desviación de la normalidad.",
              "No: el resultado no es significativo.",
              "No se puede saber sin la media."),
       ok = 1, ex = "En los supuestos la lógica se invierte: p > ,05 es lo que deseamos."),
  list(q = "Levene: F(1, 78) = 5,21, p = ,025. ¿Se cumple la homocedasticidad?",
       op = c("Sí, porque p es pequeño.", "No: hay evidencia de que las varianzas son distintas.", "Levene compara medias, no varianzas."),
       ok = 2, ex = "p ≤ ,05 → se rechaza H₀ (varianzas iguales): no se cumple el supuesto."),
  list(q = "En una tabla de chi-cuadrado significativa, la casilla Instagram–Ciberacoso Sí tiene un residuo corregido de 3,1. Significa que…",
       op = c("hay significativamente más casos de los esperados en esa casilla.",
              "hay significativamente menos casos de los esperados.",
              "no hay diferencias en esa casilla."),
       ok = 1, ex = "Z > +1,96 → más casos observados que esperados; Z < −1,96 → menos."),
  list(q = "Obtienes r = ,12, p < ,001 con n = 1.000. ¿Cuál es la mejor interpretación?",
       op = c("Relación positiva, estadísticamente significativa, pero débil.",
              "Relación muy fuerte, porque p es muy pequeño.",
              "No hay relación, porque r es menor que ,30."),
       ok = 1, ex = "Con muestras grandes, relaciones débiles salen significativas. Significación ≠ intensidad."),
  list(q = "Estrés laboral y satisfacción: r = −,41, p < ,001. ¿Qué significa?",
       op = c("A más estrés, más satisfacción.",
              "A más estrés, menos satisfacción; relación inversa moderada y significativa. El estrés causa la insatisfacción.",
              "A más estrés, menos satisfacción; relación inversa moderada y significativa, sin que podamos afirmar causalidad."),
       ok = 3, ex = "El signo negativo indica relación inversa; |r| = ,41 es moderada. La correlación no implica causalidad.")
)

ui_quiz <- nav_panel(
  "8 · Autoevaluación", icon = icon("circle-question"),
  div(class = "container-lg py-2",
      clave("Responde a todas las preguntas y pulsa ", strong("Corregir"), ". Verás la explicación de cada una."),
      lapply(seq_along(preguntas), function(i) {
        pr <- preguntas[[i]]
        div(class = "pregunta",
            h6(paste0(i, ". ", pr$q)),
            radioButtons(paste0("q", i), NULL, choiceNames = pr$op, choiceValues = seq_along(pr$op),
                         selected = character(0), width = "100%"),
            uiOutput(paste0("fb", i)))
      }),
      layout_columns(
        col_widths = c(3, 3, 6),
        actionButton("q_corregir", "Corregir", icon = icon("check-double"), class = "btn-primary w-100"),
        actionButton("q_borrar", "Volver a empezar", icon = icon("eraser"), class = "btn-outline-primary w-100"),
        uiOutput("q_nota")
      ),
      br())
)

# ---------- Página completa -------------------------------------------
ui <- page_navbar(
  title = marca,
  window_title = "Tema 4 · Inferencia · UFV",
  theme = tema_ufv,
  fillable = FALSE,
  header = tags$head(tags$style(HTML(css))),
  ui_inicio, ui_muestras, ui_ic, ui_juicio, ui_supuestos, ui_esquema, ui_chi, ui_cor, ui_quiz,
  footer = div(class = "pie",
               "Fundamentos de Investigación en Psicología · Universidad Francisco de Vitoria · ",
               "Recurso docente con datos simulados")
)

# =====================================================================
#  SERVIDOR
# =====================================================================
server <- function(input, output, session) {

  # ===================================================================
  # 1 · MUESTRAS
  # ===================================================================
  pob <- local({
    set.seed(2026)
    round(pmin(pmax(rnorm(5000, 58, 20), 0), 100))
  })
  MU <- mean(pob)
  SIGMA <- sqrt(mean((pob - MU)^2))

  rv_m <- reactiveValues(medias = numeric(0), ult = NULL)
  reiniciar_m <- function() { rv_m$medias <- numeric(0); rv_m$ult <- NULL }
  observeEvent(input$m_n, reiniciar_m(), ignoreInit = TRUE)
  observeEvent(input$m_reset, reiniciar_m())
  observeEvent(input$m_una, {
    x <- sample(pob, input$m_n)
    rv_m$ult <- x
    rv_m$medias <- c(rv_m$medias, mean(x))
  })
  observeEvent(input$m_cien, {
    ms <- replicate(99, mean(sample(pob, input$m_n)))
    x <- sample(pob, input$m_n)
    rv_m$ult <- x
    rv_m$medias <- c(rv_m$medias, ms, mean(x))
  })

  output$m_cifras <- renderUI({
    k <- length(rv_m$medias)
    ee <- SIGMA / sqrt(input$m_n)
    fila_cifras(
      cifra("Muestras extraídas", num(k, 0), tipo = "azul"),
      cifra("Media de la última muestra", if (k) num(tail(rv_m$medias, 1), 1) else "—", "estadístico", tipo = "roja"),
      cifra("Dispersión de tus medias", if (k > 1) num(sd(rv_m$medias), 2) else "—", "DT de las medias obtenidas"),
      cifra("Error típico teórico", num(ee, 2), paste0("σ / √n = ", num(SIGMA, 1), " / √", input$m_n), tipo = "verde")
    )
  })

  output$m_plot_muestra <- renderPlotC({
    x <- rv_m$ult
    if (is.null(x)) return(graf_vacio("Pulsa «Extraer 1 muestra»"))
    g <- ggplot(data.frame(x = x), aes(x)) +
      geom_histogram(binwidth = 5, boundary = 0, fill = AZUL_SUAVE, colour = "white") +
      geom_vline(xintercept = mean(x), colour = ROJO, linewidth = 1.3) +
      annotate("label", x = mean(x), y = Inf, vjust = 1.2, colour = ROJO,
               label = paste0("media de la muestra = ", num(mean(x), 1))) +
      scale_x_continuous(limits = c(0, 100)) +
      labs(x = "Apoyo social percibido (0–100)", y = "Número de personas") + tema_graf
    if (input$m_mu) {
      g <- g + geom_vline(xintercept = MU, colour = UFV_AZUL, linetype = "dashed", linewidth = 1) +
        annotate("label", x = MU, y = 0, vjust = -0.3, colour = UFV_AZUL, label = paste0("μ = ", num(MU, 1)))
    }
    g
  })

  output$m_plot_medias <- renderPlotC({
    ms <- rv_m$medias
    if (length(ms) == 0) return(graf_vacio("Aquí se irán acumulando las medias"))
    ee <- SIGMA / sqrt(input$m_n)
    bw <- max(0.25, round(ee / 2.5, 2))
    g <- ggplot(data.frame(m = ms), aes(m)) +
      geom_histogram(binwidth = bw, fill = ROJO, alpha = .75, colour = "white") +
      scale_x_continuous(limits = c(MU - 22, MU + 22)) +
      labs(x = "Media de cada muestra", y = "Número de muestras") + tema_graf
    if (length(ms) >= 30) {
      xs <- seq(MU - 22, MU + 22, length.out = 400)
      g <- g + geom_line(data = data.frame(x = xs, y = dnorm(xs, MU, ee) * length(ms) * bw),
                         aes(x, y), colour = UFV_AZUL, linewidth = 1)
    }
    if (input$m_mu) g <- g + geom_vline(xintercept = MU, colour = UFV_AZUL, linetype = "dashed", linewidth = 1)
    g
  })

  output$m_mensaje <- renderUI({
    ms <- rv_m$medias
    if (length(ms) < 30) {
      return(reto("Cuando tengas al menos 30 muestras aparecerá la curva teórica de las medias (distribución muestral)."))
    }
    q <- quantile(ms, c(.025, .975))
    ee <- SIGMA / sqrt(input$m_n)
    clave(strong("Puente hacia los intervalos de confianza. "),
          "El 95 % central de tus medias está entre ", strong(num(q[1], 1)), " y ", strong(num(q[2], 1)), ". ",
          paste0("La teoría dice que debería estar en μ ± 1,96 × error típico = ", num(MU, 1), " ± ", num(1.96 * ee, 1),
                 " → [", num(MU - 1.96 * ee, 1), " ; ", num(MU + 1.96 * ee, 1), "]. "),
          "Esa es la idea que usaremos al construir un intervalo de confianza.")
  })

  # ===================================================================
  # 2 · INTERVALOS DE CONFIANZA
  # ===================================================================
  observeEvent(input$ic_ej1, { updateNumericInput(session, "ic_media", value = 58); updateNumericInput(session, "ic_dt", value = 20); updateNumericInput(session, "ic_n", value = 100) })
  observeEvent(input$ic_ej2, { updateNumericInput(session, "ic_media", value = 60); updateNumericInput(session, "ic_dt", value = 20); updateNumericInput(session, "ic_n", value = 25) })
  observeEvent(input$ic_ej3, { updateNumericInput(session, "ic_media", value = 60); updateNumericInput(session, "ic_dt", value = 20); updateNumericInput(session, "ic_n", value = 400) })

  ic <- reactive({
    req(is.numeric(input$ic_media), input$ic_dt > 0, input$ic_n >= 2)
    conf <- as.numeric(input$ic_conf); a <- 1 - conf
    n <- round(input$ic_n)
    crit <- if (input$ic_t) qt(1 - a / 2, n - 1) else qnorm(1 - a / 2)
    ee <- input$ic_dt / sqrt(n)
    me <- crit * ee
    list(conf = conf, a = a, n = n, crit = crit, ee = ee, me = me, m = input$ic_media,
         li = input$ic_media - me, ls = input$ic_media + me, usa_t = input$ic_t)
  })

  output$ic_resultado <- renderUI({
    r <- ic()
    simb <- if (r$usa_t) paste0("t(", r$n - 1, ")") else "z"
    tagList(
      div(class = "resultado-ic",
          h3(paste0("IC al ", pct(r$conf), " = [", num(r$li, 2), " ; ", num(r$ls, 2), "]")),
          span(paste0("Estimación puntual: ", num(r$m, 2), " · Margen de error: ±", num(r$me, 2)))),
      layout_columns(
        col_widths = c(3, 3, 3, 3),
        div(class = "paso", h6(span(class = "bola", "1"), "Error típico"),
            div("EE = DT / √n"), div(class = "grande", paste0(num(input$ic_dt, 2), " / √", r$n, " = ", num(r$ee, 2)))),
        div(class = "paso", h6(span(class = "bola", "2"), "Valor crítico"),
            div(paste0(simb, " que deja ", pct(r$a / 2), " en cada cola")), div(class = "grande", num(r$crit, 3))),
        div(class = "paso", h6(span(class = "bola", "3"), "Margen de error"),
            div("ME = valor crítico × EE"), div(class = "grande", paste0(num(r$crit, 2), " × ", num(r$ee, 2), " = ", num(r$me, 2)))),
        div(class = "paso", h6(span(class = "bola", "4"), "Intervalo"),
            div("media ± ME"), div(class = "grande", paste0(num(r$m, 2), " ± ", num(r$me, 2))))
      )
    )
  })

  output$ic_curva <- renderPlotC({
    r <- ic()
    df <- if (r$usa_t) r$n - 1 else Inf
    dens <- function(x) if (is.finite(df)) dt(x, df) else dnorm(x)
    xs <- seq(-4.5, 4.5, length.out = 600)
    d <- data.frame(x = xs, y = dens(xs))
    d$zona <- ifelse(abs(d$x) >= r$crit, "cola", "centro")
    ytop <- max(d$y)
    ggplot(d, aes(x, y)) +
      geom_area(data = subset(d, x <= -r$crit), fill = ROJO, alpha = .7) +
      geom_area(data = subset(d, x >= r$crit), fill = ROJO, alpha = .7) +
      geom_area(data = subset(d, abs(x) <= r$crit), fill = AZUL_SUAVE) +
      geom_line(colour = UFV_AZUL, linewidth = 1) +
      geom_vline(xintercept = c(-r$crit, r$crit), linetype = "dashed", colour = UFV_AZUL) +
      annotate("text", x = 0, y = ytop * .45, label = paste0("1 − α\n", pct(r$conf)), size = 6.5,
               fontface = "bold", colour = UFV_AZUL) +
      annotate("label", x = c(-3.6, 3.6), y = ytop * .3, label = paste0("α/2\n", pct(r$a / 2)), colour = ROJO, size = 4.5) +
      scale_x_continuous(breaks = c(-r$crit, 0, r$crit), labels = c(paste0("−", num(r$crit, 3)), "0", paste0("+", num(r$crit, 3)))) +
      labs(x = if (r$usa_t) paste0("Distribución t de Student (gl = ", r$n - 1, ")") else "Distribución normal estándar (z)", y = NULL) +
      tema_graf + theme(axis.text.y = element_blank(), axis.text.x = element_text(size = 13, face = "bold", colour = ROJO))
  })

  output$ic_curva_txt <- renderUI({
    r <- ic()
    tagList(
      p(class = "small",
        "Con un nivel de confianza del ", strong(pct(r$conf)), ", el ", pct(r$a), " restante (α) se reparte entre las dos colas: ",
        pct(r$a / 2), " en cada una. El valor que deja ese ", pct(r$a / 2), " por encima es ", strong(num(r$crit, 3)), ". ",
        "Por eso multiplicamos el error típico por ese número."),
      if (r$usa_t) p(class = "small", style = "color:#5B6770;",
                     "Con la t de Student el valor crítico es algo mayor que 1,96, sobre todo con muestras pequeñas. Con n grande, t y z casi coinciden.")
    )
  })

  output$ic_niveles <- renderPlotC({
    r <- ic()
    niveles <- c(0.90, 0.95, 0.99, 0.999)
    crits <- sapply(niveles, function(cf) if (r$usa_t) qt(1 - (1 - cf) / 2, r$n - 1) else qnorm(1 - (1 - cf) / 2))
    d <- data.frame(nivel = factor(pct(niveles), levels = rev(pct(niveles))),
                    li = r$m - crits * r$ee, ls = r$m + crits * r$ee,
                    sel = abs(niveles - r$conf) < 1e-9)
    ggplot(d, aes(y = nivel)) +
      geom_segment(aes(x = li, xend = ls, yend = nivel, colour = sel), linewidth = 4, lineend = "round") +
      geom_point(aes(x = r$m), size = 3.5, colour = "white") +
      geom_text(aes(x = li, label = num(li, 1)), vjust = -1.1, size = 3.8, colour = GRIS) +
      geom_text(aes(x = ls, label = num(ls, 1)), vjust = -1.1, size = 3.8, colour = GRIS) +
      scale_colour_manual(values = c(`TRUE` = ROJO, `FALSE` = AZUL_SUAVE), guide = "none") +
      labs(x = "Valores plausibles para la media poblacional", y = "Confianza") + tema_graf
  })

  # --- 100 intervalos -------------------------------------------------
  rv_ci <- reactiveValues(lote = NULL, total = 0, aciertos = 0)
  generar_ci <- function() {
    n <- input$ci_n; conf <- as.numeric(input$ci_conf)
    m <- matrix(rnorm(100 * n, 60, 20), nrow = 100)
    medias <- rowMeans(m)
    dts <- sqrt(rowSums((m - medias)^2) / (n - 1))
    crit <- qnorm(1 - (1 - conf) / 2)
    li <- medias - crit * dts / sqrt(n); ls <- medias + crit * dts / sqrt(n)
    cont <- li <= 60 & ls >= 60
    rv_ci$lote <- data.frame(id = 1:100, media = medias, li = li, ls = ls, contiene = cont)
    rv_ci$total <- rv_ci$total + 100
    rv_ci$aciertos <- rv_ci$aciertos + sum(cont)
  }
  observeEvent(input$ci_go, generar_ci(), ignoreNULL = FALSE)
  observeEvent(list(input$ci_n, input$ci_conf), { rv_ci$total <- 0; rv_ci$aciertos <- 0; generar_ci() }, ignoreInit = TRUE)
  observeEvent(input$ci_reset, { rv_ci$total <- 0; rv_ci$aciertos <- 0; generar_ci() })

  output$ci_cifras <- renderUI({
    d <- rv_ci$lote; req(d)
    oc <- input$ci_ocultar
    fila_cifras(
      cifra("En esta tanda", if (oc) "¿?" else paste0(sum(d$contiene), " de 100"), "intervalos que contienen μ", tipo = "verde"),
      cifra("Acumulado", if (oc) "¿?" else pct(rv_ci$aciertos / rv_ci$total),
            paste0(num(rv_ci$aciertos, 0), " de ", num(rv_ci$total, 0), " intervalos")),
      cifra("Nivel de confianza", pct(as.numeric(input$ci_conf)), "lo que esperamos a la larga", tipo = "azul"),
      cifra("Anchura media", num(mean(d$ls - d$li), 1), "puntos (de un extremo a otro)", tipo = "roja")
    )
  })

  output$ci_plot <- renderPlotC({
    d <- rv_ci$lote; req(d)
    oc <- input$ci_ocultar
    d$estado <- if (oc) "Desconocido" else ifelse(d$contiene, "Contiene μ", "No contiene μ")
    cols <- c("Contiene μ" = VERDE, "No contiene μ" = ROJO, "Desconocido" = AZUL_MEDIO)
    g <- ggplot(d, aes(y = id)) +
      geom_segment(aes(x = li, xend = ls, yend = id, colour = estado), linewidth = 1.1) +
      geom_point(aes(x = media, colour = estado), size = 1.4) +
      scale_colour_manual(values = cols, name = NULL) +
      coord_cartesian(xlim = c(40, 80)) +
      labs(x = "Apoyo social percibido: intervalo de cada estudio", y = "Estudio nº") + tema_graf
    if (!oc) g <- g + geom_vline(xintercept = 60, colour = UFV_AZUL, linewidth = 1, linetype = "dashed") +
      annotate("label", x = 60, y = 104, label = "μ = 60", colour = UFV_AZUL)
    g
  })

  # --- Tamaño muestral y precisión -----------------------------------
  output$pr_plot <- renderPlotC({
    conf <- as.numeric(input$pr_conf); z <- qnorm(1 - (1 - conf) / 2)
    ns <- c(input$pr_n1, input$pr_n2)
    d <- data.frame(muestra = factor(c(paste0("Muestra A (n = ", ns[1], ")"), paste0("Muestra B (n = ", ns[2], ")")),
                                     levels = rev(c(paste0("Muestra A (n = ", ns[1], ")"), paste0("Muestra B (n = ", ns[2], ")")))),
                    me = z * 20 / sqrt(ns))
    d$li <- 60 - d$me; d$ls <- 60 + d$me
    ggplot(d, aes(y = muestra)) +
      geom_segment(aes(x = li, xend = ls, yend = muestra), linewidth = 5, colour = c(AMBAR, AZUL_MEDIO), lineend = "round") +
      geom_point(aes(x = 60), size = 4, colour = UFV_AZUL) +
      geom_text(aes(x = li, label = num(li, 1)), vjust = -1.2, size = 4, colour = GRIS) +
      geom_text(aes(x = ls, label = num(ls, 1)), vjust = -1.2, size = 4, colour = GRIS) +
      geom_text(aes(x = ls, label = paste0("  ±", num(me, 2))), hjust = -0.2, size = 4.2, fontface = "bold", colour = UFV_AZUL) +
      coord_cartesian(xlim = c(44, 76)) +
      labs(x = "Satisfacción laboral (0–100)", y = NULL) + tema_graf
  })

  output$pr_curva <- renderPlotC({
    conf <- as.numeric(input$pr_conf); z <- qnorm(1 - (1 - conf) / 2)
    ns <- 10:1000
    d <- data.frame(n = ns, me = z * 20 / sqrt(ns))
    pts <- data.frame(n = c(input$pr_n1, input$pr_n2), me = z * 20 / sqrt(c(input$pr_n1, input$pr_n2)), m = c("A", "B"))
    ggplot(d, aes(n, me)) +
      geom_line(colour = UFV_AZUL, linewidth = 1.1) +
      geom_point(data = pts, aes(colour = m), size = 5) +
      geom_text(data = pts, aes(label = paste0(m, ": ±", num(me, 2))), vjust = -1.2, fontface = "bold") +
      scale_colour_manual(values = c(A = AMBAR, B = AZUL_MEDIO), guide = "none") +
      labs(x = "Tamaño de la muestra (n)", y = "Margen de error (± puntos)") + tema_graf
  })

  # ===================================================================
  # 3 · EL JUICIO
  # ===================================================================
  juicio_datos <- eventReactive(list(input$j_go, input$j_n, input$j_dif), {
    n <- input$j_n
    list(chicos = pmin(pmax(rnorm(n, 6, 1.5), 0), 10),
         chicas = pmin(pmax(rnorm(n, 6 + input$j_dif, 1.5), 0), 10),
         dif_real = input$j_dif, n = n)
  }, ignoreNULL = FALSE)

  juicio <- reactive({
    d <- juicio_datos(); a <- as.numeric(input$j_alpha)
    tt <- t.test(d$chicas, d$chicos, var.equal = TRUE, conf.level = 1 - a)
    sp <- sqrt((var(d$chicas) + var(d$chicos)) / 2)
    list(d = d, a = a, t = unname(tt$statistic), gl = unname(tt$parameter), p = tt$p.value,
         ic = tt$conf.int, m1 = mean(d$chicas), m2 = mean(d$chicos),
         dif = mean(d$chicas) - mean(d$chicos), dcohen = (mean(d$chicas) - mean(d$chicos)) / sp,
         tcrit = qt(1 - a / 2, tt$parameter), condena = tt$p.value <= a)
  })

  output$j_pasos <- renderUI({
    j <- juicio()
    layout_columns(
      col_widths = c(3, 3, 3, 3),
      div(class = "paso", h6(span(class = "bola", "1"), "Presunción de inocencia"),
          div(class = "grande", "H₀: μ chicas = μ chicos"),
          div(class = "small", "Suponemos que en la población no hay diferencias. H₁: μ chicas ≠ μ chicos.")),
      div(class = "paso", h6(span(class = "bola", "2"), "Las pruebas"),
          div(paste0("Chicas: M = ", num(j$m1, 2), " · Chicos: M = ", num(j$m2, 2))),
          div(class = "grande", paste0("t(", j$gl, ") = ", num(j$t, 2))),
          div(class = "small", paste0("Diferencia = ", num(j$dif, 2), " · d de Cohen = ", num(j$dcohen, 2)))),
      div(class = "paso", h6(span(class = "bola", "3"), "¿Sorprendentes si fuera inocente?"),
          div(class = "grande", p_txt(j$p)),
          div(class = "small", paste0("Si no hubiera diferencias en la población, obtendríamos una diferencia así de grande (o más) en ",
                                      if (j$p < .001) "menos del 0,1 %" else paste0("un ", pct(round(j$p, 3))),
                                      " de los estudios."))),
      div(class = "paso", h6(span(class = "bola", "4"), "Comparar con la duda razonable"),
          div(class = "grande", paste0(p_txt(j$p), if (j$condena) " ≤ " else " > ", "α = ", alfa_txt(j$a))),
          div(class = "small", "α se fijó antes de ver los datos."))
    )
  })

  output$j_veredicto <- renderUI({
    j <- juicio()
    real_inocente <- j$d$dif_real == 0
    realidad <- NULL
    if (input$j_revelar) {
      txt <- if (real_inocente && j$condena) "Realidad: era INOCENTE (diferencia real = 0). Has cometido un ERROR TIPO I: condenar a un inocente."
      else if (real_inocente && !j$condena) "Realidad: era INOCENTE (diferencia real = 0). Acierto."
      else if (!real_inocente && j$condena) paste0("Realidad: era CULPABLE (diferencia real = ", num(j$d$dif_real, 2), "). Acierto.")
      else paste0("Realidad: era CULPABLE (diferencia real = ", num(j$d$dif_real, 2), "). Has cometido un ERROR TIPO II: absolver a un culpable.")
      realidad <- div(class = "realidad", icon("eye"), " ", txt)
    }
    if (j$condena) {
      div(class = "veredicto culpable",
          h3(icon("gavel"), " Veredicto: CULPABLE → rechazamos H₀"),
          div("Las pruebas serían muy improbables si no hubiera diferencias. Existen diferencias estadísticamente significativas en autoestima entre chicas y chicos."),
          realidad)
    } else {
      div(class = "veredicto absuelto",
          h3(icon("scale-balanced"), " Veredicto: NO CULPABLE → no rechazamos H₀"),
          div("No hay pruebas suficientes de diferencias. Ojo: esto no demuestra que no existan; solo que estos datos no bastan para afirmarlo."),
          realidad)
    }
  })

  output$j_plot_t <- renderPlotC({
    j <- juicio()
    lim <- max(4.5, min(abs(j$t) + 1, 15))
    xs <- seq(-lim, lim, length.out = 800)
    d <- data.frame(x = xs, y = dt(xs, j$gl))
    ta <- abs(j$t)
    ggplot(d, aes(x, y)) +
      geom_area(data = subset(d, x <= -ta), aes(fill = "Valor p"), alpha = .6) +
      geom_area(data = subset(d, x >= ta), aes(fill = "Valor p"), alpha = .6) +
      geom_area(data = subset(d, x <= -j$tcrit), aes(fill = "Zona de condena (α)"), alpha = .75) +
      geom_area(data = subset(d, x >= j$tcrit), aes(fill = "Zona de condena (α)"), alpha = .75) +
      geom_line(colour = UFV_AZUL, linewidth = 1) +
      geom_vline(xintercept = j$t, colour = "black", linewidth = 1.2) +
      geom_vline(xintercept = -j$t, colour = "black", linewidth = .6, linetype = "dotted") +
      annotate("label", x = j$t, y = max(d$y) * .85, label = paste0("tus pruebas\nt = ", num(j$t, 2)), size = 4.2) +
      annotate("text", x = 0, y = max(d$y) * .35, label = "Lo esperable\nsi H₀ es cierta", colour = UFV_AZUL, size = 4.5) +
      scale_fill_manual(values = c("Zona de condena (α)" = ROJO, "Valor p" = AMBAR), name = NULL) +
      labs(x = paste0("Estadístico t (gl = ", j$gl, ")"), y = NULL) +
      tema_graf + theme(axis.text.y = element_blank())
  })

  output$j_plot_txt <- renderUI({
    j <- juicio()
    p(class = "small",
      "La curva muestra qué valores de t aparecerían si el acusado fuera inocente (H₀ cierta). ",
      span(.noWS = "outside", style = paste0("color:", ROJO, ";font-weight:700;"), "En rojo"), ", la zona de condena: el ", pct(j$a),
      paste0(" más extremo (valores críticos ±", num(j$tcrit, 2), "). "),
      span(.noWS = "outside", style = paste0("color:", AMBAR, ";font-weight:700;"), "En naranja"), ", el valor p: el área más allá de tus pruebas. ",
      "Si tus pruebas caen en la zona de condena, p ≤ α.")
  })

  output$j_plot_datos <- renderPlotC({
    j <- juicio()
    d <- rbind(data.frame(grupo = "Chicos", y = j$d$chicos), data.frame(grupo = "Chicas", y = j$d$chicas))
    res <- aggregate(y ~ grupo, d, function(v) c(m = mean(v), e = qt(.975, length(v) - 1) * sd(v) / sqrt(length(v))))
    res <- data.frame(grupo = res$grupo, m = res$y[, "m"], e = res$y[, "e"])
    ggplot(d, aes(grupo, y, colour = grupo)) +
      geom_jitter(width = .18, alpha = .35, size = 1.6) +
      geom_errorbar(data = res, aes(y = m, ymin = m - e, ymax = m + e), width = .25, linewidth = 1.2, colour = UFV_AZUL) +
      geom_point(data = res, aes(y = m), size = 4.5, colour = UFV_AZUL) +
      geom_text(data = res, aes(y = m, label = paste0("M = ", num(m, 2))), nudge_x = .38, colour = UFV_AZUL, fontface = "bold") +
      scale_colour_manual(values = c(Chicos = AZUL_MEDIO, Chicas = AMBAR), guide = "none") +
      scale_y_continuous(limits = c(0, 10)) +
      labs(x = NULL, y = "Autoestima (0–10)", caption = "Media e IC al 95 % de cada grupo") + tema_graf
  })

  output$j_plot_ic <- renderPlotC({
    j <- juicio()
    excl <- j$ic[1] > 0 || j$ic[2] < 0
    lim <- max(1, abs(j$ic) + .2)
    ggplot() +
      geom_vline(xintercept = 0, linetype = "dashed", colour = GRIS) +
      annotate("text", x = 0, y = 1.45, label = "0 = sin diferencia (H₀)", colour = GRIS, size = 4) +
      annotate("segment", x = j$ic[1], xend = j$ic[2], y = 1, yend = 1, linewidth = 5,
               colour = if (excl) ROJO else UFV_AZUL, lineend = "round") +
      annotate("point", x = j$dif, y = 1, size = 4, colour = "white") +
      annotate("text", x = j$ic, y = .6, label = num(j$ic, 2), colour = GRIS, size = 4) +
      scale_x_continuous(limits = c(-lim, lim)) + scale_y_continuous(limits = c(.4, 1.6)) +
      labs(x = "Diferencia de medias (chicas − chicos)", y = NULL) + tema_graf +
      theme(axis.text.y = element_blank(), panel.grid.major.y = element_blank())
  })

  output$j_ic_txt <- renderUI({
    j <- juicio()
    excl <- j$ic[1] > 0 || j$ic[2] < 0
    p(paste0("El IC al ", pct(1 - j$a), " (es decir, 1 − α) de la diferencia es [", num(j$ic[1], 2), " ; ", num(j$ic[2], 2), "]. "),
      strong(if (excl) "No incluye el 0" else "Incluye el 0"), ", y por eso ",
      if (excl) "p ≤ α (rechazamos H₀)." else "p > α (no rechazamos H₀).",
      " El intervalo y el contraste siempre coinciden en su veredicto, pero el intervalo además nos dice ", strong("cuánto"), " difieren los grupos.")
  })

  # --- Mil juicios ----------------------------------------------------
  mil <- eventReactive(input$mj_go, {
    n <- input$mj_n; k <- 1000; a <- as.numeric(input$mj_alpha)
    x1 <- matrix(rnorm(n * k, 6, 1.5), k); x2 <- matrix(rnorm(n * k, 6 + input$mj_dif, 1.5), k)
    m1 <- rowMeans(x1); m2 <- rowMeans(x2)
    v1 <- rowSums((x1 - m1)^2) / (n - 1); v2 <- rowSums((x2 - m2)^2) / (n - 1)
    t <- (m2 - m1) / sqrt((v1 + v2) / 2 * (2 / n))
    p <- 2 * pt(-abs(t), 2 * n - 2)
    list(p = p, condena = p <= a, a = a, dif = input$mj_dif, n = n)
  }, ignoreNULL = FALSE)

  output$mj_cifras <- renderUI({
    r <- mil(); cond <- sum(r$condena)
    inocente <- r$dif == 0
    fila_cifras(
      cifra("Realidad", if (inocente) "Inocente" else "Culpable",
            if (inocente) "diferencia real = 0 (H₀ verdadera)" else paste0("diferencia real = ", num(r$dif, 2)), tipo = "azul"),
      cifra("Condenas (rechazo H₀)", paste0(num(cond, 0), " de 1.000"), pct(cond / 1000), tipo = "roja"),
      cifra("Absoluciones (no rechazo H₀)", paste0(num(1000 - cond, 0), " de 1.000"), pct(1 - cond / 1000)),
      cifra("α fijado", alfa_txt(r$a), paste0(r$n, " participantes por grupo"), tipo = "verde")
    )
  })

  output$mj_plot <- renderPlotC({
    r <- mil()
    ord <- sort(r$condena, decreasing = TRUE)
    d <- data.frame(x = rep(1:50, 20), y = rep(20:1, each = 50), c = ord)
    d$v <- ifelse(d$c, "Condena (rechazo H₀)", "Absolución (no rechazo H₀)")
    ggplot(d, aes(x, y, fill = v)) +
      geom_tile(colour = "white", linewidth = .6) +
      scale_fill_manual(values = c("Condena (rechazo H₀)" = ROJO, "Absolución (no rechazo H₀)" = AZUL_SUAVE), name = NULL) +
      coord_equal() + theme_void(base_size = 14) + theme(legend.position = "bottom")
  })

  output$mj_mensaje <- renderUI({
    r <- mil(); tasa <- mean(r$condena)
    if (r$dif == 0) {
      clave(strong("El acusado era inocente en los 1.000 juicios. "),
            "Aun así, condenaste en el ", strong(pct(tasa)), " de ellos: son ", strong("errores tipo I"), ". ",
            "Fíjate en que este porcentaje se parece mucho a α = ", alfa_txt(r$a), ": ",
            "α es precisamente la probabilidad de condenar a un inocente que aceptamos de antemano. ",
            "Y el ", pct(1 - tasa), " de absoluciones se parece a 1 − α.")
    } else {
      tagList(
        clave(strong("El acusado era culpable en los 1.000 juicios. "),
              "Lo condenaste en el ", strong(pct(tasa)), " (", strong("potencia"), ": capacidad de detectar una diferencia real) y lo absolviste en el ",
              strong(pct(1 - tasa)), " (", strong("errores tipo II"), "). Para reducir el error tipo II, aumenta el tamaño de la muestra."),
        if (r$dif <= 0.3 && tasa > .5)
          alerta(strong("Significativo ≠ importante. "), "Con muestras grandes se detectan diferencias muy pequeñas (aquí, ",
                 num(r$dif, 2), " puntos en una escala de 0 a 10). Por eso conviene informar también del tamaño del efecto y del intervalo de confianza.")
      )
    }
  })

  # ===================================================================
  # 4 · SUPUESTOS
  # ===================================================================
  gen_forma <- function(forma, n) {
    switch(forma,
           normal   = rnorm(n, 30, 5),
           asimpos  = 18 + rgamma(n, shape = 1.5, scale = 6),
           asimneg  = 45 - rgamma(n, shape = 1.5, scale = 6),
           atipicos = { x <- rnorm(n, 30, 5); k <- max(1, round(n * .05)); x[1:k] <- 30 + sample(c(-1, 1), k, TRUE) * runif(k, 18, 25); x },
           unif     = runif(n, 15, 45))
  }
  norm_datos <- eventReactive(list(input$n_go, input$n_forma, input$n_n), gen_forma(input$n_forma, input$n_n), ignoreNULL = FALSE)

  output$n_resultado <- renderUI({
    x <- norm_datos(); n <- length(x)
    sw <- shapiro.test(x)
    ks <- if (tiene_nortest) nortest::lillie.test(x) else NULL
    usar_sw <- n < 50
    p_usado <- if (usar_sw || is.null(ks)) sw$p.value else ks$p.value
    cumple <- p_usado > .05
    fila <- function(nombre, est, p, elegido) {
      tags$tr(style = if (elegido) "background:#FFF7EA;font-weight:700;" else "",
              tags$td(class = "fila", nombre, if (elegido) span(" ← la que interpretamos", style = "color:#E8A33D;")),
              tags$td(est), tags$td(p_txt(p)),
              tags$td(if (p > .05) "No se rechaza H₀" else "Se rechaza H₀"))
    }
    tagList(
      tags$table(class = "t-ufv",
                 tags$tr(tags$th("Prueba"), tags$th("Estadístico"), tags$th("p"), tags$th("Decisión")),
                 fila("Shapiro-Wilk", paste0("W(", n, ") = ", sin_cero(num(sw$statistic, 3))), sw$p.value, usar_sw || is.null(ks)),
                 if (!is.null(ks)) fila("Kolmogorov-Smirnov (Lilliefors)", paste0("D(", n, ") = ", sin_cero(num(ks$statistic, 3))), ks$p.value, !usar_sw)),
      if (cumple) div(class = "veredicto absuelto", style = "background:#1E9E63;",
                      h3(icon("circle-check"), " Se cumple el supuesto de normalidad"),
                      div("p > ,05: no hay evidencia de desviación de la normalidad (no se rechaza H₀)."))
      else div(class = "veredicto culpable",
               h3(icon("triangle-exclamation"), " No se cumple el supuesto de normalidad"),
               div("p ≤ ,05: hay evidencia de desviación de la normalidad (se rechaza H₀). En el esquema de clase usaríamos la alternativa no paramétrica.")),
      if (!tiene_nortest) p(class = "small", "Instala el paquete «nortest» para ver también Kolmogorov-Smirnov con corrección de Lilliefors.")
    )
  })

  output$n_hist <- renderPlotC({
    x <- norm_datos()
    xs <- seq(min(x) - 5, max(x) + 5, length.out = 300)
    bw <- diff(range(x)) / max(8, min(25, round(sqrt(length(x)) * 1.5)))
    ggplot(data.frame(x = x), aes(x)) +
      geom_histogram(binwidth = bw, fill = AZUL_SUAVE, colour = "white") +
      geom_line(data = data.frame(x = xs, y = dnorm(xs, mean(x), sd(x)) * length(x) * bw), aes(x, y),
                colour = ROJO, linewidth = 1.1) +
      labs(x = "Autoestima", y = "Frecuencia") + tema_graf
  })

  output$n_qq <- renderPlotC({
    x <- norm_datos()
    ggplot(data.frame(x = x), aes(sample = x)) +
      stat_qq_line(colour = ROJO, linewidth = 1) +
      stat_qq(colour = UFV_AZUL, alpha = .7, size = 2) +
      labs(x = "Valores teóricos (normal)", y = "Valores observados") + tema_graf
  })

  homo_datos <- eventReactive(list(input$h_go, input$h_ratio, input$h_n1, input$h_n2), {
    rbind(data.frame(grupo = "Psicología", y = rnorm(input$h_n1, 28, 6)),
          data.frame(grupo = "Criminología", y = rnorm(input$h_n2, 33, 6 * input$h_ratio)))
  }, ignoreNULL = FALSE)

  levene <- reactive({
    d <- homo_datos()
    d$z <- abs(d$y - ave(d$y, d$grupo))                     # centrado en la media, como SPSS
    a <- anova(lm(z ~ grupo, data = d))
    list(F = a$`F value`[1], gl1 = a$Df[1], gl2 = a$Df[2], p = a$`Pr(>F)`[1])
  })

  output$h_resultado <- renderUI({
    l <- levene(); d <- homo_datos()
    s <- tapply(d$y, d$grupo, sd)
    cumple <- l$p > .05
    tagList(
      fila_cifras(
        cifra("DT Psicología", num(s["Psicología"], 2), paste0("varianza = ", num(s["Psicología"]^2, 1))),
        cifra("DT Criminología", num(s["Criminología"], 2), paste0("varianza = ", num(s["Criminología"]^2, 1)), tipo = "roja"),
        cifra("Prueba de Levene", paste0("F(", l$gl1, ", ", l$gl2, ") = ", num(l$F, 2)), p_txt(l$p), tipo = "azul")
      ),
      if (cumple) div(class = "veredicto absuelto", style = "background:#1E9E63;",
                      h3(icon("circle-check"), " Se cumple la homocedasticidad"),
                      div("p > ,05: no hay evidencia de diferencias entre las varianzas (no se rechaza H₀)."))
      else div(class = "veredicto culpable",
               h3(icon("triangle-exclamation"), " No se cumple la homocedasticidad"),
               div("p ≤ ,05: hay evidencia de que las varianzas son distintas (se rechaza H₀)."))
    )
  })

  output$h_plot <- renderPlotC({
    d <- homo_datos()
    ggplot(d, aes(y, grupo, colour = grupo)) +
      geom_boxplot(outlier.shape = NA, width = .5, linewidth = .9, fill = NA) +
      geom_jitter(height = .15, alpha = .45, size = 2) +
      scale_colour_manual(values = c("Psicología" = UFV_AZUL, "Criminología" = ROJO), guide = "none") +
      labs(x = "Ansiedad", y = NULL) + tema_graf
  })

  # ===================================================================
  # 5 · ESQUEMA DE DECISIÓN
  # ===================================================================
  pruebas <- list(
    chi = list(n = "Chi-cuadrado de Pearson (χ²) + residuos",
               para = "Analizar la asociación entre dos variables categóricas.",
               rep = "χ²(gl, N = …) = …, p = …. Si es significativo, se interpretan los residuos estandarizados corregidos (±1,96).",
               donde = "Practícala en el apartado 6."),
    pearson = list(n = "Correlación de Pearson (r)",
                   para = "Relación lineal entre dos variables cuantitativas: dirección e intensidad. Prueba paramétrica.",
                   rep = "r(gl) = …, p = …", donde = "Practícala en el apartado 7."),
    spearman = list(n = "Correlación de Spearman (ρ)",
                    para = "Relación monótona entre variables ordinales o cuantitativas sin normalidad. Prueba no paramétrica basada en rangos.",
                    rep = "ρ(gl) = …, p = …", donde = "Practícala en el apartado 7."),
    t_rel = list(n = "t de Student para muestras relacionadas (t)",
                 para = "Comparar las medias de las mismas personas en dos momentos o condiciones.",
                 rep = "t(gl) = …, p = …", donde = "La veremos en la siguiente parte del tema."),
    wilcoxon = list(n = "Prueba de Wilcoxon (W)",
                    para = "Alternativa no paramétrica para comparar dos medidas de las mismas personas.",
                    rep = "W = …, p = … (o z = …, p = …)", donde = "La veremos en la siguiente parte del tema."),
    t_ind = list(n = "t de Student para muestras independientes (t)",
                 para = "Comparar las medias de dos grupos formados por personas distintas.",
                 rep = "t(gl) = …, p = …", donde = "Su lógica la tienes en «3 · El juicio»."),
    mann = list(n = "U de Mann-Whitney (U)",
                para = "Alternativa no paramétrica para comparar dos grupos independientes.",
                rep = "U = …, p = …", donde = "La veremos en la siguiente parte del tema.")
  )

  camino <- reactive({
    ch <- function(t, cl = "") list(t = t, cl = cl)
    if (input$w_tipo == "cat") return(list(pasos = list(ch("2 variables"), ch("Categóricas")), prueba = "chi"))
    if (input$w_tipo == "rel") {
      if (isTRUE(input$w_ordinal))
        return(list(pasos = list(ch("2 variables"), ch("Relacionar"), ch("Variable ordinal (excepción)", "supuesto")), prueba = "spearman"))
      nr <- input$w_norm_rel
      return(list(pasos = list(ch("2 variables"), ch("Cuantitativas"), ch("Relacionar"),
                               ch(paste0("Normalidad: ", if (nr == "si") "sí" else "no"), "supuesto")),
                  prueba = if (nr == "si") "pearson" else "spearman"))
    }
    base <- list(ch("2 variables"), ch("Cuantitativa"), ch("Comparar"))
    nc <- input$w_norm_comp
    if (input$w_muestras == "rel") {
      return(list(pasos = c(base, list(ch("Muestras relacionadas"), ch(paste0("Normalidad: ", if (nc == "si") "sí" else "no"), "supuesto"))),
                  prueba = if (nc == "si") "t_rel" else "wilcoxon"))
    }
    if (nc == "no") {
      return(list(pasos = c(base, list(ch("Muestras independientes"), ch("Normalidad: no", "supuesto"))), prueba = "mann"))
    }
    lv <- input$w_lev
    list(pasos = c(base, list(ch("Muestras independientes"), ch("Normalidad: sí", "supuesto"),
                              ch(paste0("Homocedasticidad: ", if (lv == "si") "sí" else "no"), "supuesto"))),
         prueba = if (lv == "si") "t_ind" else "mann")
  })

  output$w_camino <- renderUI({
    cm <- camino(); pr <- pruebas[[cm$prueba]]
    elems <- list()
    for (s in cm$pasos) {
      elems <- c(elems, list(span(class = paste("chip", s$cl), s$t), span(class = "flecha", icon("arrow-right"))))
    }
    div(style = "margin:8px 0 14px;", elems, span(class = "chip final", pr$n))
  })

  output$w_prueba <- renderUI({
    pr <- pruebas[[camino()$prueba]]
    card(card_header(icon("flag-checkered"), " Prueba recomendada: ", pr$n),
         card_body(
           p(strong("¿Para qué sirve? "), pr$para),
           p(strong("¿Cómo se informa? "), pr$rep),
           p(class = "small", style = "color:#5B6770;", pr$donde)
         ))
  })

  casos <- list(
    list(t = "Un equipo estudia si practicar deporte (sí/no) se asocia con tener insomnio (sí/no) en 200 universitarios.",
         ok = "chi", ex = "Dos variables categóricas y objetivo de asociación → chi-cuadrado (no requiere normalidad)."),
    list(t = "Se analiza la relación entre las horas semanales de uso de redes sociales y la ansiedad (puntuación) en 120 adolescentes. Ambas variables cumplen la normalidad.",
         ok = "pearson", ex = "Dos cuantitativas, objetivo relacionar, normalidad sí → Pearson."),
    list(t = "Relación entre el estrés laboral y la satisfacción laboral en 150 trabajadores. Kolmogorov-Smirnov: p = ,003 en estrés laboral.",
         ok = "spearman", ex = "Dos cuantitativas, objetivo relacionar, pero no se cumple la normalidad → Spearman."),
    list(t = "Relación entre el nivel de estudios (primaria / secundaria / universitarios) y la satisfacción con la vida (puntuación 0–50).",
         ok = "spearman", ex = "Una variable es categórica ordinal y la otra cuantitativa: es la excepción del esquema → Spearman."),
    list(t = "Se compara el estrés de enfermeras de turno de noche (n = 40) y de turno de día (n = 42). Shapiro-Wilk: p > ,05 en ambos grupos; Levene: p = ,41.",
         ok = "t_ind", ex = "Cuantitativa en dos grupos independientes, normalidad sí y homocedasticidad sí → t de Student para muestras independientes."),
    list(t = "Se mide la ansiedad de 30 personas antes y después de un programa de mindfulness. La normalidad no se cumple (Shapiro-Wilk: p = ,012).",
         ok = "wilcoxon", ex = "Las mismas personas medidas dos veces (relacionadas) y sin normalidad → Wilcoxon."),
    list(t = "Se mide la autoestima de 25 adolescentes antes y después de un taller. La normalidad se cumple (Shapiro-Wilk: p = ,48).",
         ok = "t_rel", ex = "Muestras relacionadas con normalidad → t de Student para muestras relacionadas."),
    list(t = "Se compara el rendimiento académico de estudiantes con mentoría (n = 35) y sin mentoría (n = 38). Shapiro-Wilk: p = ,004 en el grupo con mentoría.",
         ok = "mann", ex = "Dos grupos independientes y no se cumple la normalidad → U de Mann-Whitney."),
    list(t = "Se estudia si el tipo de centro (público/privado) se asocia con la presencia de sintomatología ansiosa elevada (sí/no) en 300 escolares.",
         ok = "chi", ex = "Dos variables categóricas → chi-cuadrado de Pearson y, si es significativo, residuos.")
  )
  opciones_prueba <- c("Elige una prueba…" = "", setNames(names(pruebas), sapply(pruebas, `[[`, "n")))
  rv_caso <- reactiveValues(i = 1, orden = sample(seq_along(casos)), fb = NULL)
  observe(updateSelectInput(session, "caso_resp", choices = opciones_prueba))
  observeEvent(input$caso_sig, {
    rv_caso$i <- if (rv_caso$i >= length(casos)) 1 else rv_caso$i + 1
    rv_caso$fb <- NULL
    updateSelectInput(session, "caso_resp", selected = "")
  })
  output$caso_txt <- renderUI({
    k <- rv_caso$orden[rv_caso$i]
    div(class = "pregunta", style = "border-left:6px solid #003865;",
        h6(paste0("Caso ", rv_caso$i, " de ", length(casos))),
        p(style = "font-size:1.08rem;", casos[[k]]$t))
  })
  observeEvent(input$caso_comprobar, {
    k <- rv_caso$orden[rv_caso$i]; cs <- casos[[k]]
    if (!nzchar(input$caso_resp)) { rv_caso$fb <- alerta("Elige primero una prueba."); return() }
    rv_caso$fb <- if (input$caso_resp == cs$ok) {
      div(class = "caja clave", style = "border-left-color:#1E9E63;", span(class = "fb-ok", icon("circle-check"), " ¡Correcto! "), cs$ex)
    } else {
      alerta(span(class = "fb-no", icon("circle-xmark"), " No es esa. "), "La prueba adecuada es ", strong(pruebas[[cs$ok]]$n), ". ", cs$ex)
    }
  })
  output$caso_fb <- renderUI(rv_caso$fb)

  # ===================================================================
  # 6 · CHI-CUADRADO
  # ===================================================================
  poner_tabla <- function(v) for (i in 1:4) updateNumericInput(session, c("x11", "x12", "x21", "x22")[i], value = v[i])
  observeEvent(input$x_ej1, poner_tabla(c(40, 60, 20, 80)))
  observeEvent(input$x_ej2, poner_tabla(c(32, 68, 28, 72)))
  observeEvent(input$x_ej3, {
    a <- rbinom(1, 100, .3); b <- rbinom(1, 100, .3)
    poner_tabla(c(a, 100 - a, b, 100 - b))
  })

  chi <- reactive({
    v <- c(input$x11, input$x12, input$x21, input$x22)
    req(all(!is.na(v)), all(v >= 0))
    O <- matrix(round(v), 2, byrow = TRUE, dimnames = list(c("Instagram", "Otras"), c("Sí", "No")))
    req(all(rowSums(O) > 0), all(colSums(O) > 0))
    ct <- suppressWarnings(chisq.test(O, correct = FALSE))
    a <- as.numeric(input$x_alpha)
    list(O = O, E = ct$expected, R = ct$stdres, chi = unname(ct$statistic), gl = unname(ct$parameter),
         p = ct$p.value, N = sum(O), a = a, zc = qnorm(1 - a / 2), sig = ct$p.value <= a)
  })

  tabla_html <- function(M, fmt, clase = NULL, totales = TRUE) {
    filas <- lapply(1:2, function(i) {
      tags$tr(tags$td(class = "fila", rownames(M)[i]),
              lapply(1:2, function(j) tags$td(class = if (!is.null(clase)) clase[i, j] else NULL, HTML(fmt(M, i, j)))),
              if (totales) tags$td(num(sum(M[i, ]), 0)))
    })
    tags$table(class = "t-ufv",
               tags$tr(tags$th(""), tags$th("Ciberacoso: Sí"), tags$th("Ciberacoso: No"), if (totales) tags$th("Total")),
               filas,
               if (totales) tags$tr(tags$td(class = "fila", "Total"), tags$td(num(sum(M[, 1]), 0)), tags$td(num(sum(M[, 2]), 0)),
                                    tags$td(strong(num(sum(M), 0)))))
  }

  output$x_obs <- renderUI({
    r <- chi()
    tagList(tabla_html(r$O, function(M, i, j) paste0("<b>", M[i, j], "</b><br><small>", pct(round(M[i, j] / sum(M[i, ]), 3)), " de la fila</small>")),
            p(class = "small", "Lo que realmente encontramos en la muestra."))
  })
  output$x_esp <- renderUI({
    r <- chi()
    tagList(tabla_html(r$E, function(M, i, j) num(M[i, j], 1)),
            p(class = "small", paste0("E = (total fila × total columna) / N. Si las variables fueran independientes, el % de ciberacoso sería el mismo en los dos grupos (",
              pct(round(sum(r$O[, 1]) / r$N, 3)), ").")),
            if (any(r$E < 5)) alerta("Hay frecuencias esperadas menores que 5: el supuesto de la prueba no se cumple bien."))
  })
  output$x_res <- renderUI({
    r <- chi()
    cl <- matrix(ifelse(r$R > r$zc, "mas", ifelse(r$R < -r$zc, "menos", "neutro")), 2)
    tagList(
      tabla_html(r$R, function(M, i, j) {
        flecha <- if (M[i, j] > r$zc) " ▲" else if (M[i, j] < -r$zc) " ▼" else ""
        paste0(num(M[i, j], 2), flecha)
      }, clase = cl, totales = FALSE),
      p(class = "small", style = "margin-top:8px;",
        span(.noWS = "outside", style = "color:#B0153A;font-weight:700;", paste0("▲ Z > +", num(r$zc, 2))), ": más casos de los esperados · ",
        span(.noWS = "outside", style = "color:#003865;font-weight:700;", paste0("▼ Z < −", num(r$zc, 2))), ": menos casos de los esperados · ",
        "entre ambos: sin diferencias significativas en esa casilla."),
      if (!r$sig) p(class = "small", style = "color:#5B6770;", "Como el χ² no es significativo, no es necesario interpretar los residuos.")
    )
  })

  output$x_cifras <- renderUI({
    r <- chi()
    fila_cifras(
      cifra("Estadístico", paste0("χ²(", r$gl, ", N = ", r$N, ") = ", num(r$chi, 2)), "compara observadas y esperadas", tipo = "azul"),
      cifra("Valor p", p_txt(r$p), paste0("α = ", alfa_txt(r$a)), tipo = "roja"),
      cifra("Decisión", if (r$sig) "Se rechaza H₀" else "No se rechaza H₀",
            if (r$sig) "hay evidencia de asociación" else "no hay evidencia de asociación", tipo = if (r$sig) "roja" else "verde"),
      cifra("Frecuencias esperadas ≥ 5", if (all(r$E >= 5)) "Sí" else "No", "supuesto de la prueba")
    )
  })

  output$x_plot_bar <- renderPlotC({
    r <- chi()
    d <- data.frame(g = rownames(r$O), p = r$O[, 1] / rowSums(r$O))
    tot <- sum(r$O[, 1]) / r$N
    ggplot(d, aes(g, p, fill = g)) +
      geom_col(width = .55) +
      geom_text(aes(label = pct(round(p, 3))), vjust = -.5, fontface = "bold", size = 5, colour = UFV_AZUL) +
      geom_hline(yintercept = tot, linetype = "dashed", colour = GRIS, linewidth = 1) +
      annotate("label", x = 1.5, y = tot, label = paste0("esperado si son independientes: ", pct(round(tot, 3))), size = 3.8, colour = GRIS) +
      scale_fill_manual(values = c(Instagram = ROJO, Otras = AZUL_MEDIO), guide = "none") +
      scale_y_continuous(labels = function(x) pct(x), limits = c(0, max(.6, max(d$p) + .12))) +
      labs(x = "Red social más utilizada", y = "% con ciberacoso") + tema_graf
  })

  output$x_plot_chi <- renderPlotC({
    r <- chi()
    crit <- qchisq(1 - r$a, r$gl)
    lim <- max(crit + 3, min(r$chi + 2, 40))
    xs <- seq(0.15, lim, length.out = 600)
    d <- data.frame(x = xs, y = dchisq(xs, r$gl))
    ggplot(d, aes(x, y)) +
      geom_area(data = subset(d, x >= r$chi), aes(fill = "Valor p"), alpha = .6) +
      geom_area(data = subset(d, x >= crit), aes(fill = "Zona de rechazo (α)"), alpha = .75) +
      geom_line(colour = UFV_AZUL, linewidth = 1) +
      geom_vline(xintercept = r$chi, linewidth = 1.2) +
      annotate("label", x = r$chi, y = .32, label = paste0("tu χ² = ", num(r$chi, 2))) +
      annotate("text", x = crit, y = .4, label = paste0("valor crítico = ", num(crit, 2)), colour = ROJO, hjust = -.05) +
      scale_fill_manual(values = c("Zona de rechazo (α)" = ROJO, "Valor p" = AMBAR), name = NULL) +
      coord_cartesian(ylim = c(0, .45)) +
      labs(x = paste0("Distribución χ² si H₀ es cierta (gl = ", r$gl, ")"), y = NULL) +
      tema_graf + theme(axis.text.y = element_blank())
  })

  output$x_informe <- renderUI({
    r <- chi()
    res_txt <- NULL
    if (r$sig) {
      celdas <- which(abs(r$R) > r$zc, arr.ind = TRUE)
      if (nrow(celdas) > 0) {
        res_txt <- paste(apply(celdas, 1, function(ix) {
          paste0(rownames(r$O)[ix[1]], "–", colnames(r$O)[ix[2]], " (Z = ", num(r$R[ix[1], ix[2]], 2), ")")
        }), collapse = "; ")
      }
    }
    pI <- r$O[1, 1] / sum(r$O[1, ]); pO <- r$O[2, 1] / sum(r$O[2, ])
    mayor <- if (pI > pO) "Instagram" else "otras redes"
    conclusion <- if (r$sig) {
      paste0("Existe una asociación estadísticamente significativa entre la red social más utilizada y haber sufrido ciberacoso. ",
             "Quienes usan principalmente ", mayor, " presentan más casos de ciberacoso de los esperados (",
             pct(round(pI, 3)), " en Instagram frente a ", pct(round(pO, 3)), " en otras redes). ",
             "Esta asociación no implica que la red social cause el ciberacoso.")
    } else {
      paste0("No se ha encontrado evidencia estadísticamente significativa de asociación entre la red social más utilizada y haber sufrido ciberacoso. ",
             "Esto no demuestra que las variables sean independientes; los datos no son suficientes para afirmar que estén asociadas.")
    }
    layout_columns(
      col_widths = c(4, 4, 4),
      div(class = "paso", h6(span(class = "bola", "1"), "¿Por qué esta prueba?"),
          p(class = "small", "Dos variables categóricas dicotómicas (red social: Instagram/otras; ciberacoso: sí/no). ",
            "Objetivo: analizar su asociación → chi-cuadrado de Pearson. No requiere normalidad ni homocedasticidad; ",
            paste0("comprobamos que las frecuencias esperadas sean ≥ 5 (", if (all(r$E >= 5)) "se cumple" else "no se cumple", ")."))),
      div(class = "paso", h6(span(class = "bola", "2"), "¿Qué resultados obtengo?"),
          p(strong(paste0("χ²(", r$gl, ", N = ", r$N, ") = ", num(r$chi, 2), ", ", p_txt(r$p), "."))),
          p(class = "small", if (r$sig) paste0("Se rechaza H₀. Residuos significativos: ", if (is.null(res_txt)) "ninguno" else res_txt, ".")
            else "No se rechaza H₀. No es necesario interpretar los residuos.")),
      div(class = "paso", h6(span(class = "bola", "3"), "¿Qué puedo concluir?"),
          p(class = "small", conclusion))
    )
  })

  # ===================================================================
  # 7 · CORRELACIONES
  # ===================================================================
  poner_cor <- function(r, n, f = "lin") {
    updateSliderInput(session, "c_r", value = r); updateSliderInput(session, "c_n", value = n)
    updateRadioButtons(session, "c_forma", selected = f)
  }
  observeEvent(input$c_ej1, poner_cor(.15, 500))
  observeEvent(input$c_ej2, poner_cor(.5, 8))
  observeEvent(input$c_ej3, poner_cor(0, 50))
  observeEvent(input$c_ej4, poner_cor(-.65, 60))

  cor_datos <- eventReactive(list(input$c_go, input$c_r, input$c_n, input$c_forma), {
    n <- input$c_n; r <- input$c_r
    z1 <- rnorm(n); z2 <- rnorm(n)
    ylat <- r * z1 + sqrt(1 - r^2) * z2
    if (input$c_forma == "curva") {
      x <- 1.2 * exp(0.85 * z1)
    } else {
      x <- 10 + 3.5 * z1
    }
    y <- 6 + 1.5 * ylat
    if (input$c_forma == "atip") {
      x <- c(x, max(x) + 6)
      y <- c(y, if (r >= 0) 0.5 else 9.8)
    }
    data.frame(x = pmax(x, 0), y = pmin(pmax(y, 0), 10))
  }, ignoreNULL = FALSE)

  cor_res <- reactive({
    d <- cor_datos()
    pe <- suppressWarnings(cor.test(d$x, d$y, method = "pearson"))
    sp <- suppressWarnings(cor.test(d$x, d$y, method = "spearman", exact = FALSE))
    list(r = unname(pe$estimate), pr = pe$p.value, rho = unname(sp$estimate), ps = sp$p.value, gl = nrow(d) - 2, n = nrow(d))
  })

  intensidad <- function(v) {
    v <- abs(v)
    if (v < .10) "muy débil" else if (v < .30) "débil" else if (v < .50) "moderada" else if (v < .70) "fuerte" else "muy fuerte"
  }

  output$c_cifras <- renderUI({
    k <- cor_res()
    fila_cifras(
      cifra("Pearson", paste0("r(", k$gl, ") = ", sin_cero(num(k$r, 2))), p_txt(k$pr), tipo = "roja"),
      cifra("Spearman", paste0("ρ(", k$gl, ") = ", sin_cero(num(k$rho, 2))), p_txt(k$ps), tipo = "azul"),
      cifra("Tamaño de la muestra", num(k$n, 0), paste0("gl = n − 2 = ", k$gl))
    )
  })

  output$c_plot <- renderPlotC({
    d <- cor_datos()
    ggplot(d, aes(x, y)) +
      geom_point(colour = UFV_AZUL, alpha = .65, size = 2.6) +
      geom_smooth(method = "lm", formula = y ~ x, se = FALSE, colour = ROJO, linewidth = 1.2) +
      scale_y_continuous(limits = c(0, 10)) +
      labs(x = "Horas de estudio semanales", y = "Nota del examen (0–10)") + tema_graf
  })

  output$c_intens <- renderPlotC({
    k <- cor_res()
    tramos <- data.frame(ini = c(0, .1, .3, .5, .7), fin = c(.1, .3, .5, .7, 1),
                         lab = c("Muy débil", "Débil", "Moderada", "Fuerte", "Muy fuerte"), et = c("M. débil", "Débil", "Moderada", "Fuerte", "Muy fuerte"))
    ggplot() +
      geom_rect(data = tramos, aes(xmin = ini, xmax = fin, ymin = 0, ymax = 1, fill = lab), colour = "white") +
      geom_text(data = tramos, aes(x = (ini + fin) / 2, y = .5, label = et), size = 3.6, colour = c(UFV_AZUL, UFV_AZUL, "white", "white", "white"), fontface = "bold") +
      annotate("point", x = abs(k$r), y = 1.25, shape = 25, size = 6, fill = ROJO, colour = ROJO) +
      annotate("text", x = abs(k$r), y = 1.55, label = "|r| Pearson", colour = ROJO, fontface = "bold", size = 5) +
      annotate("point", x = abs(k$rho), y = -.25, shape = 24, size = 6, fill = AMBAR, colour = AMBAR) +
      annotate("text", x = abs(k$rho), y = -.55, label = "|ρ| Spearman", colour = AMBAR, fontface = "bold", size = 5) +
      scale_fill_manual(values = c("Muy débil" = "#EBF5FE", "Débil" = "#BFDDF7", "Moderada" = "#6FA8E3",
                                   "Fuerte" = "#1F6FD1", "Muy fuerte" = UFV_AZUL), guide = "none") +
      scale_x_continuous(breaks = c(0, .1, .3, .5, .7, 1), labels = c("0", ",10", ",30", ",50", ",70", "1")) +
      coord_cartesian(ylim = c(-.8, 1.8)) + theme_void(base_size = 13) + theme(axis.text.x = element_text(colour = GRIS))
  })

  output$c_interp <- renderUI({
    k <- cor_res(); sig <- k$pr <= .05
    dir <- if (abs(k$r) < .10) "prácticamente nula" else if (k$r > 0) "positiva (a más horas, mejor nota)" else "inversa (a más horas, peor nota)"
    tagList(
      tags$ul(
        tags$li(strong("Dirección: "), dir),
        tags$li(strong("Intensidad (Pearson): "), paste0(intensidad(k$r), " (|r| = ", sin_cero(num(abs(k$r), 2)), ")")),
        tags$li(strong("Significación: "), p_txt(k$pr), if (sig) " → significativa (se rechaza H₀: ρ = 0)" else " → no significativa (no se rechaza H₀)")
      ),
      if (sig && abs(k$r) < .30) alerta(strong("Significativa pero débil. "), "Con muestras grandes, relaciones pequeñas salen significativas.")
      else if (!sig && abs(k$r) >= .40) alerta(strong("Intensa pero no significativa. "), "Con tan pocos participantes no hay evidencia suficiente, aunque r parezca alto."),
      if (abs(k$rho - k$r) > .12) clave(strong("Pearson y Spearman difieren. "),
                                         "Pearson solo capta relaciones lineales y es sensible a los valores atípicos; Spearman trabaja con rangos y capta relaciones monótonas.")
    )
  })

  # ===================================================================
  # 8 · AUTOEVALUACIÓN
  # ===================================================================
  corregido <- reactiveVal(FALSE)
  observeEvent(input$q_corregir, corregido(TRUE))
  observeEvent(input$q_borrar, {
    corregido(FALSE)
    for (i in seq_along(preguntas)) updateRadioButtons(session, paste0("q", i), selected = character(0))
  })
  lapply(seq_along(preguntas), function(i) {
    output[[paste0("fb", i)]] <- renderUI({
      if (!corregido()) return(NULL)
      pr <- preguntas[[i]]; r <- input[[paste0("q", i)]]
      if (is.null(r)) return(p(class = "fb-no", "Sin responder. ", span(style = "color:#36404a;font-weight:400;", pr$ex)))
      if (as.integer(r) == pr$ok) p(class = "fb-ok", icon("circle-check"), " Correcto. ", span(style = "color:#36404a;font-weight:400;", pr$ex))
      else p(class = "fb-no", icon("circle-xmark"), " Incorrecto. ", span(style = "color:#36404a;font-weight:400;",
                                                                          paste0("La respuesta correcta es: «", pr$op[pr$ok], "». ", pr$ex)))
    })
  })
  output$q_nota <- renderUI({
    if (!corregido()) return(NULL)
    ok <- sum(sapply(seq_along(preguntas), function(i) {
      r <- input[[paste0("q", i)]]; !is.null(r) && as.integer(r) == preguntas[[i]]$ok
    }))
    div(class = "cifra azul", style = "padding:6px 14px;",
        div(class = "cifra-t", "Tu resultado"), div(class = "cifra-v", paste0(ok, " de ", length(preguntas))))
  })
}

shinyApp(ui, server)
