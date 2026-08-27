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
const activeIndex = document.querySelector("#active-index");
const activeTitle = document.querySelector("#active-title");
let active = 0;
let dragStartX = 0;
let dragOffset = 0;
let isDragging = false;

function asset(name, type) {
  return `assets/${type}/${name}.${type === "videos" ? "mp4" : "jpg"}`;
}

function render() {
  showcase.innerHTML = "";
  grid.innerHTML = "";

  works.forEach(([title, desc, file], index) => {
    const card = document.createElement("button");
    card.className = "video-card";
    card.type = "button";
    card.dataset.title = title;
    card.setAttribute("aria-label", `查看${title}`);
    card.innerHTML = `<video muted loop playsinline preload="metadata" poster="${asset(file, "posters")}"><source src="${asset(file, "videos")}" type="video/mp4"></video>`;
    card.addEventListener("click", () => setActive(index));
    showcase.appendChild(card);

    const item = document.createElement("article");
    item.className = "work";
    item.innerHTML = `<img src="${asset(file, "posters")}" alt="${title}封面"><div><h3>${title}</h3><p>${desc}</p></div>`;
    grid.appendChild(item);
  });
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
    const visible = abs <= 4.6;
    card.classList.toggle("is-active", index === active);
    card.style.opacity = visible ? String(1 - abs * .13) : "0";
    card.style.pointerEvents = visible ? "auto" : "none";
    card.style.zIndex = String(40 - Math.round(abs * 4));
    card.style.transform = `translate(-50%, -50%) translateX(${offset * 68}px) translateY(${offset * -70}px) translateZ(${80 - abs * 92}px) rotateY(${offset * -18}deg) rotateZ(${offset * 2.5}deg) scale(${1.06 - abs * .035})`;

    const video = card.querySelector("video");
    if (index === active && !isDragging && dragOffset === 0) {
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

showcase.addEventListener("pointerdown", (event) => {
  isDragging = true;
  dragStartX = event.clientX;
  showcase.classList.add("is-dragging");
  showcase.setPointerCapture(event.pointerId);
  layoutCards();
});

showcase.addEventListener("pointermove", (event) => {
  if (!isDragging) return;
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
}

showcase.addEventListener("pointerup", endDrag);
showcase.addEventListener("pointercancel", endDrag);
