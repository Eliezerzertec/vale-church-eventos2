# 📊 Análise de Proporção de Exibição da Logo

**Data:** 20 de fevereiro de 2026  
**Arquivo:** `src/pages/Index.tsx`  
**Logo:** `LOGO-IGREJA.-Branco .png`

---

## 📐 Configuração Atual

### Dimensões do Banner (Hero)
```
Altura: 85vh (85% da viewport)
Largura: 100%
Layout: Flexbox (flex items-center justify-center)
```

### Dimensões da Logo
```
Mobile:  h-24   (96px)
Desktop: h-32   (128px)
Efeitos: drop-shadow-lg, animate-pulse
Margin:  mb-6 (24px abaixo)
```

### Estrutura de Camadas
```
1. Imagem de fundo (heroImage)
2. Gradient overlay (gradient-hero)
3. Container de conteúdo (bg-black/20 backdrop-blur-sm)
   └── Logo
   └── Subtítulo
   └── Título (Vale Church Lavras)
   └── Descrição
   └── Botões (Ver Eventos / Conheça Nossa Igreja)
```

---

## 🎯 Análise de Proporção

### Cálculo de Proporção

**Em Desktop (1920px viewport):**
- Altura do banner: 1920 × 85% = 1632px
- Altura da logo: 128px
- Proporção: 128/1632 = **7.8% da altura do banner**

**Em Mobile (375px viewport):**
- Altura do banner: 375 × 85% = 318.75px
- Altura da logo: 96px
- Proporção: 96/318.75 = **30.1% da altura do banner**

### Avaliação

| Aspecto | Status | Observação |
|---------|--------|-----------|
| **Visibilidade Desktop** | ⚠️ Pequena | 7.8% da altura - pode parecer pequena |
| **Visibilidade Mobile** | ✅ Adequada | 30.1% - bem proporcionada |
| **Espaço Disponível** | ✅ Bom | Container `max-w-2xl` deixa espaço para logo |
| **Hierarquia Visual** | ✅ Clara | Logo → Subtítulo → Título → Descrição |
| **Animação | ✅ Apropriada | Pulse suave sem exagero |

---

## 💡 Sugestões de Melhorias

### Opção 1: Aumentar Logo em Desktop (RECOMENDADO)
Aumentar de `h-32` para `h-40` ou `h-48` para melhor proporção:

```tsx
<img 
  src={logoIgreja} 
  alt="Logo Igreja" 
  className="h-24 md:h-40 lg:h-48 drop-shadow-lg"
/>
```

**Resultado:**
- Desktop (h-40): 160px = **9.8% da altura**
- Desktop (h-48): 192px = **11.8% da altura** ✅ Muito Melhor

---

### Opção 2: Ajustar Espaçamento

Aumentar margem inferior para mais destaque:

```tsx
<div className="mb-8 md:mb-10 flex justify-center animate-pulse">
```

**Resultado:** Mais espaço entre logo e subtítulo

---

### Opção 3: Variações de Animação

**A) Remover Animação (mais estática):**
```tsx
<div className="mb-6 flex justify-center">
```

**B) Hover Effect (mais interativo):**
```tsx
<div className="mb-6 flex justify-center hover:scale-105 transition-transform duration-300">
```

---

## 🎨 Recomendação Final

Implementar **Opção 1 com ajuste de tamanho:**

```tsx
{/* Logo */}
<div className="mb-8 flex justify-center animate-pulse">
  <img 
    src={logoIgreja} 
    alt="Logo Igreja" 
    className="h-24 md:h-40 lg:h-48 drop-shadow-lg"
  />
</div>
```

**Benefícios:**
- ✅ Melhor proporção em desktop
- ✅ Mantém responsividade
- ✅ Logo mais destacada
- ✅ Contribui para identidade visual
- ✅ Animação suave mantida

---

## 📊 Comparação Visual

### Antes (Atual)
```
Banner: 85vh
Logo: h-32 (128px)
Proporção: ~7.8% (Desktop)
Status: Pequena em desktop
```

### Depois (Recomendado)
```
Banner: 85vh
Logo: h-48 (192px)
Proporção: ~11.8% (Desktop)
Status: ✅ Bem proporcionada
```

---

## ✅ Checkllist de Ajustes

- [ ] Atualizar tamanho da logo: `h-32` → `h-48`
- [ ] Adicionar breakpoint `lg:h-48`
- [ ] Aumentar margem: `mb-6` → `mb-8`
- [ ] Testar em diferentes resoluções
- [ ] Verificar altura do container
- [ ] Avaliar visualmente em navegador

---

**Próximo Passo:** Implementar sugestão e testar em navegador?
