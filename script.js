// =============================================================================
// LOADING SCREEN MODULE
// =============================================================================

class LoadingScreen {
  constructor() {
    this.loadingScreen = document.getElementById("loadingScreen");
    this.spinner = this.loadingScreen?.querySelector(".spinner");
    this.loadingText = this.loadingScreen?.querySelector("p");

    this.isLoaded = false;
    this.minimumLoadTime = 2000;
    this.loadStartTime = Date.now();
    this.currentMessageIndex = 0;

    this.messages = [
      "Preparing a surprise...",
      "Setting up the party...",
      "Adding magical touches...",
      "Almost ready!",
    ];

    this.init();
  }

  init() {
    this.preloadResources();
    this.startMessageCycle();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.onDOMReady());
      window.addEventListener("load", () => this.onWindowLoad());
    } else {
      this.onDOMReady();
      if (document.readyState === "complete") {
        this.onWindowLoad();
      } else {
        window.addEventListener("load", () => this.onWindowLoad());
      }
    }
  }

  preloadResources() {
    const imagesToPreload = [
      "https://ik.imagekit.io/e3wiv79bq/huntrix-cake.png",
      "https://ik.imagekit.io/e3wiv79bq/invitation-preview.png",
    ];

    const promises = imagesToPreload.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = src;
      });
    });

    Promise.all(promises).then(() => console.log("Images preloaded"));
  }

  startMessageCycle() {
    if (!this.loadingText) return;

    this.messageInterval = setInterval(() => {
      if (this.isLoaded) return;
      this.currentMessageIndex =
        (this.currentMessageIndex + 1) % this.messages.length;
      this.updateLoadingMessage(this.messages[this.currentMessageIndex]);
    }, 1500);
  }

  updateLoadingMessage(message) {
    if (!this.loadingText) return;

    this.loadingText.style.opacity = "0";
    this.loadingText.style.transform = "translateY(-10px)";

    setTimeout(() => {
      this.loadingText.textContent = message;
      this.loadingText.style.opacity = "1";
      this.loadingText.style.transform = "translateY(0)";
    }, 300);
  }

  onDOMReady() {
    console.log("DOM ready");
  }

  onWindowLoad() {
    console.log("Window loaded");
    const loadTime = Date.now() - this.loadStartTime;
    const remainingTime = Math.max(0, this.minimumLoadTime - loadTime);

    setTimeout(() => this.hideLoadingScreen(), remainingTime);
  }

  hideLoadingScreen() {
    if (!this.loadingScreen || this.isLoaded) return;

    this.isLoaded = true;

    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }

    this.loadingScreen.classList.add("loading-complete");

    if (this.loadingText) {
      this.updateLoadingMessage("Welcome to the party! 🎉");
    }

    setTimeout(() => {
      this.loadingScreen.classList.add("fade-out");
      setTimeout(() => {
        if (this.loadingScreen.parentNode) {
          this.loadingScreen.style.display = "none";
        }
        this.onLoadingComplete();
      }, 800);
    }, 1000);
  }

  onLoadingComplete() {
    console.log("Loading complete - initializing app");

    if (typeof confetti !== "undefined") {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#9B4DFF", "#FF2D95", "#4BC9FF", "#FFD700"],
        });
      }, 500);
    }

    this.initializeApp();
  }

  initializeApp() {
    if (typeof tsParticles !== "undefined") {
      this.initParticles();
    }

    document.body.classList.add("loaded");
    window.dispatchEvent(new CustomEvent("loadingComplete"));
  }

  initParticles() {
    tsParticles.load("tsparticles", {
      fpsLimit: 30,
      particles: {
        color: { value: "#FF8FA3" },
        move: {
          enable: true,
          speed: 0.5,
          direction: "none",
          random: true,
          straight: false,
          outModes: { default: "out" },
        },
        number: { value: 100 },
        opacity: {
          value: { min: 0.1, max: 1 },
          animation: { enable: true, speed: 1, minimumValue: 0.1 },
        },
        shape: { type: "circle" },
        size: { value: { min: 0.5, max: 2 } },
      },
    });
  }

  forceHide() {
    this.hideLoadingScreen();
  }
}

// =============================================================================
// GUEST LIST MODULE
// =============================================================================

