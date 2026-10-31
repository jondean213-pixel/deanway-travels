/* DeanWay Travels — lead form wiring.
 *
 * TO CONNECT THE COMMAND CENTER:
 * Paste your Google Apps Script web app URL between the quotes below.
 * The form POSTs the lead as JSON; your script should append a row
 * to the "DeanWay Travels Master Database" spreadsheet.
 */
var COMMAND_CENTER_URL = "https://script.google.com/macros/s/AKfycbw_qVZWlqwZgmK0D1LeK-D8RJUQGmvRGDVgkzg2MDxKN5yT768-TuXmc0x6Fpc0Q_mu/exec";

(function () {
  // Pre-select interest when coming from the "Sail with Jon" button
  document.querySelectorAll('[data-interest]').forEach(function (el) {
    el.addEventListener('click', function () {
      var sel = document.getElementById('interest');
      if (sel) sel.value = el.getAttribute('data-interest');
    });
  });

  var form = document.getElementById('lead-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v.trim(); });
    data.source = 'deanwaytravel.com website';
    data.submitted_at = new Date().toISOString();

    if (!data.name || !data.phone) {
      note('Please add your name and phone so Jon can reach you.', true);
      return;
    }

    if (!COMMAND_CENTER_URL) {
      // Not wired yet — don't lose the lead, point at Jon directly.
      note('Thanks ' + escapeHtml(data.name.split(' ')[0]) + '! The online form is being connected — ' +
           'please call or text <a href="tel:+18127467175"><strong>812-746-7175</strong></a> and Jon will take care of you personally.', false);
      return;
    }

    var btn = form.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    fetch(COMMAND_CENTER_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data)
    }).then(function () {
      showSuccess(data.name);
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = 'Send My Request';
      note('Hmm, that didn\'t go through. Please call or text <a href="tel:+18127467175"><strong>812-746-7175</strong></a> instead — Jon will help you directly.', true);
    });
  });

  function note(html, isError) {
    var n = document.getElementById('form-note');
    n.innerHTML = html;
    n.style.color = isError ? '#b3261e' : '';
    n.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showSuccess(name) {
    var first = escapeHtml((name || 'there').split(' ')[0]);
    form.outerHTML =
      '<div class="form-success"><h3>Thanks, ' + first + '! 🎉</h3>' +
      '<p>Your request is in. Jon will reach out personally — usually within a day.</p>' +
      '<p class="form-note">Can\'t wait? Call or text <a href="tel:+18127467175"><strong>812-746-7175</strong></a>.</p></div>';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();

/* ---- Gemma's voice ---- */
(function () {
  var voiceToggle = document.getElementById("voice-toggle");
  var gemmaAudio = null;

  function getAudio() {
    if (!gemmaAudio) {
      gemmaAudio = new Audio("assets/gemma-welcome.mp3");
      gemmaAudio.preload = "auto";
      gemmaAudio.addEventListener("ended", function () { setToggle(false); });
    }
    return gemmaAudio;
  }

  function setToggle(playing) {
    if (!voiceToggle) return;
    voiceToggle.textContent = playing ? "🔊" : "🔇";
    voiceToggle.classList.toggle("off", !playing);
    voiceToggle.setAttribute("aria-label", playing ? "Stop Gemma's voice" : "Hear Gemma's welcome");
  }

  if (voiceToggle) {
    voiceToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var a = getAudio();
      if (a.paused) {
        a.currentTime = 0;
        a.play().catch(function () {});
        setToggle(true);
      } else {
        a.pause();
        a.currentTime = 0;
        setToggle(false);
      }
    });
  }
})();

/* ---- Talk to Gemma ---- */
(function () {
  var log = document.getElementById("chat-log");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("chat-input");
  var voiceBtn = document.getElementById("chat-voice");
  var humanBtn = document.getElementById("chat-human");
  if (!log || !form || !input) return;

  var history = [];
  var voiceOn = true;

  function pickVoice() {
    try {
      var vs = speechSynthesis.getVoices();
      return vs.find(function (v) { return /^en/i.test(v.lang) && /google|natural|neural|samantha|zira|jenny|aria/i.test(v.name); })
          || vs.find(function (v) { return /^en[-_]US/i.test(v.lang); })
          || vs.find(function (v) { return /^en/i.test(v.lang); });
    } catch (e) { return null; }
  }
  if ("speechSynthesis" in window) {
    try {
      speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = function () { speechSynthesis.getVoices(); };
    } catch (e) {}
  }

  function speak(text) {
    if (!voiceOn || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 1; u.pitch = 1.05;
      var v = pickVoice();
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  if (voiceBtn) {
    voiceBtn.addEventListener("click", function () {
      voiceOn = !voiceOn;
      voiceBtn.classList.toggle("off", !voiceOn);
      voiceBtn.textContent = voiceOn ? "🔊" : "🔇";
      voiceBtn.setAttribute("aria-label", voiceOn ? "Mute Gemma's voice" : "Unmute Gemma's voice");
      if (!voiceOn) { try { speechSynthesis.cancel(); } catch (e) {} }
    });
  }

  if (humanBtn) {
    humanBtn.addEventListener("click", function () {
      addMsg("ai", "Of course — Jon is a real person and he'd love to talk. Call or text him at 812-746-7175, or leave your number in the Plan My Trip form below and he'll call you back, usually within a day.");
      speak("Of course — Jon is a real person and he'd love to talk. Call or text him at 8 1 2, 7 4 6, 7 1 7 5.");
    });
  }

  function addMsg(role, text) {
    var div = document.createElement("div");
    div.className = "chat-msg " + (role === "user" ? "user" : "ai");
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  addMsg("ai", "Hi, I'm Gemma. Ask me anything about DeanWay Travels — I write it here and say it out loud. Want a human? Tap 'Talk to a real person' anytime.");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMsg("user", text);
    history.push({ role: "user", content: text });
    var thinking = addMsg("ai", "Thinking…");
    thinking.classList.add("thinking");

    fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        thinking.remove();
        var reply = data.reply || "Sorry, I lost that — try again?";
        addMsg("ai", reply);
        speak(reply);
        history.push({ role: "assistant", content: reply });
      })
      .catch(function () {
        thinking.remove();
        addMsg("ai", "Hmm, I can't reach my brain right now. Call or text Jon at 812-746-7175 and he'll take care of you.");
      });
  });
})();
