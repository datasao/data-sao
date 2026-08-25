export default async function handler(
    req,
    res
) {

    if (
        req.method !==
        "POST"
    ) {

        return res
            .status(405)
            .json({
                error:
                    "Método no permitido"
            });

    }


    const {
        password
    } =
        req.body || {};


    if (
        password !==
        process.env.ADMIN_PASSWORD
    ) {

        return res
            .status(401)
            .json({
                error:
                    "No autorizado"
            });

    }


    try {

        const respuesta =
            await fetch(
                process.env.SUPABASE_URL +
                "/rest/v1/votos" +
                "?select=jugador,equipo" +
                "&partido_id=eq.talleres-ferro-vuelta",
                {

                    headers: {

                        apikey:
                            process.env.SUPABASE_SECRET_KEY,

                        Authorization:
                            "Bearer " +
                            process.env.SUPABASE_SECRET_KEY

                    }

                }
            );


        if (
            !respuesta.ok
        ) {

            const texto =
                await respuesta.text();


            console.error(
                texto
            );


            return res
                .status(500)
                .json({
                    error:
                        "Error de Supabase"
                });

        }


        const votos =
            await respuesta.json();


        return res
            .status(200)
            .json({
                votos:
                    votos
            });


    } catch (error) {

        console.error(
            error
        );


        return res
            .status(500)
            .json({
                error:
                    "Error interno"
            });

    }

}