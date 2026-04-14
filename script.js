const output = document.getElementById("output");

const sequence = [
  { type: "command", text: "connect --secure" },
  { type: "output", text: "Establishing secure connection"},
  { type: "output", text: "Encrypting channel" },
  { type: "output_nodot", text: "Handshake complete" },

  { type: "output", text: "Authenticating user"},
  { type: "output_nodot", text: "Credentials verified" },
  { type: "output_nodot", text: "Access granted" },

  { type: "output", text: "Loading assets"},
  { type: "output", text: "Initializing GUI"},
  { type: "output", text: "Loading user data" }
];

let currentCursor = null;
let skip = false;

// Create a command line with cursor
function createCommandLine() {
  if (currentCursor) currentCursor.remove();

  const line = document.createElement("div");
  const prompt = document.createElement("span");
  const text = document.createElement("span");
  const cursor = document.createElement("span");

  prompt.textContent = "root@system:~$ ";
  cursor.classList.add("cursor");

  line.appendChild(prompt);
  line.appendChild(text);
  line.appendChild(cursor);
  output.appendChild(line);

  currentCursor = cursor;

  return { line, text, cursor };
}

function createOutputNodotLine() {
  if (currentCursor) currentCursor.remove();

  const line = document.createElement("div");
  const prompt = document.createElement("span");
  const text = document.createElement("span");
  const cursor = document.createElement("span");

  prompt.textContent = "";
  cursor.classList.add("cursor");

  line.appendChild(prompt);
  line.appendChild(text);
  line.appendChild(cursor);
  output.appendChild(line);

  currentCursor = cursor;

  return { line, text, cursor };
}


// Create output line (no cursor) and animate dots
function createOutputLine() {
  const line = document.createElement("div");
  const text = document.createElement("span");
  line.appendChild(text);
  output.appendChild(line);
  return text;
}

function typeCommand(content, textElement, callback, instant = false) {

  if (instant) {
    textElement.textContent = content;
    if (currentCursor) currentCursor.remove();
    currentCursor = null;
    setTimeout(callback, 30);
    return;
  }

  let i = 0;

  function typeChar() {
    if (i < content.length) {
      textElement.textContent += content[i];
      i++;
      setTimeout(typeChar, Math.random() * 15 + 10);
    } else {
      setTimeout(() => {
        if (currentCursor) currentCursor.remove();
        currentCursor = null;
        setTimeout(callback, 150);
      }, 0);
    }
  }

  setTimeout(typeChar, 80);
}


function animateDots(baseText, textElement, callback, instant = false) {

  if (instant) {
    textElement.textContent = baseText + "...";
    setTimeout(callback, 20);
    return;
  }

  textElement.textContent = baseText;
  let dots = 0;

  function step() {
    if (dots < 3) {
      textElement.textContent += ".";
      dots++;
      setTimeout(step, 180);
    } else {
      setTimeout(callback, 120);
    }
  }

  step();
}
// Run sequence
function runSequence(index = 0) {
  if (index >= sequence.length) {
    launchSite();
    return;
  }


  const item = sequence[index];

  const isFirstPhase = index < 1;
  const isLastPhase = index === sequence.length - 1;
  const isInstant = !(isFirstPhase || isLastPhase);

  // small transition pause when entering "fast mode"
  if (index === 3) {
    setTimeout(() => processItem(), 200);
    return;
  }

  processItem();

  function processItem() {
    if (item.type === "command") {
      const { text } = createCommandLine();

      typeCommand(
        item.text,
        text,
        () => runSequence(index + 1),
        isInstant
      );

    } else if (item.type === "output") {
      const textEl = createOutputLine();

      animateDots(
        item.text,
        textEl,
        () => runSequence(index + 1),
        isInstant
      );

    } else if (item.type === "output_nodot") {
      const { text } = createOutputNodotLine();

      typeCommand(
        item.text,
        text,
        () => runSequence(index + 1),
        isInstant
      );
    }
  }
}
// Transition to main site
function launchSite() {
  setTimeout(() => {
    const terminal = document.getElementById("terminal");
    const appWindow = document.getElementById("appWindow");
    const cracks = document.getElementById("crackedOverlay");

    // fade out terminal
    terminal.style.opacity = 0;

    setTimeout(() => {
      terminal.style.display = "none";

      // show window
      appWindow.classList.remove("hidden");
      appWindow.classList.add("open");

      // REMOVE cracks effect
      cracks.style.opacity = 0;

    }, 500);

  }, 300);
}


document.getElementById("startPrompt").addEventListener("click", () => {
    // hide landing
    document.getElementById("landing").style.display = "none";

    // show terminal and start sequence
    document.getElementById("terminal").classList.remove("hidden");

    runSequence(); // your existing terminal boot animation


});



document.querySelectorAll(".projectCard").forEach(card => {
  const video = card.querySelector("video");

  card.addEventListener("mouseenter", () => {
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(err => {
      console.log("Video play blocked:", err);
    });
  });

  card.addEventListener("mouseleave", () => {
    if (!video) return;
    video.pause();
  });
});


document.querySelectorAll("#navBar a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    const targetId = link.getAttribute("href").substring(1);
    const target = document.getElementById(targetId);
    const container = document.getElementById("windowContent");

    if (target && container) {
      container.scrollTo({
        top: target.offsetTop,
        behavior: "smooth"
      });
    }
  });
});


document.querySelectorAll(".copyable").forEach(card => {
  card.addEventListener("click", async () => {
    const text = card.getAttribute("data-copy");

    try {
      await navigator.clipboard.writeText(text);

      card.classList.add("copied");

      setTimeout(() => {
        card.classList.remove("copied");
      }, 600);

    } catch (err) {
      console.log("Copy failed:", err);
    }
  });
});


const toast = document.getElementById("copyToast");

function showToast(message = "COPIED TO CLIPBOARD") {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 900);
}

document.querySelectorAll(".copyable").forEach(card => {
  card.addEventListener("click", async () => {
    const text = card.getAttribute("data-copy");

    try {
      await navigator.clipboard.writeText(text);

      card.classList.add("copied");
      showToast("COPIED");

      setTimeout(() => {
        card.classList.remove("copied");
      }, 600);

    } catch (err) {
      showToast("COPY FAILED");
    }
  });
});