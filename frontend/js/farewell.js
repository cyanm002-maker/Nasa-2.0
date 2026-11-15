// Farewell Wall - Spacecraft Memorial Guestbook & Tributes
(function () {
  let tributes = [];
  let activeFilter = "all";
  let tributesUnavailable = false;

  const grid = document.getElementById("tributesGrid");
  const filterBtns = document.querySelectorAll("[data-filter]");
  const modal = document.getElementById("tributeModal");
  const openModalBtn = document.getElementById("openTributeModalBtn");
  const closeModalBtn = document.getElementById("closeTributeModalBtn");
  const tributeForm = document.getElementById("tributeForm");
  const formStatus = document.getElementById("tributeFormStatus");

  async function loadTributes() {
    try {
      const resp = await fetch(`/api/tributes?probe=${activeFilter}`, { cache: "no-store" });
      if (!resp.ok) throw new Error("Could not load tributes");
      tributes = await resp.json();
      tributesUnavailable = false;
      renderTributes();
    } catch (error) {
      console.error("Could not load tributes:", error);
      tributes = [];
      tributesUnavailable = true;
      renderTributes();
    }
  }

  function renderTributes() {
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = activeFilter === "all"
      ? tributes
      : tributes.filter((t) => t.probe === activeFilter);

    if (filtered.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.style.cssText = "grid-column: 1 / -1; text-align: center; color: var(--muted); padding: 3rem;";
      emptyState.textContent = tributesUnavailable
        ? "Tributes are temporarily unavailable. Please try again shortly."
        : "No tribute notes found for this spacecraft yet. Be the first to leave one!";
      grid.replaceChildren(emptyState);
      return;
    }

    filtered.forEach((t) => {
      const card = document.createElement("div");
      card.className = "tribute-card";

      const heartedKey = `hearted_${t.id}`;
      const isHearted = localStorage.getItem(heartedKey) === "true";

      const content = document.createElement("div");
      const probeTag = document.createElement("span");
      probeTag.className = "tribute-probe-tag";
      probeTag.textContent = t.probeName || t.probe;
      const message = document.createElement("p");
      message.className = "tribute-text";
      message.textContent = `"${t.message}"`;
      content.append(probeTag, message);

      const authorSection = document.createElement("div");
      authorSection.className = "tribute-author";
      const author = document.createElement("span");
      const authorName = document.createElement("strong");
      authorName.textContent = t.author;
      author.append(authorName, ` (${t.callsign || "Explorer"}) · ${t.date}`);

      const heartBtn = document.createElement("button");
      heartBtn.className = "heart-btn";
      heartBtn.type = "button";
      heartBtn.setAttribute("aria-label", "Heart this tribute");
      heartBtn.dataset.id = t.id;
      heartBtn.innerHTML = `<span>${isHearted ? "❤️" : "🤍"}</span><span class="heart-count">${t.hearts || 0}</span>`;
      authorSection.append(author, heartBtn);
      card.append(content, authorSection);

      heartBtn.addEventListener("click", () => {
        const currentlyHearted = localStorage.getItem(heartedKey) === "true";
        const countSpan = heartBtn.querySelector(".heart-count");
        let count = parseInt(countSpan.textContent, 10) || 0;

        if (currentlyHearted) {
          localStorage.setItem(heartedKey, "false");
          countSpan.textContent = Math.max(0, count - 1);
          heartBtn.querySelector("span:first-child").textContent = "🤍";
        } else {
          localStorage.setItem(heartedKey, "true");
          countSpan.textContent = count + 1;
          heartBtn.querySelector("span:first-child").textContent = "❤️";
        }
      });

      grid.appendChild(card);
    });
  }

  function init() {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        activeFilter = btn.dataset.filter;
        loadTributes();
      });
    });

    if (openModalBtn && modal) {
      openModalBtn.addEventListener("click", () => {
        modal.hidden = false;
        if (formStatus) formStatus.textContent = "";
      });
    }

    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener("click", () => {
        modal.hidden = true;
      });
    }

    if (tributeForm) {
      tributeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(tributeForm);
        const submitBtn = tributeForm.querySelector("button[type='submit']");
        if (submitBtn) submitBtn.disabled = true;
        if (formStatus) formStatus.textContent = "Posting tribute note to the memorial...";

        const payload = {
          author: formData.get("author"),
          callsign: formData.get("callsign"),
          probe: formData.get("probe"),
          message: formData.get("message")
        };

        try {
          const resp = await fetch("/api/tributes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (!resp.ok) throw new Error("Could not save note");
          const saved = await resp.json();
          tributes.unshift(saved);
          renderTributes();

          tributeForm.reset();
          if (modal) modal.hidden = true;
        } catch {
          if (formStatus) formStatus.textContent = "Could not save tribute. Please try again.";
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    loadTributes();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
