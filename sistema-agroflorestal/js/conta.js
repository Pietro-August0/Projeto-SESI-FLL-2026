/* Senhas e tokens de sessão não são gravados no armazenamento do navegador. */
import './utils.js';
import { consultarAcesso, enviarConta, encerrarSessao, destinoAposLogin } from './sessao.js';

const $ = seletor => document.querySelector(seletor);
const formulario = $('#form-conta');
const email = $('#email');
const senha = $('#senha');
const repeticao = $('#confirmacao');
const campoCodigo = $('#codigo-email');
const emailCodigo = $('#email-codigo');
const mensagem = $('#mensagem-conta');
let modo = 'entrar';
let verificacaoEmail = false;
let emEnvio = false;
let emailPendente = '';
let reenvioAte = 0;
try {
    emailPendente = sessionStorage.getItem('ybyra_email_pendente') || '';
    reenvioAte = Number(sessionStorage.getItem('ybyra_reenvio_ate')) || 0;
} catch { /* A confirmação funciona mesmo sem sessionStorage. */ }
let tokenConfirmacao = new URLSearchParams(location.hash.slice(1)).get('token_hash');
if (location.hash) history.replaceState(null, '', location.pathname + location.search);

function avisar(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.classList.toggle('erro', erro);
    mensagem.focus();
}
function guardarEmail(valor) {
    emailPendente = valor.trim();
    try {
        if (emailPendente) sessionStorage.setItem('ybyra_email_pendente', emailPendente);
        else sessionStorage.removeItem('ybyra_email_pendente');
    } catch { /* Nunca armazena senha ou código. */ }
}
function atualizarSenha() {
    const valor = senha.value;
    const variedade = new Set(valor).size;
    let forca = 0;
    if (valor) forca = 1;
    if (valor.length >= 12 && variedade >= 5) forca = 2;
    if (valor.length >= 16 && variedade >= 6) forca = 3;
    if (valor.length >= 20 && variedade >= 8) forca = 4;
    $('#forca-senha').value = forca;
    $('#forca-senha-texto').textContent = ['comece a digitar', 'fraca ou curta', 'razoável', 'boa', 'muito boa'][forca];
    const iguais = senha.value === repeticao.value;
    repeticao.setCustomValidity(modo === 'cadastrar' && repeticao.value && !iguais ? 'As senhas precisam ser iguais.' : '');
    $('#senha-combinacao').textContent = !repeticao.value ? 'Repita a senha escolhida.' : iguais ? 'As senhas são iguais.' : 'As senhas ainda estão diferentes.';
}
function atualizarReenvio() {
    const segundos = Math.max(0, Math.ceil((reenvioAte - Date.now()) / 1000));
    $('#reenviar-email').disabled = emEnvio || segundos > 0;
    $('#reenviar-email').textContent = segundos ? `Reenviar em ${segundos}s` : 'Reenviar código';
}
function iniciarIntervaloReenvio() {
    reenvioAte = Date.now() + 60000;
    try { sessionStorage.setItem('ybyra_reenvio_ate', String(reenvioAte)); } catch { /* Limites reais são aplicados pelo servidor. */ }
    atualizarReenvio();
}
function mostrarDestinatario() {
    emailCodigo.value = emailPendente;
    $('#destinatario-email').textContent = emailPendente;
    $('#codigo-destinatario').hidden = !emailPendente;
    $('#alterar-email-codigo').hidden = !emailPendente;
    $('#campo-email-codigo').hidden = Boolean(emailPendente);
}
function mudarModo(novoModo, limparMensagem = true) {
    if (!['entrar', 'cadastrar', 'confirmar'].includes(novoModo)) novoModo = 'entrar';
    if (novoModo === 'confirmar' && !verificacaoEmail) novoModo = 'entrar';
    modo = novoModo;
    formulario.reset();
    senha.type = repeticao.type = 'password';
    $('#mostrar-senha').checked = false;
    $('#painel-acesso').hidden = modo === 'confirmar';
    $('#confirmacao-codigo').hidden = modo !== 'confirmar';
    $('#painel-acesso').setAttribute('aria-labelledby', `aba-${modo === 'cadastrar' ? 'cadastrar' : 'entrar'}`);
    $('#campo-confirmacao').hidden = $('#senha-orientacao').hidden = modo !== 'cadastrar';
    repeticao.required = modo === 'cadastrar';
    senha.minLength = modo === 'cadastrar' ? 12 : 1;
    senha.autocomplete = modo === 'cadastrar' ? 'new-password' : 'current-password';
    $('#ajuda-senha').textContent = modo === 'cadastrar' ? 'Crie uma senha com pelo menos 12 caracteres.' : 'Use sua senha para entrar.';
    $('#enviar-conta').textContent = modo === 'cadastrar' ? 'Criar conta →' : 'Entrar →';
    $('#conta-titulo').textContent = { entrar: 'Boas-vindas ao ybyrá', cadastrar: 'Sua conta começa aqui', confirmar: 'Confirme seu e-mail' }[modo];
    $('#conta-subtitulo').textContent = { entrar: 'Entre com seu e-mail e senha.', cadastrar: verificacaoEmail ? 'Crie sua senha. Depois, confirme o código enviado ao seu e-mail.' : 'Crie sua senha para começar.', confirmar: 'Agora só falta o código que chegou na sua caixa de entrada.' }[modo];
    document.querySelectorAll('[data-modo]').forEach(botao => {
        const ativo = botao.dataset.modo === modo;
        botao.setAttribute('aria-selected', String(ativo));
        botao.tabIndex = ativo ? 0 : -1;
    });
    const url = new URL(location.href);
    if (modo === 'entrar') url.searchParams.delete('etapa');
    else url.searchParams.set('etapa', modo);
    history.replaceState(null, '', url.pathname + url.search);
    if (modo === 'confirmar') mostrarDestinatario();
    atualizarSenha();
    if (limparMensagem) { mensagem.textContent = ''; mensagem.classList.remove('erro'); }
    atualizarReenvio();
}
function bloquear(ativo) {
    emEnvio = ativo;
    $('#campos-conta').disabled = ativo;
    $('#enviar-codigo').disabled = ativo;
    emailCodigo.disabled = campoCodigo.disabled = ativo;
    document.querySelectorAll('[data-modo], #alterar-email-codigo, #confirmar-email').forEach(b => { b.disabled = ativo; });
    atualizarReenvio();
}
function erroLegivel(erro) {
    return erro instanceof TypeError || erro.name === 'TimeoutError' ? 'Não foi possível conectar. Confira sua conexão e tente novamente.' : erro.message;
}
function mostrarConfirmacaoPorLink() {
    if (!tokenConfirmacao || !verificacaoEmail) return;
    mudarModo('confirmar');
    $('#verificar-email').hidden = false;
    $('#form-codigo').hidden = true;
    $('#reenvio-email').hidden = true;
    avisar('Clique em Confirmar meu e-mail para ativar sua conta.');
}
function concluirConfirmacao(texto) {
    const confirmado = emailCodigo.value || emailPendente;
    guardarEmail('');
    $('#form-codigo').reset();
    $('#verificar-email').hidden = true;
    $('#form-codigo').hidden = false;
    $('#reenvio-email').hidden = false;
    tokenConfirmacao = null;
    mudarModo('entrar');
    email.value = confirmado;
    avisar(texto);
}

