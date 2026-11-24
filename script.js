const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  burger.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}));

const targets = document.querySelectorAll('.section-head, .two-col > *, .pillar, .food-row img, .gallery figure, .groepen-inner');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  targets.forEach(t => { t.classList.add('reveal'); io.observe(t); });
}
