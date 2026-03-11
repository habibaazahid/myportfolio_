<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Habiba Zahid | Frontend Developer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- CURSOR -->
  <div class="cursor" id="cursor"></div>
  <div class="cursor-ring" id="cursorRing"></div>

  <!-- GLOW ORBS -->
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>
  <div class="orb orb3"></div>

  <!-- ===== NAVIGATION ===== -->
  <nav>
    <div class="nav-logo">HZ<span>.</span></div>
    <ul class="nav-links">
      <li><a href="#about"          data-num="01">About</a></li>
      <li><a href="#skills"         data-num="02">Skills</a></li>
      <li><a href="#projects"       data-num="03">Projects</a></li>
      <li><a href="#experience"     data-num="04">Experience</a></li>
      <li><a href="#certifications" data-num="05">Certs</a></li>
      <li><a href="#contact"        data-num="06">Contact</a></li>
    </ul>
    <a href="/cdn-cgi/l/email-protection#2941484b404b4848534841404d694e44484045074a4644" class="nav-cta">Let's Connect</a>
  </nav>

  <!-- ===== HERO ===== -->
  <section id="hero">
    <div class="hero-tag">Aspiring Frontend Developer · Available for Remote Work</div>

    <h1 class="hero-name">
      Habiba<br>
      <span class="line2">Zahid<span class="accent">.</span></span>
    </h1>

    <p class="hero-role">
      <strong>Aspiring Frontend Developer & CS Student</strong> at IU International University, Germany ·
      Currently learning to build beautiful, responsive web experiences with
      <strong>HTML, CSS, JavaScript & React</strong> · 6+ years of freelance excellence on Upwork.
    </p>

    <div class="hero-actions">
      <a href="#projects" class="btn-primary">View My Work</a>
      <a href="#contact"  class="btn-ghost">Get In Touch</a>
    </div>

    <!-- Floating badges -->
    <div class="hero-badge b1"><span class="dot dot-green"></span>Open to Remote Work</div>
    <div class="hero-badge b2"><span class="dot dot-purple"></span>Frontend Dev</div>
    <div class="hero-badge b3"><span class="dot dot-pink"></span>⭐ 5-Star Upwork</div>
  </section>

  <div class="divider"></div>

  <!-- ===== ABOUT ===== -->
  <section id="about">
    <div class="section-label">About Me</div>
    <h2 class="section-title reveal">Who I <span>Am.</span></h2>

    <div class="about-grid">
      <div class="about-text reveal">
        <p>
          I'm a <strong>dedicated CS student and aspiring Frontend Developer</strong> at IU International
          University of Applied Sciences, Germany (Distance Learning) with a CGPA of 3.16.
          I bring hands-on experience in <strong>HTML, CSS, JavaScript, and Python</strong>,
          constantly pushing my skills to match industry standards.
        </p>
        <p>
          My <strong>6+ years of freelance work</strong> on Upwork as a content writer and
          data administrator has sharpened my communication, client relations, and
          problem-solving skills — making me a well-rounded professional, not just a coder.
        </p>
        <p>
          I'm passionate about crafting <strong>pixel-perfect, responsive interfaces</strong>
          that users love. Currently seeking a remote role where I can contribute
          meaningfully and grow with a forward-thinking team.
        </p>

        <!-- Typing showcase -->
        <div style="margin-top:28px; padding:20px 24px; background:var(--surface); border:1px solid var(--border); border-radius:6px; font-family:var(--font-mono); font-size:0.82rem; color:var(--accent3);">
          <span style="color:var(--muted)">// currently building:</span><br>
          <span id="typingText"></span><span class="type-cursor"></span>
        </div>
      </div>

      <div class="about-stats reveal">
        <div class="stat-card">
          <div class="stat-num">3.16</div>
          <div class="stat-label">Current CGPA</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">6+</div>
          <div class="stat-label">Years Freelancing</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">7</div>
          <div class="stat-label">Certifications</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">⭐5</div>
          <div class="stat-label">Upwork Rating</div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- ===== SKILLS ===== -->
  <section id="skills">
    <div class="section-label">Expertise</div>
    <h2 class="section-title reveal">My <span>Skills.</span></h2>

    <div class="skills-container">

      <!-- ★ FRONTEND SPOTLIGHT ★ -->
      <div class="skill-group featured-skill reveal">
        <div class="featured-badge">★ Primary Focus</div>
        <div class="skill-group-title"><span class="icon">🖥️</span> Frontend Development</div>
        <div class="skill-group-sub">Building what users see & love</div>
        <div class="skill-tags" style="margin-bottom:24px">
          <span class="tag tag-purple">HTML5</span>
          <span class="tag tag-purple">CSS3</span>
          <span class="tag tag-purple">JavaScript (ES6+)</span>
          <span class="tag tag-purple">React</span>
          <span class="tag tag-purple">Responsive Design</span>
          <span class="tag tag-purple">CSS Animations</span>
          <span class="tag tag-purple">WordPress</span>
          <span class="tag tag-teal">UI/UX Principles</span>
          <span class="tag tag-teal">Flexbox & Grid</span>
          <span class="tag tag-teal">Cross-Browser Compatibility</span>
        </div>

        <!-- Skill bars -->
        <div class="skill-bars" id="skillBarsSection">
          <div class="skill-bar-item">
            <div class="skill-bar-top"><span class="skill-bar-name">HTML5 & CSS3</span><span class="skill-bar-pct">90%</span></div>
            <div class="skill-bar-track"><div class="skill-bar-fill" data-width="90"></div></div>
          </div>
          <div class="skill-bar-item">
            <div class="skill-bar-top"><span class="skill-bar-name">JavaScript (ES6+)</span><span class="skill-bar-pct">75%</span></div>
            <div class="skill-bar-track"><div class="skill-bar-fill" data-width="75"></div></div>
          </div>
          <div class="skill-bar-item">
            <div class="skill-bar-top"><span class="skill-bar-name">React</span><span class="skill-bar-pct">65%</span></div>
            <div class="skill-bar-track"><div class="skill-bar-fill" data-width="65"></div></div>
          </div>
          <div class="skill-bar-item">
            <div class="skill-bar-top"><span class="skill-bar-name">Responsive / CSS Animations</span><span class="skill-bar-pct">85%</span></div>
            <div class="skill-bar-track"><div class="skill-bar-fill" data-width="85"></div></div>
          </div>
        </div>
      </div>

      <div class="skill-group reveal">
        <div class="skill-group-title"><span class="icon">⚙️</span> Backend & Data</div>
        <div class="skill-group-sub">Server, databases & APIs</div>
        <div class="skill-tags">
          <span class="tag tag-teal">Node.js</span>
          <span class="tag tag-teal">Express.js</span>
          <span class="tag tag-teal">MongoDB</span>
          <span class="tag tag-teal">REST APIs</span>
          <span class="tag tag-teal">Basic Python</span>
          <span class="tag tag-teal">Java</span>
        </div>
      </div>

      <div class="skill-group reveal">
        <div class="skill-group-title"><span class="icon">📊</span> Digital & Marketing</div>
        <div class="skill-group-sub">Growth & analytics</div>
        <div class="skill-tags">
          <span class="tag tag-orange">SEO Basics</span>
          <span class="tag tag-orange">Google Analytics</span>
          <span class="tag tag-orange">Digital Marketing</span>
          <span class="tag tag-orange">Social Media Mgmt</span>
          <span class="tag tag-orange">Content Creation</span>
          <span class="tag tag-orange">CRM Software</span>
        </div>
      </div>

      <div class="skill-group reveal">
        <div class="skill-group-title"><span class="icon">🛠️</span> Tools & Design</div>
        <div class="skill-group-sub">My daily toolkit</div>
        <div class="skill-tags">
          <span class="tag tag-pink">Git & GitHub</span>
          <span class="tag tag-pink">VS Code</span>
          <span class="tag tag-pink">Figma</span>
          <span class="tag tag-pink">Canva</span>
          <span class="tag tag-pink">Vercel</span>
          <span class="tag tag-pink">MS Office Suite</span>
        </div>
      </div>

      <div class="skill-group reveal">
        <div class="skill-group-title"><span class="icon">🤖</span> AI & Learning</div>
        <div class="skill-group-sub">Currently exploring</div>
        <div class="skill-tags">
          <span class="tag tag-purple">Machine Learning</span>
          <span class="tag tag-purple">IBM AI Foundations</span>
          <span class="tag tag-teal">Google AI Essentials</span>
          <span class="tag tag-teal">TypeScript</span>
          <span class="tag tag-teal">Next.js</span>
        </div>
      </div>

    </div>

    <!-- Progress Rings -->
    <div class="progress-rings reveal" id="progressRings">
      <div class="ring-wrap">
        <svg class="ring-svg" width="90" height="90" viewBox="0 0 90 90">
          <circle class="ring-track" cx="45" cy="45" r="40" stroke-width="5"/>
          <circle class="ring-fill"  cx="45" cy="45" r="40" stroke-width="5" stroke="url(#g1)" stroke-dasharray="251" data-dash="226"/>
          <text class="ring-text"    x="45" y="45">90%</text>
          <defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#7c6aff"/><stop offset="100%" stop-color="#6affd4"/></linearGradient></defs>
        </svg>
        <div class="ring-label">HTML/CSS</div>
      </div>
      <div class="ring-wrap">
        <svg class="ring-svg" width="90" height="90" viewBox="0 0 90 90">
          <circle class="ring-track" cx="45" cy="45" r="40" stroke-width="5"/>
          <circle class="ring-fill"  cx="45" cy="45" r="40" stroke-width="5" stroke="url(#g2)" stroke-dasharray="251" data-dash="188"/>
          <text class="ring-text"    x="45" y="45">75%</text>
          <defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ff6a9b"/><stop offset="100%" stop-color="#7c6aff"/></linearGradient></defs>
        </svg>
        <div class="ring-label">JavaScript</div>
      </div>
      <div class="ring-wrap">
        <svg class="ring-svg" width="90" height="90" viewBox="0 0 90 90">
          <circle class="ring-track" cx="45" cy="45" r="40" stroke-width="5"/>
          <circle class="ring-fill"  cx="45" cy="45" r="40" stroke-width="5" stroke="url(#g3)" stroke-dasharray="251" data-dash="163"/>
          <text class="ring-text"    x="45" y="45">65%</text>
          <defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#6affd4"/><stop offset="100%" stop-color="#ff6a9b"/></linearGradient></defs>
        </svg>
        <div class="ring-label">React</div>
      </div>
      <div class="ring-wrap">
        <svg class="ring-svg" width="90" height="90" viewBox="0 0 90 90">
          <circle class="ring-track" cx="45" cy="45" r="40" stroke-width="5"/>
          <circle class="ring-fill"  cx="45" cy="45" r="40" stroke-width="5" stroke="url(#g4)" stroke-dasharray="251" data-dash="201"/>
          <text class="ring-text"    x="45" y="45">80%</text>
          <defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#7c6aff"/><stop offset="100%" stop-color="#ff6a9b"/></linearGradient></defs>
        </svg>
        <div class="ring-label">UI/UX Design</div>
      </div>
      <div class="ring-wrap">
        <svg class="ring-svg" width="90" height="90" viewBox="0 0 90 90">
          <circle class="ring-track" cx="45" cy="45" r="40" stroke-width="5"/>
          <circle class="ring-fill"  cx="45" cy="45" r="40" stroke-width="5" stroke="url(#g5)" stroke-dasharray="251" data-dash="238"/>
          <text class="ring-text"    x="45" y="45">95%</text>
          <defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#6affd4"/><stop offset="100%" stop-color="#7c6aff"/></linearGradient></defs>
        </svg>
        <div class="ring-label">Content Writing</div>
      </div>
      <div class="ring-wrap">
        <svg class="ring-svg" width="90" height="90" viewBox="0 0 90 90">
          <circle class="ring-track" cx="45" cy="45" r="40" stroke-width="5"/>
          <circle class="ring-fill"  cx="45" cy="45" r="40" stroke-width="5" stroke="url(#g6)" stroke-dasharray="251" data-dash="176"/>
          <text class="ring-text"    x="45" y="45">70%</text>
          <defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ff6a9b"/><stop offset="100%" stop-color="#6affd4"/></linearGradient></defs>
        </svg>
        <div class="ring-label">Digital Marketing</div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- ===== PROJECTS ===== -->
  <section id="projects">
    <div class="section-label">Work</div>
    <h2 class="section-title reveal">My <span>Projects.</span></h2>

    <div class="projects-grid">
      <!-- Featured -->
      <div class="project-card featured reveal">
        <div class="project-visual">🌐</div>
        <div class="project-content">
          <div class="project-num">01 — Featured</div>
          <h3 class="project-title">Personal Portfolio Website</h3>
          <p class="project-desc">
            A fully responsive, animated portfolio website built with HTML, CSS & vanilla JavaScript.
            Features custom cursor, scroll animations, floating badges, glow orbs, and
            a dark aesthetic — everything hand-coded from scratch.
          </p>
          <div class="project-stack">
            <span class="tag tag-purple">HTML5</span>
            <span class="tag tag-purple">CSS3</span>
            <span class="tag tag-orange">JavaScript</span>
            <span class="tag tag-teal">Vercel</span>
          </div>
          <a href="https://github.com/habibazahid03" class="project-link">View on GitHub</a>
        </div>
      </div>

      <div class="project-card reveal">
        <div class="project-num">02</div>
        <h3 class="project-title">Content & Blog Platform</h3>
        <p class="project-desc">
          A full-stack blogging platform showcasing my 6+ years of content writing expertise.
          Features user auth, CRUD operations, rich text editor, and SEO-optimized structure.
        </p>
        <div class="project-stack">
          <span class="tag tag-purple">React</span>
          <span class="tag tag-teal">Node.js</span>
          <span class="tag tag-teal">MongoDB</span>
          <span class="tag tag-pink">JWT Auth</span>
        </div>
        <a href="#" class="project-link">Coming Soon</a>
      </div>

      <div class="project-card reveal">
        <div class="project-num">03</div>
        <h3 class="project-title">E-Commerce Storefront</h3>
        <p class="project-desc">
          A pixel-perfect responsive e-commerce UI with product filtering, cart logic,
          and animations — built using React with Shopify integration experience.
        </p>
        <div class="project-stack">
          <span class="tag tag-purple">React</span>
          <span class="tag tag-orange">Shopify API</span>
          <span class="tag tag-teal">CSS Animations</span>
        </div>
        <a href="#" class="project-link">In Progress</a>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- ===== EXPERIENCE ===== -->
  <section id="experience">
    <div class="section-label">Journey</div>
    <h2 class="section-title reveal">My <span>Timeline.</span></h2>

    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-date">2023 – 2027 (Expected)</div>
        <div class="timeline-title">BSc Computer Science</div>
        <div class="timeline-place">IU International University of Applied Sciences, Germany · Distance Learning</div>
        <div class="timeline-desc">
          Studying core CS subjects alongside self-driven frontend development. Maintaining a CGPA of 3.16
          while building real-world projects and earning industry certifications.
        </div>
      </div>

      <div class="timeline-item">
        <div class="timeline-date">2019 – Present</div>
        <div class="timeline-title">Freelance Content Writer</div>
        <div class="timeline-place">Upwork · Remote · ⭐ 5-Star Rating</div>
        <div class="timeline-desc">
          Wrote eBooks, research papers, articles, and blogs — improving client engagement by 30%
          through strategic content marketing. Maintained a 5-star rating across all projects.
        </div>
      </div>


      <div class="timeline-item">
        <div class="timeline-date">Ongoing</div>
        <div class="timeline-title">Student Ambassador</div>
        <div class="timeline-place">IU International University</div>
        <div class="timeline-desc">
          Represented the university at global events. Organized campus tours, open days,
          and orientations — serving as a bridge between students and faculty.
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- ===== CERTIFICATIONS ===== -->
  <section id="certifications">
    <div class="section-label">Credentials</div>
    <h2 class="section-title reveal">My <span>Certifications.</span></h2>

    <div class="certs-grid">
      <div class="cert-card reveal"><div class="cert-icon">🏛️</div><div><div class="cert-title">CS50: Introduction to Computer Science</div><div class="cert-issuer">Harvard University</div></div></div>
      <div class="cert-card reveal"><div class="cert-icon">🔵</div><div><div class="cert-title">HTML, CSS & JavaScript for Web Developers</div><div class="cert-issuer">Johns Hopkins University</div></div></div>
      <div class="cert-card reveal"><div class="cert-icon">🌐</div><div><div class="cert-title">Digital Marketing Strategy</div><div class="cert-issuer">University of Edinburgh</div></div></div>
      <div class="cert-card reveal"><div class="cert-icon">🤖</div><div><div class="cert-title">IBM AI Foundations for Business Specialization</div><div class="cert-issuer">IBM</div></div></div>
      <div class="cert-card reveal"><div class="cert-icon">🔬</div><div><div class="cert-title">Machine Learning with Python</div><div class="cert-issuer">IBM</div></div></div>
      <div class="cert-card reveal"><div class="cert-icon">✨</div><div><div class="cert-title">Google AI Essentials Specialization</div><div class="cert-issuer">Google</div></div></div>
      <div class="cert-card reveal"><div class="cert-icon">⚡</div><div><div class="cert-title">Maximize Productivity With AI Tools</div><div class="cert-issuer">Google</div></div></div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- ===== CONTACT ===== -->
  <section id="contact">
    <div class="section-label" style="justify-content:center">Contact</div>
    <h2 class="contact-tagline reveal">
      Let's Build<br>
      <span class="outline">Something.</span>
    </h2>
    <p class="contact-sub reveal">
      I'm actively looking for remote frontend roles and freelance projects.
      Whether you have an opportunity or just want to say hi — my inbox is always open.
    </p>
    <a href="/cdn-cgi/l/email-protection#f59d94979c9794948f949d9c91b59298949c99db969a98" class="contact-email reveal"><span class="__cf_email__" data-cfemail="d7bfb6b5beb5b6b6adb6bfbeb397b0bab6bebbf9b4b8ba">[email&#160;protected]</span></a>

    <div class="social-row reveal">
      <a href="https://github.com/habibazahid03"             class="social-link">⚡ GitHub</a>
      <a href="https://linkedin.com/in/habibazahid03"        class="social-link">💼 LinkedIn</a>
      <a href="/cdn-cgi/l/email-protection#cda5acafa4afacacb7aca5a4a98daaa0aca4a1e3aea2a0" class="social-link">✉️ Email</a>
      <a href="tel:+923376172209"                            class="social-link">📞 Call</a>
      <a href="#"                                            class="social-link">📄 Resume</a>
    </div>
  </section>

  <!-- ===== FOOTER ===== -->
  <footer>
    <span>Designed & Built by <a href="#">Habiba Zahid</a></span>
    <span>© 2025 · All Rights Reserved</span>
  </footer>

  <!-- ===== JAVASCRIPT ===== -->

  <script src="script.js"></script>
</body>
</html>