document.querySelectorAll('[data-modo]').forEach(botao => botao.addEventListener('click', () => mudarModo(botao.dataset.modo)));
$('#modos-conta').addEventListener('keydown', evento => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(evento.key)) return;
    const botoes = [...document.querySelectorAll('[data-modo]')].filter(b => !b.hidden);
    const atual = botoes.indexOf(document.activeElement);
    if (atual < 0 || emEnvio) return;
    evento.preventDefault();
    const indice = evento.key === 'Home' ? 0 : evento.key === 'End' ? botoes.length - 1 : (atual + (evento.key === 'ArrowRight' ? 1 : -1) + botoes.length) % botoes.length;
    mudarModo(botoes[indice].dataset.modo); botoes[indice].focus();
});
senha.addEventListener('input', atualizarSenha);
repeticao.addEventListener('input', atualizarSenha);
$('#mostrar-senha').addEventListener('change', evento => { senha.type = repeticao.type = evento.target.checked ? 'text' : 'password'; });
$('#alterar-email-codigo').addEventListener('click', () => { guardarEmail(''); mostrarDestinatario(); campoCodigo.value = ''; emailCodigo.focus(); });
formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    atualizarSenha();
    if (emEnvio || !formulario.reportValidity()) return;
    const endereco = email.value.trim();
    const acao = modo === 'cadastrar' ? 'cadastrar' : 'entrar';
    bloquear(true); $('#enviar-conta').textContent = 'Aguarde…';
    try {
        const resultado = await enviarConta(acao, { email: endereco, senha: senha.value });
        if (resultado.verificacao_pendente) {
            guardarEmail(endereco); iniciarIntervaloReenvio(); mudarModo('confirmar'); avisar(resultado.mensagem); campoCodigo.focus();
        } else {
            formulario.reset();
            try { localStorage.removeItem('analiseAtual'); } catch { /* A sessão não depende desse armazenamento. */ }
            location.replace(destinoAposLogin());
        }
    } catch (erro) {
        if (erro.verificacaoPendente) { guardarEmail(endereco); mudarModo('confirmar'); }
        avisar(erroLegivel(erro), true);
    } finally { bloquear(false); $('#enviar-conta').textContent = modo === 'cadastrar' ? 'Criar conta →' : 'Entrar →'; }
});
$('#form-codigo').addEventListener('submit', async evento => {
    evento.preventDefault();
    if (emEnvio || !evento.target.reportValidity()) return;
    bloquear(true);
    try {
        const resultado = await enviarConta('confirmar', { email: emailCodigo.value.trim(), codigo: campoCodigo.value.trim() });
        concluirConfirmacao(resultado.mensagem);
    } catch (erro) { avisar(erroLegivel(erro), true); }
    finally { bloquear(false); }
});
$('#reenviar-email').addEventListener('click', async () => {
    if (emEnvio || Date.now() < reenvioAte || !emailCodigo.reportValidity()) return;
    bloquear(true);
    try {
        const resultado = await enviarConta('reenviar', { email: emailCodigo.value.trim() });
        guardarEmail(emailCodigo.value); mostrarDestinatario(); iniciarIntervaloReenvio(); avisar(resultado.mensagem);
    } catch (erro) { avisar(erroLegivel(erro), true); }
    finally { bloquear(false); }
});
$('#confirmar-email').addEventListener('click', async () => {
    if (emEnvio) return;
    bloquear(true);
    try { const resultado = await enviarConta('confirmar', { token_hash: tokenConfirmacao }); concluirConfirmacao(resultado.mensagem); }
    catch (erro) { $('#verificar-email').hidden = true; $('#form-codigo').hidden = false; $('#reenvio-email').hidden = false; avisar(erroLegivel(erro), true); }
    finally { bloquear(false); }
});
$('#copiar-codigo').addEventListener('click', async () => {
    if (!/^(?:[0-9]{6}|[0-9]{8})$/.test(campoCodigo.value.trim())) { avisar('Informe o código recebido no e-mail antes de copiar.', true); campoCodigo.focus(); return; }
    try { await navigator.clipboard.writeText(campoCodigo.value.trim()); avisar('Código copiado.'); }
    catch { campoCodigo.focus(); campoCodigo.select(); avisar('O código foi selecionado. Use Copiar no seu dispositivo.'); }
});
$('#colar-codigo').addEventListener('click', async () => {
    try {
        const valor = (await navigator.clipboard.readText()).replace(/[\s-]/g, '');
        if (!/^(?:[0-9]{6}|[0-9]{8})$/.test(valor)) { avisar('Copie apenas o código de confirmação recebido no e-mail.', true); return; }
        campoCodigo.value = valor; campoCodigo.focus(); avisar('Código colado. Clique em Confirmar cadastro.');
    } catch { campoCodigo.focus(); avisar('Use Colar no campo do código ou digite o código recebido.'); }
});
$('#sair-conta').addEventListener('click', async evento => {
    evento.target.disabled = true;
    try { await encerrarSessao(); } catch { avisar('Não foi possível sair. Tente novamente.', true); evento.target.disabled = false; }
});
$('#tentar-conexao').addEventListener('click', () => location.reload());
window.addEventListener('hashchange', () => {
    const token = new URLSearchParams(location.hash.slice(1)).get('token_hash');
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    if (token) { tokenConfirmacao = token; mostrarConfirmacaoPorLink(); }
});
try {
    const acesso = await consultarAcesso();
    verificacaoEmail = Boolean(acesso.verificacao_email);
    $('#aba-confirmar').hidden = $('#conta-seguranca').hidden = !verificacaoEmail;
    if (acesso.usuario) {
        $('#modos-conta').hidden = $('#conta-apresentacao').hidden = $('#painel-acesso').hidden = true;
        $('#sessao-conta').hidden = false;
        $('#conta-email').textContent = acesso.usuario.email;
        $('#continuar-conta').href = destinoAposLogin();
    } else {
        $('#campos-conta').disabled = false;
        mudarModo(new URLSearchParams(location.search).get('etapa') || 'entrar');
        mostrarConfirmacaoPorLink();
    }
} catch (erro) {
    avisar(erroLegivel(erro), true); $('#tentar-conexao').hidden = false;
}
atualizarReenvio();
setInterval(atualizarReenvio, 1000);
