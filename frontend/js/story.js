const storyList = document.querySelector("[data-story-list]");
const storyName = document.querySelector("[data-story-name]");
const storyProse = document.querySelector("[data-story-prose]");
const storyAccessible = document.querySelector("[data-story-accessible]");
const storyCursor = document.querySelector("[data-story-cursor]");
const storyProgress = document.querySelector("[data-story-progress]");
const typewriterButton = document.querySelector("[data-typewriter]");
const narrationButton = document.querySelector("[data-narrate]");
const narrationPauseButton = document.querySelector("[data-narration-pause]");
const narrationStopButton = document.querySelector("[data-narration-stop]");
const narrationStatus = document.querySelector("[data-narration-status]");
const storyFigure = document.querySelector("[data-story-figure]");
const storyImage = document.querySelector("[data-story-image]");
const storyImageLink = document.querySelector("[data-story-image-link]");
const storyImageCatalog = document.querySelector("[data-story-image-catalog]");
const storyImageCredit = document.querySelector("[data-story-image-credit]");
const storyImageFallback = document.querySelector("[data-story-image-fallback]");
const voyagerMiles = document.querySelector("[data-voyager-miles]");
const voyagerKilometers = document.querySelector("[data-voyager-kilometers]");
const voyagerAu = document.querySelector("[data-voyager-au]");
const voyagerLightTime = document.querySelector("[data-voyager-light-time]");
const voyagerStatus = document.querySelector("[data-voyager-status]");
const voyagerIndicator = document.querySelector(".voyager-live");
const storySearch = document.querySelector("[data-story-search]");
const storyPageStatus = document.querySelector("[data-story-page]");
const previousStoriesButton = document.querySelector("[data-story-previous]");
const nextStoriesButton = document.querySelector("[data-story-next]");

const MILES_PER_KILOMETER = 0.621371;
const SPEED_OF_LIGHT_KM_S = 299792.458;
const EPHEMERIS_REFRESH_MS = 5 * 60 * 1000;
const STORIES_PER_PAGE = 10;
const distanceFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const auFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});
let voyagerEphemeris;
let voyagerReceivedAt;

let stories = [];
let filteredStories = [];
let storyPage = 0;
let currentStory;
let typingTimer;
let typingToken = 0;
let imageToken = 0;
let prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let narrationToken = 0;
let currentUtterance;
const narrationSupported =
  typeof window.speechSynthesis !== "undefined" &&
  typeof window.SpeechSynthesisUtterance === "function";

function createMissionStories(categories) {
  const perspectives = [
    {
      id: "first-look",
      title: "The First Look",
      type: "Arrival log",
      subtitle: (mission) => `A first-person field note from ${mission.place}.`,
      paragraphs: (mission) => [
        `My assignment was to ${mission.purpose}. In ${mission.year}, I reached ${mission.place}. From Earth, this destination had been a point on a screen and a question in a notebook; arrival made it possible to measure the place directly.`,
        `My measurements revealed ${mission.finding}. Each reading was only one part of a larger picture, limited by my route, my instruments, and the time available. The team compared those signals with observations made from Earth and from other spacecraft.`,
        `The hardest part was ${mission.challenge}. Even so, the mission helped ${mission.legacy}. A first look is never the whole story, but it gives the next explorer a better place to begin.`,
      ],
    },
    {
      id: "field-notes",
      title: "Reading the Data",
      type: "Science log",
      subtitle: (mission) => `What ${mission.name} could learn at ${mission.place}.`,
      paragraphs: (mission) => [
        `I was sent to ${mission.place} to ${mission.purpose}. The questions were written before launch, but the useful answers depended on what my instruments could actually record once I arrived in ${mission.year}.`,
        `The measurements pointed to ${mission.finding}. No single signal explained everything. Scientists checked the evidence, compared it with other observations, and kept the uncertainties visible instead of asking the data to say more than it could.`,
        `My work had to contend with ${mission.challenge}. The careful record nevertheless helped ${mission.legacy}. It is a small chapter in a much longer investigation, built from measurements that other missions can revisit.`,
      ],
    },
    {
      id: "at-the-limits",
      title: "At the Limits",
      type: "Operations log",
      subtitle: (mission) => `The practical challenge of working at ${mission.place}.`,
      paragraphs: (mission) => [
        `A destination is only part of a mission plan. In ${mission.year}, I was operating at ${mission.place}, carrying instruments meant to ${mission.purpose}. Commands had to be planned carefully, and the science team had to make each observation count.`,
        `The central difficulty was ${mission.challenge}. Spacecraft cannot improvise like people in a field, so engineers and scientists tested possible responses, watched the telemetry, and adjusted the plan when the evidence allowed.`,
        `Within those limits, I still recorded ${mission.finding}. That work helped ${mission.legacy}. The achievement was not that every obstacle disappeared; it was that the mission returned useful evidence despite them.`,
      ],
    },
    {
      id: "long-echo",
      title: "The Long Echo",
      type: "Legacy log",
      subtitle: (mission) => `What the mission left behind after ${mission.year}.`,
      paragraphs: (mission) => [
        `Long after ${mission.year}, the record from ${mission.name} can still be opened and examined. I went to ${mission.place} to ${mission.purpose}, but a mission's work does not end when its last command is sent.`,
        `The observations describe ${mission.finding}. They are not a complete portrait of the destination; they are evidence gathered from one path, with all the strengths and limits of the instruments that traveled it.`,
        `The mission also had to work through ${mission.challenge}. Its longer legacy is that it helped ${mission.legacy}. Future explorers begin with that record, ask new questions, and carry the investigation farther.`,
      ],
    },
  ];

  return categories.flatMap((category) =>
    category.missions.flatMap((mission) =>
      perspectives.map((perspective) => ({
        id: `${mission.id}-${perspective.id}`,
        name: `${mission.name} — ${perspective.title}`,
        type: `${mission.type} · ${perspective.type}`,
        era: `${mission.year} · ${mission.place}`,
        location: mission.place.toLocaleUpperCase(),
        subtitle: perspective.subtitle(mission),
        paragraphs: perspective.paragraphs(mission),
        sourceLabel: category.sourceLabel,
        sourceUrl: category.sourceUrl,
      })),
    ),
  );
}

