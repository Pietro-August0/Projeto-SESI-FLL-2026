/* Desenhos vetoriais próprios. Folhas, flores e frutos usam a mesma origem dos
 * ramos: mudar o porte não desloca os órgãos para fora da planta. */
import { perfisVisuais } from './evolucao-plantas.js';

const verdeClaro = '#79A96C';
const madeira = '#85634C';
const n = (v) => Number(v.toFixed(2));
const linha = (x, y, a, b, cor = madeira, largura = 2) =>
  `<path d="M${n(x)} ${n(y)}L${n(a)} ${n(b)}" stroke="${cor}" stroke-width="${n(largura)}" fill="none" stroke-linecap="round"/>`;
const grupo = (x, y, angulo, conteudo) =>
  `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(angulo)})">${conteudo}</g>`;

function folha(x, y, angulo, tamanho, largura, cor) {
  return grupo(
    x,
    y,
    angulo,
    `<path d="M0 0Q${n(tamanho * 0.46)} ${n(-largura)} ${n(tamanho)} 0Q${n(tamanho * 0.48)} ${n(largura)} 0 0Z" fill="${cor}"/>${linha(0, 0, tamanho * 0.9, 0, '#C0D6A2', 0.6)}`,
  );
}

function trifolio(x, y, tamanho, cor) {
  return [-150, -90, -30].map((a) => folha(x, y, a, tamanho, tamanho * 0.48, cor)).join('');
}

function palmada(x, y, tamanho, cor, estreita = false, lobos = 7) {
  const pontos = [];
  for (let i = 0; i < lobos * 2; i++) {
    const a = ((-180 + (i * 360) / (lobos * 2)) * Math.PI) / 180;
    const raio = i % 2 ? tamanho * (estreita ? 0.2 : 0.46) : tamanho;
    pontos.push([n(Math.cos(a) * raio), n(Math.sin(a) * raio)]);
  }
  return grupo(
    x,
    y,
    0,
    `<path d="M${pontos.map((p) => p.join(' ')).join('L')}Z" fill="${cor}"/>${pontos
      .filter((_, i) => i % 2 === 0)
      .map(([a, b]) => linha(0, 0, a * 0.82, b * 0.82, '#A9C787', 0.7))
      .join('')}`,
  );
}

function pinada(x, y, angulo, tamanho, cor, dupla = false) {
  let desenho = linha(0, 0, tamanho, 0, '#789466', 1.1);
  for (let i = 1; i <= 5; i++) {
    const inicio = (tamanho * i) / 6;
    const comprimento = tamanho * (0.33 - i * 0.025);
    for (const lado of [-1, 1]) {
      desenho += dupla
        ? pinada(inicio, 0, lado * 53, comprimento, cor)
        : folha(inicio, 0, lado * 47, comprimento, comprimento * 0.28, cor);
    }
  }
  desenho += folha(tamanho * 0.88, 0, 0, tamanho * 0.15, tamanho * 0.04, cor);
  return grupo(x, y, angulo, desenho);
}

function flor(x, y, raio, cor, centro = '#8B5C32', petalas = 8) {
  return grupo(
    x,
    y,
    0,
    Array.from({ length: petalas }, (_, i) =>
      grupo(
        0,
        0,
        (i * 360) / petalas,
        `<ellipse cx="0" cy="${n(-raio * 0.68)}" rx="${n(raio * 0.3)}" ry="${n(raio * 0.6)}" fill="${cor}"/>`,
      ),
    ).join('') + `<circle r="${n(raio * 0.35)}" fill="${centro}"/>`,
  );
}

function fruto(x, y, largura, altura, cor, sulcos = false) {
  return grupo(
    x,
    y,
    0,
    `<ellipse rx="${n(largura)}" ry="${n(altura)}" fill="${cor}"/>${sulcos ? [-0.45, 0, 0.45].map((k) => `<path d="M0 ${n(-altura * 0.9)}Q${n(largura * k * 1.8)} 0 0 ${n(altura * 0.9)}" stroke="#6F4A2E" stroke-width=".8" opacity=".5" fill="none"/>`).join('') : ''}`,
  );
}

