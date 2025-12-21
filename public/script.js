/* === DICTIONARY === */
const RESOURCES = {
  en: {
    nav_chat: "Dialogue",
    nav_diary: "Collection",
    nav_logout: "Log out",
    diary_title: "Precious Moments",
    input_placeholder: "Write something beautiful...",
    ai_welcome: "Welcome to your sanctuary.\nHow are you feeling today?",
    ai_resp: "That is truly beautiful.",
    save_title: "Collect",
    meta_ai: "ToyBox AI",
    meta_user: "You",
    dateFormat: (d) =>
      new Date(d).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
  },
  jp: {
    nav_chat: "おはなし",
    nav_diary: "想い出",
    nav_logout: "ログアウト",
    diary_title: "大切な言葉たち",
    input_placeholder: "ここに想いを綴ってください...",
    ai_welcome: "ようこそ。あなたの言葉は、\nここで大切な想い出になります。",
    ai_resp: "それは素敵な考えですね。",
    save_title: "想い出に残す",
    meta_ai: "AI",
    meta_user: "あなた",
    dateFormat: (d) =>
      new Date(d).toLocaleDateString("ja-JP").replace(/\//g, "."),
  },
};

let currentLang = "jp";
let activeScene = "chat";
let currentUser = null;
let chatMessages = []; // Local state for chat message
let scrollOffset = 0;
let startY = 0;
let isDragging = false;

document.addEventListener("DOMContentLoaded", () => {
  initAuth();
  initUI();
});

/* === INITIALIZATION === */
async function initAuth() {
  try {
    const res = await fetch("/user");
    if (res.ok) {
      currentUser = await res.json();
      // Auth Success
      document.getElementById("authOverlay").classList.remove("active");
      document.getElementById("appViewport").classList.add("authenticated");
      document.getElementById("userMenu").style.display = "flex";
      document.getElementById("userName").textContent = currentUser.displayName;

      // Initial Load
      setLang("jp");
      // Greet
      if (chatMessages.length === 0) {
        chatMessages.push({
          id: "welcome",
          type: "ai",
          text: RESOURCES[currentLang].ai_welcome,
        });
        renderChat();
      }
    } else {
      // Not logged in -> Show Overlay
      document.getElementById("authOverlay").classList.add("active");
    }
  } catch (e) {
    console.error("Auth check failed", e);
  }
}

function initUI() {
  // Lang Switchers
  document.getElementById("btn-lang-en").onclick = () => setLang("en");
  document.getElementById("btn-lang-jp").onclick = () => setLang("jp");

  // Nav Switchers
  document.getElementById("btn-chat").onclick = () => switchScene("chat");
  document.getElementById("btn-diary").onclick = () => switchScene("diary");
  document.getElementById("chestTarget").onclick = () => switchScene("diary");

  // Input
  document.getElementById("inputBox").onkeypress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };
  document.getElementById("sendBtn").onclick = handleSubmit;

  // Resize Handler
  window.onresize = renderChat;

  // Scroll Events
  window.addEventListener("wheel", (e) => {
    if (activeScene !== "chat") return;
    scrollOffset += e.deltaY;
    clampScroll();
    renderChat();
  });

  window.addEventListener("touchstart", (e) => {
    if (activeScene !== "chat") return;
    isDragging = true;
    startY = e.touches[0].pageY;
  });

  window.addEventListener("touchmove", (e) => {
    if (!isDragging || activeScene !== "chat") return;
    const currentY = e.touches[0].pageY;
    const diff = startY - currentY;
    scrollOffset += diff;
    startY = currentY;
    clampScroll();
    renderChat();
  });

  window.addEventListener("touchend", () => {
    isDragging = false;
  });
}

function clampScroll() {
  const GAP = 30;
  const totalHeight = Array.from(stream.children).reduce((acc, el) => acc + (el.offsetHeight || 120) + GAP, 0);
  const maxScroll = Math.max(0, totalHeight - 200); 
  if (scrollOffset < 0) scrollOffset = 0;
  if (scrollOffset > maxScroll) scrollOffset = maxScroll;
}

