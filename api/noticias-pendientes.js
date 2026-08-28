import { listPending, updatePending } from "../lib/news-pipeline.js";

export default async function handler(req, res) {
  if (!["POST", "PATCH"].includes(req.method)) return res.status(405).json({ error: "Método no permitido" });
  if (!process.env.ADMIN_PASSWORD || req.body?.password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: "Contraseña incorrecta" });
  try {
    if (req.method === "POST") return res.status(200).json({ noticias: await listPending() });
    if (!req.body?.id) return res.status(400).json({ error: "Falta el ID" });
    const rows = await updatePending(req.body.id, req.body.changes || {});
    return res.status(200).json({ noticia: rows?.[0] || null });
  } catch (error) {
    console.error("pending_news_failed", { message: error.message });
    return res.status(500).json({ error: "No se pudo acceder a pendientes", detail: error.message });
  }
}

