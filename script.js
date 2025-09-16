class BirthdayInvitationController {
    constructor() {
        this.isEnvelopeOpened = false;
        this.isMusicPlaying = false;
        this.countdownInterval = null;
        this.giftBoxState = null;
        this.currentPage = 0;
        this.floatingConfettiInterval = null;
        this.currentConfettiCount = 0;

        this.rafId = null;
        this.isAnimating = false;
        this.throttledResize = this.throttle(this.handleResize.bind(this), 250);
        this.elements = {};

        this.init();
    }

    init() {
        this.cacheElements();
        this.setupLoadingScreen();
        this.setupEventListeners();
        this.setupCountdown();
        this.setupTouchSupport();
    }

    // Cache frequently used DOM elements
    cacheElements() {
        const elementIds = [
            'loadingScreen', 'mainContent', 'envelope', 'lid', 'letter',
            'lid1', 'storybook', 'inviteDetails', 'musicBtn', 'rsvpBtn',
            'shareBtn', 'openSound', 'bgMusic', 'rsvpModal', 'shareModal',
            'closeModal', 'closeShareModal', 'progressBar', 'giftBoxBtn',
            'giftBoxLid', 'jumpCharacter', 'days', 'hours', 'balloonsContainer',
            'invitationList'
        ];

        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }

    // Loading Screen
    setupLoadingScreen() {
        const { loadingScreen, mainContent } = this.elements;

        const showMainContent = () => {
            loadingScreen.classList.add('hidden');
            mainContent.classList.add('visible');

            setTimeout(() => {
                loadingScreen.remove();
            }, 700);
        };

        // Hide loader as soon as everything is ready
        window.addEventListener('load', showMainContent);
    }


    //  Event Listeners Setup
    setupEventListeners() {
        const { envelope, musicBtn, rsvpBtn, shareBtn } = this.elements;

        // Use passive listeners where possible
        envelope.addEventListener('click', this.openEnvelope.bind(this), { passive: true });
        envelope.addEventListener('keydown', this.handleEnvelopeKeydown.bind(this));

        musicBtn.addEventListener('click', this.toggleMusic.bind(this), { passive: true });
        // rsvpBtn.addEventListener('click', this.openRSVPModal.bind(this), { passive: true });
        // shareBtn.addEventListener('click', this.openShareModal.bind(this), { passive: true });

        this.setupModals();
        this.setupShareHandlers();

        // Use throttled resize handler
        window.addEventListener('resize', this.throttledResize, { passive: true });
        window.addEventListener('beforeunload', this.cleanup.bind(this));
    }

    handleEnvelopeKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.openEnvelope();
        }
    }

    // Envelope Opening
    openEnvelope() {
        if (this.isEnvelopeOpened || this.isAnimating) return;

        this.isAnimating = true;
        this.isEnvelopeOpened = true;

        const { envelope, lid, letter, openSound, lid1, storybook } = this.elements;
        if (lid1) lid1.style.display = 'none';

        // Disable envelope interaction
        envelope.style.pointerEvents = 'none';
        this.playSound(openSound);
        this.animateEnvelopeOpening(lid, letter, storybook);
    }

    animateEnvelopeOpening(lid, letter, storybook) {
        // Animate flap opening
        lid.classList.add('open');
        setTimeout(() => {
            letter.classList.add('visible');
        }, 500);

        setTimeout(() => {
            storybook.classList.add('visible');
            this.showStoryBook();
            this.startMusic();
            this.smoothScrollToStorybook(storybook);
            this.triggerBirthdayConfetti();
            this.isAnimating = false;
        }, 1200);
    }

    smoothScrollToStorybook(storybook) {
        this.rafId = requestAnimationFrame(() => {
            storybook.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    playSound(audioElement) {
        if (audioElement) {
            audioElement.play().catch(() => {
                console.log('Audio play failed - user interaction required');
            });
        }
    }

    showInvitationAfterStory() {
        const { inviteDetails, invitationList } = this.elements;

        setTimeout(() => {
            inviteDetails.classList.add('visible');
            invitationList.classList.add('visible');
            setTimeout(() => {
                window.scrollBy({ top: 800, behavior: 'smooth' });
            }, 100);
        }, 1000);
    }

    smoothScrollToElement(element, offset = 0) {
        this.rafId = requestAnimationFrame(() => {
            const elementTop = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementTop - offset,
                behavior: 'smooth'
            });
        });
    }

    //  Story Book
    showStoryBook() {
        const initState = {
            move: "move",
            jump: "",
            rotated: "",
            rotating: ""
        };

        if (!this.giftBoxState) {
            this.giftBoxState = { ...initState };
        }
        if (!this.currentPage) {
            this.currentPage = 0;
        }

        // cache DOM queries
        const pages = document.querySelectorAll('.page');
        const totalPages = pages.length;
        const { progressBar, giftBoxBtn, giftBoxLid, jumpCharacter } = this.elements;

        // gift box functions
        const updateGiftBoxState = (newState) => {
            this.giftBoxState = { ...this.giftBoxState, ...newState };
            this.applyGiftBoxClasses(giftBoxLid, jumpCharacter);
        };

        const animateGiftBox = () => {
            const isDone = this.giftBoxState.rotated === "rotated";

            if (!isDone) {
                updateGiftBoxState({ rotating: "rotating" });

                setTimeout(() => {
                    updateGiftBoxState({ jump: "jump" });
                    // this.triggerBirthdayConfetti();
                }, 300);

                setTimeout(() => {
                    updateGiftBoxState({ rotated: "rotated" });
                    nextPage();
                    setTimeout(closeGiftBox, 700);
                }, 700);
            } else {
                updateGiftBoxState(initState);
                nextPage();
            }

            const moving = this.giftBoxState.move === "move" ? "" : "move";
            updateGiftBoxState({ move: moving });
        };

        const closeGiftBox = () => {
            if (this.giftBoxState.rotated === "rotated") {
                updateGiftBoxState({ jump: "" });

                if (giftBoxLid) {
                    giftBoxLid.style.animation = "rotating-back 0.7s ease-out forwards";
                    setTimeout(() => {
                        updateGiftBoxState(initState);
                        giftBoxLid.style.animation = "";
                    }, 700);
                }
            }
        };

        const updateProgress = () => {
            if (progressBar) {
                const progress = (this.currentPage / (totalPages - 1)) * 100;
                progressBar.style.width = progress + '%';
            }
        };

        const showPage = (pageIndex) => {
            pages.forEach((page, index) => {
                page.classList.remove('active', 'prev');
                if (index === pageIndex) {
                    page.classList.add('active');
                } else if (index < pageIndex) {
                    page.classList.add('prev');
                }
            });
            updateProgress();
        };

        const nextPage = () => {
            this.currentPage = (this.currentPage + 1) % totalPages;
            showPage(this.currentPage);

            if (this.currentPage === totalPages - 1) {
                setTimeout(() => {
                    this.showInvitationAfterStory();
                }, 1000);
            }
        };

        // event listener setup
        if (giftBoxBtn && !giftBoxBtn.hasAttribute('data-listener-added')) {
            giftBoxBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                animateGiftBox();
            }, { passive: true });
            giftBoxBtn.setAttribute('data-listener-added', 'true');
        }

        // Initialize display
        if (totalPages > 0) {
            showPage(0);
            updateProgress();
            this.applyGiftBoxClasses(giftBoxLid, jumpCharacter);
        }
    }

    // gift box class application
    applyGiftBoxClasses(giftBoxLid, jumpCharacter) {
        const { move, jump, rotated, rotating } = this.giftBoxState;

        if (giftBoxLid) {
            giftBoxLid.className = `gift-lid ${move} ${rotating} ${rotated}`.trim();
        }

        if (jumpCharacter) {
            jumpCharacter.className = `jump-character ${jump}`.trim();
        }
    }

    // Birthday Confetti
    triggerBirthdayConfetti() {
        if (!window.confetti) return;

        const duration = 500;
        const animationEnd = Date.now() + duration;
        const colors = ['#ff6b35', '#ffd23f', '#4ecdc4', '#45b7d1', '#fd79a8', '#6c5ce7'];

        const confettiInterval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(confettiInterval);
                return;
            }

            const particleCount = Math.floor(30 * (timeLeft / duration));
            this.createConfettiBurst(particleCount, colors, 0.1, 0.3);
            this.createConfettiBurst(particleCount, colors, 0.7, 0.9);
        }, 1250);

        // Delayed special effects
        setTimeout(() => this.createSpecialConfetti(colors), 1000);
        setTimeout(() => this.createBalloonBurst(colors), 2000);
    }

    createConfettiBurst(particleCount, colors, minX, maxX) {
        if (window.confetti) {
            confetti({
                particleCount,
                startVelocity: 35,
                spread: 70,
                origin: { x: this.randomInRange(minX, maxX), y: Math.random() - 0.2 },
                colors: colors,
                shapes: ['circle', 'square'],
                ticks: 80
            });
        }
    }

    createSpecialConfetti(colors) {
        if (window.confetti) {
            confetti({
                particleCount: 50,
                spread: 100,
                origin: { y: 0.6 },
                shapes: ['circle'],
                colors: ['#ff6b35', '#ffd23f', '#fd79a8'],
                startVelocity: 45,
                gravity: 0.8
            });
        }
    }

    createBalloonBurst(colors) {
        if (window.confetti) {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.4 },
                shapes: ['circle'],
                colors: ['#4ecdc4', '#45b7d1', '#6c5ce7'],
                startVelocity: 25
            });
        }
    }

    // Floating Confetti with performance limits
    startFloatingBalloons() {
        const MAX_CONFETTI = 15;
        const { balloonsContainer } = this.elements;

        if (!balloonsContainer) return;

        const createConfetti = () => {
            if (this.currentConfettiCount >= MAX_CONFETTI) return;

            this.currentConfettiCount++;
            const piece = document.createElement('div');
            piece.className = 'floating-confetti';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.setProperty('--hue', Math.floor(Math.random() * 360));

            balloonsContainer.appendChild(piece);

            setTimeout(() => {
                if (piece.parentNode) {
                    piece.remove();
                    this.currentConfettiCount--;
                }
            }, 6000);
        };

        this.floatingConfettiInterval = setInterval(createConfetti, 500);
        for (let i = 0; i < 2; i++) {
            setTimeout(createConfetti, i * 800);
        }
    }

    // Countdown
    setupCountdown() {
        const eventDate = new Date("Nov 02, 2025 18:00:00").getTime();
        const { days: daysEl, hours: hoursEl } = this.elements;

        if (!daysEl || !hoursEl) return;

        const updateCountdown = () => {
            const now = Date.now();
            const distance = eventDate - now;

            if (distance < 0) {
                this.handlePartyStarted();
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            // Only update if values changed
            this.updateCountdownElement(daysEl, days.toString().padStart(2, '0'));
            this.updateCountdownElement(hoursEl, hours.toString().padStart(2, '0'));
        };

        this.countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    updateCountdownElement(element, newValue) {
        if (element.textContent !== newValue) {
            this.animateNumberChange(element, newValue);
        }
    }

    animateNumberChange(element, newValue) {
        element.style.transform = 'scale(1.3)';
        element.style.textShadow = '0 0 10px rgba(255, 107, 53, 0.8)';

        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            element.style.textShadow = '';
        }, 200);
    }

    handlePartyStarted() {
        const countdownSection = document.querySelector('.countdown-section');
        if (countdownSection) {
            countdownSection.innerHTML = `
              <h3>🎊 The Party Has Begun! 🎊</h3>
              <div class="event-started">
                <p style="font-size: 1.2rem; color: #ff6b35; margin: 15px 0;">Hope you're having a blast!</p>
                <div style="font-size: 2rem; animation: partyTime 1s ease-in-out infinite;">🎉 🎂 🎈 🍰 🎁</div>
              </div>
            `;
        }

        clearInterval(this.countdownInterval);
        this.triggerBirthdayConfetti();
    }

    // Music Controls
    toggleMusic() {
        const { musicBtn, bgMusic } = this.elements;

        if (this.isMusicPlaying) {
            bgMusic.pause();
            musicBtn.classList.remove('playing');
            this.isMusicPlaying = false;
        } else {
            this.startMusic();
        }
    }

    startMusic() {
        const { musicBtn, bgMusic } = this.elements;

        bgMusic.play()
            .then(() => {
                musicBtn.classList.add('playing');
                this.isMusicPlaying = true;
            })
            .catch(() => {
                console.log('Auto-play prevented. User interaction required.');
            });
    }

    // Modal Management
    setupModals() {
        const { rsvpModal, closeModal, shareModal, closeShareModal } = this.elements;

        // RSVP modal close
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal(rsvpModal), { passive: true });
        }
        if (rsvpModal) {
            rsvpModal.addEventListener('click', (e) => {
                if (e.target === rsvpModal) {
                    this.closeModal(rsvpModal);
                }
            }, { passive: true });
        }

        // Share modal close
        if (closeShareModal) {
            closeShareModal.addEventListener('click', () => this.closeModal(shareModal), { passive: true });
        }
        if (shareModal) {
            shareModal.addEventListener('click', (e) => {
                if (e.target === shareModal) {
                    this.closeModal(shareModal);
                }
            }, { passive: true });
        }

        // Escape key closes whichever is open
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                [rsvpModal, shareModal].forEach(m => this.closeModal(m));
            }
        });
    }


    openRSVPModal() {
        const modal = this.elements.rsvpModal;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Use requestAnimationFrame for focus
        this.rafId = requestAnimationFrame(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 300);
            }
        });
    }

    openShareModal() {
        const modal = this.elements.shareModal;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Share Handlers
    setupShareHandlers() {
        const shareOptions = document.querySelectorAll('.share-option');
        shareOptions.forEach(option => {
            option.addEventListener('click', () => {
                const platform = option.dataset.platform;
                this.handleShare(platform);
            }, { passive: true });
        });
    }

    handleShare(platform) {
        const shareText = "💌 Hey! I've got a surprise invitation for you. Open the link 🎉";
        const shareUrl = window.location.href;

        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
                break;
            case 'copy':
                const fullText = `${shareText}\n${shareUrl}`;
                this.copyToClipboard(fullText);
                break;
        }

        this.closeModal(this.elements.shareModal);
    }

    // clipboard function
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Link copied to clipboard! 📋', 'success');
        } catch (err) {
            this.fallbackCopyTextToClipboard(text);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.showNotification('Link copied to clipboard! 📋', 'success');
        } catch (err) {
            this.showNotification('Failed to copy link', 'error');
        }

        document.body.removeChild(textArea);
    }

    // Touch Support
    setupTouchSupport() {
        const interactiveElements = document.querySelectorAll('.envelope, button, .share-option');

        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.transform = (element.style.transform || '') + ' scale(0.95)';
            }, { passive: true });

            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.style.transform = element.style.transform.replace(' scale(0.95)', '');
                }, 100);
            }, { passive: true });
        });
    }

    // Throttle utility for performance
    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Responsive Handling
    handleResize() {
        const countdown = document.querySelector('.countdown');
        if (countdown) {
            if (window.innerWidth < 350) {
                countdown.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else {
                countdown.style.gridTemplateColumns = 'repeat(4, 1fr)';
            }
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        if (existingNotifications.length >= 3) {
            existingNotifications[0].remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<div class="notification-content">${message}</div>`;

        const bgColor = type === 'success' ?
            'linear-gradient(135deg, #4CAF50, #45a049)' :
            'linear-gradient(135deg, #ff6b35, #ff8566)';

        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${bgColor};
          color: white;
          padding: 15px 20px;
          border-radius: 15px;
          z-index: 1001;
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
          max-width: 300px;
          font-family: inherit;
          font-weight: 500;
          will-change: transform;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Utility Functions
    randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    cleanup() {
        // Clear all intervals
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        if (this.floatingConfettiInterval) {
            clearInterval(this.floatingConfettiInterval);
        }

        // Cancel animation frames
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        // Stop music
        const { bgMusic } = this.elements;
        if (bgMusic && !bgMusic.paused) {
            bgMusic.pause();
        }

        // Remove event listeners
        window.removeEventListener('resize', this.throttledResize);
    }
}

// initialization
document.addEventListener('DOMContentLoaded', () => {
    const controller = new BirthdayInvitationController();

    // storybook completion handler
    const storybookContainer = document.querySelector('.storybook-container');
    if (storybookContainer) {
        storybookContainer.addEventListener('storyComplete', () => {
            controller.showInvitationAfterStory();
        }, { once: true });
    }

    const galleryContainer = document.querySelector('.dress-code-gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox .close');

    if (galleryContainer && lightbox) {
        galleryContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                lightbox.style.display = 'flex';
                lightboxImg.src = e.target.src;
                lightboxImg.alt = e.target.alt;
            }
        }, { passive: true });

        closeBtn.addEventListener('click', () => {
            lightbox.style.display = 'none';
        }, { passive: true });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        }, { passive: true });
    }

    // google calendar
    const calendarBtn = document.getElementById('calendarBtn');
    calendarBtn.addEventListener('click', () => {
        const title = encodeURIComponent("[Child Name]'s 7th Birthday Celebration");
        const details = encodeURIComponent("Come celebrate with us! 🎉");
        const location = encodeURIComponent("Location Philippines");

        // Event start and end in format: YYYYMMDDTHHMMSSZ
        const startDate = "20250102T020000Z";
        const endDate = "20250102T060000Z";

        const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}&sf=true&output=xml`;

        window.open(googleCalendarUrl, "_blank");
    });

    var calendarEl = document.getElementById('calendar-js');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      initialDate: '2025-01-02',
      headerToolbar: {
        left: 'title',
        center: '',
        right: ''
      },
      showNonCurrentDates: true,
      fixedWeekCount: true,
      dayHeaderFormat: { weekday: 'narrow' },
      selectable: false,
      height: 'auto',
      contentHeight: 300,
      expandRows: true,
      aspectRatio: 1.35,
      validRange: {
        start: '2025-01-01',
        end: '2025-01-31'
      },

      events: [
        {
          start: '2025-01-02',
          display: 'background',
          backgroundColor: '#ff7bb0'
        }
      ]
    });
    calendar.render();
});

//notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        will-change: transform;
        backface-visibility: hidden;
    }
`;

// add styles if they don't exist
if (!document.querySelector('#notification-styles')) {
    notificationStyles.id = 'notification-styles';
    document.head.appendChild(notificationStyles);
}