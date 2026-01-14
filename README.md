
# Guebly Text Formatter

Ferramenta open-source para **formatação inteligente de textos** gerados por IA ou escritos em Markdown,
adaptando automaticamente o conteúdo para **LinkedIn, Instagram e WhatsApp**, respeitando limites reais,
formatação suportada e legibilidade.

🔗 **Produção:** https://formatter.guebly.com.br

---

## ✨ O que é

O **Guebly Text Formatter** resolve um problema real:

- Textos de IA vêm com Markdown quebrado
- Cada plataforma aceita formatação diferente
- Copiar e colar “do jeito que vem” quebra o layout

Essa ferramenta:
- Normaliza o texto
- Converte destaque para o formato correto por plataforma
- Divide automaticamente em blocos quando necessário
- Não coleta dados
- Roda 100% no navegador

---

## 🎯 Plataformas suportadas

| Plataforma  | Estratégia |
|------------|------------|
| LinkedIn   | Destaque visual via Unicode |
| Instagram  | Destaque visual via Unicode |
| WhatsApp  | Conversão real para *negrito* e _itálico_ |

---

## 🧠 Conceitos importantes

### EXECUTAR
Aplica a formatação da plataforma selecionada.
Nada é feito automaticamente para evitar sobrescrever texto sem controle.

### DIVIDIR
Divide a saída em blocos com tamanho máximo configurável.
Ideal para colar textos longos em apps com limite de caracteres.

### Unicode Safe Output
A saída usa fonte **sans-serif compatível**, evitando o problema comum de `�` em alguns sistemas Windows.

---

## 🌗 Dark / Light Mode

- Dark: logo completa da Guebly
- Light: ícone isolado da Guebly
- Preferência salva no navegador

---

## 🔐 Privacidade

- Nenhum dado é enviado para servidores
- Nenhuma análise ou tracking
- Tudo acontece localmente no browser

---

## 🛠️ Stack técnica

- React + TypeScript
- TailwindCSS
- Lucide Icons
- Sem backend
- Sem banco
- Sem cookies

---

## 🚀 Rodando localmente

```bash
npm install
npm run dev
```

A aplicação roda em:
```
http://localhost:5173
```

---

## 🌍 Produção

Hospedado em:
```
https://formatter.guebly.com.br
```

Deploy estático (Vite / CDN).

---

## 🤝 Contribuindo

Esse projeto é **open-source** e mantido pela **Guebly**.

Você pode:
- Melhorar UI/UX
- Criar novos formatos (ex: X / Threads / Email)
- Otimizar conversões de texto
- Melhorar acessibilidade
- Ajustar performance

### Como contribuir

1. Fork o repositório
2. Crie sua branch
3. Commit claro e objetivo
4. Abra um Pull Request

Sem burocracia.

---

## 🧭 Organização

Este projeto faz parte do ecossistema **Guebly**:

> Construindo infraestrutura digital real, sem marketing vazio.

---

## 📄 Licença

MIT License.

Você pode usar, modificar e redistribuir.
Apenas mantenha os créditos.

---

## 🏷️ Assinatura

**Guebly**
https://guebly.com.br