function renderStoryList() {
  storyList.replaceChildren();
  const start = storyPage * STORIES_PER_PAGE;
  const pageStories = filteredStories.slice(start, start + STORIES_PER_PAGE);

  pageStories.forEach((story) => {
    storyList.append(createStoryChoice(story, stories.indexOf(story)));
  });

  const end = Math.min(start + STORIES_PER_PAGE, filteredStories.length);
  storyPageStatus.textContent = filteredStories.length
    ? `${start + 1}–${end} of ${filteredStories.length}`
    : "No matching stories";
  previousStoriesButton.disabled = storyPage === 0;
  nextStoriesButton.disabled = end >= filteredStories.length;

  if (!pageStories.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "story-list-empty";
    emptyState.textContent = "No stories match your search.";
    storyList.append(emptyState);
  }
}

function filterStories() {
  const searchTerm = storySearch.value.trim().toLocaleLowerCase();
  filteredStories = stories.filter((story) =>
    `${story.name} ${story.type} ${story.era} ${story.location} ${story.subtitle}`
      .toLocaleLowerCase()
      .includes(searchTerm),
  );
  storyPage = 0;
  renderStoryList();
}

function stopNarration(message = "Narration stopped.") {
  narrationToken += 1;
  if (narrationSupported) window.speechSynthesis.cancel();
  currentUtterance = undefined;
  narrationButton.textContent = "Listen to story";
  narrationPauseButton.disabled = true;
  narrationPauseButton.textContent = "Pause";
  narrationStopButton.disabled = true;
  if (message) narrationStatus.textContent = message;
}

function startNarration() {
  if (!narrationSupported || !currentStory) return;
  const token = ++narrationToken;
  window.speechSynthesis.cancel();
  const utterance = new window.SpeechSynthesisUtterance(
    `${currentStory.name}. ${currentStory.paragraphs.join(" ")}`,
  );
  utterance.lang = document.documentElement.lang || navigator.language;
  utterance.rate = 0.95;
  currentUtterance = utterance;
  narrationButton.textContent = "Listen again";
  narrationPauseButton.disabled = false;
  narrationPauseButton.textContent = "Pause";
  narrationStopButton.disabled = false;
  narrationStatus.textContent = "Starting narration…";

  utterance.onstart = () => {
    if (token === narrationToken) narrationStatus.textContent = "Narration playing.";
  };
  utterance.onend = () => {
    if (token !== narrationToken) return;
    currentUtterance = undefined;
    narrationButton.textContent = "Listen again";
    narrationPauseButton.disabled = true;
    narrationPauseButton.textContent = "Pause";
    narrationStopButton.disabled = true;
    narrationStatus.textContent = "Narration finished.";
  };
  utterance.onerror = (event) => {
    if (token !== narrationToken || event.error === "canceled" || event.error === "interrupted") {
      return;
    }
    currentUtterance = undefined;
    narrationPauseButton.disabled = true;
    narrationStopButton.disabled = true;
    narrationButton.textContent = "Try narration again";
    narrationPauseButton.textContent = "Pause";
    narrationStatus.textContent = "Narration could not start. Try another browser voice or device.";
  };
  window.speechSynthesis.speak(utterance);
}

