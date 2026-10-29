/* Parâmetros de desenho, NÃO taxas agronômicas. O progresso não representa dias. */
export const perfisVisuais = {
    'feijao-guandu': { tipo: 'guandu', altura: 104, raiz: 'pivotante', ritmo: .68, cor: '#456C39', detalhe: 'Arbusto ramificado, folhas com três folíolos e pequenas vagens.' },
    crotalaria: { tipo: 'crotalaria', altura: 102, raiz: 'pivotante', ritmo: .5, cor: '#68883D', detalhe: 'Hastes eretas, folhas estreitas e flores amarelas em racemos.' },
    'feijao-de-porco': { tipo: 'canavalia', altura: 55, raiz: 'pivotante', ritmo: .5, cor: '#3F804F', detalhe: 'Folhas largas com três folíolos e vagens largas; cobertura de porte baixo.' },
    mucuna: { tipo: 'mucuna', altura: 48, raiz: 'ramificada', ritmo: .55, cor: '#376A4A', detalhe: 'Ramos rastejantes ou trepadores e folhas trifolioladas; expansão lateral.' },
    gliricidia: { tipo: 'gliricidia', altura: 173, raiz: 'ramificada', ritmo: .76, cor: '#598C53', detalhe: 'Copa ramificada com folhas compostas pinadas; a copa pode ser manejada por poda.' },
    caupi: { tipo: 'caupi', altura: 64, raiz: 'pivotante', ritmo: .5, cor: '#4D8D4B', detalhe: 'Folhas trifolioladas e vagens finas e alongadas, diferentes das do feijão-de-porco.' },
    mandioca: { tipo: 'mandioca', altura: 105, raiz: 'tuberosa', ritmo: .72, cor: '#457B4C', detalhe: 'Caule ramificado, folhas palmadas com lobos estreitos e raízes de reserva no solo.' },
    milho: { tipo: 'milho', altura: 131, raiz: 'fasciculada', ritmo: .45, cor: '#729447', detalhe: 'Colmo com nós, folhas compridas, pendão no alto e espigas junto ao colmo.' },
    abacaxi: { tipo: 'abacaxi', altura: 69, raiz: 'fasciculada', ritmo: .67, cor: '#527C63', detalhe: 'Roseta de folhas rígidas e pontiagudas, com fruto central e coroa de folhas.' },
    banana: { tipo: 'banana', altura: 155, raiz: 'fasciculada', ritmo: .66, cor: '#489568', detalhe: 'Pseudocaule e folhas grandes com nervura central; o cacho surge sob a copa.' },
    mamao: { tipo: 'mamao', altura: 143, raiz: 'pivotante', ritmo: .7, cor: '#4B8A56', detalhe: 'Caule alto com cicatrizes, folhas palmadas no topo e frutos próximos ao caule.' },
    acai: { tipo: 'acai', altura: 194, raiz: 'fasciculada', ritmo: .98, cor: '#427F62', detalhe: 'Touceira de estipes delgados, folhas pinadas arqueadas e cachos de frutos escuros.' },
    cupuacu: { tipo: 'cupuacu', altura: 127, raiz: 'ramificada', ritmo: .96, cor: '#467454', detalhe: 'Copa de folhas grandes e frutos ovais castanhos, pendentes dos ramos.' },
    cacau: { tipo: 'cacau', altura: 101, raiz: 'pivotante', ritmo: .94, cor: '#3B7051', detalhe: 'Folhas largas e frutos com sulcos ligados ao tronco e aos ramos mais grossos.' },
    pupunha: { tipo: 'pupunha', altura: 179, raiz: 'fasciculada', ritmo: .92, cor: '#538950', detalhe: 'Palmeira de folhas pinadas e cachos compactos de frutos alaranjados; pode perfilhar.' },
    andiroba: { tipo: 'andiroba', altura: 204, raiz: 'ramificada', ritmo: 1.18, cor: '#396C50', detalhe: 'Árvore com copa ampla, folhas compostas e cápsulas de sementes; crescimento visual mais gradual.' },
    parica: { tipo: 'parica', altura: 219, raiz: 'ramificada', ritmo: .82, cor: '#65925D', detalhe: 'Tronco alongado, copa alta e aberta e folhas bipinadas, com pequenos foliólulos.' },
    margaridao: { tipo: 'margaridao', altura: 109, raiz: 'ramificada', ritmo: .65, cor: '#59834D', detalhe: 'Arbusto com folhas lobadas e capítulos amarelos semelhantes a pequenas margaridas.' }
};

