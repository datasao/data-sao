export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método no permitido"
        });
    }

    const password = req.body?.password;

    if (!process.env.ADMIN_PASSWORD) {
        return res.status(500).json({
            error: "Falta ADMIN_PASSWORD"
        });
    }

    if (!process.env.SUPABASE_URL) {
        return res.status(500).json({
            error: "Falta SUPABASE_URL"
        });
    }

    if (!process.env.SUPABASE_SECRET_KEY) {
        return res.status(500).json({
            error: "Falta SUPABASE_SECRET_KEY"
        });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
            error: "Contraseña incorrecta"
        });
    }

    try {

        const url =
            `${process.env.SUPABASE_URL}/rest/v1/votos` +
            `?select=id,partido_id,jugador,equipo,created_at` +
            `&order=id.asc`;

        const respuesta = await fetch(url, {
            method: "GET",

            headers: {
                apikey: process.env.SUPABASE_SECRET_KEY,
                Accept: "application/json"
            }
        });

        const texto = await respuesta.text();

        console.log(
            "SUPABASE STATUS:",
            respuesta.status
        );

        console.log(
            "SUPABASE RESPUESTA:",
            texto
        );

        if (!respuesta.ok) {

            return res.status(500).json({
                error: "Supabase rechazó la consulta",
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

        console.error(
            "ERROR API:",
            error
        );

        return res.status(500).json({
            error: "Error interno",
            detalle: String(error)
        });
    }
}
