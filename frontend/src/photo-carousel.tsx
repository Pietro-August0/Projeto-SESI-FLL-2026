import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Expand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'

const fotos = [
  { src: 'jumpers-natureza.webp', titulo: 'Aprender com a natureza', alt: 'Jumpers reunidos entre árvores e vegetação durante uma visita' },
  { src: 'jumpers-conversa.webp', titulo: 'Compartilhar descobertas', alt: 'Integrantes dos Jumpers reunidos à mesa em uma conversa de pesquisa' },
  { src: 'jumpers-equipe.webp', titulo: 'Criar em equipe', alt: 'Equipe Jumpers reunida em uma sala do SESI' },
  { src: 'jumpers-visita.webp', titulo: 'Observar de perto', alt: 'Equipe acompanhando uma explicação durante uma visita' },
  { src: 'jumpers-trilha.webp', titulo: 'Explorar novos caminhos', alt: 'Jumpers em uma trilha arborizada' },
  { src: 'jumpers-encontro.webp', titulo: 'Construir juntos', alt: 'Registro da equipe em um encontro na escola' },
  { src: 'jumpers-robo-frente.webp', titulo: 'Nosso robô, de perto', alt: 'Vista frontal do robô LEGO desenvolvido pela equipe', pequeno: true },
  { src: 'jumpers-robo-lado.webp', titulo: 'Cada peça tem um papel', alt: 'Outro ângulo do robô LEGO da equipe', pequeno: true },
  { src: 'jumpers-territorio.webp', titulo: 'Um olhar sobre o território', alt: 'Imagem do território usada na pesquisa da equipe', pequeno: true },
]

export function PhotoCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const [posicao, setPosicao] = useState(0)
  const [foto, setFoto] = useState(0)
  const [reduzir, setReduzir] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const origem = useRef<HTMLButtonElement | null>(null)
  const atual = fotos[foto]
  const mudar = (direcao: number) => setFoto(i => (i + direcao + fotos.length) % fotos.length)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const atualizar = () => setReduzir(media.matches)
    media.addEventListener('change', atualizar)
    return () => media.removeEventListener('change', atualizar)
  }, [])
  useEffect(() => {
    if (!api) return
    const atualizar = () => setPosicao(api.selectedScrollSnap())
    atualizar(); api.on('select', atualizar); api.on('reInit', atualizar)
    return () => { api.off('select', atualizar); api.off('reInit', atualizar) }
  }, [api])
  return <section className="photo-carousel-section" aria-label="Fotos da equipe Jumpers" data-reveal>
    <Dialog>
      <Carousel setApi={setApi} opts={{ align: 'start', loop: true, duration: reduzir ? 0 : 25 }} aria-label="Álbum dos Jumpers" className="team-carousel">
        <div className="about-section-heading"><h2>Aprender. Criar. Compartilhar.</h2><div className="carousel-controls"><span className="carousel-count" aria-live="polite" aria-atomic="true">{String(posicao + 1).padStart(2, '0')} <span>/ {String(fotos.length).padStart(2, '0')}</span></span><CarouselPrevious aria-label="Fotos anteriores" /><CarouselNext aria-label="Próximas fotos" /></div></div>
        <CarouselContent>{fotos.map((item, i) => <CarouselItem key={item.src} className="team-slide" aria-label={`${i + 1} de ${fotos.length}`}><DialogTrigger asChild><button className="about-photo" type="button" onClick={e => { origem.current = e.currentTarget; setFoto(i) }} aria-label={`Ampliar: ${item.titulo}`}><div className={item.pequeno ? 'photo-frame photo-original' : 'photo-frame'}><img src={`assets/equipe/${item.src}`} alt={item.alt} loading="lazy" width="640" height="480" draggable={false} /><span className="photo-expand"><Expand aria-hidden="true" /></span></div><span className="photo-caption">{item.titulo}<ArrowRight aria-hidden="true" /></span></button></DialogTrigger></CarouselItem>)}</CarouselContent>
      </Carousel>
      <DialogContent className="photo-dialog" onCloseAutoFocus={e => { e.preventDefault(); origem.current?.focus() }} onKeyDown={e => { if (e.key === 'ArrowRight') mudar(1); if (e.key === 'ArrowLeft') mudar(-1) }}>
        <DialogHeader><DialogTitle>{atual.titulo}</DialogTitle><DialogDescription>Registros da equipe Jumpers · {foto + 1} de {fotos.length}</DialogDescription></DialogHeader>
        <div className={atual.pequeno ? 'photo-view original' : 'photo-view'}><img src={`assets/equipe/${atual.src}`} alt={atual.alt} /></div>
        <div className="photo-navigation"><Button variant="outline" onClick={() => mudar(-1)}><ArrowLeft data-icon="inline-start" />Anterior</Button><span aria-live="polite">{foto + 1} / {fotos.length}</span><Button variant="outline" onClick={() => mudar(1)}>Próxima<ArrowRight data-icon="inline-end" /></Button></div>
      </DialogContent>
    </Dialog>
  </section>
}
