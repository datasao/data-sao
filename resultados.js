/* =========================================================
   DATA SAO
   RESULTADOS DE LA VOTACIÓN
========================================================= */

const PARTIDO_ID = "talleres-ferro-vuelta";


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://irbigxtptkzgyogijaap.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Hi-3l1y5mv0A73uqevkzLA_pXyYDbGJ";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   CARGAR VOTOS
========================================================= */

async function cargarResultados() {

    const contenedor =
        document.getElementById(
            "listaResultados"
        );


    const totalElemento =
        document.getElementById(
            "totalVotos"
        );


    try {

        const { data, error } =
            await supabaseClient
                .from("votos")
                .select(
                    "jugador, equipo"
                )
                .eq(
                    "partido_id",
                    PARTIDO_ID
                );


        if (error) {

            console.error(
                "Error cargando votos:",
                error
            );


            contenedor.innerHTML =
                "<p>No se pudieron cargar los resultados.</p>";


            return;

        }


        /* =============================================
           TOTAL
        ============================================= */

        const total =
            data.length;


        totalElemento.textContent =
            total;


        /* =============================================
           AGRUPAR POR JUGADOR
        ============================================= */

        const conteo = {};


        data.forEach(
            function (voto) {

                const nombre =
                    voto.jugador;


                if (!conteo[nombre]) {

                    conteo[nombre] = {
                        votos: 0,
                        equipo: voto.equipo
                    };

                }


                conteo[nombre].votos++;

            }
        );


        /* =============================================
           CONVERTIR A ARRAY
        ============================================= */

        const resultados =
            Object.entries(conteo)
                .map(
                    function ([nombre, datos]) {

                        return {

                            nombre:
                                nombre,

                            votos:
                                datos.votos,

                            equipo:
                                datos.equipo

                        };

                    }
                );


        /* =============================================
           ORDENAR DE MAYOR A MENOR
        ============================================= */

        resultados.sort(
            function (a, b) {

                return b.votos - a.votos;

            }
        );


        /* =============================================
           SI NO HAY VOTOS
        ============================================= */

        if (resultados.length === 0) {

            contenedor.innerHTML =
                "<p class='cargando'>Todavía no hay votos.</p>";

            return;

        }


        /* =============================================
           MOSTRAR RESULTADOS
        ============================================= */

        contenedor.innerHTML = "";


        resultados.forEach(
            function (resultado, indice) {

                const porcentaje =
                    total > 0
                        ? Math.round(
                            (
                                resultado.votos /
                                total
                            ) * 100
                        )
                        : 0;


                const fila =
                    document.createElement(
                        "div"
                    );


                fila.className =
                    "resultado-jugador";


                fila.innerHTML = `

                    <div class="resultado-posicion">

                        ${indice + 1}

                    </div>


                    <div class="resultado-info">

                        <div class="resultado-superior">

                            <div>

                                <h3>
                                    ${resultado.nombre}
                                </h3>

                                <p>
                                    ${resultado.equipo}
                                </p>

                            </div>


                            <div class="resultado-numeros">

                                <strong>
                                    ${resultado.votos}
                                </strong>

                                <span>
                                    ${porcentaje}%
                                </span>

                            </div>

                        </div>


                        <div class="barra">

                            <div
                                class="barra-progreso"
                                style="width: ${porcentaje}%"
                            >
                            </div>

                        </div>

                    </div>

                `;


                contenedor.appendChild(
                    fila
                );

            }
        );


    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );


        contenedor.innerHTML =
            "<p>No se pudieron cargar los resultados.</p>";

    }

}


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    cargarResultados
);