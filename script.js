/* =========================================================
   DATA SAO
   SISTEMA DE VOTACIÓN
========================================================= */


const PARTIDO_ID =
    "talleres-ferro-vuelta";


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
   JUGADORES
========================================================= */

const jugadores = {

    "Tomás Bouzas": "Talleres",

    "Ricardo Bartolo": "Talleres",

    "Leandro Railef": "Talleres",

    "Javier Feldaño": "Ferro",

    "Braian Castro": "Ferro",

    "Ezequiel Pereyra": "Ferro"

};


/* =========================================================
   COMPROBAR SI YA VOTÓ
========================================================= */

function yaVoto() {

    return localStorage.getItem(
        "dataSaoVoto_" + PARTIDO_ID
    );

}


/* =========================================================
   VOTAR LISTA
========================================================= */

async function votar(nombreJugador) {

    if (yaVoto()) {

        mostrarModalYaVoto();

        return;

    }


    const equipo =
        jugadores[nombreJugador];


    if (!equipo) {

        mostrarModalError(
            "No pudimos identificar al jugador."
        );

        return;

    }


    await registrarVoto(
        nombreJugador,
        equipo
    );

}


/* =========================================================
   OTRO JUGADOR
========================================================= */

async function votarOtro() {

    if (yaVoto()) {

        mostrarModalYaVoto();

        return;

    }


    const input =
        document.getElementById(
            "otroJugador"
        );


    let nombre =
        input.value.trim();


    if (nombre.length < 3) {

        mostrarModalError(
            "Escribí el nombre del jugador."
        );

        input.focus();

        return;

    }


    nombre =
        nombre.replace(
            /\s+/g,
            " "
        );


    let equipo =
        "Otro";


    for (
        const jugadorLista in jugadores
    ) {

        if (
            jugadorLista.toLowerCase() ===
            nombre.toLowerCase()
        ) {

            nombre =
                jugadorLista;

            equipo =
                jugadores[jugadorLista];

            break;

        }

    }


    await registrarVoto(
        nombre,
        equipo
    );

}


/* =========================================================
   REGISTRAR EN SUPABASE
========================================================= */

async function registrarVoto(
    jugador,
    equipo
) {

    bloquearBotones();


    try {

        const { error } =
            await supabaseClient
                .from("votos")
                .insert([
                    {
                        partido_id:
                            PARTIDO_ID,

                        jugador:
                            jugador,

                        equipo:
                            equipo
                    }
                ]);


        if (error) {

            console.error(
                error
            );


            desbloquearBotones();


            mostrarModalError(
                "No pudimos registrar el voto. Intentá nuevamente."
            );


            return;

        }


        localStorage.setItem(
            "dataSaoVoto_" + PARTIDO_ID,
            jugador
        );


        localStorage.setItem(
            "dataSaoEquipo_" + PARTIDO_ID,
            equipo
        );


        desactivarVotacion();


        mostrarModalExito(
            jugador
        );


    } catch (error) {

        console.error(
            error
        );


        desbloquearBotones();


        mostrarModalError(
            "Ocurrió un problema de conexión."
        );

    }

}


/* =========================================================
   MODAL ÉXITO
========================================================= */

function mostrarModalExito(
    jugador
) {

    document.getElementById(
        "modalTitulo"
    ).textContent =
        "¡Voto registrado!";


    document.getElementById(
        "modalTexto"
    ).innerHTML =
        "Elegiste a <strong>" +
        escaparHTML(jugador) +
        "</strong> como Jugador del Partido.";


    abrirModal();

}


/* =========================================================
   YA VOTÓ
========================================================= */

function mostrarModalYaVoto() {

    const jugador =
        yaVoto();


    document.getElementById(
        "modalTitulo"
    ).textContent =
        "Ya participaste";


    document.getElementById(
        "modalTexto"
    ).innerHTML =
        "Tu voto fue para <strong>" +
        escaparHTML(jugador) +
        "</strong>.";


    abrirModal();

}


/* =========================================================
   ERROR
========================================================= */

function mostrarModalError(
    mensaje
) {

    document.getElementById(
        "modalTitulo"
    ).textContent =
        "Algo salió mal";


    document.getElementById(
        "modalTexto"
    ).textContent =
        mensaje;


    abrirModal();

}


/* =========================================================
   MODAL
========================================================= */

function abrirModal() {

    document.getElementById(
        "modalVoto"
    ).classList.add(
        "activo"
    );

}


function cerrarModal() {

    document.getElementById(
        "modalVoto"
    ).classList.remove(
        "activo"
    );

}


/* =========================================================
   BOTONES
========================================================= */

function bloquearBotones() {

    document
        .querySelectorAll(
            "button"
        )
        .forEach(
            boton => {

                boton.disabled =
                    true;

            }
        );

}


function desbloquearBotones() {

    document
        .querySelectorAll(
            "button"
        )
        .forEach(
            boton => {

                boton.disabled =
                    false;

            }
        );

}


/* =========================================================
   DESACTIVAR VOTACIÓN
========================================================= */

function desactivarVotacion() {

    document
        .querySelectorAll(
            ".jugador button"
        )
        .forEach(
            boton => {

                boton.disabled =
                    true;

                boton.textContent =
                    "VOTACIÓN REALIZADA";

            }
        );


    const botonOtro =
        document.querySelector(
            ".otro-form button"
        );


    if (botonOtro) {

        botonOtro.disabled =
            true;

        botonOtro.textContent =
            "VOTACIÓN REALIZADA";

    }


    const input =
        document.getElementById(
            "otroJugador"
        );


    if (input) {

        input.disabled =
            true;

    }

}


/* =========================================================
   SEGURIDAD HTML
========================================================= */

function escaparHTML(texto) {

    const elemento =
        document.createElement(
            "div"
        );


    elemento.textContent =
        texto;


    return elemento.innerHTML;

}


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (yaVoto()) {

            desactivarVotacion();

        }


        const input =
            document.getElementById(
                "otroJugador"
            );


        if (input) {

            input.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        votarOtro();

                    }

                }
            );

        }

    }
);
