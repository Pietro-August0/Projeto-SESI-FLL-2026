import { createRoot } from 'react-dom/client'
import { About } from './about'
import { PhotoCarousel } from './photo-carousel'
import './ui.css'

const about = document.querySelector<HTMLElement>('[data-ui-about]')
if (about) createRoot(about).render(<About />)
const album = document.querySelector<HTMLElement>('[data-ui-carousel]')
if (album) createRoot(album).render(<PhotoCarousel />)
