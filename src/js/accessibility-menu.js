// accessibility-menu.js
// Este arquivo deve ficar em: src/js/accessibility-menu.js
// Ele carrega o componente e inicializa os handlers

(function () {
  // carrega o componente (caminho relativo a partir de src/js/ até src/components/)
  fetch("../components/accessibility-menu.html")
    .then((res) => {
      if (!res.ok) throw new Error("Falha ao carregar componente: " + res.status);
      return res.text();
    })
    .then((html) => {
      document.body.insertAdjacentHTML("beforeend", html);
      initAccessibilityMenu();
    })
    .catch((err) => {
      console.error(err);
    });

  function initAccessibilityMenu() {
    const floatBtn = document.getElementById("accessibility-float-btn");
    const menu = document.getElementById("accessibility-menu");
    const closeBtn = document.getElementById("accessibility-close");
    const readBtn = document.getElementById("readTextBtn");
    const incFontBtn = document.getElementById("increaseFontBtn");
    const decFontBtn = document.getElementById("decreaseFontBtn");

    if (!floatBtn || !menu) {
      console.warn("Accessibility: elementos não encontrados");
      return;
    }

    // helper: toggle menu visibility with aria
    function openMenu() {
      menu.classList.remove("hidden");
      floatBtn.setAttribute("aria-expanded", "true");
      // em mobile, focar primeiro botão para acessibilidade
      setTimeout(() => {
        const first = menu.querySelector("button");
        if (first) first.focus();
      }, 120);
    }
    function closeMenu() {
      menu.classList.add("hidden");
      floatBtn.setAttribute("aria-expanded", "false");
      floatBtn.focus();
    }
    floatBtn.addEventListener("click", () => {
      if (menu.classList.contains("hidden")) openMenu();
      else closeMenu();
    });
    closeBtn?.addEventListener("click", closeMenu);

    // ======== LEITOR DE TEXTO (SpeechSynthesis) =========
    let utterance = null;
    const synth = window.speechSynthesis;

    function collectVisibleText(maxChars = 20000) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          // ignore controls, nav, buttons, scripts, styles, noscript, svg, textarea, input
          const ignore = ["script", "style", "noscript", "svg", "textarea", "input", "button"];
          if (ignore.includes(tag)) return NodeFilter.FILTER_REJECT;
          // ignore hidden elements
          if (parent.closest && parent.closest("[hidden], [aria-hidden='true']")) return NodeFilter.FILTER_REJECT;
          // ignore content inside .no-read class
          if (parent.closest && parent.closest(".no-read")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });

      let text = "";
      while (walker.nextNode() && text.length < maxChars) {
        text += walker.currentNode.nodeValue.trim() + " ";
      }
      return text.trim();
    }

    function updateReadButtonState(state) {
      // states: 'idle' | 'reading' | 'paused'
      if (!readBtn) return;
      if (state === "reading") {
        readBtn.innerHTML = `<span class="material-symbols-rounded">pause</span><span>Pausar Leitura</span>`;
      } else if (state === "paused") {
        readBtn.innerHTML = `<span class="material-symbols-rounded">play_arrow</span><span>Retomar Leitura</span>`;
      } else {
        readBtn.innerHTML = `<span class="material-symbols-rounded">volume_up</span><span>Ler Página</span>`;
      }
    }

    if (readBtn) {
      readBtn.addEventListener("click", () => {
        if (!("speechSynthesis" in window)) {
          alert("Seu navegador não suporta SpeechSynthesis API.");
          return;
        }

        // Se já falando e não pausado => pause
        if (synth.speaking && !synth.paused) {
          synth.pause();
          updateReadButtonState("paused");
          return;
        }

        // Se está pausado => resume
        if (synth.paused) {
          synth.resume();
          updateReadButtonState("reading");
          return;
        }

        // Caso contrário: iniciar nova leitura
        const text = collectVisibleText();
        if (!text) {
          alert("Não há texto visível para ler nesta página.");
          return;
        }

        // Cria uma nova utterance e liga callbacks
        utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        utterance.rate = 1; // ajustar conforme necessário
        utterance.pitch = 1;

        utterance.onstart = () => {
          updateReadButtonState("reading");
        };
        utterance.onend = () => {
          updateReadButtonState("idle");
        };
        utterance.onerror = (e) => {
          console.error("Erro na síntese de voz:", e);
          updateReadButtonState("idle");
        };

        synth.speak(utterance);
      });
    }

    // Opcional: parar leitura quando o menu fechar
    const observer = new MutationObserver(() => {
      if (menu.classList.contains("hidden") && synth.speaking) {
        synth.cancel();
        updateReadButtonState("idle");
      }
    });
    observer.observe(menu, { attributes: true, attributeFilter: ["class"] });

    // ======== CONTROLES DE FONTE (simples) ========
    const htmlEl = document.documentElement || document.querySelector("html");
    const STORAGE_KEY = "helio_font_scale";
    const baseScale = parseFloat(localStorage.getItem(STORAGE_KEY)) || 1;

    function applyScale(scale) {
      htmlEl.style.setProperty("font-size", (scale * 100) + "%");
      localStorage.setItem(STORAGE_KEY, scale);
    }
    // aplicar scale inicial
    applyScale(baseScale);

    if (incFontBtn) {
      incFontBtn.addEventListener("click", () => {
        const current = parseFloat(localStorage.getItem(STORAGE_KEY)) || 1;
        const next = Math.min(1.5, +(current + 0.1).toFixed(2));
        applyScale(next);
      });
    }
    if (decFontBtn) {
      decFontBtn.addEventListener("click", () => {
        const current = parseFloat(localStorage.getItem(STORAGE_KEY)) || 1;
        const next = Math.max(0.8, +(current - 0.1).toFixed(2));
        applyScale(next);
      });
    }
    
   // ======== ALTO CONTRASTE ========
const contrastBtn = document.getElementById("toggleContrastBtn");

contrastBtn.addEventListener("click", () => {
    document.body.classList.toggle("contrast");
});




    // ESC fecha o menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }
})();



