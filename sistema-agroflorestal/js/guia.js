/* Orientação compartilhada: um percurso visível e um guia que a pessoa abre quando quiser. */
export function iniciarGuia(pagina, temAnalise) {
    const etapas = [
        { arquivo: 'index.html', nome: 'Começar' },
        { arquivo: 'analise.html', nome: 'Informar dados' },
        { arquivo: 'resultado.html', nome: 'Explorar SAF' }
    ];
    const atual = etapas.findIndex(etapa => etapa.arquivo === pagina);
    if (atual !== -1) {
        const percurso = document.createElement('nav');
        percurso.className = 'percurso';
        percurso.setAttribute('aria-label', 'Seu caminho no ybyrá');
        percurso.innerHTML = `<ol>${etapas.map((etapa, i) => `<li ${i === atual ? 'aria-current="step"' : ''}>${i === atual || (i === 2 && !temAnalise) ? `<span><b>${i + 1}</b>${etapa.nome}</span>` : `<a href="${etapa.arquivo}${i === 1 && temAnalise ? '?editar' : ''}"><b>${i + 1}</b>${etapa.nome}</a>`}</li>`).join('')}</ol>`;
        document.querySelector('main').prepend(percurso);
    }
    const telas = [
        ['Comece com um exemplo', 'Com sua conta, você pode começar mesmo sem ter dados. Escolha um exemplo fictício para conhecer o sistema. SAF é um Sistema Agroflorestal: uma combinação de árvores e outras plantas na mesma área.'],
        ['Informe uma etapa de cada vez', 'Confira a localização, os dados do solo e o objetivo. Use Continuar para avançar e Voltar para ajustar. O exemplo já traz os campos preenchidos.'],
        ['Explore sua proposta', 'Compare as opções de SAF e use Reproduzir para ver as fases. Abra os detalhes para entender a função das plantas. Você pode editar os dados e gerar novas opções.']
    ];
    const dialogo = document.createElement('dialog');
    dialogo.className = 'guia-dialogo';
    dialogo.setAttribute('aria-labelledby', 'guia-titulo');
    dialogo.innerHTML = `<div class="guia-topo"><span>Como usar o ybyrá</span><button type="button" data-fechar-guia aria-label="Fechar guia">Fechar ×</button></div><p id="guia-contagem" class="guia-contagem"></p><h2 id="guia-titulo" tabindex="-1"></h2><p id="guia-texto"></p><div class="guia-acoes"><button type="button" class="botao secundario" data-guia-voltar>Voltar</button><button type="button" class="botao" data-guia-avancar>Próximo →</button><a class="botao" href="analise.html?cenario=solo-a" data-guia-iniciar hidden>Experimentar um exemplo →</a></div>`;
    document.body.append(dialogo);
    let indice = 0;
    let origem;
    function exibir() {
        dialogo.querySelector('#guia-contagem').textContent = `Passo ${indice + 1} de ${telas.length}`;
        dialogo.querySelector('#guia-titulo').textContent = telas[indice][0];
        dialogo.querySelector('#guia-texto').textContent = telas[indice][1];
        dialogo.querySelector('[data-guia-voltar]').hidden = indice === 0;
        dialogo.querySelector('[data-guia-avancar]').hidden = indice === telas.length - 1;
        dialogo.querySelector('[data-guia-iniciar]').hidden = indice !== telas.length - 1;
        dialogo.querySelector('#guia-titulo').focus();
    }
    document.addEventListener('click', evento => {
        const botao = evento.target.closest('[data-abrir-guia]');
        if (!botao) return;
        origem = botao;
        indice = 0;
        dialogo.showModal();
        exibir();
    });
    dialogo.querySelector('[data-fechar-guia]').addEventListener('click', () => dialogo.close());
    dialogo.addEventListener('close', () => origem?.focus());
    dialogo.querySelector('[data-guia-voltar]').addEventListener('click', () => { indice--; exibir(); });
    dialogo.querySelector('[data-guia-avancar]').addEventListener('click', () => { indice++; exibir(); });
}
