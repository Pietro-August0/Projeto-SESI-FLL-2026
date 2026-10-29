import { useState } from 'react'
import { ArrowRight, Users, Bot, Sprout, Clock3, Leaf, HeartHandshake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { PhotoCarousel } from './photo-carousel'

function Historia() {
  const [historia, setHistoria] = useState('')
  return <section className="about-story" id="nossa-historia" aria-label="Conheça os Jumpers" data-reveal>
    <Tabs defaultValue="equipe">
      <TabsList aria-label="Nossa história"><TabsTrigger value="equipe"><Users />Nossa equipe</TabsTrigger><TabsTrigger value="desafio"><Bot />O desafio</TabsTrigger><TabsTrigger value="ybyra"><Sprout />O ybyrá</TabsTrigger></TabsList>
      <TabsContent value="equipe"><div className="story-panel"><Users className="story-icon" aria-hidden="true" /><div><h2>Mais do que robótica. Um time.</h2><p>11 integrantes, uma mentora e uma técnica. Juntos, levamos criatividade, ciência e colaboração para a FIRST LEGO League.</p><Accordion type="single" collapsible value={historia} onValueChange={setHistoria}><AccordionItem value="completa"><AccordionTrigger>Nossa história completa</AccordionTrigger><AccordionContent><p>Nós somos os Jumpers, uma equipe de robótica do SESI Cotia formada por 11 integrantes, uma mentora e uma técnica. Participamos da FIRST LEGO League (FLL), uma competição que reúne estudantes do 6º ao 9º ano para colocar a criatividade, a ciência, a tecnologia e o trabalho em equipe em ação!</p><p>Na competição, temos o desafio de desenvolver e programar um robô autônomo capaz de realizar 15 missões em apenas 2 minutos e 30 segundos. E não para por aí! Também precisamos criar um projeto de inovação para encontrar soluções para problemas relacionados ao tema da temporada.</p></AccordionContent></AccordionItem></Accordion></div></div></TabsContent>
      <TabsContent value="desafio"><div className="story-panel"><Bot className="story-icon" aria-hidden="true" /><div><h2>15 missões. 2 minutos e 30 segundos.</h2><p>Desenvolvemos e programamos um robô autônomo. Fora da arena, criamos um projeto de inovação para investigar problemas do tema da temporada.</p><p className="story-small">Estudantes do 6º ao 9º ano, colocando as ideias em prática.</p></div></div></TabsContent>
      <TabsContent value="ybyra"><div className="story-panel"><Sprout className="story-icon" aria-hidden="true" /><div><h2>Da pesquisa à agrofloresta.</h2><p>O ybyrá reúne plantas, funções e propostas de Sistemas Agroflorestais. Uma ferramenta criada com as ideias da equipe para explorar nossa pesquisa.</p><Button variant="link" asChild><a href="analise.html?cenario=solo-a">Experimentar um exemplo<ArrowRight data-icon="inline-end" /></a></Button><p className="story-small">Propostas demonstrativas. Consulte os limites na metodologia.</p></div></div></TabsContent>
    </Tabs>
  </section>
}

export function About() {
  return <div className="about-page">
    <section className="about-hero"><div className="about-hero-copy"><h1>Ideias que<br />criam <em>raízes.</em></h1><p>Somos os Jumpers, a equipe de robótica do SESI Cotia. Ciência, criatividade e natureza no mesmo time.</p><div className="about-actions"><Button size="lg" asChild><a href="#nossa-historia">Conheça nossa história<ArrowRight data-icon="inline-end" /></a></Button><Button size="lg" variant="outline" asChild><a href="index.html">Explorar o ybyrá<ArrowRight data-icon="inline-end" /></a></Button></div></div><figure className="about-hero-photo"><img src="assets/equipe/jumpers-natureza.webp" alt="Jumpers conhecendo uma área de pesquisa entre árvores e plantas" width="1280" height="960" fetchPriority="high" /><figcaption><Leaf aria-hidden="true" />Conhecimento que cresce fora da sala de aula.</figcaption></figure></section>
    <div className="about-stats" aria-label="A equipe e o desafio"><div><Users aria-hidden="true" /><p><strong>11</strong><span>integrantes</span></p></div><div><HeartHandshake aria-hidden="true" /><p><strong>Juntos</strong><span>uma mentora e uma técnica</span></p></div><div><Bot aria-hidden="true" /><p><strong>15</strong><span>missões</span></p></div><div><Clock3 aria-hidden="true" /><p><strong>2min30s</strong><span>de desafio do robô</span></p></div></div>
    <PhotoCarousel /><Historia />
    <section className="about-partner" id="parceiros" data-reveal><div className="partner-identity"><img src="assets/instituicoes/taiobas-simbolo.jpeg" alt="Taiobas do Matão" width="80" height="80" loading="lazy" /><div><span>Parceiro de pesquisa</span><h2>Conhecimento compartilhado<br />também cria raízes.</h2></div></div><div><p>O Grupo Taiobas do Matão USP compartilhou seu banco de sementes de 2021 para apoiar nossa pesquisa.</p><Button variant="link" asChild><a href="especies.html#catalogo">Conheça as plantas<ArrowRight data-icon="inline-end" /></a></Button></div></section>
  </div>
}