class GuestListManager {
  constructor() {
    this.checkGuestBtn = document.getElementById("checkGuestBtn");
    this.guestListContent = document.getElementById("guestListContent");
    this.guestCards = document.querySelectorAll(".guest-card");
    this.thankYouMessage = document.getElementById("thankYouMessage");

    // Debug logging
    // console.log('=== ELEMENT SELECTION DEBUG ===');
    // console.log('Check button found:', !!this.checkGuestBtn);
    // console.log('Content found:', !!this.guestListContent);
    // console.log('Cards found:', this.guestCards.length);
    // console.log('Thank you message found:', !!this.thankYouMessage);

    if (!this.checkGuestBtn || !this.guestListContent) {
      console.error("Critical elements not found!");
      return;
    }

    this.init();
  }

  init() {
    this.setupMobileToggle();
    this.setupIntersectionObserver();
    this.setupResizeHandler();
  }

  setupMobileToggle() {
    if (!this.checkGuestBtn || !this.guestListContent) return;

    this.checkGuestBtn.addEventListener("click", () => {
      this.guestListContent.classList.toggle("show");

      if (this.guestListContent.classList.contains("show")) {
        this.showGuestList();
      } else {
        this.hideGuestList();
      }
    });
  }

  showGuestList() {
    console.log("=== SHOW GUEST LIST DEBUG ===");
    console.log("Button element:", this.checkGuestBtn);
    console.log("Content element:", this.guestListContent);
    console.log("Button current HTML:", this.checkGuestBtn.innerHTML);
    console.log("Content current classes:", this.guestListContent.className);
    console.log(
      "Content current display:",
      getComputedStyle(this.guestListContent).display
    );

    // Update button text
    this.checkGuestBtn.innerHTML = `
            Hide Guest List
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <path d="m18 15-6-6-6 6"/>
            </svg>
        `;

    // console.log('Button HTML after update:', this.checkGuestBtn.innerHTML);

    // Force display change
    this.guestListContent.style.display = "block";
    console.log(
      "Content display after force:",
      getComputedStyle(this.guestListContent).display
    );

    setTimeout(() => {
      this.guestListContent.classList.add("visible");
      console.log(
        "Added visible class. Classes now:",
        this.guestListContent.className
      );
      this.animateCards();
      this.scrollToContent();
    }, 100);
  }

  hideGuestList() {
    this.checkGuestBtn.innerHTML = `
            Check Guest List
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <path d="m9 18 6-6-6-6"/>
            </svg>
        `;

    this.guestListContent.classList.remove("visible");
    this.guestCards.forEach((card) => card.classList.remove("visible"));
    this.thankYouMessage.classList.remove("visible");
  }

  animateCards() {
    this.guestCards.forEach((card, index) => {
      setTimeout(() => card.classList.add("visible"), index * 150);
    });

    setTimeout(() => {
      this.thankYouMessage.classList.add("visible");
    }, this.guestCards.length * 150 + 200);
  }

  scrollToContent() {
    setTimeout(() => {
      this.guestListContent.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const header = document.getElementById("guestListHeader");
            if (header) header.classList.add("visible");

            if (window.innerWidth > 768) {
              setTimeout(() => {
                this.guestListContent.classList.add("visible");
                this.animateCards();
              }, 300);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    const guestListSection = document.getElementById("guest-list-section");
    if (guestListSection) observer.observe(guestListSection);
  }

  setupResizeHandler() {
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        // Desktop: Always show content if visible class is present
        this.guestListContent.style.display = "block";
        if (this.guestListContent.classList.contains("visible")) {
          this.guestCards.forEach((card) => card.classList.add("visible"));
          this.thankYouMessage.classList.add("visible");
        }
      } else {
        // Mobile: Only hide if not manually shown by button
        if (!this.guestListContent.classList.contains("show")) {
          this.guestListContent.style.display = "none";
          this.guestListContent.classList.remove("visible");
          this.guestCards.forEach((card) => card.classList.remove("visible"));
          this.thankYouMessage.classList.remove("visible");
        }
      }
    });
  }
}

// =============================================================================
// STORY BOOK MODULE
// =============================================================================

