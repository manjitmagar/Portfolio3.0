(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var themeToggle = document.getElementById('themeToggle');
  var menuToggle = document.getElementById('menuToggle');
  var navigation = document.getElementById('siteNavigation');
  var scrollTopButton = document.getElementById('scrollToTopBtn');
  var pointerSpotlight = document.getElementById('pointerSpotlight');
  var terminalOutput = document.getElementById('terminalOutput');
  var terminalForm = document.getElementById('terminalForm');
  var terminalInput = document.getElementById('terminalInput');
  var terminalBody = document.getElementById('terminalBody');
  var resumeLink = document.querySelector('[data-resume-link]');

  function updateThemeToggle() {
    var isDark = root.dataset.theme === 'dark';
    if (!themeToggle) return;
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    themeToggle.innerHTML = '<i class="fa-solid ' + (isDark ? 'fa-sun' : 'fa-moon') + '" aria-hidden="true"></i>';
  }

  updateThemeToggle();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = nextTheme;
      try { localStorage.setItem('portfolio-theme', nextTheme); } catch (error) {}
      updateThemeToggle();
    });
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener('click', function () {
      var isOpen = navigation.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      menuToggle.innerHTML = '<i class="fa-solid ' + (isOpen ? 'fa-xmark' : 'fa-bars') + '" aria-hidden="true"></i>';
    });

    navigation.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navigation.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
        menuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
      });
    });
  }

  function updateScrollUi() {
    var isPastHeader = window.scrollY > 20;
    var showScrollButton = window.scrollY > 580;
    var header = document.querySelector('.site-header');
    if (header) header.classList.toggle('is-scrolled', isPastHeader);
    if (scrollTopButton) scrollTopButton.classList.toggle('is-visible', showScrollButton);
  }

  window.addEventListener('scroll', updateScrollUi, { passive: true });
  updateScrollUi();

  if (scrollTopButton) {
    scrollTopButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  if (pointerSpotlight && !reducedMotion && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
    var frame;
    var pointerX = -500;
    var pointerY = -500;
    window.addEventListener('pointermove', function (event) {
      pointerX = event.clientX - 230;
      pointerY = event.clientY - 230;
      if (frame) return;
      frame = window.requestAnimationFrame(function () {
        pointerSpotlight.style.transform = 'translate(' + pointerX + 'px, ' + pointerY + 'px)';
        frame = null;
      });
    }, { passive: true });
  }

  var revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -20px' });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var active = link.getAttribute('href') === '#' + entry.target.id;
          if (active) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-36% 0px -56% 0px', threshold: 0 });
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  function terminalLine(text, kind) {
    if (!terminalOutput) return;
    var line = document.createElement('p');
    line.className = 'terminal-line' + (kind ? ' terminal-line--' + kind : '');
    line.textContent = text;
    terminalOutput.appendChild(line);
    if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function terminalCommandLine(command) {
    terminalLine('manjit@linux:~$ ' + command, 'command');
  }

  function scrollToSection(id) {
    var target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function typeTerminalIntro() {
    if (!terminalOutput) return;
    var intro = [
      { command: 'whoami', output: 'Manjit Pun — IT Engineer | web systems · IoT · cybersecurity' },
      { command: 'cat focus.txt', output: 'Building clear, useful technology for real-world problems.' },
      { command: 'status', output: 'Portfolio console ready. Type help to explore.' }
    ];

    if (reducedMotion) {
      intro.forEach(function (item) {
        terminalCommandLine(item.command);
        terminalLine(item.output, item.command === 'status' ? 'accent' : '');
      });
      return;
    }

    var itemIndex = 0;
    function playItem() {
      if (itemIndex >= intro.length) return;
      var item = intro[itemIndex];
      var typed = '';
      var line = document.createElement('p');
      line.className = 'terminal-line terminal-line--command';
      terminalOutput.appendChild(line);
      var cursor = document.createElement('span');
      cursor.textContent = '▌';
      cursor.style.color = 'var(--accent)';
      line.appendChild(document.createTextNode('manjit@linux:~$ '));
      line.appendChild(cursor);
      var characterIndex = 0;
      var timer = window.setInterval(function () {
        typed += item.command.charAt(characterIndex);
        cursor.before(document.createTextNode(item.command.charAt(characterIndex)));
        characterIndex += 1;
        if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
        if (characterIndex >= item.command.length) {
          window.clearInterval(timer);
          window.setTimeout(function () {
            cursor.remove();
            terminalLine(item.output, item.command === 'status' ? 'accent' : '');
            itemIndex += 1;
            window.setTimeout(playItem, 430);
          }, 230);
        }
      }, 45);
    }
    playItem();
  }

  var commands = {
    help: function () {
      terminalLine('Available: about · skills · projects · contact · resume · clear', 'accent');
      terminalLine('Use a command to jump to a section, or clear to reset the console.');
    },
    about: function () {
      terminalLine('IT Engineer focused on web development, IoT integration, and cybersecurity-minded problem solving.');
      scrollToSection('about');
    },
    skills: function () {
      terminalLine('Opening capability modules…', 'accent');
      scrollToSection('skills');
    },
    projects: function () {
      terminalLine('Opening project archive…', 'accent');
      scrollToSection('projects');
    },
    contact: function () {
      terminalLine('Opening secure contact channels…', 'accent');
      scrollToSection('contact');
    },
    resume: function () {
      terminalLine('Preparing résumé download…', 'accent');
      if (resumeLink) resumeLink.click();
    },
    clear: function () {
      if (terminalOutput) terminalOutput.innerHTML = '';
    },
    status: function () {
      terminalLine('Portfolio console ready. Navigation, project archive, and contact channels are operational.', 'accent');
    }
  };

  if (terminalForm && terminalInput) {
    terminalForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var rawCommand = terminalInput.value.trim();
      var command = rawCommand.toLowerCase();
      if (!command) return;
      terminalCommandLine(rawCommand);
      terminalInput.value = '';
      if (commands[command]) {
        commands[command]();
      } else {
        terminalLine('command not found: ' + rawCommand + '. Type help for available commands.');
      }
    });
  }

  typeTerminalIntro();

  var certificateDialog = document.getElementById('certificateDialog');
  var certificateDialogImage = document.getElementById('certificateDialogImage');
  var certificateDialogClose = document.getElementById('certificateDialogClose');
  document.querySelectorAll('[data-certificate-src]').forEach(function (card) {
    card.addEventListener('click', function () {
      if (!certificateDialog || !certificateDialogImage) return;
      certificateDialogImage.src = card.getAttribute('data-certificate-src');
      certificateDialogImage.alt = card.getAttribute('data-certificate-alt') || 'Certificate preview';
      certificateDialog.showModal();
    });
  });

  if (certificateDialog && certificateDialogClose) {
    certificateDialogClose.addEventListener('click', function () { certificateDialog.close(); });
    certificateDialog.addEventListener('click', function (event) {
      var bounds = certificateDialog.getBoundingClientRect();
      var clickedOutside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (clickedOutside) certificateDialog.close();
    });
  }
}());
