import fs from "node:fs/promises";
import sharp from "sharp";
const dir = "sistema-agroflorestal/assets/marca/";
const jpeg = (await fs.readFile(dir + "originais/ybyra-2-green.jpeg")).toString(
  "base64",
);
const filter =
  '<filter id="cut" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 0"/><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 1 1"/></feComponentTransfer></filter>';
const base = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="350 390 950 900" role="img" aria-label="Ybyrá"><defs>${filter}<clipPath id="five-leaves"><path d="M350 900H1300V1290H350Z M552 726H1053V901H552Z M750 395H871V587H750Z M557 583H717V713H557Z M896 583H1056V713H896Z"/></clipPath></defs><image clip-path="url(#five-leaves)" width="1600" height="1600" href="data:image/jpeg;base64,${jpeg}" filter="url(#cut)"/></svg>`;
await fs.writeFile(dir + "logo-negativa.svg", base);
await fs.writeFile("sistema-agroflorestal/assets/logo-ybyra.svg", base);
const positive = base
  .replace(
    "</defs>",
    `<filter id="positive" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 0"/><feComponentTransfer result="cut"><feFuncA type="discrete" tableValues="0 0 1 1"/></feComponentTransfer><feColorMatrix in="cut" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0"/><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 1"/></feComponentTransfer><feComposite in2="cut" operator="in" result="letters"/><feFlood flood-color="#24513e"/><feComposite in2="letters" operator="in"/><feMerge><feMergeNode in="cut"/><feMergeNode/></feMerge></filter></defs>`,
  )
  .replace('filter="url(#cut)"', 'filter="url(#positive)"');
await fs.writeFile(dir + "logo-positiva.svg", positive);
await fs.writeFile(
  dir + "logo-monocromatica.svg",
  base
    .replace(
      "</defs>",
      '<filter id="mono"><feFlood flood-color="#24513e"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>',
    )
    .replace("<image", '<g filter="url(#mono)"><image')
    .replace("/></svg>", "/></g></svg>"),
);
// Contorno do y central, traçado sobre a assinatura original.
const twig = "M830 733C864 878 844 1039 747 1192L724 1194L759 1129L712 1195L657 1199C711 1152 757 1093 787 1032C740 1005 707 961 688 906L713 920C733 963 761 996 795 1013C829 938 827 843 794 775L811 757L830 816L818 748Z";
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#24513e"/><svg x="60" y="60" width="392" height="392" viewBox="646 726 224 480"><path fill="#fff" d="${twig}"/></svg></svg>`;
await fs.writeFile(dir + "favicon.svg", favicon);
for (const [file, size] of [
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
  ["favicon-48.png", 48],
  ["apple-touch-icon.png", 180],
  ["icone-192.png", 192],
  ["icone-512.png", 512],
])
  await sharp(Buffer.from(favicon))
    .resize(size, size)
    .png()
    .toFile(dir + file);
const png = await sharp(Buffer.from(favicon)).resize(48, 48).png().toBuffer();
const head = Buffer.alloc(22);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(1, 4);
head[6] = 48;
head[7] = 48;
head.writeUInt16LE(1, 10);
head.writeUInt16LE(32, 12);
head.writeUInt32LE(png.length, 14);
head.writeUInt32LE(22, 18);
await fs.writeFile(dir + "favicon.ico", Buffer.concat([head, png]));
await sharp(Buffer.from(base))
  .resize(240, 228)
  .flatten({ background: "#24513e" })
  .png()
  .toFile(dir + "logo-email.png");
