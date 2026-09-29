// Navbar ganha borda/fundo ao rolar
const navbar = document.querySelector(".nx-navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Fragmentos de dados flutuando no fundo de cada seção, cada um numa profundidade diferente
const fragmentTexts = ["0x3F9A", "NULL", "01101110", "SYS://ZERO", "NODE_77", "VEYRON.E", "0xFF00", "PING 4ms", "ACCESS", "∅", "10.0.0.1", "LINK_OK"];

function addFragments(layer, count) {
  for (let i = 0; i < count; i++) {
    const depth = Math.random() * 1.1 - 0.4; // -0.4 (frente) até 0.7 (fundo)
    const frag = document.createElement("span");
    frag.className = "nx-frag" + (depth < 0 ? " nx-frag-near" : "");
    frag.textContent = fragmentTexts[Math.floor(Math.random() * fragmentTexts.length)];
    frag.style.left = Math.random() * 92 + "%";
    frag.style.top = Math.random() * 90 + "%";
    frag.style.opacity = (0.15 + (0.7 - depth) * 0.35).toFixed(2);
    frag.dataset.parallax = depth.toFixed(2);
    layer.appendChild(frag);
  }
}

const hero = document.getElementById("inicio");
const heroLayer = document.createElement("div");
heroLayer.className = "nx-bg-layer";
heroLayer.setAttribute("aria-hidden", "true");
hero.prepend(heroLayer);
addFragments(heroLayer, 10);
document.querySelectorAll(".nx-section .nx-bg-layer").forEach((layer) => addFragments(layer, 7));

// Parallax: cada [data-parallax] se desloca conforme a distância da sua seção até o centro da tela.
// Valor positivo = camada mais lenta (fundo); negativo = mais rápida (frente).
// data-parallax-x faz o mesmo na horizontal. Usa a propriedade `translate`, que não
// conflita com os `transform` do reveal e do hover.
const parallaxLayers = [...document.querySelectorAll("[data-parallax], [data-parallax-x]")].map((el) => ({
  el,
  speedY: parseFloat(el.dataset.parallax || 0),
  speedX: parseFloat(el.dataset.parallaxX || 0),
  section: el.closest("section, [data-parallax-root]"),
}));
let parallaxTicking = false;

function updateParallax() {
  parallaxTicking = false;
  if (reduceMotion.matches) return;

  const vh = window.innerHeight;
  const intensity = window.innerWidth < 768 ? 0.5 : 1; // mais suave no celular

  parallaxLayers.forEach(({ el, speedY, speedX, section }) => {
    const rect = section.getBoundingClientRect();
    if (rect.bottom < -vh || rect.top > vh * 2) return; // fora da tela
    // O hero parte do repouso no topo; as demais seções, quando centralizadas
    const distance = section === hero ? rect.top : rect.top + rect.height / 2 - vh / 2;
    const offset = -distance * intensity;
    el.style.translate = `${(offset * speedX).toFixed(1)}px ${(offset * speedY).toFixed(1)}px`;
  });
}

function requestParallax() {
  if (!parallaxTicking) {
    parallaxTicking = true;
    requestAnimationFrame(updateParallax);
  }
}

window.addEventListener("scroll", requestParallax, { passive: true });
window.addEventListener("resize", requestParallax);
updateParallax();

// Parallax do mouse no hero: retrato inclina e as camadas de fundo acompanham o cursor
const portrait = hero.querySelector(".nx-portrait");
const mouseLayers = [
  { el: hero.querySelector(".nx-bg-symbol-hero"), depth: -40 },
  { el: hero.querySelector(".nx-hero-glow"), depth: 25 },
  { el: hero.querySelector(".nx-rain"), depth: -12 },
  { el: heroLayer, depth: 18 },
];

if (window.matchMedia("(pointer: fine)").matches) {
  hero.addEventListener("mousemove", (e) => {
    if (reduceMotion.matches) return;
    const rect = hero.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 a 1
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    portrait.style.transform = `perspective(900px) rotateY(${nx * 7}deg) rotateX(${-ny * 7}deg)`;
    mouseLayers.forEach(({ el, depth }) => {
      el.style.transform = `translate(${nx * depth}px, ${ny * depth}px)`;
    });
  });

  hero.addEventListener("mouseleave", () => {
    portrait.style.transform = "";
    mouseLayers.forEach(({ el }) => (el.style.transform = ""));
  });
}

// Fecha o menu mobile ao clicar em um link
const menu = document.getElementById("menu");
document.querySelectorAll("#menu .nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (menu.classList.contains("show")) {
      bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }
  });
});

// Efeito de digitação da frase do hero
const phrase = "“Se tudo pode ser conectado, tudo pode ser controlado.”";
const typed = document.getElementById("typed");
let charIndex = 0;

function typeNext() {
  if (charIndex <= phrase.length) {
    typed.textContent = phrase.slice(0, charIndex++);
    setTimeout(typeNext, 45);
  }
}
setTimeout(typeNext, 600);

// Revela elementos ao entrar na tela
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Simulação do Projeto Zero: assume os sistemas um a um
const zeroBtn = document.getElementById("zero-btn");
const zeroBar = document.getElementById("zero-bar");
const zeroCount = document.getElementById("zero-count");
const zeroStatus = document.getElementById("zero-status");
const systems = document.querySelectorAll("#zero-systems .nx-system");
const progress = zeroBar.parentElement;

function setProgress(done) {
  const pct = Math.round((done / systems.length) * 100);
  zeroBar.style.transform = `scaleX(${pct / 100})`;
  progress.setAttribute("aria-valuenow", pct);
  zeroCount.textContent = done;
}

zeroBtn.addEventListener("click", () => {
  // Segundo clique reinicia a simulação
  if (zeroBtn.dataset.state === "done") {
    systems.forEach((s) => s.classList.remove("online"));
    setProgress(0);
    zeroStatus.textContent = "standby";
    zeroBtn.textContent = "Iniciar Projeto Zero";
    zeroBtn.dataset.state = "";
    return;
  }

  zeroBtn.disabled = true;
  zeroStatus.textContent = "invadindo...";
  systems.forEach((system, i) => {
    setTimeout(() => {
      system.classList.add("online");
      setProgress(i + 1);
      if (i === systems.length - 1) {
        zeroStatus.textContent = "controle total";
        zeroBtn.textContent = "Reiniciar";
        zeroBtn.dataset.state = "done";
        zeroBtn.disabled = false;
      }
    }, (i + 1) * 500);
  });
});

// Terminal da fraqueza: roda uma vez quando aparece na tela
const terminal = document.getElementById("terminal");
const terminalLines = [
  { text: "> carregando modelo_comportamental_novaris.v9" },
  { text: "> analisando 4.812.337 cidadãos..." },
  { text: "> previsão racional ............ 99,7% OK" },
  { text: "> previsão por interesse ....... 98,9% OK" },
  { text: "> previsão por emoção .......... ??", err: true },
  { text: "> previsão por improviso ....... ??", err: true },
  { text: "> previsão por sacrifício ...... ERRO", err: true },
  { text: "" },
  { text: "[FALHA] variável humana não computável.", err: true },
];

function runTerminal() {
  terminalLines.forEach((line, i) => {
    setTimeout(() => {
      const span = document.createElement("span");
      if (line.err) span.className = "err";
      span.textContent = line.text + "\n";
      terminal.appendChild(span);
    }, i * 450);
  });
}

const terminalObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      runTerminal();
      terminalObserver.disconnect();
    }
  },
  { threshold: 0.4 }
);
terminalObserver.observe(terminal);