class StoryBook {
  constructor() {
    this.stories = [
      {
        title: "My Birthday Adventure",
        image:
          "https://ik.imagekit.io/e3wiv79bq/cover.png",
        text: "Come along on a magical journey of my life and see what you might have missed from my birthdays!",
      },
      {
        title: "My First Birthday! 🎂",
        image: "https://placehold.co/600x400",
        text: "One year old and ready to explore!",
      },
      {
        title: "Two Years of Wonder! 🎈🎈",
        image: "https://placehold.co/600x400",
        text: "Two candles dancing in the breeze! I'm getting bigger and learning so many new things every day.",
      },
      {
        title: "Three and Free! 🌟🌟🌟",
        image: "https://placehold.co/600x400",
        text: "Three years of adventures! I can run, jump, and play.",
      },
      {
        title: "Fantastic Four! 🚀🚀🚀🚀",
        image: "https://placehold.co/600x400",
        text: "Four candles glowing bright!",
      },
      {
        title: "High Five for Five! 🖐️",
        image: "https://placehold.co/600x400",
        text: "Five years of growing and learning! I'm getting ready for big adventures and maybe even school soon!",
      },
      {
        title: "Super Six! 🦋🦋🦋🦋🦋🦋",
        image: "https://placehold.co/600x400",
        text: "Six wonderful years of birthdays!",
      },
      {
        title: "Time to Celebrate! 🎉✨",
        image:
          "https://ik.imagekit.io/e3wiv79bq/final-cover.png",
        text: "Get your party hats on, grab the confetti, and let's make this next birthday the happiest one yet! 🥳",
      },
    ];

    this.currentStory = 0;
    this.init();
  }

  init() {
    this.initializeIndicators();
    this.setupNextButton();
    this.setupIntersectionObserver();
  }

  initializeIndicators() {
    const indicator = document.getElementById("storyIndicator");
    if (!indicator) return;

    indicator.innerHTML = "";
    this.stories.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.className = "story-dot";
      if (index === 0) dot.classList.add("active");
      indicator.appendChild(dot);
    });
  }

  setupNextButton() {
    const nextButton = document.getElementById("nextButton");
    if (!nextButton) return;

    nextButton.addEventListener("click", () => {
      if (this.currentStory < this.stories.length - 1) {
        this.currentStory++;
        this.updateStory();
      } else {
        console.log("Moving to next section...");
      }
    });
  }

  updateStory() {
    const elements = {
      storyCard: document.getElementById("storyCard"),
      storyTitle: document.getElementById("storyTitle"),
      storyImage: document.getElementById("storyImage"),
      storyText: document.getElementById("storyText"),
      nextButton: document.getElementById("nextButton"),
    };

    if (!elements.storyCard) return;

    elements.storyCard.classList.add("turning");

    setTimeout(() => {
      const story = this.stories[this.currentStory];

      elements.storyTitle.textContent = story.title;
      elements.storyImage.src = story.image;
      elements.storyImage.alt = `Story illustration ${this.currentStory + 1}`;
      elements.storyText.textContent = story.text;

      this.updateIndicators();
      this.updateNextButton(elements.nextButton);

      elements.storyCard.classList.remove("turning");
    }, 300);
  }

  updateIndicators() {
    const dots = document.querySelectorAll(".story-dot");
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === this.currentStory);
    });
  }

  updateNextButton(button) {
    const isLastStory = this.currentStory === this.stories.length - 1;
    button.innerHTML = isLastStory
      ? `Continue to Party! <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`
      : `Next <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;

    if (isLastStory) {
      const eventSection = document.getElementById("event-details");
      eventSection.classList.add("visible");
      eventSection.scrollIntoView({ behavior: "smooth", block: "center" });

      const dressSection = document.getElementById("dress-code");
      dressSection.classList.add("visible");

      const rsvpSection = document.getElementById("rsvp-section");
      rsvpSection.classList.add("visible");

      const guestSection = document.getElementById("guest-list-section");
      guestSection.classList.add("visible");

      const footerSection = document.getElementById("footer-section");
      footerSection.classList.add("visible");
    }
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelector(".story-card")?.classList.add("visible");
        }
      });
    });

    const storySection = document.getElementById("story-section");
    if (storySection) observer.observe(storySection);
  }
}

// =============================================================================
// EVENT DETAILS MODULE
// =============================================================================

class EventDetailsManager {
  constructor() {
    this.eventDetails = {
      title: "Damaris Alexa's 7th Birthday Party",
      start: "2025-11-02T10:00:00",
      end: "2025-11-01T14:00:00",
      location:
        "Captain's Place (Private Pool and Events Place), 24XP+J63, Malvar, Batangas, Philippines",
      description:
        "Join us for an amazing birthday celebration with games, cake, and fun!",
    };

    this.init();
  }

  init() {
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const container = entry.target;
          container.classList.add("event-details-animated");

          setTimeout(
            () =>
              container
                .querySelector(".calendar-section")
                ?.classList.add("visible"),
            100
          );
          setTimeout(
            () =>
              container.querySelector(".map-section")?.classList.add("visible"),
            300
          );
          setTimeout(() => this.initializeCalendar(), 500);
        }
      });
    });

    const eventDetailsSection = document.getElementById("event-details");
    if (eventDetailsSection) observer.observe(eventDetailsSection);
  }

  initializeCalendar() {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl || typeof FullCalendar === "undefined") return;

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      initialDate: "2025-11-02",
      height: "auto",
      dayHeaderFormat: { weekday: "narrow" },
      headerToolbar: { left: "title", center: "", right: "" },
      events: [
        {
          title: this.eventDetails.title,
          start: this.eventDetails.start,
          end: this.eventDetails.end,
          backgroundColor: "#FF2D95",
          borderColor: "#FF2D95",
          textColor: "#FFFFFF",
        },
      ],
      eventClick: (info) => {
        info.jsEvent.preventDefault();
        alert(
          `🎉 ${
            info.event.title
          }\n📅 ${info.event.start.toLocaleDateString()}\n⏰ ${info.event.start.toLocaleTimeString()} - ${info.event.end.toLocaleTimeString()}`
        );
      },
    });

    calendar.render();
    this.setupCalendarButton();
  }

  setupCalendarButton() {
    const addToCalendarBtn = document.getElementById("addToCalendar");
    if (addToCalendarBtn) {
      addToCalendarBtn.addEventListener("click", () =>
        this.addToGoogleCalendar()
      );
    }
  }

  addToGoogleCalendar() {
    const startDate = new Date(this.eventDetails.start)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
    const endDate = new Date(this.eventDetails.end)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      this.eventDetails.title
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
      this.eventDetails.description
    )}&location=${encodeURIComponent(this.eventDetails.location)}`;

    window.open(googleCalendarUrl, "_blank");
  }
}