// Modelos esquemáticos das novas espécies pesquisadas; sem escala temporal agronômica.
Object.assign(perfisVisuais, {
  "abiuzeiro": {
    "tipo": "abiuzeiro",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Abiúzeiro. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://ask.ifas.ufl.edu/publication/HS300"
  },
  "acafrao-curcuma": {
    "tipo": "acafrao-curcuma",
    "classe": "rizoma",
    "altura": 80,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Açafrão/ Cúrcuma. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.infoteca.cnptia.embrapa.br/bitstream/doc/659093/1/cot142.pdf"
  },
  "araca-amarelo": {
    "tipo": "araca-amarelo",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Araçá-amarelo. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.infoteca.cnptia.embrapa.br/bitstream/doc/697560/1/doc266.pdf"
  },
  "araca-roxo": {
    "tipo": "araca-roxo",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Araçá-roxo. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.bahiana.edu.br/mapeamento-de-especies/"
  },
  "araucaria": {
    "tipo": "araucaria",
    "classe": "conifera",
    "altura": 210,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Araucária. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1092571/1/2018LivroIVEncontroBrasileirodeSilviculturafinal.pdf"
  },
  "aroeira-pimenta": {
    "tipo": "aroeira-pimenta",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Aroeira-pimenta. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.esalq.usp.br/trilhas/medicina/am09.php"
  },
  "batata-doce": {
    "tipo": "batata-doce",
    "classe": "rasteira",
    "altura": 42,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Batata-Doce. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1155447/1/Sistema-de-Producao-de-Batata-Doce.pdf"
  },
  "biriba": {
    "tipo": "biriba",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Biribá. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://ask.ifas.ufl.edu/publication/HS1523"
  },
  "capixingui": {
    "tipo": "capixingui",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Capixingui. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.embrapa.br/en/busca-de-publicacoes/-/publicacao/1139725/capixingui-croton-floribundus"
  },
  "cereja-do-rio-grande": {
    "tipo": "cereja-do-rio-grande",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Cereja-do-Rio-Grande. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/578655/1/CT224.pdf"
  },
  "fruto-do-sabia": {
    "tipo": "fruto-do-sabia",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Fruto-do-sabiá. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.sescsp.org.br/wp-content/uploads/2021/12/MOGI-DAS-CRUZES.pdf"
  },
  "gengibre": {
    "tipo": "gengibre",
    "classe": "rizoma",
    "altura": 80,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Gengibre. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://biblioteca.incaper.es.gov.br/digital/bitstream/123456789/4005/1/101culturas-gengibre.pdf"
  },
  "grumixama": {
    "tipo": "grumixama",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Grumixama. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.esalq.usp.br/trilhas/fruti/fr09.htm"
  },
  "guacatonga": {
    "tipo": "guacatonga",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Guaçatonga. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://hortodidatico.ufsc.br/guacatonga/"
  },
  "guapuruvu": {
    "tipo": "guapuruvu",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Guapuruvu. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/314147/1/circtec104.pdf"
  },
  "inga-de-metro": {
    "tipo": "inga-de-metro",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Ingá-de-metro. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1140499/1/Especies-Arboreas-Brasileiras-vol-5-Inga-Cipo.pdf"
  },
  "ipe-verde": {
    "tipo": "ipe-verde",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Ipê-verde. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://uenf.br/projetos/arvoresdauenf/especie-2/ipe-verde/"
  },
  "jaracatia": {
    "tipo": "jaracatia",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Jaracatiá. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://ainfo.cnptia.embrapa.br/digital/bitstream/item/232466/1/Especies-Arboreas-Brasileiras-vol-2-Jaracatia.pdf"
  },
  "jenipapo": {
    "tipo": "jenipapo",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Jenipapo. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.esalq.usp.br/trilhas/medicina/am15.php"
  },
  "mexerica": {
    "tipo": "mexerica",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Mexerica. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://ceagesp.gov.br/hortiescolha/hortipedia/tangerina/"
  },
  "mutambo": {
    "tipo": "mutambo",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Mutambo. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/312825/1/Circular141.pdf"
  },
  "ora-pro-nobis": {
    "tipo": "ora-pro-nobis",
    "classe": "cacto",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Ora pro Nobis. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/983087/1/MANUAL-DE-PRODUCAO-DE-HORTALICAS-TRADICIONAIS.pdf"
  },
  "palmito-jucara": {
    "tipo": "palmito-jucara",
    "classe": "palmeira",
    "altura": 190,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Palmito-Juçara. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1042301/1/ManualdeViveiroeproducaodemudas.pdf"
  },
  "pau-cigarra": {
    "tipo": "pau-cigarra",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Pau-cigarra. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.infoteca.cnptia.embrapa.br/bitstream/doc/293956/1/circtec126.pdf"
  },
  "pau-jacare": {
    "tipo": "pau-jacare",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Pau-jacaré. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.esalq.usp.br/trilhas/uteis/ut03.php"
  },
  "pau-jangada": {
    "tipo": "pau-jangada",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Pau-jangada. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.hu.usp.br/wp-content/uploads/sites/433/2018/11/Placas.pdf"
  },
  "pau-polvora": {
    "tipo": "pau-polvora",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Pau-pólvora. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://repositorio.ufpe.br/bitstream/123456789/38433/1/DISSERTA%C3%87%C3%83O%20Cledson%20dos%20Santos%20Magalh%C3%A3es.pdf"
  },
  "pau-viola": {
    "tipo": "pau-viola",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#A69058",
    "detalhe": "Ilustração esquemática de Pau-viola. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.ufmg.br/mhnjb/wp-content/uploads/2025/09/Projeto-Plantar-20251103.pdf"
  },
  "pitanga": {
    "tipo": "pitanga",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#C34B47",
    "detalhe": "Ilustração esquemática de Pitanga. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.ifbaiano.edu.br/unidades/gmb/files/2021/04/Cartilha-PLAME-2.pdf"
  },
  "urucum": {
    "tipo": "urucum",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#B65C47",
    "detalhe": "Ilustração esquemática de Urucum. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/783869/1/FOL101.pdf"
  },
  "uvaia": {
    "tipo": "uvaia",
    "classe": "arvore",
    "altura": 140,
    "raiz": "esquematica",
    "ritmo": 0.85,
    "cor": "#4D8059",
    "fruto": "#E9BB52",
    "detalhe": "Ilustração esquemática de Uvaia. O progresso não representa dias, produtividade ou anatomia real das raízes.",
    "fonte": "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1157385/1/Guia-de-mudas-Livro-Cpact.pdf"
  }
});

