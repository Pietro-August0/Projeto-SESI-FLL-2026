// Ilhas React: aprimoram apenas os pontos marcados, sem assumir o roteamento ou o login.
import { createRoot } from 'react-dom/client';
import { About } from './about';
import { PhotoCarousel } from './photo-carousel';
import './ui.css';

const about = document.querySelector<HTMLElement>('[data-ui-about]');
if (about) createRoot(about).render(<About />);
const album = document.querySelector<HTMLElement>('[data-ui-carousel]');
if (album) createRoot(album).render(<PhotoCarousel />);