// =============================================================================
// RSVP & DRESS CODE MODULE
// =============================================================================

class RSVPManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupFormLoading();
    this.setupIntersectionObservers();
  }

  setupFormLoading() {
    const rsvpForm = document.getElementById("rsvpForm");
    const formLoading = document.getElementById("formLoading");

    setTimeout(() => {
      if (formLoading) formLoading.style.display = "none";
      if (rsvpForm) rsvpForm.style.display = "block";
    }, 2000);

    if (rsvpForm) {
      rsvpForm.addEventListener("load", () => {
        if (formLoading) formLoading.style.display = "none";
        rsvpForm.style.display = "block";
      });
    }
  }

  setupIntersectionObservers() {
    const rsvpObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rsvpCard = entry.target.querySelector(".rsvp-card");
            if (rsvpCard) rsvpCard.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const dressCodeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const header = entry.target.querySelector(".section-header");
            const colorTheme = entry.target.querySelector(".color-theme");
            const content = entry.target.querySelector(".dress-code-content");

            if (header) header.classList.add("visible");
            if (colorTheme)
              setTimeout(() => colorTheme.classList.add("visible"), 200);
            if (content)
              setTimeout(() => content.classList.add("visible"), 400);
          }
        });
      },
      { threshold: 0.1 }
    );

    const dressCodeSection = document.getElementById("dress-code");
    const rsvpSection = document.getElementById("rsvp-section");

    if (dressCodeSection) dressCodeObserver.observe(dressCodeSection);
    if (rsvpSection) rsvpObserver.observe(rsvpSection);
  }
}

// =============================================================================
// ENVELOPE INTERACTION MODULE
// =============================================================================

class EnvelopeManager {
  constructor() {
    this.envelope = document.getElementById("envelope");
    this.lid = document.getElementById("lid");
    this.lid1 = document.getElementById("lid1");
    this.letter = document.getElementById("letter");
    this.storybook = document.getElementById("story-section");
    this.openSound = document.getElementById("openSound");

    this.isEnvelopeOpened = false;
    this.isAnimating = false;

    this.init();
  }