const limitar = x => Math.max(0, Math.min(1, x));
const suave = x => { const t = limitar(x); return t * t * (3 - 2 * t); };

export function faseDoProgresso(valor) {
    return valor < 34 ? 0 : valor < 67 ? 1 : 2;
}

export function estadoDaPlanta(especie, progresso, fases) {
    const p = Math.max(0, Math.min(100, Number(progresso) || 0));
    const perfil = perfisVisuais[especie.id];
    if (!perfil) throw new Error(`Desenho não cadastrado para ${especie.id}.`);
    const renovavel = especie.ciclo === 'CURTO' && especie.estrato === 'COBERTURA';
    const noDesenvolvimento = fases.desenvolvimento.includes(especie.id);
    const noEstabelecido = fases.estabelecido.includes(especie.id);
    const fim = !noDesenvolvimento ? 34 : !noEstabelecido ? 72 : null;
    const geracao = renovavel ? Math.min(2, Math.floor(p / 35)) : 0;
    const local = renovavel ? p - geracao * 35 : p;
    const maturacao = especie.ciclo === 'CURTO' ? 24 : especie.ciclo === 'MEDIO' ? 54 : 100;
    const vigor = Math.pow(suave(local / maturacao), perfil.ritmo);
    const crescimento = .17 + .83 * vigor;
    const opacidade = renovavel ? (local < 5 && geracao ? suave(local / 5)
        : geracao < 2 ? 1 - suave((local - 29) / 6) : 1)
        : fim == null ? 1 : 1 - suave((p - (fim - 5)) / 11);
    const passou = opacidade < .05;
    const renovacao = renovavel && geracao > 0;
    const estado = renovavel && passou ? 'Renovação da cobertura'
        : passou ? 'Ciclo encerrado no arranjo'
        : renovacao ? 'Cobertura renovada'
        : vigor < .18 ? 'Estabelecimento'
        : vigor < .68 ? 'Desenvolvimento vegetativo'
        : 'Porte desenvolvido na ilustração';
    return {
        crescimento, vigor, opacidade, renovavel, geracao, estado,
        presente: !passou,
        reproducao: suave((vigor - .65) / .35),
        residuos: renovacao ? .7 : fim == null ? 0 : suave((p - (fim - 3)) / 12),
        raiz: .18 + .82 * Math.pow(vigor, .75)
    };
}
