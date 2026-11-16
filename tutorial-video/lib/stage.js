// Runs inside the app page. Draws everything the recording adds on top of the real UI:
// the pointer, click ripples, a highlight box, a draggable file chip and the explainer cards.
// It lives in a shadow root so the app's styles and React never touch it.
(() => {
  if (window.__stage) return;

  const host = document.createElement("div");
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>${window.__stageCss}</style>
    <div class="cards"></div>
    <div class="hl"></div>
    <div class="file"><span class="xl">X</span><span class="name"></span></div>
    <div class="ripples"></div>
    <div class="cursor"><div class="size">
      <div class="halo"></div>
      <svg viewBox="0 0 28 28"><path d="M5 3.2 5 22.6 10.2 17.9 13.6 25.6 16.9 24.1 13.6 16.6 20.6 16.6Z" fill="#111827" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/></svg>
    </div></div>`;
  document.documentElement.appendChild(host);

  const $ = (sel) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const cursor = $(".cursor");
  const file = $(".file");
  const pos = { x: 0, y: 0 };
  let dragging = false;

  const place = () => {
    cursor.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    if (dragging) file.style.transform = `translate(${pos.x - 26}px, ${pos.y - 22}px)`;
  };
  window.addEventListener("mousemove", (e) => { pos.x = e.clientX; pos.y = e.clientY; place(); }, true);
  const press = (down) => {
    cursor.classList.toggle("down", down);
    if (!down) return;
    const r = document.createElement("div");
    r.className = "ripple";
    r.style.left = pos.x + "px";
    r.style.top = pos.y + "px";
    $(".ripples").appendChild(r);
    setTimeout(() => r.remove(), 700);
  };
  window.addEventListener("mousedown", () => press(true), true);
  window.addEventListener("mouseup", () => press(false), true);

  const pills = (wishes, got) =>
    wishes.map((w, i) => `<span class="pill${i === got ? " got" : ""}"><i>${i + 1}.</i>${esc(w)}</span>`).join("");

  const templates = {
    title: (d) => `<img src="${esc(d.logo)}" alt=""><h1>${esc(d.title)}</h1><p>${esc(d.subtitle)}</p>`,

    outro: (d) => `<h1>${esc(d.title)}</h1><div class="url">${esc(d.url)}</div>`,

    idea: (d) => `
      <div class="cols">
        <div class="col">
          <h3>${esc(d.wishesTitle)}</h3>
          ${d.people.map((p, i) => `<div class="person"><span class="av c${i}">${esc(p.name[0])}</span><b>${esc(p.name)}</b>${pills(p.wishes, p.gets)}</div>`).join("")}
        </div>
        <div class="col" data-from="1">
          <h3>${esc(d.workshopsTitle)}</h3>
          ${d.workshops.map((w) => {
            const i = d.people.findIndex((p) => p.wishes[p.gets] === w.name);
            return `<div class="shop"><div><b>${esc(w.name)}</b><small>${esc(w.seats)}</small></div>
              <div class="seat"><span class="rank">${esc(d.ranks[d.people[i].gets])}</span><span class="empty"></span><span class="av c${i}">${esc(d.people[i].name[0])}</span></div></div>`;
          }).join("")}
        </div>
      </div>`,

    scope: (d) => `
      <h1>${d.title.map((part, i) => (i % 2 ? `<span>${esc(part)}</span>` : esc(part))).join("")}</h1>
      <div class="cols">
        <div class="panel yes">
          <div class="label"><span class="mark">✓</span>${esc(d.yes.label)}</div>
          <div class="who"><span class="av c0">${esc(d.yes.who[0])}</span>${esc(d.yes.who)}</div>
          <div class="pills">${pills(d.yes.wishes, -1)}</div>
        </div>
        <div class="panel no" data-from="1">
          <div class="label"><span class="mark">✕</span>${esc(d.no.label)}</div>
          ${d.no.bubbles.map((b) => `<div class="bubble">${esc(b)}</div>`).join("")}
        </div>
      </div>`,

    sheet: (d) => `<div class="fit">
      <div class="notes">
        <span class="note p1" style="left:46px">${esc(d.notes.name)}</span>
        ${d.notes.wishes.map((w, i) => `<span class="note p2" style="left:${255 + i * 208}px">${esc(w)}</span>`).join("")}
        <span class="note p3" style="left:46px">${esc(d.notes.noHeader)}</span>
      </div>
      <div class="win">
        <div class="bar"><span class="xl">X</span>${esc(d.file)}</div>
        <table>
          <tr><th class="n"></th>${["A", "B", "C", "D"].map((c, i) => `<th class="${i ? "cW" : "cA"}">${c}</th>`).join("")}</tr>
          ${d.rows.map((r, n) => `<tr><td class="n">${n + 1}</td>${r.map((c, i) => `<td class="${i ? "cW" : "cA"}${n ? "" : " r1"}">${esc(c)}</td>`).join("")}</tr>`).join("")}
        </table>
        <div class="tabs">${d.tabs.map((t, i) => `<span class="${i ? "" : "active"}">${esc(t)}</span>`).join("")}</div>
      </div>
      <div class="foot"><span class="note p4" style="left:12px">${esc(d.notes.firstSheet)}</span></div>
    </div>`,
  };

  window.__stage = {
    setCam(s) { host.style.setProperty("--cam", s); },
    showCursor(on) { cursor.classList.toggle("on", on); },

    // Cross-fades to a new card; card(null) fades the current one out.
    card(name, data) {
      const cards = $(".cards");
      const old = [...cards.children];
      setTimeout(() => old.forEach((c) => c.remove()), 450);
      // A new card fades in on top of the old one, so the app never shows through.
      if (!name) return old.forEach((c) => c.classList.remove("on"));
      const el = document.createElement("div");
      el.className = `card ${name}`;
      el.dataset.phase = 0;
      el.innerHTML = templates[name](data);
      cards.appendChild(el);
      el.getBoundingClientRect();
      el.classList.add("on");
    },
    phase(n) { const c = $(".cards").lastElementChild; if (c) c.dataset.phase = n; },

    highlight(r) {
      const hl = $(".hl");
      if (!r) return hl.classList.remove("on");
      // A hidden box jumps to its new place; only a visible one glides there.
      hl.style.transition = hl.classList.contains("on") ? "" : "none";
      Object.assign(hl.style, { left: r.x + "px", top: r.y + "px", width: r.width + "px", height: r.height + "px" });
      hl.getBoundingClientRect();
      hl.style.transition = "";
      hl.classList.add("on");
    },

    // Shows a file hanging on the pointer, as if dragged in from a file manager.
    dragFile(name) {
      $(".file .name").textContent = name;
      dragging = true;
      press(true);
      place();
      file.classList.add("on");
    },

    // Hands the app a real drop event, so the import's own drag-and-drop code runs.
    dropFile(selector, name, base64, type) {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const dt = new DataTransfer();
      dt.items.add(new File([bytes], name, { type }));
      const target = document.querySelector(selector);
      for (const ev of ["dragenter", "dragover", "drop"]) {
        target.dispatchEvent(new DragEvent(ev, { bubbles: true, cancelable: true, dataTransfer: dt }));
      }
      dragging = false;
      press(false);
      file.classList.remove("on");
    },
  };
})();
