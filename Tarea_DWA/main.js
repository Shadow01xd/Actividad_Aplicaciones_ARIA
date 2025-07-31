/* ========== Narrador genérico ========== */
function hablar(texto){
  if('speechSynthesis' in window){
    const msg = new SpeechSynthesisUtterance(texto);
    msg.lang = 'es-ES';
    speechSynthesis.cancel();   // corta cualquier lectura previa
    speechSynthesis.speak(msg);
  }
}

/* ========== Navegación suave ========== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offsetTop = target.offsetTop - 70; // Ajuste para navbar fijo
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // Anunciar navegación
      const sectionName = this.textContent.trim();
      hablar(`Navegando a la sección ${sectionName}`);
    }
  });
  // Anunciar al recibir foco (accesibilidad navbar)
  anchor.addEventListener('focus', function () {
    const sectionName = this.textContent.trim();
    hablar(`Enlace de navegación: ${sectionName}`);
  });
});

/* ========== Efectos del navbar ========== */
const navbar = document.querySelector('.navbar');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Cambiar opacidad del navbar al hacer scroll
  if (scrollTop > 100) {
    navbar.style.background = 'rgba(31, 41, 55, 0.98)';
  } else {
    navbar.style.background = 'rgba(31, 41, 55, 0.95)';
  }
  
  lastScrollTop = scrollTop;
});

/* ========== Anunciar al recibir foco (TAB) ========== */
const campos = document.querySelectorAll(
  '#formulario input, #formulario textarea, #formulario button'
);
campos.forEach(el=>{
  el.addEventListener('focus', ()=>{
    const desc = el.getAttribute('aria-label') ||
                 el.placeholder || 'Campo de formulario';
    hablar(desc);
  });
});

/* ========== Animaciones de entrada ========== */
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      
      // Anunciar sección visible
      const sectionTitle = entry.target.querySelector('.section-title');
      if (sectionTitle && !entry.target.dataset.announced) {
        hablar(`Sección ${sectionTitle.textContent} visible`);
        entry.target.dataset.announced = 'true';
      }
    }
  });
}, observerOptions);

// Observar secciones para animaciones
document.querySelectorAll('.services-section, .about-section, .form-section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(30px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(section);
});

/* ========== Efectos hover para tarjetas de servicio ========== */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    const title = card.querySelector('h3').textContent;
    hablar(`Servicio: ${title}`);
  });
});

/* ========== Validación + alerta accesible ========== */
const form = document.getElementById('formulario');
const alertaDiv = document.getElementById('alerta');

form.addEventListener('submit', e=>{
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const mensaje = document.getElementById('mensaje').value.trim();
  let mensajeAlerta, estado;

  if(nombre === ''){
    mensajeAlerta = 'Debes escribir tu nombre.';
    estado  = 'error';
  } else if(email === ''){
    mensajeAlerta = 'Debes escribir un correo electrónico.';
    estado  = 'error';
  } else if(mensaje === ''){
    mensajeAlerta = 'Debes escribir un mensaje.';
    estado  = 'error';
  } else {
    mensajeAlerta = 'Formulario enviado correctamente. ¡Gracias por tu mensaje!';
    estado  = 'ok';
    // Aquí iría tu fetch()/AJAX real si hace falta
  }

  alertaDiv.className = '';            // limpia clases previas
  alertaDiv.classList.add(estado);     // ok o error
  alertaDiv.textContent = mensajeAlerta;
  alertaDiv.hidden = false;            // role="alert" lo anunciará
  hablar(mensajeAlerta);
});

/* ========== Funcionalidad adicional para estadísticas ========== */
function animateStats() {
  const stats = document.querySelectorAll('.stat-number');
  stats.forEach(stat => {
    const finalValue = stat.textContent;
    let currentValue = 0;
    
    if (finalValue === '100+') {
      const increment = 100 / 50; // 50 pasos
      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= 100) {
          currentValue = 100;
          clearInterval(timer);
        }
        stat.textContent = Math.floor(currentValue) + '+';
      }, 50);
    } else if (finalValue === '5+') {
      const increment = 5 / 30; // 30 pasos
      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= 5) {
          currentValue = 5;
          clearInterval(timer);
        }
        stat.textContent = Math.floor(currentValue) + '+';
      }, 80);
    } else if (finalValue === '24/7') {
      // Para valores no numéricos, solo hacer fade in
      stat.style.opacity = '0';
      stat.style.transition = 'opacity 1s ease';
      setTimeout(() => {
        stat.style.opacity = '1';
      }, 500);
    }
  });
}

// Animar estadísticas cuando la sección hero esté visible
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateStats();
      heroObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroSection = document.querySelector('.hero-section');
if (heroSection) {
  heroObserver.observe(heroSection);
}

/* ========== Mejoras de accesibilidad para el footer ========== */
document.querySelectorAll('.footer-section a').forEach(link => {
  link.addEventListener('focus', () => {
    const linkText = link.textContent.trim();
    hablar(`Enlace del pie de página: ${linkText}`);
  });
});

/* ========== Indicador de progreso de scroll ========== */
function updateScrollProgress() {
  const scrollTop = window.pageYOffset;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  
  // Crear o actualizar barra de progreso
  let progressBar = document.getElementById('scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: var(--accent);
      z-index: 1001;
      transition: width 0.3s ease;
    `;
    document.body.appendChild(progressBar);
  }
  
  progressBar.style.width = scrollPercent + '%';
}

window.addEventListener('scroll', updateScrollProgress);
