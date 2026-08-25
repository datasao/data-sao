export default async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Método no permitido"
        });

    }


    const password =
        req.body?.password;


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


    if (
        password !==
        process.env.ADMIN_PASSWORD
    ) {

        return res.status(401).json({
            error: "Contraseña incorrecta"
        });

    }


    try {

        const url =
            `${process.env.SUPABASE_URL}/rest/v1/votos?select=id,partido_id,jugador,equipo,created_at&partido_id=eq.talleres-ferro-vuelta`;


        const respuesta =
            await fetch(
                url,
                {
                    headers: {

                        apikey:
                            process.env.SUPABASE_SECRET_KEY,

                        Authorization:
                            `Bearer ${process.env.SUPABASE_SECRET_KEY}`

                    }
                }
            );


        if (!respuesta.ok) {

            const errorTexto =
                await respuesta.text();


            console.error(
                "Supabase:",
                respuesta.status,
                errorTexto
            );


            return res.status(500).json({
                error: "Supabase rechazó la consulta",
                status: respuesta.status
            });

        }


        const votos =
            await respuesta.json();


        return res.status(200).json({
            votos: votos
        });


    } catch (error) {

        console.error(
            "Error API:",
            error
        );


        return res.status(500).json({
            error: "Error interno"
        });

    }

}