/* === LOGIC: LANGUAGE === */
function setLang(lang) {
  currentLang = lang;
  document.body.className = `lang-${lang}`;

  document
    .querySelectorAll(".lang-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(`btn-lang-${lang}`).classList.add("active");

  document.querySelectorAll("[data-key]").forEach((el) => {
    const key = el.getAttribute("data-key");
    if (RESOURCES[lang][key]) el.textContent = RESOURCES[lang][key];
  });

  document.getElementById("inputBox").placeholder =
    RESOURCES[lang].input_placeholder;

  if (activeScene === "chat") resetChatInLang();
  if (activeScene === "diary") renderDiary(); // Re-render dates/text if needed?
}

/* === LOGIC: SCENE === */
function switchScene(name) {
  activeScene = name;

  document
    .querySelectorAll(".scene")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById("scene-" + name).classList.add("active");

  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById("btn-" + name).classList.add("active");

  if (name === "chat") {
    requestAnimationFrame(renderChat);
  } else if (name === "diary") {
    fetchAndRenderDiary();
  }
}

/* === LOGIC: CHAT (CURVE) === */
const stream = document.getElementById("stream");
const inputDock = document.getElementById("inputDock");

function resetChatInLang() {
  // If we only have the welcome message, translate it.
  if (chatMessages.length === 1 && chatMessages[0].id === "welcome") {
    chatMessages[0].text = RESOURCES[currentLang].ai_welcome;
    renderChat();
  }
}

function renderChat() {
  // 1. DOM Sync (Optimized for reuse would be better, but full rebuild is safe for prototypes)
  // To avoid scroll issues, we'll rebuild.
  while (stream.children.length > chatMessages.length)
    stream.removeChild(stream.firstChild);

  while (stream.children.length < chatMessages.length) {
    const i = stream.children.length;
    const msg = chatMessages[i];
    const el = document.createElement("div");
    el.className = `card ${msg.type}`;

    const meta =
      msg.type === "ai"
        ? RESOURCES[currentLang].meta_ai
        : RESOURCES[currentLang].meta_user;
    const tooltip = RESOURCES[currentLang].save_title;
    // Escape HTML for safety
    const safeText = msg.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const html = `
            <div class="card-meta">
                <span>${meta}</span>
                <span class="card-action" title="${tooltip}">💎</span>
            </div>
            <div class="msg-text">${safeText}</div>
        `;
    el.innerHTML = html;

    // Animation: Start from bottom (Initial state)
    // We set this BEFORE appending to DOM or immediately after
    // Current loop replaces logic.
    // Ensure it starts 'low' so it flows UP to target.
    // Use a large Y (e.g. window.innerHeight)
    el.style.transform = `translate(-50%, 0) translate3d(0, ${window.innerHeight}px, 0)`;

    // Add click listener for save
    el.querySelector(".card-action").onclick = (e) =>
      saveToDiaryFromChat(e.target, safeText);

    stream.appendChild(el);
  }

  // 2. Layout Calculation (Dynamic Height + Curve)
  const windowHeight = window.innerHeight;
  const inputRect = inputDock.getBoundingClientRect();
  const inputTop = inputRect.top === 0 ? windowHeight - 100 : inputRect.top;
  const safeBottomY = inputTop - 30; // Start point for newest message
  const curveThresholdY = windowHeight * 0.15; // 0.15: Keep bubbles big longer (was 0.3)
  const GAP = 30;
  const nodes = Array.from(stream.children);
  let currentBottomY = safeBottomY + scrollOffset;

  // Iterate backwards (Newest -> Oldest) to stack them on top of each other
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    const reverseIndex = nodes.length - 1 - i;

    const cardHeight = node.offsetHeight || 120;
    let targetTopY = currentBottomY - cardHeight;

    // Calculate visual transformation
    let transformY = targetTopY;
    let z = 0;
    let xOffset = 0;
    let scale = 1;
    let opacity = 1;

    // Apply Curve Logic
    if (transformY < curveThresholdY) {
      // It's in the "Curve Area"
      const excess = curveThresholdY - transformY;

      // Compress the Y space in the curve area to create depth illusion
      transformY = curveThresholdY - excess * 0.4;

      z = -(excess * 5); // Move deep into background
      xOffset = Math.pow(excess, 1.1) * 0.2; // Slide slightly right

      // Scale down
      scale = Math.max(0, 1 - excess * 0.002);
      opacity = Math.max(0, 1 - excess * 0.003);
    } else {
      // Standard Stack Area (Near User)
      // Visual feedback for cards below the input box (hidden by input dock)
      z = 0 - (Math.max(0, targetTopY - curveThresholdY) * 0.1); 
      scale = 1;
    }

    if (opacity <= 0.05) {
      node.style.opacity = 0;
      node.style.visibility = "hidden";
    } else {
      node.style.opacity = opacity;
      node.style.visibility = "visible";
    }

    node.style.transform = `translate(-50%, 0) translate3d(${xOffset}px, ${transformY}px, ${z}px) scale(${scale})`;

    // Stacking: Newest message should be on top.
    node.style.zIndex = 100 - reverseIndex;
    
    // Update currentBottomY for the NEXT item (which is above this one)
    currentBottomY -= (cardHeight + GAP);
  }
}

