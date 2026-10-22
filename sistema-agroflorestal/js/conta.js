/* Cadastro e login no servidor local. O JavaScript não guarda senhas ou tokens. */
import './utils.js';
import { consultarSessao, enviarConta, encerrarSessao, destinoAposLogin } from './sessao.js';

const formulario = document.querySelector('#form-conta');
const email = document.querySelector('#email');
const senha = document.querySelector('#senha');
const confirmacao = document.querySelector('#confirmacao');
const mensagem = document.querySelector('#mensagem-conta');
const enviar = document.querySelector('#enviar-conta');
let modo = 'entrar';

function avisar(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.classList.toggle('erro', erro);
    mensagem.focus();
}
function mudarModo(novoModo) {
    modo = novoModo;
    formulario.reset();
    senha.type = confirmacao.type = 'password';
    document.querySelector('#campo-confirmacao').hidden = modo !== 'cadastrar';
    confirmacao.required = modo === 'cadastrar';
    senha.autocomplete = modo === 'cadastrar' ? 'new-password' : 'current-password';
    senha.minLength = modo === 'cadastrar' ? 8 : 1;
    enviar.textContent = modo === 'cadastrar' ? 'Criar minha conta →' : 'Entrar →';
    document.querySelector('#conta-titulo').textContent = modo === 'cadastrar' ? 'Crie sua conta no ybyrá' : 'Boas-vindas ao ybyrá';
    document.querySelectorAll('[data-modo]').forEach(botao => botao.setAttribute('aria-pressed', String(botao.dataset.modo === modo)));
    mensagem.textContent = '';
    mensagem.classList.remove('erro');
}
document.querySelectorAll('[data-modo]').forEach(botao => botao.addEventListener('click', () => mudarModo(botao.dataset.modo)));
document.querySelector('#mostrar-senha').addEventListener('change', evento => {
    senha.type = confirmacao.type = evento.target.checked ? 'text' : 'password';
});
formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    if (!formulario.reportValidity()) return;
    if (modo === 'cadastrar' && senha.value !== confirmacao.value) {
        avisar('As senhas precisam ser iguais.', true);
        confirmacao.focus();
        return;
    }
    document.querySelector('#campos-conta').disabled = true;
    document.querySelectorAll('[data-modo]').forEach(botao => { botao.disabled = true; });
    enviar.textContent = 'Aguarde…';
    try {
        await enviarConta(modo === 'cadastrar' ? 'cadastrar' : 'entrar', { email: email.value.trim(), senha: senha.value });
        formulario.reset();
        try { localStorage.removeItem('analiseAtual'); } catch { /* O login não depende desse armazenamento. */ }
        location.replace(destinoAposLogin());
    } catch (erro) {
        avisar(erro instanceof TypeError || erro.name === 'TimeoutError' ? 'Não foi possível conectar. Confira se o servidor está em execução e tente novamente.' : erro.message, true);
    } finally {
        document.querySelector('#campos-conta').disabled = false;
        document.querySelectorAll('[data-modo]').forEach(botao => { botao.disabled = false; });
        enviar.textContent = modo === 'cadastrar' ? 'Criar minha conta →' : 'Entrar →';
    }
});
document.querySelector('#sair-conta').addEventListener('click', async evento => {
    evento.target.disabled = true;
    try { await encerrarSessao(); }
    catch { avisar('Não foi possível sair. Tente novamente.', true); evento.target.disabled = false; }
});
mudarModo('entrar');
const usuario = await consultarSessao();
if (usuario) {
    formulario.hidden = true;
    document.querySelector('#modos-conta').hidden = true;
    document.querySelector('#conta-apresentacao').hidden = true;
    document.querySelector('#sessao-conta').hidden = false;
    document.querySelector('#conta-email').textContent = usuario.email;
    document.querySelector('#continuar-conta').href = destinoAposLogin();
} else {
    document.querySelector('#campos-conta').disabled = false;
}
