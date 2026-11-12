import { ArrowRight, Bot, Sprout, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PhotoCarousel } from './photo-carousel';

function Historia() {
  return (
    <section
      className="about-story"
      id="nossa-historia"
      aria-label="O trabalho dos Jumpers"
      data-reveal
    >
      <Tabs defaultValue="desafio">
        <TabsList aria-label="Conheça o projeto">
          <TabsTrigger value="desafio">
            <Bot />Na mesa
          </TabsTrigger>
          <TabsTrigger value="campo">
            <Leaf />No campo
          </TabsTrigger>
          <TabsTrigger value="ybyra">
            <Sprout />O ybyrá
          </TabsTrigger>
        </TabsList>
        <TabsContent value="desafio">
          <div className="story-panel">
            <Bot className="story-icon" aria-hidden="true" />
            <div>
              <h2>Nosso robô na mesa de missões</h2>
              <p>
                Montamos nosso robô com peças LEGO e motores SPIKE Prime. Depois que ele sai da
                base, segue sozinho o percurso que programamos. Cada missão tem uma tarefa
                própria, como puxar uma peça do modelo ou empurrar outra até a posição certa.
              </p>
              <p>
                São 15 missões na mesa, e cada rodada dura 2 minutos e 30 segundos.
              </p>
              <figure className="story-table">
                <img
                  src="assets/equipe/jumpers-mesa-missoes.jpg"
                  alt="Mesa de missões da FIRST LEGO League com o tapete de biodiversidade e os modelos LEGO"
                  width="876"
                  height="1600"
                  loading="lazy"
                />
              </figure>
              <div className="story-robot-photos">
                <img
                  src="assets/equipe/jumpers-robo-frente.webp"
                  alt="Vista lateral do robô LEGO dos Jumpers"
                  width="180"
                  height="186"
                  loading="lazy"
                />
                <img
                  src="assets/equipe/jumpers-robo-lado.webp"
                  alt="Vista frontal do robô LEGO dos Jumpers"
                  width="170"
                  height="202"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="campo">
          <div className="story-panel">
            <Leaf className="story-icon" aria-hidden="true" />
            <div>
              <h2>O que fomos ver na USP</h2>
              <p>
                Fomos ao Instituto de Biociências da USP e conhecemos uma agrofloresta de perto.
                A visita fez parte da pesquisa da equipe sobre como árvores e cultivos podem
                crescer na mesma área.
              </p>
              <p>
                A Thalita incentivou nossa pesquisa, fez os contatos, organizou conversas com
                profissionais da área e levou a equipe à USP. Durante todo o processo, acolheu
                nossas dúvidas com carinho e respeito.
              </p>
              <Button variant="link" asChild>
                <a href="#album-jumpers">Ver fotos das visitas <ArrowRight data-icon="inline-end" /></a>
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="ybyra">
          <div className="story-panel">
            <Sprout className="story-icon" aria-hidden="true" />
            <div>
              <h2>Por que criamos o ybyrá</h2>
              <p>
                A mesa de missões muda de tema a cada ano. Depois da arqueologia, veio a
                biodiversidade. Foi esse tema que nos deu a ideia de criar o ybyrá, um projeto
                de implementação que complementa o trabalho do nosso robô na mesa.
              </p>
              <p>
                Pensamos primeiro em agricultores familiares e também em quem quer aprender
                sobre agrofloresta. Queremos ajudar cada pessoa a identificar plantas que façam
                sentido para o seu solo e clima, para produzir alimento, cuidar da terra e
                favorecer a biodiversidade.
              </p>
              <Button variant="link" asChild>
                <a href="analise.html?cenario=solo-a">
                  Experimentar um exemplo
                  <ArrowRight data-icon="inline-end" />
                </a>
              </Button>
              <p className="story-small">
                Propostas demonstrativas. Consulte os limites na metodologia.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

export function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <h1>Da mesa de missões à <em>agrofloresta</em></h1>
          <p>
            Somos os Jumpers, equipe de robótica do SESI Cotia. Nossa equipe tem 11 integrantes
            e a Thalita, nossa professora, orientadora técnica e mentora.
          </p>
          <div className="about-actions">
            <Button size="lg" asChild>
              <a href="#nossa-historia">
                Conheça nossa história
                <ArrowRight data-icon="inline-end" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="index.html">
                Explorar o ybyrá
                <ArrowRight data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </div>
        <figure className="about-hero-photo">
          <img
            src="assets/equipe/jumpers-natureza.webp"
            alt="Jumpers conhecendo uma área de pesquisa entre árvores e plantas"
            width="1280"
            height="960"
            fetchPriority="high"
          />
          <figcaption>
            <Leaf aria-hidden="true" />
            Visita da equipe a uma agrofloresta na USP.
          </figcaption>
        </figure>
      </section>
      <Historia />
      <div id="album-jumpers"><PhotoCarousel /></div>
      <section className="about-partner" id="parceiros" data-reveal>
        <div className="partner-identity">
          <img
            src="assets/instituicoes/taiobas-simbolo.jpeg"
            alt="Taiobas do Matão"
            width="80"
            height="80"
            loading="lazy"
          />
          <div>
            <span>Parceiro de pesquisa</span>
            <h2>
              Conhecimento compartilhado
              <br />
              também cria raízes.
            </h2>
          </div>
        </div>
        <div>
          <p>
            O Grupo Taiobas do Matão USP compartilhou seu banco de sementes de 2021 para apoiar
            nossa pesquisa.
          </p>
          <Button variant="link" asChild>
            <a href="especies.html#catalogo">
              Conheça as plantas
              <ArrowRight data-icon="inline-end" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