/* === LOGIC: SUBMIT === */
async function handleSubmit() {
  const inp = document.getElementById("inputBox");
  const text = inp.value.trim();
  if (!text) return;

  inp.value = "";

  if (activeScene === "chat") {
    // Optimistic UI
    chatMessages.push({ type: "user", text: text });
    renderChat();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }), // Adjust payload according to API
      });

      if (res.ok) {
        // Assuming JSON for now based on previous files.
        const data = await res.json();
        console.log("Chat API Response:", data);
        const aiText = data.message || RESOURCES[currentLang].ai_resp; // Fixed key: message

        chatMessages.push({ type: "ai", text: aiText });
        renderChat();
      }
    } catch (e) {
      console.error(e);
      chatMessages.push({ type: "ai", text: "..." });
      renderChat();
    }
  } else {
    // Diary
    createPost(text);
  }
}

/* === LOGIC: DIARY / POSTS === */
async function fetchAndRenderDiary() {
  const grid = document.getElementById("diaryGrid");
  grid.innerHTML =
    '<div style="text-align:center;width:100%;">Loading...</div>'; // Simple loader

  try {
    const res = await fetch("/api/posts");
    if (res.ok) {
      const posts = await res.json();
      renderDiaryGrid(posts);
    }
  } catch (e) {
    console.error(e);
    grid.innerHTML = "Error loading memories.";
  }
}

function renderDiaryGrid(posts) {
  const grid = document.getElementById("diaryGrid");
  grid.innerHTML = "";

  // Icons
  const icons = ["🌸", "✨", "💎", "🔑", "🕊️"];

  posts.forEach((post) => {
    // Random visual attrs (should perform deterministically if possible, but random ok for now)
    const rot = (Math.random() * 4 - 2).toFixed(1);
    const icon = icons[Math.floor(Math.random() * icons.length)];

    const el = document.createElement("div");
    el.className = "polaroid";
    el.style.transform = `rotate(${rot}deg)`;

    const dateStr = post.createdAt
      ? RESOURCES[currentLang].dateFormat(post.createdAt)
      : "";
    const safeContent = (post.content || "").replace(/</g, "&lt;");

    // Delete button if owner
    let delBtn = "";
    if (currentUser && post.author && post.author.id === currentUser.id) {
      delBtn = `<button class="del-btn" onclick="deletePost('${post.id}', this)">×</button>`;
    }

    el.innerHTML = `
            ${delBtn}
            <div class="polaroid-img-placeholder">${icon}</div>
            <div class="polaroid-text">${safeContent}</div>
            <div class="polaroid-date">${dateStr}</div>
        `;
    grid.prepend(el); // Newest first? usually API returns sorted. if API sorts by new, append. if API old first, prepend.
    // Let's assume API list is New->Old or Old->New. `prepend` reverses order of iteration.
    // If API is Old->New (default log), `prepend` makes Newest at top.
  });
}

async function createPost(text) {
  try {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });

    if (res.ok) {
      // Refresh
      fetchAndRenderDiary();

      // Animation?
      // For now simple refresh is reliable.
    }
  } catch (e) {
    console.error(e);
  }
}

async function deletePost(id, btn) {
  if (!confirm("Are you sure?")) return;

  try {
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      btn.closest(".polaroid").remove();
    }
  } catch (e) {
    console.error(e);
  }
}

async function saveToDiaryFromChat(btn, text) {
  // Visual Feedback
  const card = btn.closest(".card");

  // Clone Animation (Flying Polaroid)
  const clone = card.cloneNode(true);
  const rect = card.getBoundingClientRect();
  clone.style.position = "fixed";
  clone.style.left = rect.left + "px";
  clone.style.top = rect.top + "px";
  clone.style.width = rect.width + "px";
  clone.style.zIndex = 2000;
  clone.style.transition = "all 0.8s ease";
  clone.style.boxShadow = "0 20px 50px rgba(0,0,0,0.2)";
  clone.querySelector(".card-action").style.display = "none";
  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    const chestRect = document
      .getElementById("chestTarget")
      .getBoundingClientRect();
    clone.style.transform = "scale(0.05) rotate(720deg)";
    clone.style.opacity = "0";
    clone.style.left = chestRect.left + "px";
    clone.style.top = chestRect.top + "px";
  });
  setTimeout(() => clone.remove(), 800);

  // Actual API Call
  await createPost(text);

  // If not in diary scene, we don't need to refresh grid immediately,
  // but `createPost` calls `fetchAndRenderDiary`. That's fine.
}

/* === UTILS === */
// CSS for PopIn provided in CSS file or here?
// CSS file handles font and layout. Animations like popIn can be in CSS too or inline.
// Adding PopIn keyframes to JS if needed, but style.css is better.
// Assuming style.css handles base.
