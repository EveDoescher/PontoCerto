# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vue 3 + TypeScript + Vite + Tailwind CSS (escolhido pela usuária).

## Users

Jogadores casuais em mesas de bar, churrascos, quadras de areia, praias ou reuniões em casa (jogando Truco, Dominó, Vôlei/Pelada, Beach Tennis ou jogos de pontos livres), usando principalmente o celular apoiado na mesa ou segurado com uma mão, além de suporte completo para PC.

## Product Purpose

Contador de pontos universal, 100% gratuito e salvo localmente no dispositivo (`localStorage`), permitindo criar qualquer quantidade X de grupos, somar pontos ao tocar no quadrado do grupo (começando em 0), gerenciar fila de espera ("quem ganha fica") ou trocas manuais de grupos, tocar som de vitória (`/victory.mp3`) ao vencer e registrar todo o histórico de partidas e trocas da sessão.

## Positioning

Um placar de mesa físico/tátil no navegador que substitui papel, caneta, feijões ou marcadores improvisados, combinando contagem por toque em quadrados gigantes com controle nativo de rodízio de grupos ("quem ganha fica") e histórico completo da sessão sem precisar de login ou internet.

## Operating Context

Usado durante partidas reais e barulhentas (mesas de truco, dominó, quadras de vôlei/pelada), muitas vezes com o celular deitado sobre a mesa ao alcance de vários jogadores ou operado rapidamente com o polegar entre uma rodada e outra.

## Capabilities and Constraints

- Interfaces do código (TypeScript) e toda a interface de usuário 100% em Português (PT-BR).
- Arquitetura totalmente componentizada em Vue 3 + TypeScript.
- Presets rápidos (Truco, Dominó, Vôlei/Pelada, Livre) e configuração livre de passo de pontos ("de quantos em quantos") e meta de vitória ("quantos pontos vence").
- Atalhos opcionais de pontos extras no quadrado do grupo (ex: +3, +6, +9, +12 para Truco), botão discreto de diminuir pontos (`-`) e função de desfazer última ação.
- Suporte a modo "Todos juntos na tela" e modo "Mesa + Fila (Quem ganha fica)" com registro de trocas de grupos no histórico.
- Reprodução automática do áudio `/victory.mp3` quando algum grupo vence a partida.
- Persistência exclusivamente local (`localStorage`).

## Brand Commitments

- Nome: PontoCerto.
- Sem aparência de dashboard genérico de IA (sem caixas SaaS cinzas/azuladas genéricas); deve ter identidade visual e tátil de jogo de verdade, com animações fluidas e responsivas no mobile e desktop.

## Evidence on Hand

- Áudio de vitória real fornecido pela usuária em `public/victory.mp3`.

## Product Principles

1. **Toque sem erro na mesa**: Os quadrados dos grupos são o centro absoluto da experiência, com áreas de toque generosas e resposta física imediata (visual, sonora e vibratória).
2. **Identidade de Jogo Real**: Superfícies, cores, placares e animações devem remeter a tabuleiros, placares esportivos de mesa e jogos reais, nunca a um painel administrativo ou SaaS corporativo.
3. **Zero atrito entre partidas**: Declarar vitória, rodar a fila de "quem ganha fica" e iniciar a próxima revanche deve levar apenas um toque.
4. **Memória fiel da resenha**: Toda troca de grupo e resultado de partida fica registrado no histórico local para ninguém discutir quem ganhou mais na noite.
