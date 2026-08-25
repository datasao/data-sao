/* =========================================================
   DATA SAO
   PANEL PRIVADO
========================================================= */


async function ingresarResultados() {

    const password =
        document.getElementById(
            "passwordResultados"
        ).value;


    const errorElemento =
        document.getElementById(
            "errorLogin"
        );


    errorElemento.textContent =
        "";


    if (!password) {

        errorElemento.textContent =
            "Ingresá la contraseña.";

        return;

    }


    try {

        const respuesta =
            await fetch(
                "/api/resultados",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            password:
                                password
                        })
                }
            );


        if (
            respuesta.status ===
            401
        ) {

            errorElemento.textContent =
                "Contraseña incorrecta.";

            return;

        }


        if (!respuesta.ok) {

            errorElemento.textContent =
                "No se pudieron cargar los resultados.";

            return;

        }


        const data =
            await respuesta.json();


        document.getElementById(
            "loginResultados"
        ).classList.add(
            "oculto"
        );


        document.getElementById(
            "panelResultados"
        ).classList.remove(
            "oculto"
        );


        mostrarResultados(
            data.votos
        );


    } catch (error) {

        console.error(
            error
        );


        errorElemento.textContent =
            "Error de conexión.";

    }

}


/* =========================================================
   MOSTRAR RESULTADOS
========================================================= */

function mostrarResultados(
    votos
) {

    const total =
        votos.length;


    document.getElementById(
        "totalVotos"
    ).textContent =
        total;


    const conteo = {};


    votos.forEach(
        voto => {

            if (
                !conteo[voto.jugador]
            ) {

                conteo[voto.jugador] = {

                    votos:
                        0,

                    equipo:
                        voto.equipo

                };

            }


            conteo[
                voto.jugador
            ].votos++;

        }
    );


    const resultados =
        Object.entries(
            conteo
        )
        .map(
            ([nombre, datos]) => ({
                nombre,
                votos:
                    datos.votos,
                equipo:
                    datos.equipo
            })
        )
        .sort(
            (a, b) =>
                b.votos -
                a.votos
        );


    const contenedor =
        document.getElementById(
            "listaResultados"
        );


    contenedor.innerHTML =
        "";


    if (
        resultados.length ===
        0
    ) {

        contenedor.innerHTML =
            "<p class='cargando'>Todavía no hay votos.</p>";

        return;

    }


    resultados.forEach(
        (
            resultado,
            indice
        ) => {


            const porcentaje =
                Math.round(
                    (
                        resultado.votos /
                        total
                    ) * 100
                );


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
                                ${escaparHTML(resultado.nombre)}
                            </h3>

                            <p>
                                ${escaparHTML(resultado.equipo)}
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
                            style="width:${porcentaje}%"
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
   SEGURIDAD
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
   ENTER
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const input =
            document.getElementById(
                "passwordResultados"
            );


        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    ingresarResultados();

                }

            }
        );

    }
);