  init() {
    if (this.envelope) {
      this.envelope.addEventListener("click", this.openEnvelope.bind(this), {
        passive: true,
      });
    }
  }

  openEnvelope() {
    if (this.isEnvelopeOpened || this.isAnimating) return;

    this.isAnimating = true;
    this.isEnvelopeOpened = true;

    if (this.lid1) this.lid1.style.display = "none";

    this.envelope.style.pointerEvents = "none";
    this.playSound(this.openSound);
    this.animateEnvelopeOpening();
  }

  animateEnvelopeOpening() {
    if (this.lid) this.lid.classList.add("open");

    setTimeout(() => {
      if (this.letter) this.letter.classList.add("visible");
    }, 500);

    setTimeout(() => {
      // Start music when envelope opens
      if (window.musicManager) {
        window.musicManager.startMusic();
      }

      // Additional envelope opening effects can be added here
      this.isAnimating = false;
    }, 1200);

    setTimeout(() => {
      // show storybook
      this.storybook.classList.add("visible");
      this.smoothScrollToStorybook();
    }, 2000);
  }

  playSound(audioElement) {
    if (audioElement) {
      audioElement.play().catch(() => {
        console.log("Audio play failed - user interaction required");
      });
    }
  }

  reset() {
    this.isEnvelopeOpened = false;
    this.isAnimating = false;

    if (this.envelope) this.envelope.style.pointerEvents = "auto";
    if (this.lid) this.lid.classList.remove("open");
    if (this.letter) this.letter.classList.remove("visible");
    if (this.lid1) this.lid1.style.display = "block";
  }

  smoothScrollToStorybook() {
    this.storybook.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// =============================================================================
// MUSIC CONTROLS MODULE
// =============================================================================

class MusicManager {
  constructor() {
    this.musicBtn = document.getElementById("musicBtn");
    this.bgMusic = document.getElementById("bgMusic");
    this.isMusicPlaying = false;

    this.init();
  }

  init() {
    if (this.musicBtn) {
      this.musicBtn.addEventListener("click", this.toggleMusic.bind(this), {
        passive: true,
      });
    }
  }

  toggleMusic() {
    if (!this.bgMusic) return;

    if (this.isMusicPlaying) {
      this.pauseMusic();
    } else {
      this.startMusic();
    }
  }

  startMusic() {
    if (!this.bgMusic || !this.musicBtn) return;

    this.bgMusic
      .play()
      .then(() => {
        this.musicBtn.classList.add("playing");
        this.isMusicPlaying = true;
      })
      .catch(() => {
        console.log("Auto-play prevented. User interaction required.");
      });
  }

  pauseMusic() {
    if (!this.bgMusic || !this.musicBtn) return;

    this.bgMusic.pause();
    this.musicBtn.classList.remove("playing");
    this.isMusicPlaying = false;
  }

  playSound(audioElement) {
    if (audioElement) {
      audioElement.play().catch(() => {
        console.log("Audio play failed - user interaction required");
      });
    }
  }

  setVolume(volume) {
    if (this.bgMusic) {
      this.bgMusic.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function showLoading(message = "Loading...") {
  const loadingEl = document.getElementById("loadingScreen");
  const textEl = loadingEl?.querySelector("p");

  if (loadingEl) {
    if (textEl) textEl.textContent = message;
    loadingEl.classList.remove("fade-out");
    loadingEl.style.display = "flex";
    loadingEl.style.opacity = "1";
    loadingEl.style.visibility = "visible";
  }
}

function hideLoading() {
  if (window.loadingScreen) {
    window.loadingScreen.forceHide();
  }
}

// =============================================================================
// APP INITIALIZATION
// =============================================================================

let loadingScreen;

function initializeApp() {
  loadingScreen = new LoadingScreen();
  const envelopeManager = new EnvelopeManager();
  const musicManager = new MusicManager();

  new GuestListManager();
  new StoryBook();
  new EventDetailsManager();
  new RSVPManager();

  // Make managers globally accessible
  window.loadingScreen = loadingScreen;
  window.envelopeManager = envelopeManager;
  window.musicManager = musicManager;
}

document.addEventListener("DOMContentLoaded", initializeApp);

if (document.readyState !== "loading") {
  initializeApp();
}

// Module exports for compatibility
if (typeof module !== "undefined" && module.exports) {
  module.exports = { LoadingScreen, showLoading, hideLoading };
}
