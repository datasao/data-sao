/* =========================================================
   DATA SAO
   JUGADOR DEL PARTIDO
   Talleres vs Ferro
   Sistema de votación conectado a Supabase
========================================================= */


/* =========================================================
   CONFIGURACIÓN DEL PARTIDO
========================================================= */

const PARTIDO_ID = "talleres-ferro-vuelta";


/* =========================================================
   CONFIGURACIÓN SUPABASE

   IMPORTANTE:
   - Usar solamente Project URL
   - Usar solamente Publishable Key
   - NUNCA usar Secret Key
========================================================= */

const SUPABASE_URL =
    "https://irbigxtptkzgyogijaap.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Hi-3l1y5mv0A73uqevkzLA_pXyYDbGJ";


/* =========================================================
   CREAR CONEXIÓN CON SUPABASE
========================================================= */

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =========================================================
   JUGADORES Y EQUIPOS
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
   COMPROBAR SI ESTE NAVEGADOR YA VOTÓ
========================================================= */

function yaVoto() {

    return localStorage.getItem(
        "dataSaoVoto_" + PARTIDO_ID
    );

}


/* =========================================================
   VOTAR POR JUGADOR DE LA LISTA
========================================================= */

async function votar(nombreJugador) {

    if (yaVoto()) {

        mostrarYaVoto();

        return;

    }


    const equipo = jugadores[nombreJugador];


    if (!equipo) {

        alert(
            "No pudimos identificar al jugador."
        );

        return;

    }


    const confirmar = confirm(
        "¿Confirmás tu voto por " +
        nombreJugador +
        "?"
    );


    if (!confirmar) {

        return;

    }


    await registrarVoto(
        nombreJugador,
        equipo
    );

}


/* =========================================================
   VOTAR POR OTRO JUGADOR
========================================================= */

async function votarOtro() {

    if (yaVoto()) {

        mostrarYaVoto();

        return;

    }


    const input = document.getElementById(
        "otroJugador"
    );


    if (!input) {

        return;

    }


    let nombreJugador =
        input.value.trim();


    /* Evitar nombre vacío */

    if (nombreJugador === "") {

        alert(
            "Escribí el nombre del jugador."
        );

        input.focus();

        return;

    }


    /* Evitar nombres demasiado cortos */

    if (nombreJugador.length < 3) {

        alert(
            "Escribí un nombre válido."
        );

        input.focus();

        return;

    }


    /* Limpiar espacios dobles */

    nombreJugador =
        nombreJugador.replace(
            /\s+/g,
            " "
        );


    /*
       Si escribieron uno de los jugadores
       que ya está en la lista, usamos su
       equipo correspondiente.
    */

    let equipo = "Otro";


    for (const jugadorLista in jugadores) {

        if (
            jugadorLista.toLowerCase() ===
            nombreJugador.toLowerCase()
        ) {

            nombreJugador =
                jugadorLista;

            equipo =
                jugadores[jugadorLista];

            break;

        }

    }


    const confirmar = confirm(
        "¿Confirmás tu voto por " +
        nombreJugador +
        "?"
    );


    if (!confirmar) {

        return;

    }


    await registrarVoto(
        nombreJugador,
        equipo
    );

}


/* =========================================================
   REGISTRAR VOTO EN SUPABASE
========================================================= */

async function registrarVoto(
    nombreJugador,
    equipo
) {

    bloquearBotonesTemporalmente();


    try {

        const { data, error } =
            await supabaseClient
                .from("votos")
                .insert([
                    {
                        partido_id:
                            PARTIDO_ID,

                        jugador:
                            nombreJugador,

                        equipo:
                            equipo
                    }
                ])
                .select();


        /* ERROR SUPABASE */

        if (error) {

            console.error(
                "Error Supabase:",
                error
            );


            desbloquearBotones();


            alert(
                "No pudimos registrar el voto.\n\n" +
                "Intentá nuevamente."
            );


            return;

        }


        /* =================================================
           VOTO REGISTRADO CORRECTAMENTE
        ================================================= */

        localStorage.setItem(
            "dataSaoVoto_" + PARTIDO_ID,
            nombreJugador
        );


        localStorage.setItem(
            "dataSaoEquipo_" + PARTIDO_ID,
            equipo
        );


        console.log(
            "Voto registrado:",
            data
        );


        mostrarConfirmacion(
            nombreJugador
        );


        desactivarVotacion();


    } catch (error) {


        console.error(
            "Error inesperado:",
            error
        );


        desbloquearBotones();


        alert(
            "Ocurrió un error al conectar con DATA SAO.\n\n" +
            "Intentá nuevamente."
        );

    }

}


/* =========================================================
   CONFIRMACIÓN
========================================================= */

function mostrarConfirmacion(
    nombreJugador
) {

    alert(
        "¡VOTO REGISTRADO!\n\n" +
        "Elegiste a:\n" +
        nombreJugador +
        "\n\nGracias por participar en DATA SAO."
    );

}


/* =========================================================
   AVISO SI YA VOTÓ
========================================================= */

function mostrarYaVoto() {

    const jugador =
        yaVoto();


    alert(
        "Ya participaste de esta votación.\n\n" +
        "Tu voto fue para:\n" +
        jugador
    );

}


/* =========================================================
   BLOQUEAR BOTONES MIENTRAS SE ENVÍA EL VOTO
========================================================= */

function bloquearBotonesTemporalmente() {

    const botones =
        document.querySelectorAll(
            "button"
        );


    botones.forEach(
        function (boton) {

            boton.disabled = true;

        }
    );

}


/* =========================================================
   DESBLOQUEAR BOTONES SI HUBO ERROR
========================================================= */

function desbloquearBotones() {

    const botones =
        document.querySelectorAll(
            "button"
        );


    botones.forEach(
        function (boton) {

            boton.disabled = false;

        }
    );

}


/* =========================================================
   DESACTIVAR VOTACIÓN DESPUÉS DEL VOTO
========================================================= */

function desactivarVotacion() {

    const botonesJugadores =
        document.querySelectorAll(
            ".jugador button"
        );


    botonesJugadores.forEach(
        function (boton) {

            boton.disabled = true;

            boton.textContent =
                "VOTACIÓN REALIZADA";

            boton.style.opacity =
                "0.45";

            boton.style.cursor =
                "not-allowed";

        }
    );


    const botonOtro =
        document.querySelector(
            ".otro-form button"
        );


    if (botonOtro) {

        botonOtro.disabled = true;

        botonOtro.textContent =
            "VOTACIÓN REALIZADA";

        botonOtro.style.opacity =
            "0.45";

        botonOtro.style.cursor =
            "not-allowed";

    }


    const input =
        document.getElementById(
            "otroJugador"
        );


    if (input) {

        input.disabled = true;

    }

}


/* =========================================================
   COMPROBAR VOTO AL ABRIR LA PÁGINA
========================================================= */

function comprobarVotoAnterior() {

    const voto =
        yaVoto();


    if (voto) {

        desactivarVotacion();

    }

}


/* =========================================================
   PERMITIR ENTER EN "OTRO JUGADOR"
========================================================= */

function prepararCampoOtroJugador() {

    const input =
        document.getElementById(
            "otroJugador"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                votarOtro();

            }

        }
    );

}


/* =========================================================
   INICIAR DATA SAO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        comprobarVotoAnterior();

        prepararCampoOtroJugador();

    }
);