function vagem(x, y, comprimento, cor, largura = 4) {
  return grupo(
    x,
    y,
    0,
    `<path d="M0 0Q${largura * 2} ${n(comprimento / 2)} 2 ${n(comprimento)}Q${-largura} ${n(comprimento / 2)} 0 0Z" fill="${cor}"/>`,
  );
}

function cacho(x, y, escala, cor, banana = false) {
  let desenho = linha(0, -6, 0, 17, '#726044', 2);
  for (let fila = 0; fila < 3; fila++) {
    for (let i = -1; i <= 1; i++) {
      desenho += banana
        ? `<path d="M${i * 8} ${fila * 7}q-5 9 4 12q-5-6 2-11" fill="#C3C75F" stroke="#788849" stroke-width=".8"/>`
        : `<circle cx="${i * (6 - fila)}" cy="${fila * 6}" r="4" fill="${cor}"/>`;
    }
  }
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(escala)})">${desenho}</g>`;
}

function arbusto(tipo, h, cor, vigor, reproducao) {
  const ramos = tipo === 'crotalaria' ? 3 : 5;
  let desenho = linha(0, 0, 0, -h * 0.76, '#7B8052', 2 + vigor * 2);
  for (let i = 0; i < ramos; i++) {
    const lado = i % 2 ? 1 : -1;
    const y = -h * (0.25 + i * 0.105);
    const x = lado * h * (tipo === 'crotalaria' ? 0.12 : 0.28);
    const fim = y - h * 0.15;
    desenho += linha(0, y, x, fim, '#748356', 1.6);
    if (tipo === 'crotalaria') {
      desenho += folha(x, fim, lado < 0 ? -155 : -25, h * 0.21, h * 0.035, cor);
      if (reproducao > 0.05) {
        const topo = fim - h * 0.17;
        desenho += `<g opacity="${n(reproducao)}">${linha(x, fim, x, topo, '#748356', 1)}${[0, 1, 2].map((j) => `${linha(x, topo + j * h * 0.055, x + (j % 2 ? 3 : -3), topo + j * h * 0.055, '#748356', 0.8)}${flor(x + (j % 2 ? 3 : -3), topo + j * h * 0.055, h * 0.039, '#E9CA52', '#BD9A35', 5)}`).join('')}</g>`;
      }
    } else if (tipo === 'margaridao') {
      desenho += palmada(x, fim, h * 0.18, cor, false, 5);
      const fy = fim - h * 0.2;
      desenho += `<g opacity="${n(reproducao)}">${linha(x, fim, x, fy, '#748356', 1.5)}${flor(x, fy, h * 0.085, '#F0C94F')}</g>`;
    } else {
      desenho += trifolio(x, fim, h * (0.13 + 0.09 * vigor), cor);
      if (reproducao > 0.05)
        desenho += `<g opacity="${n(reproducao)}">${tipo === 'guandu' ? flor(x, fim, h * 0.035, '#E5C862', '#927437', 5) : ''}${linha(x, fim, x, fim + 2, '#748356', 1)}${vagem(x, fim + 2, h * (tipo === 'caupi' ? 0.42 : 0.18), '#A3A15D', tipo === 'caupi' ? 2 : 3)}</g>`;
    }
  }
  return desenho;
}

function cobertura(tipo, h, cor, vigor, reproducao) {
  const amplitude = h * (tipo === 'mucuna' ? 1.4 : 1);
  let desenho = '';
  for (const lado of [-1, 1]) {
    desenho += `<path d="M0 0Q${n(lado * amplitude * 0.4)} ${n(-h * 0.35)} ${n(lado * amplitude)} -4" fill="none" stroke="#64845B" stroke-width="2"/>`;
    for (let i = 1; i <= 3; i++) {
      const x = (lado * amplitude * i) / 3.2;
      const y = -h * 0.27 * Math.sin((Math.PI * i) / 3.2) - 2;
      desenho += linha(x, y, x, y - h * 0.2, '#64845B', 1.2);
      desenho += trifolio(x, y - h * 0.2, h * (tipo === 'canavalia' ? 0.4 : 0.28), cor);
      if (tipo === 'canavalia')
        desenho += `<g opacity="${n(reproducao)}">${vagem(x, y - h * 0.2, h * 0.42, '#8B9B62', 5)}</g>`;
      if (tipo === 'mucuna' && i === 2)
        desenho += `<g opacity="${n(reproducao)}">${linha(x, y - h * 0.2, x, y + 5, '#64845B', 1)}${[0, 1, 2].map((j) => fruto(x + (j % 2 ? 3 : -3), y + 5 + j * 4, 3, 5, '#806183')).join('')}</g>`;
    }
  }
  return desenho;
}

