# Design System — PontoCerto (Placar de Mesa)

## Visual World & Thesis
**Mesa de Carteado & Placas de Tento Lacadas** (`seed key: d3b289c3`).
O PontoCerto recusa a estética de dashboard SaaS genérico (cartões cinza-ardósia translúcidos, pílulas pequenas e gradientes neon) para assumir a materialidade de uma mesa de clube de jogos: madeira escura nogueira, ferragens em latão/ouro velho, placas de tento esmaltadas de alto contraste e canhotos de partida carimbados.

## Paleta e Superfícies
- **Superfícies da Mesa**:
  - `--mesa-fundo` (`#14110f`): Nogueira escura profunda com trama diagonal sutil.
  - `--mesa-pano` (`#1c1714`): Bandeja interna de jogo com borda `#3a302a`.
  - `--mesa-madeira` (`#261f1b`): Controles secundários e fichas em repouso.
  - `.canhoto-partida` (`#231d19`): Folha de registro de quedas e trocas de grupos.
- **Texto e Ferragens**:
  - `--texto-marfim` (`#f6f0e4`): Texto primário e numerais das placas.
  - `--texto-areia` (`#cbbba6`): Texto de apoio aquecido pela paleta.
  - `--ouro-tento` (`#e59a28`) / `--ouro-vivo` (`#f6b23e`): Ações principais, sinalização de fila e destaques de vitória.
- **Lacas das Placas de Grupo (`CORES_GRUPOS`)**:
  - Verde Pano (`#156d45`), Carmim (`#b92b27`), Azul Real (`#1c4f9c`), Ouro Velho (`#b86514`), Violeta (`#5c258c`), Turquesa (`#126878`), Magenta (`#9c225d`), Folha (`#3f6e18`). Todos os textos secundários sobre placas coloridas são matizados pela própria cor da placa.

## Tipografia e Escala Fluida
- **Display e Numerais (`Changa`, 600–800)**: Cabeçalhos de mesa, títulos de grupos e numerais monumentais com `font-variant-numeric: tabular-nums`.
- **Interface e Canhotos (`Chivo`, 500–900)**: Rótulos de controle, botões de ação e registros históricos.
- **Container Queries (`@container placa`)**: O numeral de pontuação de cada grupo usa `clamp(4.5rem, 24cqi, 8.75rem)`, adaptando-se automaticamente ao tamanho individual do quadrado tanto no mobile quanto no desktop.

## Movimento e Microinterações Mobile-First
- **Partículas de Tento no Toque (`animar-subir-tento` + `animar-anel-impacto`)**: Ao tocar em qualquer posição da placa do grupo, um anel de impacto se expande e o valor somado (`+1`, `+3`, etc.) flutua a partir da coordenada exata do dedo.
- **Impulso Mecânico da Placa (`animar-impulso-placar`)**: Curva de desaceleração natural `cubic-bezier(0.16, 1, 0.3, 1)` de `240ms`, acompanhada de vibração tátil (`navigator.vibrate`) em dispositivos móveis.
- **Acessibilidade de Movimento**: Suporte completo a `@media (prefers-reduced-motion: reduce)` e alvos de toque mínimos de `46x46px` em `@media (pointer: coarse)`.
