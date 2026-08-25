export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método no permitido"
        });
    }

    const { password } = req.body || {};

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
            error: "No autorizado"
        });
    }

    try {

        const url =
            process.env.SUPABASE_URL +
            "/rest/v1/votos" +
            "?select=id,partido_id,jugador,equipo,created_at" +
            "&partido_id=eq.talleres-ferro-vuelta";

        console.log("Consultando:", url);

        const respuesta = await fetch(url, {
            method: "GET",

            headers: {
                apikey: process.env.SUPABASE_SECRET_KEY,

                Authorization:
                    "Bearer " +
                    process.env.SUPABASE_SECRET_KEY,

                Accept: "application/json"
            }
        });

        const texto = await respuesta.text();

        console.log(
            "Respuesta Supabase:",
            respuesta.status,
            texto
        );

        if (!respuesta.ok) {

            return res.status(500).json({
                error: "Error consultando Supabase",
                status: respuesta.status,
                detalle: texto
            });

        }

        const votos = JSON.parse(texto);

        return res.status(200).json({
            total: votos.length,
            votos: votos
        });

    } catch (error) {

        console.error("Error:", error);

        return res.status(500).json({
            error: "Error interno",
            detalle: String(error)
        });

    }

}
