/* Progressive enhancement: navigation and content work without this module. */
const paths = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  leaf: '<path d="M20 4c-7-1-15 2-15 9a6 6 0 0 0 6 6c7 0 9-8 9-15Z"/><path d="M4 21 15 10"/>',
  sliders:
    '<path d="M4 7h7m4 0h5M4 17h11m4 0h1"/><circle cx="13" cy="7" r="2"/><circle cx="17" cy="17" r="2"/>',
  sprout: '<path d="M12 21v-8m0 0C4 14 3 8 4 5c6-1 9 2 8 8Zm0 0c-1-7 3-10 8-10 1 6-2 10-8 10Z"/>',
};
function icon(name) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  node.setAttribute('viewBox', '0 0 24 24');
  node.setAttribute('fill', 'none');
  node.setAttribute('stroke', 'currentColor');
  node.setAttribute('stroke-linecap', 'round');
  node.setAttribute('stroke-linejoin', 'round');
  node.setAttribute('aria-hidden', 'true');
  node.classList.add('ui-icon');
  node.innerHTML = paths[name] || paths.arrow;
  return node;
}
document.querySelectorAll('.hero-acoes .botao').forEach((b, i) => {
  if (b.querySelector('svg')) return;
  b.append(icon(i ? 'sliders' : 'arrow'));
});
document
  .querySelectorAll('.fluxo li>span')
  .forEach((span, i) => span.prepend(icon(['leaf', 'sliders', 'sprout'][i])));

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  const selector =
    '[data-reveal]:not(.reveal-ready),.fluxo-secao:not(.reveal-ready),.cenarios-secao:not(.reveal-ready)';
  const observe = (root) => {
    const elements = [...root.querySelectorAll(selector)];
    if (root.matches?.(selector)) elements.push(root);
    elements.forEach((el) => {
      el.setAttribute('data-reveal', '');
      el.classList.add('reveal-ready');
      observer.observe(el);
    });
  };
  observe(document);
  new MutationObserver((changes) => {
    for (const change of changes)
      for (const node of change.addedNodes) if (node.nodeType === 1) observe(node);
  }).observe(document.querySelector('main'), { childList: true, subtree: true });
}
