(function () {
  "use strict";

  const state = {
    all: [],
    themesRef: {},
    activeType: null,
    activeTheme: null,
    activeSecteur: null,
    search: "",
    selection: new Set(),
  };

  const el = {
    chipsType: document.getElementById("chipsType"),
    chipsTheme: document.getElementById("chipsTheme"),
    chipsSecteur: document.getElementById("chipsSecteur"),
    searchInput: document.getElementById("searchInput"),
    docBody: document.getElementById("docBody"),
    resultCount: document.getElementById("resultCount"),
    emptyState: document.getElementById("emptyState"),
    btnReset: document.getElementById("btnReset"),
    selectionBanner: document.getElementById("selectionBanner"),
    selectionCount: document.getElementById("selectionCount"),
    btnCopyLink: document.getElementById("btnCopyLink"),
    btnDownloadZip: document.getElementById("btnDownloadZip"),
    btnClearSelection: document.getElementById("btnClearSelection"),
  };

  const TYPE_LABELS = {
    "diplome": "Diplôme",
    "certification": "Certification",
    "attestation-formation": "Attestation de formation",
    "attestation-conseil": "Attestation de conseil",
  };

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "fr"));
  }

  function buildChips(container, entries, activeKey, onPick) {
    container.innerHTML = "";
    entries.forEach(([value, label]) => {
      const btn = document.createElement("button");
      btn.className = "chip" + (state[activeKey] === value ? " active" : "");
      btn.textContent = label;
      btn.addEventListener("click", () => {
        state[activeKey] = state[activeKey] === value ? null : value;
        render();
      });
      container.appendChild(btn);
    });
  }

  function matchesFilters(doc) {
    if (state.activeType && doc.type_document !== state.activeType) return false;
    if (state.activeTheme && !doc.themes.includes(state.activeTheme)) return false;
    if (state.activeSecteur && doc.secteur !== state.activeSecteur) return false;
    if (state.search) {
      const hay = [doc.titre, doc.organisme, doc.client_final].join(" ").toLowerCase();
      if (!hay.includes(state.search.toLowerCase())) return false;
    }
    return true;
  }

  function themeLabel(slug) {
    return state.themesRef[slug] || slug;
  }

  function renderTable(list) {
    el.docBody.innerHTML = "";
    el.emptyState.style.display = list.length ? "none" : "block";
    el.resultCount.textContent = list.length + (list.length > 1 ? " documents" : " document");

    list.forEach((doc) => {
      const tr = document.createElement("tr");

      const tdCheck = document.createElement("td");
      tdCheck.className = "col-check";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = state.selection.has(doc.id);
      cb.addEventListener("change", () => {
        if (cb.checked) state.selection.add(doc.id);
        else state.selection.delete(doc.id);
        updateSelectionBanner();
      });
      tdCheck.appendChild(cb);

      const tdDoc = document.createElement("td");
      const themeTags = doc.themes.map((t) => `<span class="tag-pill">${themeLabel(t)}</span>`).join("");
      const metaBits = [doc.organisme, doc.client_final, doc.secteur].filter(Boolean).join(" · ");
      tdDoc.innerHTML = `<div class="doc-title">${doc.titre}</div>
        <div class="doc-meta">${metaBits}</div>
        <div style="margin-top:6px;">${themeTags}</div>`;

      const tdType = document.createElement("td");
      tdType.innerHTML = `<span class="type-pill">${TYPE_LABELS[doc.type_document] || doc.type_document}</span>`;

      const tdYear = document.createElement("td");
      tdYear.textContent = doc.annee || "";

      const tdDl = document.createElement("td");
      tdDl.className = "col-dl";
      tdDl.innerHTML = `<a class="dl-link" href="${doc.fichier}" download>Télécharger</a>`;

      tr.append(tdCheck, tdDoc, tdType, tdYear, tdDl);
      el.docBody.appendChild(tr);
    });
  }

  function updateSelectionBanner() {
    const n = state.selection.size;
    el.selectionBanner.classList.toggle("active", n > 0);
    el.selectionCount.textContent = n + (n > 1 ? " documents sélectionnés" : " document sélectionné");
  }

  function render() {
    buildChips(el.chipsType, Object.entries(TYPE_LABELS), "activeType");
    const themeEntries = uniqueSorted(state.all.flatMap((d) => d.themes)).map((t) => [t, themeLabel(t)]);
    buildChips(el.chipsTheme, themeEntries, "activeTheme");
    const secteurEntries = uniqueSorted(state.all.map((d) => d.secteur)).map((s) => [s, s]);
    buildChips(el.chipsSecteur, secteurEntries, "activeSecteur");

    const filtered = state.all.filter(matchesFilters);
    renderTable(filtered);
  }

  function applySelectionFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const sel = params.get("sel");
    if (sel) {
      sel.split(",").forEach((id) => state.selection.add(id.trim()));
      updateSelectionBanner();
    }
  }

  el.searchInput.addEventListener("input", (e) => {
    state.search = e.target.value;
    render();
  });

  el.btnReset.addEventListener("click", () => {
    state.activeType = null;
    state.activeTheme = null;
    state.activeSecteur = null;
    state.search = "";
    el.searchInput.value = "";
    render();
  });

  el.btnClearSelection.addEventListener("click", () => {
    state.selection.clear();
    updateSelectionBanner();
    render();
  });

  el.btnCopyLink.addEventListener("click", () => {
    const ids = Array.from(state.selection).join(",");
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("sel", ids);
    navigator.clipboard.writeText(url.toString()).then(() => {
      el.btnCopyLink.textContent = "Lien copié";
      setTimeout(() => (el.btnCopyLink.textContent = "Copier le lien de sélection"), 1800);
    });
  });

  el.btnDownloadZip.addEventListener("click", async () => {
    if (!state.selection.size) return;
    el.btnDownloadZip.textContent = "Préparation…";
    const zip = new JSZip();
    const docs = state.all.filter((d) => state.selection.has(d.id));
    await Promise.all(
      docs.map(async (doc) => {
        try {
          const res = await fetch(doc.fichier);
          const blob = await res.blob();
          const filename = doc.fichier.split("/").pop();
          zip.file(filename, blob);
        } catch (e) {
          console.error("Échec du téléchargement pour", doc.fichier, e);
        }
      })
    );
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "references-sami-ben-mansour.zip");
    el.btnDownloadZip.textContent = "Télécharger la sélection (.zip)";
  });

  fetch("data/documents.json")
    .then((r) => r.json())
    .then((data) => {
      state.all = data.documents;
      state.themesRef = data.themes_reference;
      applySelectionFromUrl();
      render();
    })
    .catch((err) => {
      el.docBody.innerHTML = "";
      el.emptyState.textContent = "Le fichier de données n'a pas pu être chargé.";
      el.emptyState.style.display = "block";
      console.error(err);
    });
})();
