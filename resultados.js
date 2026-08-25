export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método no permitido"
        });
    }


    /* =============================================
       COMPROBAR VARIABLES DE VERCEL
    ============================================= */

    if (!process.env.ADMIN_PASSWORD) {
        return res.status(500).json({
            error: "ADMIN_PASSWORD no está configurada en Vercel"
        });
    }

    if (!process.env.SUPABASE_URL) {
        return res.status(500).json({
            error: "SUPABASE_URL no está configurada en Vercel"
        });
    }

    if (!process.env.SUPABASE_SECRET_KEY) {
        return res.status(500).json({
            error: "SUPABASE_SECRET_KEY no está configurada en Vercel"
        });
    }


    /* =============================================
       LEER CONTRASEÑA
    ============================================= */

    let body = req.body;

    if (typeof body === "string") {
        try {
            body = JSON.parse(body);
        } catch {
            body = {};
        }
    }

    const password = body?.password || "";


    /* =============================================
       VALIDAR CONTRASEÑA
    ============================================= */

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
            error: "Contraseña incorrecta"
        });
    }


    /* =============================================
       CONSULTAR SUPABASE
    ============================================= */

    try {

        const url =
            process.env.SUPABASE_URL +
            "/rest/v1/votos" +
            "?select=id,partido_id,jugador,equipo,created_at" +
            "&partido_id=eq.talleres-ferro-vuelta";


        const respuesta = await fetch(url, {

            method: "GET",

            headers: {

                apikey:
                    process.env.SUPABASE_SECRET_KEY,

                Authorization:
                    "Bearer " +
                    process.env.SUPABASE_SECRET_KEY,

                Accept:
                    "application/json"
            }

        });


        const texto =
            await respuesta.text();


        if (!respuesta.ok) {

            console.error(
                "Error Supabase:",
                respuesta.status,
                texto
            );

            return res.status(500).json({
                error: "Error consultando Supabase"
            });

        }


        const votos =
            JSON.parse(texto);


        return res.status(200).json({
            total: votos.length,
            votos: votos
        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Error interno"
        });

    }

}
