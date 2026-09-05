const works = [
  ["AI 漫剧 01", "剧情类 AI 视频，强调人物氛围与连续叙事。", "ai-drama-1"],
  ["AI 漫剧 02", "AI 漫剧方向补充作品，适合展示批量成片能力。", "ai-drama-2"],
  ["宣传视频", "宣传向短片，突出信息包装和节奏控制。", "promo-1"],
  ["广告宣传", "商业广告风格成片，适合品牌内容岗位展示。", "ad-1"],
  ["动作打斗", "动作节奏、冲突镜头和视觉张力展示。", "action-1"],
  ["搞笑动画 01", "轻剧情动画，适合短视频账号内容生产。", "comedy-1"],
  ["搞笑动画 02", "幽默方向动画成片，展示题材延展能力。", "comedy-2"],
  ["搞笑动画 03", "系列化搞笑动画，适合持续内容产出。", "comedy-3"],
  ["电影感运镜", "电影感镜头运动、景别和剪辑节奏展示。", "cinematic-camera"],
  ["跨年视频", "节点型活动视频，适合节日营销内容。", "new-year"],
];

const showcase = document.querySelector("#showcase");
const grid = document.querySelector("#work-grid");
const mobileTrack = document.querySelector("#mobile-featured-track");
const mobileDots = document.querySelector("#mobile-featured-dots");
const activeIndex = document.querySelector("#active-index");
const activeTitle = document.querySelector("#active-title");
const viewer = document.querySelector("#video-viewer");
const viewerTitle = document.querySelector("#viewer-title");
const viewerVideo = document.querySelector("#viewer-video");
const viewerDesc = document.querySelector("#viewer-desc");
const viewerClose = document.querySelector(".viewer-close");
let active = 0;
let dragStartX = 0;
let dragOffset = 0;
let isDragging = false;
let suppressClick = false;
let wheelLocked = false;
const desktopStageQuery = window.matchMedia("(min-width: 769px)");
const loadedVideos = new Set();
const VIDEO_BASE_URL = (window.PORTFOLIO_VIDEO_BASE_URL || "assets/videos").replace(/\/$/, "");

function asset(name, type) {
  if (type === "videos") return `${VIDEO_BASE_URL}/${name}.mp4`;
  return `assets/${type}/${name}.jpg`;
}

function render() {
  showcase.innerHTML = "";
  grid.innerHTML = "";
  mobileTrack.innerHTML = "";
  mobileDots.innerHTML = "";

  works.forEach(([title, desc, file], index) => {
    const card = document.createElement("button");
    card.className = "video-card";
    card.type = "button";
    card.dataset.title = title;
    card.setAttribute("aria-label", `查看${title}`);
    card.innerHTML = `<video muted loop playsinline preload="none" poster="${asset(file, "posters")}"></video>`;
    card.addEventListener("click", () => {
      if (suppressClick) return;
      if (index === active) openViewer(index);
      else setActive(index);
    });
    showcase.appendChild(card);

    const item = document.createElement("button");
    item.className = "work";
    item.type = "button";
    item.innerHTML = `<img src="${asset(file, "posters")}" alt="${title}封面" loading="lazy" decoding="async"><div><h3>${title}</h3><p>${desc}</p></div>`;
    item.addEventListener("click", () => openViewer(index));
    grid.appendChild(item);

    const mobileCard = document.createElement("button");
    mobileCard.className = "mobile-featured-card";
    mobileCard.type = "button";
    mobileCard.setAttribute("aria-label", `播放${title}`);
    const loading = index === 0 ? "eager" : "lazy";
    const priority = index === 0 ? ' fetchpriority="high"' : "";
    mobileCard.innerHTML = `<span class="mobile-featured-media"><img src="${asset(file, "posters")}" alt="${title}封面" loading="${loading}" decoding="async"${priority}><span class="mobile-play" aria-hidden="true">▶</span></span><span class="mobile-featured-copy"><strong>${title}</strong><small>${desc}</small></span>`;
    mobileCard.addEventListener("click", () => openViewer(index));
    mobileTrack.appendChild(mobileCard);

    const dot = document.createElement("span");
    dot.className = "mobile-featured-dot";
    dot.setAttribute("aria-hidden", "true");
    mobileDots.appendChild(dot);
  });

  updateMobilePosition(0);
}