function toggleNarrationPause() {
  if (!narrationSupported || !currentUtterance) return;
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    narrationPauseButton.textContent = "Pause";
    narrationStatus.textContent = "Narration playing.";
  } else if (window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
    narrationPauseButton.textContent = "Resume";
    narrationStatus.textContent = "Narration paused.";
  }
}

function finishTyping(token = typingToken) {
  if (token !== typingToken || !currentStory) return;
  window.clearTimeout(typingTimer);
  const paragraphs = [...storyProse.querySelectorAll("p")];
  currentStory.paragraphs.forEach((text, index) => {
    paragraphs[index].textContent = text;
  });
  storyCursor.hidden = true;
  typewriterButton.textContent = "Read again";
  storyProgress.textContent = "Transmission complete";
}

function beginTyping() {
  typingToken += 1;
  const token = typingToken;
  window.clearTimeout(typingTimer);

  storyProse.replaceChildren();
  currentStory.paragraphs.forEach(() => {
    const paragraph = document.createElement("p");
    storyProse.append(paragraph);
  });

  if (prefersReducedMotion.matches) {
    finishTyping(token);
    return;
  }

  typewriterButton.textContent = "Skip the typewriter";
  storyProgress.textContent = "Receiving transmission…";
  storyCursor.hidden = false;
  let paragraphIndex = 0;
  let characterIndex = 0;
  const paragraphs = [...storyProse.querySelectorAll("p")];
  const characters = currentStory.paragraphs.map((text) => Array.from(text));

  function typeNextCharacter() {
    if (token !== typingToken) return;
    while (
      paragraphIndex < characters.length &&
      characterIndex >= characters[paragraphIndex].length
    ) {
      paragraphIndex += 1;
      characterIndex = 0;
    }

    if (paragraphIndex >= characters.length) {
      finishTyping(token);
      return;
    }

    paragraphs[paragraphIndex].textContent += characters[paragraphIndex][characterIndex];
    characterIndex += 1;
    typingTimer = window.setTimeout(typeNextCharacter, 17);
  }

  typeNextCharacter();
}

function createStoryChoice(story, index) {
  const button = document.createElement("button");
  button.className = "story-choice";
  button.type = "button";
  button.dataset.storyId = story.id;
  button.setAttribute("aria-pressed", "false");

  const number = document.createElement("span");
  number.className = "story-choice-number";
  number.textContent = String(index + 1).padStart(3, "0");

  const copy = document.createElement("span");
  copy.className = "story-choice-copy";
  const name = document.createElement("span");
  name.className = "story-choice-name";
  name.textContent = story.name;
  const meta = document.createElement("span");
  meta.className = "story-choice-meta";
  meta.textContent = story.type;
  copy.append(name, meta);
  button.append(number);
  if (story.image) {
    const image = document.createElement("img");
    image.className = "story-choice-image";
    image.src = story.image.url;
    image.alt = "";
    image.loading = "lazy";
    image.setAttribute("aria-hidden", "true");
    image.addEventListener("error", () => {
      image.hidden = true;
    });
    button.append(image);
  } else {
    button.classList.add("story-choice-no-image");
  }
  button.append(copy);
  button.addEventListener("click", () => selectStory(story.id, true));
  return button;
}

