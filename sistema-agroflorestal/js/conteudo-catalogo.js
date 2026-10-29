/* Apresentação compartilhada das evidências, sem transformar referência em regra. */
import { escapar, numero } from './utils.js';

export const nomesRelacoes = {
    FAVORAVEL_CONDICIONAL: 'Benefício condicionado ao manejo',
    CONSORCIO_DOCUMENTADO: 'Consórcio documentado',
    ATENCAO: 'Atenção ao manejo',
    EVITAR: 'Evitar no contexto indicado',
    DESCONHECIDA: 'Sem registro nesta curadoria'
};

export function linkFonte(fonte) {
    return fonte ? `<a href="${escapar(fonte.url)}" target="_blank" rel="noopener noreferrer">${escapar(fonte.titulo)} ↗</a>` : '';
}

export function apresentarInteracao(relacao, titulo = '') {
    const status = nomesRelacoes[relacao.status] ? relacao.status : 'DESCONHECIDA';
    return `<article class="evidencia evidencia-${status.toLowerCase()}">
        ${titulo ? `<h4>${escapar(titulo)}</h4>` : ''}
        <strong>${nomesRelacoes[status]}</strong>
        <p>${escapar(relacao.motivo)}</p>
        ${relacao.contexto ? `<p><b>Contexto:</b> ${escapar(relacao.contexto)}</p>` : ''}
        ${relacao.manejo ? `<p><b>O que observar:</b> ${escapar(relacao.manejo)}</p>` : ''}
        ${relacao.tipoEvidencia ? `<p class="muted">Evidência: ${escapar(relacao.tipoEvidencia)}</p>` : ''}
        ${linkFonte(relacao.fonte)}
    </article>`;
}

export function apresentarFaixas(faixas, fontes) {
    return faixas.map(f => {
        const valor = f.min === f.max ? `≈ ${numero(f.min)}`
            : f.min == null ? `Até ${numero(f.max)}`
            : f.max == null ? `Referência mínima: ${numero(f.min)}`
            : `${numero(f.min)} a ${numero(f.max)}`;
        return `<li><strong>${escapar(f.parametro)}: ${valor} ${escapar(f.unidade)}</strong>
            <span>${escapar(f.tipo)}. ${escapar(f.contexto)}</span>${linkFonte(fontes[f.fonte])}</li>`;
    }).join('');
}