function bananeira(h, cor, vigor, reproducao) {
  const tronco = h * (0.35 + 0.26 * vigor);
  let desenho = `<path d="M-5 0L-3 ${n(-tronco)}H3L7 0Z" fill="#99AD69"/>${linha(0, 0, 0, -tronco, '#BDD18C', 2)}`;
  for (const a of [-170, -140, -97, -45, -5]) {
    const l = h * 0.5;
    const w = h * 0.14;
    desenho += grupo(
      0,
      -tronco,
      a,
      `<path d="M0 0Q${n(l * 0.3)} ${n(-w * 1.6)} ${n(l * 0.72)} ${n(-w * 0.7)}Q${n(l * 0.9)} 0 ${n(l)} ${n(l * 0.16)}Q${n(l * 0.55)} ${n(w)} 0 0Z" fill="${a < -90 ? cor : '#6DA36C'}"/><path d="M0 0Q${n(l * 0.55)} ${n(-l * 0.16)} ${n(l)} ${n(l * 0.16)}" fill="none" stroke="#B5CB85" stroke-width="1"/>`,
    );
  }
  desenho += `<g opacity="${n(reproducao)}">${linha(0, -tronco + 5, 15, -tronco + 18, '#687E4C', 2)}${cacho(15, -tronco + 23, 0.5 + vigor * 0.4, '', true)}</g>`;
  return desenho;
}

function fronde(x, y, dx, dy, tamanho, cor) {
  const cx = dx * 0.45;
  const cy = Math.min(dy, -tamanho * 0.7);
  let desenho = `<path d="M0 0Q${n(cx)} ${n(cy)} ${n(dx)} ${n(dy)}" fill="none" stroke="#6D8C58" stroke-width="1.4"/>`;
  for (let i = 1; i < 9; i++) {
    const t = i / 10;
    const px = 2 * (1 - t) * t * cx + t * t * dx;
    const py = 2 * (1 - t) * t * cy + t * t * dy;
    const angulo =
      (Math.atan2(2 * (1 - t) * cy + 2 * t * (dy - cy), 2 * (1 - t) * cx + 2 * t * (dx - cx)) *
        180) /
      Math.PI;
    const l = tamanho * (0.27 - t * 0.15);
    desenho += folha(px, py, angulo + 64, l, l * 0.12, cor);
    desenho += folha(px, py, angulo - 64, l, l * 0.12, cor);
  }
  return grupo(x, y, 0, desenho);
}

function palmeira(tipo, h, cor, vigor, reproducao) {
  let desenho = '';
  const estipes = tipo === 'jucara' ? [0] : tipo === 'acai' ? [-15, 3, 18] : [-9, 10];
  estipes.forEach((x, i) => {
    const porte = 1 - i * 0.22;
    const t = h * (0.28 + 0.45 * vigor) * porte;
    const base = x * 0.5;
    desenho += linha(base, 0, x, -t, tipo === 'acai' ? '#8B9876' : '#8B795E', 3 + vigor * 2);
    for (let j = 1; j < 7; j++) {
      const f = j / 7;
      desenho += linha(
        base + (x - base) * f - 2,
        -t * f,
        base + (x - base) * f + 2,
        -t * f,
        '#C0B698',
        0.8,
      );
    }
    const l = h * 0.46 * porte;
    for (const [dx, dy] of [
      [-0.95, 0.18],
      [-0.7, -0.3],
      [-0.12, -0.83],
      [0.68, -0.32],
      [0.95, 0.18],
    ])
      desenho += fronde(x, -t, l * dx, l * dy, l, cor);
    if (i === 0)
      desenho += `<g opacity="${n(reproducao)}">${linha(x, -t, x + 10, -t + 15, '#8B795E', 1.5)}${cacho(x + 10, -t + 20, 0.8, ['acai', 'jucara'].includes(tipo) ? '#524457' : '#D79448')}</g>`;
  });
  return desenho;
}

