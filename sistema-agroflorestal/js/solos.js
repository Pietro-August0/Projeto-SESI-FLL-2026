const classes = [
  ['argissolo', 'Argissolo', ['#aa7250', '#b66440', '#8e4637'], 'camadas',
    'A camada abaixo da superfície costuma concentrar mais argila. Confira a drenagem e o risco de erosão.'],
  ['cambissolo', 'Cambissolo', ['#8a6049', '#b18158', '#806a5c'], 'pedras',
    'O perfil varia conforme o material de origem. Confirme a profundidade disponível para as raízes.'],
  ['chernossolo', 'Chernossolo', ['#4d3b31', '#675042', '#99816a'], 'agregados',
    'A camada superficial escura e bem agregada pode ser espessa. Confira a profundidade e a drenagem no local.'],
  ['espodossolo', 'Espodossolo', ['#987b63', '#ded0aa', '#694533'], 'areia',
    'O perfil pode ter uma camada arenosa clara sobre outra mais escura. Verifique a acidez e a retenção de água.'],
  ['gleissolo', 'Gleissolo', ['#675848', '#7e8585', '#697780'], 'agua',
    'O acinzentado representa condições de saturação por água. Confira se há encharcamento prolongado.', 'lenta'],
  ['latossolo', 'Latossolo', ['#85503a', '#b76642', '#a85337'], 'camadas',
    'Perfil geralmente profundo, em tons que variam de amarelo a vermelho. Confirme textura, acidez e fertilidade.'],
  ['luvissolo', 'Luvissolo', ['#aa704b', '#ae573b', '#8c7461'], 'pedras',
    'Pode apresentar um perfil raso com argila em subsuperfície. Confira a profundidade útil.', null, 'raso'],
  ['neossolo', 'Neossolo', ['#a28a6a', '#b6a083', '#807265'], 'pedras',
    'Pode ser arenoso, raso sobre rocha ou formado por sedimentos. Informe a condição observada na área.'],
  ['nitossolo', 'Nitossolo', ['#793d32', '#9d4637', '#78352e'], 'agregados',
    'O perfil argiloso tem agregados bem desenvolvidos. A secagem pode abrir fissuras verticais.'],
  ['organossolo', 'Organossolo', ['#3c322f', '#52403b', '#6d5b4e'], 'fibras',
    'O acúmulo de matéria orgânica deixa o perfil escuro. Confira se o terreno permanece saturado.'],
  ['planossolo', 'Planossolo', ['#a58b66', '#cfb68a', '#85776b'], 'agua',
    'Uma camada menos permeável pode reter água acima dela. Confira se o terreno encharca após chuvas.', 'lenta'],
  ['plintossolo', 'Plintossolo', ['#a87854', '#b48d71', '#98664e'], 'manchas',
    'Manchas e nódulos ricos em ferro podem aparecer no perfil. Confira a drenagem e a presença de camadas endurecidas.', 'lenta'],
  ['vertissolo', 'Vertissolo', ['#66564e', '#84736a', '#65564f'], 'fendas',
    'A argila se retrai quando seca e abre fendas largas. Observe a drenagem na estação chuvosa.'],
];

export const solos = Object.fromEntries(classes.map(
  ([id, nome, cores, aspecto, descricao, drenagem, profundidade]) =>
    [id, { nome, cores, aspecto, descricao, drenagem, profundidade }],
));

const desenhos = {
  camadas: '<path d="M10 90q80-10 150 1t150-3 160 4M10 134q80-7 155 2t150-1 160 2"/>',
  pedras: '<path d="m29 164 35-20 41 18 14 34H19zm119 29 19-31 44-9 30 42zm122-12 36-21 39 9 25 28zm126 15 7-33 39-19 31 29 7 23z" fill="#574c46"/>',
  agregados: '<path d="m60 87 17-9 14 10-8 15-18 1zm57 40 15-8 16 9-5 12-21 1zm147-37 20-9 14 12-7 13-21-1zm77 59 13-7 18 8-5 13-19 1zm76-51 12-9 19 6 2 15-19 3z" fill="#ead0ac"/>',
  areia: '<path d="M0 89q83-8 161 0t160-1 159 0v30q-91 6-159 1t-160 0T0 120z" fill="#efe2bd"/>',
  agua: '<path d="M0 103q40-11 80 0t80 0 80 0 80 0 80 0 80 0v23q-40-11-80 0t-80 0-80 0-80 0-80 0-80 0z" fill="#94c5d0"/>',
  fibras: '<path d="m18 96 29 5m14 20 31-11m27-17 33 9m27 35 38-14m32-17 26 8m22 26 30-9m30-20 33 6m28-21 35 11" stroke="#e0bf8d" stroke-width="4"/>',
  manchas: '<path d="M38 119q20-23 39 0t-19 14zm89 30q15-21 38-9t-10 23zm129-39q13-15 36-3t-11 20zm93 47q13-13 35 2t-12 20zm63-37q15-22 36-8t-13 24z" fill="#743023"/>',
  fendas: '<path d="m84 45 13 28-11 19 20 22-4 22 13 15m116-105-13 28 12 19-18 30 8 19-10 35m163-130 10 22-13 24 14 22-11 29" stroke="#241c1a" stroke-width="7"/>',
};

export function mostrarPerfilSolo(alvo, tipo) {
  const solo = Object.hasOwn(solos, tipo) ? solos[tipo] : null;
  alvo.hidden = !solo;
  if (!solo) {
    alvo.replaceChildren();
    return;
  }
  const [superficie, meio, fundo] = solo.cores;
  const pontos = Array.from({ length: 85 }, (_, i) =>
    `<circle cx="${(i * 71 + 19) % 480}" cy="${55 + (i * 37) % 141}" r="${1 + (i % 4) * 0.4}"/>`,
  ).join('');
  alvo.innerHTML = `<svg viewBox="0 0 480 200" aria-hidden="true" focusable="false">
    <rect width="480" height="200" fill="#e3ece1"/>
    <path class="solo-camada" d="M0 53 Q72 42 155 49T308 48 480 46V200H0Z" fill="${fundo}"/>
    <path class="solo-camada" d="M0 53 Q72 42 155 49T308 48 480 46V139Q385 153 309 139T147 143 0 133Z" fill="${meio}"/>
    <path class="solo-camada" d="M0 53 Q72 42 155 49T308 48 480 46V76Q403 86 310 79T153 82 0 78Z" fill="${superficie}"/>
    <path d="M0 53Q72 42 155 49T308 48 480 46" fill="none" stroke="#54805a" stroke-width="5"/>
    <g fill="#f4d9b3" opacity=".36">${pontos}</g>
    <g class="solo-destaque" fill="none" stroke="#f5d7ae" stroke-width="2" opacity=".68">${desenhos[solo.aspecto]}</g>
  </svg><figcaption><strong>${solo.nome}</strong><p>${solo.descricao}</p>
    <small>Perfil ilustrativo</small></figcaption>`;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const easing = 'cubic-bezier(0.23, 1, 0.32, 1)';
    [...alvo.querySelectorAll('.solo-camada')].reverse().forEach((camada, i) => {
      camada.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 180, delay: i * 35, easing, fill: 'backwards' });
    });
    alvo.querySelector('.solo-destaque').animate(
      [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 0.68, transform: 'translateY(0)' }],
      { duration: 200, delay: 90, easing, fill: 'backwards' },
    );
  }
}
