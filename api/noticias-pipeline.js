import { runPipeline } from "../lib/news-pipeline.js";

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) return res.status(405).json({ error: "Método no permitido" });
  const authorization = req.headers.authorization;
  const cronAuthorized = process.env.CRON_SECRET && authorization === `Bearer ${process.env.CRON_SECRET}`;
  const adminAuthorized = req.method === "POST" && req.body?.password === process.env.ADMIN_PASSWORD;
  if (!cronAuthorized && !adminAuthorized) return res.status(401).json({ error: "No autorizado" });
  try {
    const result = await runPipeline({ limit: Number(req.body?.limit || 1) });
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    console.error("news_pipeline_failed", { message: error.message });
    return res.status(500).json({ error: "No se pudo ejecutar el pipeline", detail: error.message });
  }
}

