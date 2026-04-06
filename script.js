const output = document.getElementById("output");

const sequence = [
  { type: "command", text: "connect --secure" },
  { type: "output", text: "Establishing secure connection"},
  { type: "output", text: "Encrypting channel" },
  { type: "output_nodot", text: "Handshake complete" },

  { type: "output", text: "Authenticating user"},
  { type: "output_nodot", text: "Credentials verified" },
  { type: "output_nodot", text: "Access granted" },

  { type: "output", text: "Loading interface modules"},
  { type: "output", text: "Initializing renderer"},
  { type: "output", text: "Starting UI" }
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

function typeCommand(content, textElement, callback) {
  let i = 0;

  function typeChar() {
    if (skip) {
      textElement.textContent = content;
      if (currentCursor) currentCursor.remove();
      setTimeout(callback, 50); // faster skip
      return;
    }

    if (i < content.length) {
      textElement.textContent += content[i];
      i++;
      setTimeout(typeChar, Math.random() * 15 + 10); // faster typing
    } else {
      // after finishing typing, keep cursor briefly
      setTimeout(() => {
        // only remove cursor after the linger delay
        setTimeout(() => {
          if (currentCursor) currentCursor.remove();
          currentCursor = null;

          callback(); // proceed to next sequence
        }, 600); // linger delay before cursor disappears
      }, 0);
    }
  }

  // tiny delay before starting typing (after prompt)
  setTimeout(typeChar, 100);
}


function animateDots(baseText, textElement, callback) {
  textElement.textContent = baseText;
  let dots = 0;

  function step() {
    if (skip) {
      textElement.textContent = baseText + "...";
      callback();
      return;
    }

    if (dots < 3) {
      textElement.textContent += ".";
      dots++;
      setTimeout(step, 200); // faster dot speed
    } else {
      setTimeout(callback, 150); // faster pause after dots
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

  if(index==1)
  {
    const textEl = createOutputLine();
    animateDots(item.text, textEl, () => runSequence(index + 1));
    skip = true;
    launchSite();
  }
  else if (item.type === "command") {
    const { text } = createCommandLine();
    typeCommand(item.text, text, () => runSequence(index + 1));
  } else if (item.type === "output") {

    const textEl = createOutputLine();
    animateDots(item.text, textEl, () => runSequence(index + 1));
  }
   else if (item.type === "output_nodot") {

    const { text } = createOutputNodotLine();
    typeCommand(item.text, text, () => runSequence(index + 1));
  }
}

// Transition to main site
function launchSite() {
  setTimeout(() => {
    document.getElementById("terminal").classList.add("fade-out");
    setTimeout(() => {
      document.getElementById("terminal").style.display = "none";
      document.getElementById("main").classList.remove("hidden");
    }, 800);
  }, 500);
}


document.getElementById("startPrompt").addEventListener("click", () => {
    // hide landing
    document.getElementById("landing").style.display = "none";

    // show terminal and start sequence
    document.getElementById("terminal").classList.remove("hidden");

    runSequence(); // your existing terminal boot animation


});