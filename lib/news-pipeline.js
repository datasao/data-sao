const SUPABASE_HEADERS = () => ({
  apikey: process.env.SUPABASE_SECRET_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
  "Content-Type": "application/json",
});

const SEARCHES = [
  '"fútbol argentino"',
  '"Liga Profesional" Argentina',
  'River OR Boca OR Racing OR Independiente OR San Lorenzo fútbol',
];

function requireEnv(names) {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Faltan variables: ${missing.join(", ")}`);
}

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function tag(item, name) {
  return decodeXml(item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] || "").trim();
}

function stripHtml(value = "") {
  return decodeXml(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

export function parseRss(xml) {
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map(([item]) => {
    const rawTitle = tag(item, "title");
    const title = rawTitle.replace(/\s+-\s+[^-]+$/, "").trim();
    const source = tag(item, "source") || rawTitle.split(" - ").at(-1) || "Fuente RSS";
    return {
      title,
      source,
      url: tag(item, "link"),
      publishedAt: new Date(tag(item, "pubDate") || Date.now()).toISOString(),
      description: stripHtml(tag(item, "description")),
    };
  }).filter((item) => item.title && item.url);
}

async function rssSearch(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=es-419&gl=AR&ceid=AR:es-419`;
  const response = await fetch(url, { headers: { "User-Agent": "DataSao/1.0" } });
  if (!response.ok) throw new Error(`RSS respondió ${response.status}`);
  return parseRss(await response.text());
}

function normalizeTitle(title) {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function similarity(a, b) {
  const left = new Set(normalizeTitle(a).split(" ").filter((word) => word.length > 3));
  const right = new Set(normalizeTitle(b).split(" ").filter((word) => word.length > 3));
  const intersection = [...left].filter((word) => right.has(word)).length;
  return intersection / Math.max(1, Math.min(left.size, right.size));
}

function cluster(items) {
  const stories = [];
  for (const item of items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))) {
    const match = stories.find((story) => similarity(story.seed.title, item.title) >= 0.45);
    if (match) {
      if (!match.sources.some((source) => source.url === item.url)) match.sources.push(item);
    } else {
      stories.push({ seed: item, sources: [item] });
    }
  }
  return stories;
}

async function researchStory(story) {
  const related = await rssSearch(`"${story.seed.title}" OR ${story.seed.title}`);
  const combined = [...story.sources, ...related]
    .filter((source, index, all) => all.findIndex((candidate) => candidate.url === source.url) === index)
    .slice(0, 8);
  return { ...story, sources: combined };
}

async function generateArticle(story) {
  requireEnv(["OPENAI_API_KEY"]);
  const evidence = story.sources.map((source, index) => ({
    id: index + 1,
    medio: source.source,
    titulo: source.title,
    fecha: source.publishedAt,
    descripcion: source.description,
    url: source.url,
  }));

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_NEWS_MODEL || "gpt-5-mini",
      input: [
        {
          role: "system",
          content: "Sos editor de DataSao, medio argentino. Escribí sólo con los datos entregados. No inventes, no copies frases, no repitas ideas. Cada párrafo debe aportar un dato, contexto, declaración atribuida o consecuencia. Diferenciá hechos confirmados de versiones periodísticas. No uses clickbait. Devolvé exclusivamente JSON válido.",
        },
        {
          role: "user",
          content: `Redactá una nota original a partir de estas fuentes:\n${JSON.stringify(evidence)}\n\nJSON requerido: {"titulo":"...","bajada":"...","cuerpo":"...","categoria":"Fútbol argentino","tags":["..."],"slug":"...","seo_descripcion":"...","nivel_confianza":"alto|medio|bajo","alertas":["..."],"hechos_confirmados":["..."]}. El cuerpo debe tener entre 450 y 750 palabras si la evidencia alcanza; si no, ser más breve. No incluyas una imagen.`,
        },
      ],
      text: { format: { type: "json_object" } },
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`OpenAI respondió ${response.status}: ${payload.error?.message || "error"}`);
  const output = payload.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
  if (!output) throw new Error("OpenAI no devolvió texto");
  return JSON.parse(output);
}

async function supabase(path, options = {}) {
  requireEnv(["SUPABASE_URL", "SUPABASE_SECRET_KEY"]);
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: { ...SUPABASE_HEADERS(), ...(options.headers || {}) },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase respondió ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

export async function savePending(article, story) {
  const sourceFingerprint = normalizeTitle(story.seed.title).slice(0, 180);
  const rows = await supabase("noticias?on_conflict=source_fingerprint", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
    body: JSON.stringify({
      titulo: article.titulo,
      bajada: article.bajada,
      cuerpo: article.cuerpo,
      categoria: article.categoria || "Fútbol argentino",
      tags: article.tags || [],
      slug: article.slug,
      seo_descripcion: article.seo_descripcion,
      estado: "pendiente",
      imagen_url: null,
      fuentes: story.sources,
      hechos_confirmados: article.hechos_confirmados || [],
      alertas: article.alertas || [],
      nivel_confianza: article.nivel_confianza || "medio",
      source_fingerprint: sourceFingerprint,
      fuente_principal_url: story.seed.url,
      fecha_fuente: story.seed.publishedAt,
    }),
  });
  return rows?.[0] || null;
}

export async function runPipeline({ limit = 1 } = {}) {
  const batches = await Promise.all(SEARCHES.map(rssSearch));
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const candidates = batches.flat().filter((item) => new Date(item.publishedAt).getTime() >= cutoff);
  const stories = cluster(candidates).filter((story) => story.sources.length >= 2).slice(0, Math.min(limit, 3));
  const results = [];
  for (const story of stories) {
    try {
      const researched = await researchStory(story);
      const article = await generateArticle(researched);
      const saved = await savePending(article, researched);
      results.push({ title: article.titulo, inserted: Boolean(saved), id: saved?.id || null, sources: researched.sources.length });
    } catch (error) {
      results.push({ title: story.seed.title, error: String(error.message || error) });
    }
  }
  return { detected: candidates.length, clustered: stories.length, results };
}

export async function listPending() {
  return supabase("noticias?estado=eq.pendiente&select=*&order=orden.asc.nullslast,created_at.desc");
}

export async function updatePending(id, changes) {
  const allowed = ["titulo", "bajada", "cuerpo", "categoria", "tags", "slug", "seo_descripcion", "imagen_url", "orden"];
  const update = Object.fromEntries(Object.entries(changes).filter(([key]) => allowed.includes(key)));
  update.updated_at = new Date().toISOString();
  return supabase(`noticias?id=eq.${encodeURIComponent(id)}&estado=eq.pendiente`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(update),
  });
}

