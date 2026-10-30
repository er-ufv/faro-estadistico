# Revisión de ítems · Faro estadístico (Tema 4)

**Fecha:** 30 de octubre de 2026 · **Modo:** revisión (guía *crear-items* v1.1) · **Estado de los ítems tras la revisión:** `revisado_ia` (pendiente de revisión por el equipo docente y de pilotaje).

**Encargo:** práctica formativa sin calificación. Alumnado de 1.º de Psicología, Tema 4 (análisis inferencial). Fuente de contenido: diapositivas del Tema 4, Parte I y Parte II.

## 1. Defectos globales encontrados

| Defecto | Gravedad | Alcance | Corrección |
|---|---|---|---|
| La clave ocupaba siempre la misma posición (opción A en 37 de 40 ítems) y las opciones no se barajaban | **Crítico** (permite acertar sin dominar) | 40 ítems tipo test | Las opciones se barajan cada vez que se muestra el ítem (`tutor.js`) |
| La clave era la opción más larga o la más matizada | **Crítico** (pista de *testwiseness*) | 30 de 40 ítems | Opciones reescritas con longitud y forma homogéneas; diferencia máxima habitual de 10–15 caracteres |
| Algunos distractores eran poco plausibles o no representaban un error típico | Mejora | 18 ítems | Distractores basados en concepciones erróneas documentadas en clase (p. ej., «p = probabilidad de que H₀ sea cierta») |
| Ítem de verdadero/falso con dos opciones (f5) | Mejora | 1 ítem | Sustituido por un ítem de tres opciones sobre α y el error tipo I |
| Ítems de «sí/no» con solo dos opciones (a1_21, a2_21) | Mejora | 2 ítems | Tercera opción plausible (confundir significación con tamaño del efecto) |

Los 22 ejercicios de emparejar, clasificar y completar se revisaron con los mismos principios y no se encontraron defectos críticos.

## 2. Revisión ítem por ítem (tipo test)

Clave: la opción correcta está en `correcta: 0` del archivo, pero **se muestra en orden aleatorio**.

| ID | Defecto principal | Gravedad | Cambio |
|---|---|---|---|
| m1 | La clave contenía el término técnico «variabilidad muestral» (única opción con tecnicismo) | Crítico | Clave sin el término; distractores: muestra sesgada y μ que cambia |
| m4 | Distractor final más largo y con justificación | Menor | Opciones breves y paralelas (mitad / cuarta parte / igual) |
| i4 | Clave notablemente más larga | Crítico | Tres opciones de longitud similar; se mantienen los dos errores típicos de interpretación |
| i5 | Opción final más larga | Menor | Opciones paralelas |
| i6 | Distractor «las dos igual» poco plausible | Menor | Distractores: confundir amplitud con precisión; fijarse solo en media y DT |
| j3 | Distractor «Acepto H₀» sin desarrollo, fácil de descartar | Menor | Distractores con razonamiento erróneo plausible |
| j4 | Clave más larga | Crítico | Tres definiciones paralelas, incluida «se debe al azar» |
| j5 | Sin defecto crítico | — | Ajuste de redacción |
| j6 | Distractor final más largo | Menor | «En ningún caso» |
| s1 | Distractor «da igual» poco plausible | Menor | Distractor que invierte la lógica de los supuestos (p ≤ ,05 = se cumple) |
| s4 | Sin defecto crítico | — | Opciones paralelas |
| e2, e3, a1_14, f8 | Nombres de pruebas con distinta longitud | Menor | Nombres homogéneos; distractor = prueba que confunde el diseño |
| x2 | Clave más larga | Menor | Opciones paralelas |
| x3 | Distractor «nada» poco plausible | Menor | Distractor: creer que superar 1,96 invalida el residuo |
| x5 | Distractores con errores de formato evidentes | Menor | Distractores: gl confundidos con N; «p = ,000» |
| a1_12 | Sin defecto | — | Sin cambios (reproduce la plantilla de clase) |
| a1_13 | Distractor «Ninguno» poco plausible | Menor | Distractor que mezcla normalidad y frecuencias esperadas |
| a1_21, a2_21 | Solo dos opciones | Menor | Tercera opción: confundir significación con V de Cramer |
| a1_31 | Clave más larga y matizada | Crítico | Opciones homogéneas; el distractor clave es «se apoya porque p < ,001» |
| a1_32 | Clave más larga | Menor | Distractores alargados (causalidad; ausencia de relación) |
| a2_31 | Distractor «no se puede saber sin correlación» ajeno al tema | Menor | Distractores: no valorar la dirección con 3 categorías; leer mal la tabla |
| r3, r4 | Clave más larga | Menor | Opciones equilibradas |
| c3, c5 | Enunciado abierto que obligaba a leer opciones largas | Menor | Pregunta directa («¿Cómo se describe esta relación?») y opciones paralelas de tres rasgos |
| c4, c6 | Clave más larga | Menor | Opciones equilibradas |
| f1 | Distractor «una población» poco plausible | Menor | «un error típico» |
| f2 | Distractor [58,0 ; 62,0] sin error identificable | Menor | Distractores con errores de procedimiento: olvidar el valor crítico; dividir entre n |
| f3, f4, f6, f9 | Sin defecto crítico | — | Ajustes menores |
| f5 | Verdadero/falso | Menor | Sustituido (α = ,10 y error tipo I) |
| f7, f10 | Distractor débil | Menor | Distractores con concepciones erróneas típicas |

## 3. Comprobación de aceptación (resumen)

| Criterio | Resultado |
|---|---|
| 1. Objetivo y concepto definidos | Cumple (cada ítem está etiquetado con uno de los 14 conceptos del cuaderno) |
| 2. Solución defendible y fuente | Cumple: diapositivas del Tema 4. Cifras recalculadas con R |
| 3. Información suficiente | Cumple |
| 4. Única mejor respuesta | Cumple tras la revisión |
| 5. Sin pistas accidentales | Cumple tras barajar y homogeneizar |
| 6. Carga lectora pertinente | Cumple; enunciados de casos breves |
| 7. Puntuación | No aplica (práctica formativa sin nota) |
| 8. Tiempo | Estimación de diseño: 30–60 s por ítem, pendiente de pilotaje |

## 4. Pendiente

- Revisión por el equipo docente (estado `revisado_experto`).
- Pilotaje con un grupo: revisar los ítems con menos del 30 % o más del 95 % de aciertos al primer intento y los distractores que nadie elige.
- Datos de las diapositivas que siguen sin cuadrar: Actividades 3 y 4 (Parte II, diapositivas 30 y 34), residuos del ejemplo 4b (Parte II, diapositiva 6) e intensidad de r = ,62 (Parte II, diapositiva 39).