function milho(h, cor, reproducao) {
  let desenho = linha(0, 0, 0, -h, '#859255', 3);
  for (let i = 1; i <= 5; i++) {
    const y = (-h * i) / 7;
    const a = i % 2 ? -157 : -23;
    desenho += folha(0, y, a, h * (0.46 - i * 0.025), h * 0.045, cor);
    desenho += linha(-2, y, 2, y, '#C2C68F', 1);
  }
  desenho += `<g opacity="${n(reproducao)}">${linha(0, -h, 0, -h * 1.12, '#BEA362', 1.5)}${[-1, 1].map((lado) => linha(0, -h * 1.03, lado * 12, -h * 1.1, '#BEA362', 1.5)).join('')}${fruto(4, -h * 0.47, 5, h * 0.13, '#D5C46B')}${linha(5, -h * 0.6, 10, -h * 0.65, '#AB8354', 1)}</g>`;
  return desenho;
}

function abacaxi(h, cor, reproducao) {
  let desenho = [-163, -145, -125, -104, -78, -55, -35, -17]
    .map((a) => folha(0, -2, a, h * 0.77, h * 0.055, a % 2 ? cor : '#7B9B78'))
    .join('');
  const y = -h * 0.65;
  desenho += `<g opacity="${n(reproducao)}">${linha(0, -2, 0, y + 13, '#7C925E', 3)}${fruto(0, y, h * 0.17, h * 0.22, '#CFB65D', true)}`;
  for (const a of [-130, -110, -90, -70, -50])
    desenho += folha(0, y - h * 0.2, a, h * 0.25, h * 0.035, cor);
  return desenho + '</g>';
}

function palmadas(tipo, h, cor, reproducao) {
  const topo = -h * 0.77;
  let desenho = linha(
    0,
    0,
    0,
    topo,
    tipo === 'mamao' ? '#9DA87A' : '#9B7A65',
    tipo === 'mamao' ? 6 : 3,
  );
  if (tipo === 'mamao')
    for (let i = 1; i <= 5; i++)
      desenho += linha(-2, (topo * i) / 6, 2, (topo * i) / 6 + 1, '#C0C29B', 1);
  for (let i = 0; i < 5; i++) {
    const a = ((-155 + i * 32) * Math.PI) / 180;
    const x = Math.cos(a) * h * 0.34;
    const y = topo + Math.sin(a) * h * 0.15;
    desenho += linha(
      0,
      topo + (tipo === 'mandioca' ? i * h * 0.06 : 0),
      x,
      y,
      tipo === 'mandioca' ? '#A78875' : '#8E9C68',
      1.5,
    );
    desenho += palmada(x, y, h * (tipo === 'mandioca' ? 0.2 : 0.23), cor, tipo === 'mandioca');
  }
  if (tipo === 'mamao')
    desenho += `<g opacity="${n(reproducao)}">${[-1, 1].map((lado, i) => `${linha(0, topo + 7, lado * 7, topo + 12 + i * 13, '#79864C', 1.5)}${fruto(lado * 7, topo + 19 + i * 13, 6, 10, i ? '#C8B957' : '#93AA57')}`).join('')}</g>`;
  return desenho;
}

