/* =========================================================
   DATA SAO
   PANEL PRIVADO DE RESULTADOS
========================================================= */


/* =========================================================
   INGRESAR
========================================================= */

async function ingresarResultados() {

    const inputPassword =
        document.getElementById("passwordResultados");

    const errorElemento =
        document.getElementById("errorLogin");

    const password =
        inputPassword.value.trim();


    errorElemento.textContent = "";


    if (!password) {

        errorElemento.textContent =
            "Ingresá la contraseña.";

        return;
    }


    try {

        const respuesta = await fetch(
            "/api/resultados",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    password: password
                })
            }
        );


        /* =============================================
           LEER RESPUESTA
        ============================================= */

        const texto =
            await respuesta.text();


        console.log(
            "Respuesta API:",
            respuesta.status,
            texto
        );


        let datos;


        try {

            datos = JSON.parse(texto);

        } catch {

            datos = {
                error:
                    "Respuesta inválida del servidor"
            };

        }


        /* =============================================
           CONTRASEÑA INCORRECTA
        ============================================= */

        if (respuesta.status === 401) {

            errorElemento.textContent =
                "Contraseña incorrecta.";

            return;
        }


        /* =============================================
           OTRO ERROR DEL SERVIDOR
        ============================================= */

        if (!respuesta.ok) {

            errorElemento.textContent =
                datos.error ||
                "No se pudieron cargar los resultados.";

            return;
        }


        /* =============================================
           TODO CORRECTO
        ============================================= */

        document
            .getElementById(
                "loginResultados"
            )
            .classList.add(
                "oculto"
            );


        document
            .getElementById(
                "panelResultados"
            )
            .classList.remove(
                "oculto"
            );


        mostrarResultados(
            datos.votos || []
        );


    } catch (error) {

        console.error(
            "Error de conexión:",
            error
        );


        errorElemento.textContent =
            "No se pudo conectar con el servidor.";

    }

}



/* =========================================================
   MOSTRAR RESULTADOS
========================================================= */

function mostrarResultados(votos) {

    const total =
        votos.length;


    document.getElementById(
        "totalVotos"
    ).textContent =
        total;


    const conteo = {};


    /* =====================================================
       CONTAR VOTOS
    ===================================================== */

    votos.forEach(voto => {

        const nombre =
            voto.jugador;

        const equipo =
            voto.equipo || "Otro";


        if (!conteo[nombre]) {

            conteo[nombre] = {
                votos: 0,
                equipo: equipo
            };

        }


        conteo[nombre].votos++;

    });



    /* =====================================================
       CREAR RANKING
    ===================================================== */

    const resultados =
        Object.entries(conteo)

            .map(
                ([nombre, datos]) => {

                    return {

                        nombre:
                            nombre,

                        votos:
                            datos.votos,

                        equipo:
                            datos.equipo

                    };

                }
            )

            .sort(
                (a, b) =>
                    b.votos - a.votos
            );



    const contenedor =
        document.getElementById(
            "listaResultados"
        );


    contenedor.innerHTML = "";



    /* =====================================================
       SIN VOTOS
    ===================================================== */

    if (resultados.length === 0) {

        contenedor.innerHTML = `
            <p class="cargando">
                Todavía no hay votos registrados.
            </p>
        `;

        return;

    }



    /* =====================================================
       MOSTRAR JUGADORES
    ===================================================== */

    resultados.forEach(
        (resultado, indice) => {


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
                                ${escaparHTML(
                                    resultado.nombre
                                )}
                            </h3>

                            <p>
                                ${escaparHTML(
                                    resultado.equipo
                                )}
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

}



/* =========================================================
   SEGURIDAD PARA TEXTO
========================================================= */

function escaparHTML(texto) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto;


    return div.innerHTML;

}



/* =========================================================
   ENTER PARA INGRESAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const input =
            document.getElementById(
                "passwordResultados"
            );


        if (!input) {
            return;
        }


        input.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    ingresarResultados();

                }

            }
        );

    }
);