function selectStory(storyId, updateUrl) {
  const story = stories.find((item) => item.id === storyId);
  if (!story) return;
  const filteredIndex = filteredStories.indexOf(story);
  if (filteredIndex >= 0) {
    const targetPage = Math.floor(filteredIndex / STORIES_PER_PAGE);
    if (targetPage !== storyPage) {
      storyPage = targetPage;
      renderStoryList();
    }
  }
  if (currentUtterance || window.speechSynthesis?.speaking) {
    stopNarration("Narration stopped because you selected another story.");
  }
  currentStory = story;
  document.querySelector("[data-story-era]").textContent =
    `FIELD NOTE ${String(stories.indexOf(story) + 1).padStart(3, "0")} · ${story.era}`;
  document.querySelector("[data-story-location]").textContent = story.location;
  storyName.textContent = story.name;
  document.querySelector("[data-story-subtitle]").textContent = story.subtitle;
  storyAccessible.textContent = story.paragraphs.join("\n\n");

  const source = document.querySelector("[data-story-source]");
  source.href = story.sourceUrl;
  source.textContent = `Read ${story.sourceLabel} ↗`;

  imageToken += 1;
  const selectedImageToken = imageToken;
  storyFigure.hidden = !story.image;
  if (story.image) {
    storyImage.hidden = false;
    storyImageFallback.hidden = true;
    storyImage.alt = story.image.alt;
    storyImage.onload = () => {
      if (selectedImageToken !== imageToken) return;
      storyImage.hidden = false;
      storyImageFallback.hidden = true;
    };
    storyImage.onerror = () => {
      if (selectedImageToken !== imageToken) return;
      storyImage.hidden = true;
      storyImageFallback.hidden = false;
    };
    storyImageLink.href = story.image.catalogUrl;
    storyImageCatalog.href = story.image.catalogUrl;
    storyImageCatalog.textContent = story.image.title;
    storyImageCredit.textContent = story.image.credit;
    storyImage.src = story.image.url;
  }

  storyList.querySelectorAll("[data-story-id]").forEach((button) => {
    const selected = button.dataset.storyId === story.id;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  if (updateUrl) {
    history.replaceState(null, "", `?story=${encodeURIComponent(story.id)}`);
  }
  beginTyping();
}

function updateVoyagerCounter() {
  if (!voyagerEphemeris) return;
  const elapsedSeconds = Math.max(0, (Date.now() - voyagerReceivedAt) / 1000);
  const distanceKm =
    voyagerEphemeris.distanceKm + voyagerEphemeris.rangeRateKmS * elapsedSeconds;
  const distanceAu = distanceKm / 149597870.7;
  const distanceMiles = distanceKm * MILES_PER_KILOMETER;
  const lightTimeHours = distanceKm / SPEED_OF_LIGHT_KM_S / 3600;

  voyagerMiles.textContent = distanceFormatter.format(distanceMiles);
  voyagerKilometers.textContent = `${distanceFormatter.format(distanceKm)} km`;
  voyagerAu.textContent = `${auFormatter.format(distanceAu)} AU`;
  voyagerLightTime.textContent = `${lightTimeHours.toFixed(1)} hours`;
}

async function loadVoyagerEphemeris() {
  try {
    const response = await fetch("/api/voyager", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Could not load Voyager's latest ephemeris.");
    }

    const ephemerisTime = Date.parse(data.ephemerisAt);
    if (
      !Number.isFinite(ephemerisTime) ||
      !Number.isFinite(data.distanceKm) ||
      !Number.isFinite(data.distanceAu) ||
      !Number.isFinite(data.rangeRateKmS)
    ) {
      throw new Error("JPL Horizons returned incomplete Voyager telemetry.");
    }

    voyagerEphemeris = data;
    voyagerReceivedAt = ephemerisTime;
    updateVoyagerCounter();
    voyagerStatus.classList.remove("is-error");
    voyagerIndicator.classList.remove("is-stale");
    const ephemerisLabel = new Date(data.ephemerisAt).toLocaleString(undefined, {
      timeZone: "UTC",
      dateStyle: "medium",
      timeStyle: "short",
    });
    voyagerStatus.textContent =
      `JPL Horizons epoch: ${ephemerisLabel} UTC · estimate updates every second.`;
  } catch (error) {
    console.error("Voyager ephemeris could not be loaded:", error);
    voyagerIndicator.classList.add("is-stale");
    voyagerStatus.classList.add("is-error");
    voyagerStatus.textContent = voyagerEphemeris
      ? "Could not refresh Horizons data; showing the latest available estimate."
      : error instanceof Error
        ? error.message
        : "Voyager's distance is temporarily unavailable.";
  }
}

async function start() {
  storySearch.addEventListener("input", filterStories);
  previousStoriesButton.addEventListener("click", () => {
    storyPage -= 1;
    renderStoryList();
  });
  nextStoriesButton.addEventListener("click", () => {
    storyPage += 1;
    renderStoryList();
  });

  if (!narrationSupported) {
    narrationButton.disabled = true;
    narrationPauseButton.disabled = true;
    narrationStopButton.disabled = true;
    narrationStatus.textContent =
      "Audio narration is not supported by this browser. You can still read the story.";
  }

  narrationButton.addEventListener("click", () => {
    if (currentUtterance && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      narrationPauseButton.textContent = "Pause";
      narrationStatus.textContent = "Narration playing.";
      return;
    }
    startNarration();
  });
  narrationPauseButton.addEventListener("click", toggleNarrationPause);
  narrationStopButton.addEventListener("click", () => stopNarration());

  typewriterButton.addEventListener("click", () => {
    if (typewriterButton.textContent === "Skip the typewriter") {
      finishTyping();
    } else {
      beginTyping();
    }
  });

  prefersReducedMotion.addEventListener("change", (event) => {
    if (event.matches && currentStory) finishTyping();
  });

  loadVoyagerEphemeris();
  window.setInterval(updateVoyagerCounter, 1000);
  window.setInterval(loadVoyagerEphemeris, EPHEMERIS_REFRESH_MS);

  try {
    const [storiesResponse, bankResponse] = await Promise.all([
      fetch("data/stories.json"),
      fetch("data/stories-bank.json"),
    ]);
    if (!storiesResponse.ok) {
      throw new Error(`Could not load mission stories (${storiesResponse.status}).`);
    }
    if (!bankResponse.ok) {
      throw new Error(`Could not load the extended story archive (${bankResponse.status}).`);
    }
    const originalStories = await storiesResponse.json();
    const storyCategories = await bankResponse.json();
    const missionRecords = Array.isArray(storyCategories)
      ? storyCategories.flatMap((category) =>
          Array.isArray(category?.missions) ? category.missions : [],
        )
      : [];
    const missionIds = missionRecords.map((mission) => mission?.id);
    const requiredMissionFields = [
      "id",
      "name",
      "type",
      "year",
      "place",
      "purpose",
      "finding",
      "challenge",
      "legacy",
    ];
    if (
      !Array.isArray(originalStories) ||
      originalStories.length !== 6 ||
      !Array.isArray(storyCategories) ||
      storyCategories.some(
        (category) =>
          !category ||
          typeof category.category !== "string" ||
          !Array.isArray(category.missions) ||
          typeof category.sourceLabel !== "string" ||
          typeof category.sourceUrl !== "string" ||
          !category.sourceUrl.startsWith("https://"),
      ) ||
      missionRecords.length !== 50 ||
      missionRecords.some(
        (mission) =>
          !mission ||
          requiredMissionFields.some(
            (field) =>
              typeof mission[field] !== "string" || !mission[field].trim(),
          ),
      ) ||
      new Set(missionIds).size !== missionIds.length
    ) {
      throw new Error("The mission story archive is incomplete.");
    }
    const additionalStories = createMissionStories(storyCategories);
    stories = [...originalStories, ...additionalStories];
    if (
      additionalStories.length !== 200 ||
      stories.length !== 206 ||
      stories.some(
        (story) =>
          typeof story.id !== "string" ||
          !story.name ||
          !Array.isArray(story.paragraphs) ||
          story.paragraphs.length !== 3 ||
          story.paragraphs.some((paragraph) => !paragraph.trim()),
      ) ||
      new Set(stories.map((story) => story.id)).size !== stories.length
    ) {
      throw new Error("The mission story archive is incomplete.");
    }

    document.querySelector("[data-story-count]").textContent =
      `${stories.length} STORIES`;
    filteredStories = stories;
    const requestedStory = new URLSearchParams(window.location.search).get("story");
    const initialStory = stories.some((story) => story.id === requestedStory)
      ? requestedStory
      : stories[0].id;
    storyPage = Math.floor(
      stories.findIndex((story) => story.id === initialStory) / STORIES_PER_PAGE,
    );
    renderStoryList();
    selectStory(initialStory, false);
  } catch (error) {
    console.error("Mission stories could not be loaded:", error);
    storyName.textContent = "The archive is unavailable";
    storyProgress.textContent =
      error instanceof Error ? error.message : "Please reload to try again.";
    typewriterButton.disabled = true;
    narrationButton.disabled = true;
    narrationPauseButton.disabled = true;
    narrationStopButton.disabled = true;
    narrationStatus.textContent = "Narration is unavailable because the story archive did not load.";
  }
}

start();