function arvore(tipo, h, cor, vigor, reproducao) {
  const topo = -h * 0.78;
  let desenho = `<path d="M${n(-2 - vigor * 3)} 0L-2 ${n(topo)}H2L${n(3 + vigor * 3)} 0Z" fill="${tipo === 'parica' ? '#9B9F7A' : madeira}"/>`;
  const ramos = tipo === 'parica' ? 5 : 7;
  for (let i = 0; i < ramos; i++) {
    const lado = i % 2 ? 1 : -1;
    const y = topo + h * (0.28 - i * 0.045);
    const x = lado * h * (0.19 + (i % 3) * 0.07);
    const fim = y - h * 0.17;
    desenho += linha(0, y, x, fim, tipo === 'parica' ? '#9B9F7A' : madeira, 1.5 + vigor);
    if (['parica', 'andiroba', 'gliricidia'].includes(tipo)) {
      desenho += pinada(
        x,
        fim,
        lado < 0 ? -160 : -20,
        h * (tipo === 'parica' ? 0.31 : 0.29),
        cor,
        tipo === 'parica',
      );
      desenho += pinada(x, fim, -90, h * 0.23, verdeClaro, tipo === 'parica');
    } else {
      const ponta = x + lado * h * 0.1;
      desenho += linha(x, fim, ponta, fim - h * 0.06, madeira, 1);
      desenho += folha(
        ponta,
        fim - h * 0.06,
        lado < 0 ? -145 : -35,
        h * (tipo === 'cupuacu' ? 0.32 : 0.25),
        h * 0.11,
        cor,
      );
      desenho += folha(
        x,
        fim,
        lado < 0 ? -90 : -65,
        h * (0.16 + 0.1 * vigor),
        h * 0.09,
        verdeClaro,
      );
      desenho += folha(x * 0.65, y - h * 0.1, lado < 0 ? -155 : -25, h * 0.24, h * 0.095, cor);
    }
    if (tipo === 'cupuacu' && i < 3)
      desenho += `<g opacity="${n(reproducao)}">${linha(x, fim, x, fim + 10, madeira, 1)}${fruto(x, fim + 18, 7, 12, '#A1885A')}</g>`;
    if (tipo === 'andiroba' && i < 2)
      desenho += `<g opacity="${n(reproducao)}">${linha(x, fim, x, fim + 9, madeira, 1)}${fruto(x, fim + 12, 5, 6, '#A3975E')}</g>`;
    if (tipo === 'gliricidia' && i > 3)
      desenho += `<g opacity="${n(reproducao)}">${flor(x, fim, 3.5, '#C39AB3', '#E1C5B3', 5)}</g>`;
  }
  // O cacau frutifica no tronco: não penduramos os frutos nas pontas das folhas.
  if (tipo === 'cacau')
    desenho += `<g opacity="${n(reproducao)}">${[-1, 1].map((lado, i) => `${linha(0, -h * (0.35 + i * 0.18), lado * 7, -h * (0.35 + i * 0.18), madeira, 1.5)}${fruto(lado * 8, -h * (0.35 + i * 0.18), 5.5, 12, i ? '#CAA54A' : '#AA704D', true)}`).join('')}</g>`;
  return desenho;
}

// Modelos por arquitetura. As raízes são símbolos, sem representar profundidade real.
function novaPlanta(p, h, vigor, reproducao) {
  let s = '';
  if (p.classe === 'palmeira') return palmeira('jucara', h, p.cor, vigor, reproducao);
  if (p.classe === 'conifera') {
    s += linha(0, 0, 0, -h, madeira, 3);
    for (let i = 1; i <= 6; i++)
      for (const lado of [-1, 1]) {
        const y = (-h * i) / 7,
          x = lado * h * (0.34 - i * 0.035);
        s += linha(0, y, x, y - h * 0.08, p.cor, 3);
        for (let k = 1; k <= 5; k++)
          s += linha(
            (x * k) / 5,
            y - (h * 0.08 * k) / 5,
            (x * k) / 5 + lado * 5,
            y - (h * 0.08 * k) / 5 - 6,
            p.cor,
            1.5,
          );
      }
    return s;
  }
  if (p.classe === 'rizoma') {
    for (let i = -2; i <= 2; i++) {
      const x = i * 10;
      s += linha(0, 0, x, -h * (0.7 + Math.abs(i) * 0.1), p.cor, 2);
      s += folha(
        x,
        -h * (0.45 + Math.abs(i) * 0.07),
        i < 0 ? -150 : -30,
        h * 0.58,
        h * 0.12,
        p.cor,
      );
    }
    return s;
  }
  if (p.classe === 'rasteira') {
    for (const lado of [-1, 1])
      for (let i = 1; i <= 5; i++) {
        const x = lado * i * h * 0.37,
          y = -12 - i * 2;
        s += linha(0, 0, x, y, p.cor, 1.5);
        s += palmada(x, y, h * 0.28, p.cor, false, 5);
      }
    return s;
  }
  s = arvore(p.tipo, h, p.cor, vigor, 0);
  for (let i = 0; i < 4; i++) {
    const lado = i % 2 ? 1 : -1;
    const x = lado * h * (0.17 + i * 0.025),
      y = -h * (0.65 + i * 0.035);
    s +=
      '<g opacity="' +
      n(reproducao) +
      '">' +
      fruto(x, y, 4, p.tipo === 'urucum' ? 7 : 4, p.fruto, p.tipo === 'pitanga') +
      '</g>';
  }
  if (p.classe === 'cacto')
    for (let i = 1; i <= 5; i++) s += linha(2, (-h * i) / 7, 7, (-h * i) / 7 - 3, '#765D40', 1);
  return s;
}

