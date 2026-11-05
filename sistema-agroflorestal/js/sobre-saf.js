const main = document.querySelector('[data-ui-about]');

function adicionarExplicacao() {
  if (!main || main.querySelector('#explicacao-saf')) return;

  const partner = main.querySelector('.about-partner');
  const section = document.createElement('section');
  section.className = 'sobre-saf';
  section.id = 'explicacao-saf';
  section.innerHTML = `
    <span class="sobre-saf__rotulo">Sistema Agroflorestal</span>
    <h2>O que é um SAF?</h2>
    <p>
      Um SAF combina árvores, arbustos, cultivos agrícolas e outros elementos da natureza em uma
      mesma área, organizada para que cresçam em conjunto. Nessa integração, cada planta pode
      contribuir com produção, sombra, proteção do solo, matéria orgânica, alimento ou conservação
      da biodiversidade.
    </p>`;

  partner ? main.insertBefore(section, partner) : main.append(section);
}

adicionarExplicacao();

if (main && 'MutationObserver' in window) {
  new MutationObserver(adicionarExplicacao).observe(main, {
    childList: true,
  });
}