function ensureVideoLoaded(card, index) {
  const video = card.querySelector("video");
  if (!loadedVideos.has(index)) {
    video.src = asset(works[index][2], "videos");
    video.load();
    loadedVideos.add(index);
  }
  return video;
}

function setActive(next) {
  active = (next + works.length) % works.length;
  dragOffset = 0;
  layoutCards();
}

function circularOffset(index) {
  return ((index - active + works.length + 5) % works.length) - 5;
}

function layoutCards() {
  const cards = [...document.querySelectorAll(".video-card")];

  cards.forEach((card, index) => {
    const offset = circularOffset(index) + dragOffset;
    const abs = Math.abs(offset);
    const visible = abs <= 2.55;
    card.classList.toggle("is-active", index === active);
    card.style.opacity = visible ? String(1 - abs * .2) : "0";
    card.style.pointerEvents = visible ? "auto" : "none";
    card.style.zIndex = String(40 - Math.round(abs * 4));
    const x = Math.sin(offset * 1.1) * 135 + 48;
    const y = offset * 118;
    card.style.transform = `translate(-50%, -50%) translateX(${x}px) translateY(${y}px) translateZ(${170 - abs * 105}px) rotateY(${offset * -19}deg) rotateZ(${offset * -1.2}deg) scale(${1.08 - abs * .055})`;

    const video = index === active && desktopStageQuery.matches
      ? ensureVideoLoaded(card, index)
      : card.querySelector("video");
    if (desktopStageQuery.matches && index === active && !isDragging && dragOffset === 0) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  });

  activeIndex.textContent = String(active + 1).padStart(2, "0");
  activeTitle.textContent = works[active][0];
}

render();
setActive(0);

function updateMobilePosition(index) {
  [...mobileDots.children].forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });
}

mobileTrack.addEventListener("scroll", () => {
  const firstCard = mobileTrack.querySelector(".mobile-featured-card");
  if (!firstCard) return;
  const step = firstCard.offsetWidth + 14;
  updateMobilePosition(Math.max(0, Math.min(works.length - 1, Math.round(mobileTrack.scrollLeft / step))));
}, { passive: true });

desktopStageQuery.addEventListener("change", () => layoutCards());

showcase.addEventListener("pointerdown", (event) => {
  isDragging = true;
  dragStartX = event.clientX;
  showcase.classList.add("is-dragging");
  showcase.setPointerCapture(event.pointerId);
  layoutCards();
});

showcase.addEventListener("pointermove", (event) => {
  if (!isDragging) return;
  if (Math.abs(event.clientX - dragStartX) > 8) suppressClick = true;
  dragOffset = Math.max(-1, Math.min(1, (event.clientX - dragStartX) / 170));
  layoutCards();
});

function endDrag(event) {
  if (!isDragging) return;
  const shouldMove = Math.abs(dragOffset) > .35;
  const direction = dragOffset > 0 ? -1 : 1;
  isDragging = false;
  showcase.classList.remove("is-dragging");
  if (showcase.hasPointerCapture(event.pointerId)) showcase.releasePointerCapture(event.pointerId);
  setActive(shouldMove ? active + direction : active);
  setTimeout(() => {
    suppressClick = false;
  }, 0);
}

showcase.addEventListener("pointerup", endDrag);
showcase.addEventListener("pointercancel", endDrag);

showcase.addEventListener("wheel", (event) => {
  event.preventDefault();
  if (wheelLocked) return;
  wheelLocked = true;
  setActive(active + (event.deltaY > 0 ? 1 : -1));
  setTimeout(() => {
    wheelLocked = false;
  }, 420);
}, { passive: false });

function openViewer(index) {
  const [title, desc, file] = works[index];
  viewerTitle.textContent = title;
  viewerDesc.textContent = desc;
  viewerVideo.pause();
  viewerVideo.src = asset(file, "videos");
  viewerVideo.muted = false;
  viewerVideo.load();
  viewer.showModal();
  viewerVideo.play().catch(() => {});
}

function closeViewer() {
  viewerVideo.pause();
  viewerVideo.removeAttribute("src");
  viewerVideo.load();
  viewer.close();
}

viewerClose.addEventListener("click", closeViewer);
viewer.addEventListener("click", (event) => {
  if (event.target === viewer) closeViewer();
});
viewer.addEventListener("cancel", () => {
  viewerVideo.pause();
});