export function desenharEspecie(especie, estado) {
  const p = perfisVisuais[especie.id];
  const h = p.altura * estado.crescimento;
  const { vigor, reproducao } = estado;
  if (p.classe) return novaPlanta(p, h, vigor, reproducao);
  if (['guandu', 'crotalaria', 'caupi', 'margaridao'].includes(p.tipo))
    return arbusto(p.tipo, h, p.cor, vigor, reproducao);
  if (['canavalia', 'mucuna'].includes(p.tipo))
    return cobertura(p.tipo, h, p.cor, vigor, reproducao);
  if (p.tipo === 'banana') return bananeira(h, p.cor, vigor, reproducao);
  if (['acai', 'pupunha'].includes(p.tipo)) return palmeira(p.tipo, h, p.cor, vigor, reproducao);
  if (p.tipo === 'milho') return milho(h, p.cor, reproducao);
  if (p.tipo === 'abacaxi') return abacaxi(h, p.cor, reproducao);
  if (['mandioca', 'mamao'].includes(p.tipo)) return palmadas(p.tipo, h, p.cor, reproducao);
  return arvore(p.tipo, h, p.cor, vigor, reproducao);
}

export function desenharRaizes(especie, estado) {
  const p = perfisVisuais[especie.id];
  const tamanho = estado.raiz;
  const fundo = (p.raiz === 'fasciculada' ? 68 : p.raiz === 'tuberosa' ? 85 : 132) * tamanho;
  let desenho = '';
  if (p.raiz === 'fasciculada') {
    for (let i = -3; i <= 3; i++)
      desenho += `<path d="M0 0Q${n(i * 7 * tamanho)} ${n(fundo * 0.3)} ${n(i * 15 * tamanho)} ${n(fundo * (1 - Math.abs(i) * 0.09))}"/>`;
  } else if (p.raiz === 'ramificada' || p.raiz === 'esquematica') {
    // Rede lateral, visualmente distinta da raiz pivotante e sem escala real.
    for (let i = -3; i <= 3; i++) {
      const x = i * 20 * tamanho;
      const y = (74 - Math.abs(i) * 9) * tamanho;
      desenho += `<path d="M0 0Q${n(x * 0.3)} ${n(y * 0.17)} ${n(x)} ${n(y)}"/>`;
    }
  } else {
    desenho = `<path d="M0 0Q-3 ${n(fundo * 0.45)} 0 ${n(fundo)}"/>`;
    for (let i = 1; i <= 4; i++) {
      const lado = i % 2 ? -1 : 1;
      const y = (fundo * i) / 6;
      desenho += `<path d="M0 ${n(y)}Q${n(lado * 20 * tamanho)} ${n(y + 8 * tamanho)} ${n(lado * 35 * tamanho)} ${n(y + 25 * tamanho)}"/>`;
    }
    if (p.raiz === 'tuberosa') {
      for (const i of [-2, -1, 1, 2])
        desenho += `<path d="M0 5Q${n(i * 12 * tamanho)} ${n(fundo * 0.22)} ${n(i * 13 * tamanho)} ${n(fundo * 0.85)}" stroke="#A98052" stroke-width="${n(3 + estado.vigor * 7)}"/>`;
    }
  }
  return desenho;
}
