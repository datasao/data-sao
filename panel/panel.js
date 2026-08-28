let password = "";
const $ = (selector, root = document) => root.querySelector(selector);

async function api(method, body) {
  const response = await fetch("/api/noticias-pendientes", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, ...body }) });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Ocurrió un error");
  return payload;
}

async function load() {
  const { noticias } = await api("POST", {});
  $("#count").textContent = noticias.length;
  $("#empty").hidden = noticias.length > 0;
  const list = $("#newsList"); list.replaceChildren();
  noticias.forEach((news) => {
    const node = $("#newsTemplate").content.cloneNode(true);
    $(".headline", node).textContent = news.titulo;
    $(".dek", node).textContent = news.bajada;
    const confidence = $(".confidence", node); confidence.textContent = `Confianza ${news.nivel_confianza}`; confidence.classList.add(news.nivel_confianza);
    $(".source-count", node).textContent = `${news.fuentes?.length || 0} fuentes`;
    const form = $("form", node);
    for (const name of ["titulo", "bajada", "cuerpo", "categoria", "imagen_url", "orden"]) form.elements[name].value = news[name] ?? "";
    form.elements.tags.value = (news.tags || []).join(", ");
    const sources = $(".sources", node); sources.innerHTML = "<strong>Fuentes consultadas</strong>";
    (news.fuentes || []).forEach((source) => { const link = document.createElement("a"); link.href = source.url; link.target = "_blank"; link.rel = "noopener"; link.textContent = `${source.source}: ${source.title}`; sources.append(link); });
    $(".toggle", node).addEventListener("click", (event) => { form.hidden = !form.hidden; event.target.textContent = form.hidden ? "Editar" : "Cerrar"; });
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); const button = $("button[type=submit]", form); button.disabled = true;
      try { const values = Object.fromEntries(new FormData(form)); values.tags = values.tags.split(",").map((tag) => tag.trim()).filter(Boolean); values.orden = values.orden ? Number(values.orden) : null; await api("PATCH", { id: news.id, changes: values }); $(".saved", form).textContent = "Guardado"; await load(); }
      catch (error) { $(".saved", form).textContent = error.message; } finally { button.disabled = false; }
    });
    list.append(node);
  });
}

$("#loginForm").addEventListener("submit", async (event) => { event.preventDefault(); password = $("#password").value; try { await load(); $("#login").hidden = true; $("#workspace").hidden = false; } catch (error) { $("#loginError").textContent = error.message; } });
$("#runPipeline").addEventListener("click", async (event) => { const button = event.target; button.disabled = true; $("#status").textContent = "Buscando, contrastando y redactando…"; try { const response = await fetch("/api/noticias-pipeline", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, limit: 1 }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); $("#status").textContent = payload.results?.[0]?.error || "Pipeline completado."; await load(); } catch (error) { $("#status").textContent = error.message; } finally { button.disabled = false; } });

