# MyAgenda — Melhorias e funcionalidades sugeridas

Documento de análise para priorização pessoal. Baseado no estado atual do app (APK Android, local-first: Calendário, Lista, Lembretes rápidos, Notas, widget, backup JSON).

Use as notas de **Impacto**, **Esforço** e **Encaixe** no final para decidir o que vale implementar.

---

## O que o app já faz bem

Não vale reinventar estes pontos:

- Conclusão por ocorrência + auto-conclusão de ocorrências passadas
- Feriados brasileiros no calendário
- Destaque por período (manhã / tarde / noite)
- Notificações com pausa, alerta forte e antecedência por compromisso
- Widget Android com deep link para datas
- Backup JSON (tarefas, notas, lembretes, configurações)
- Ocultar concluídos (Calendário e Lista, preferência persistida)
- Filtros rápidos na Lista (mês, hoje, próx. 7 dias, atrasadas, concluídas)
- Duplicar compromisso no editor

---

## Alto impacto — provavelmente vale o tempo

### 1. Recorrência: “esta ocorrência” vs série inteira

Hoje existe o aviso de que alterações afetam toda a série (`recurrenceSeriesWarning`), mas não há:

- Pular um dia
- Mover só hoje
- Editar título/descrição só numa data

É a maior lacuna em relação ao uso real de calendários.

**Perguntas para priorizar:** Com que frequência você edita um compromisso repetido? Bastaria “exceção neste dia” ou precisa de exceções completas (estilo Google Calendar)?

| Critério | Nota sugerida |
|----------|----------------|
| Impacto | Alto |
| Esforço | Alto |
| Encaixe | Alto se usa muita recorrência |

---

### 2. Aba Calendário sem dia selecionado

Sem dia clicado, a lista abaixo do mini-calendário mostra **todo o mês em lista plana**. A aba **Lista** já agrupa por dia e tem filtros melhores.

**Opções de melhoria:**

- Abrir sempre em **hoje** por padrão
- Agrupar por dia (como na Lista)
- Mostrar só **hoje + próximos N dias** até o usuário escolher outra data

| Critério | Nota sugerida |
|----------|----------------|
| Impacto | Alto |
| Esforço | Médio |
| Encaixe | Alto |

---

### 3. Busca

Hoje a busca na Lista é:

- Só por **título**
- Limitada ao **mês visível**

Notas e lembretes rápidos têm fluxos separados.

**Possíveis evoluções:**

- Incluir descrição
- Busca global (compromissos + notas + lembretes)
- Opção “buscar em todos os meses”

| Critério | Nota sugerida |
|----------|----------------|
| Impacto | Médio–alto |
| Esforço | Médio |
| Encaixe | Alto se acumula muito histórico |

---

### 4. Adiar (snooze) nas notificações

Já existem alerta forte, pausa até data e antecedência — mas não há **+10 min / +1 h** direto na notificação (ações no Android + reagendamento).

**Vale se:** você costuma dispensar o alerta e ainda precisa do compromisso.

| Critério | Nota sugerida |
|----------|----------------|
| Impacto | Alto no dia a dia |
| Esforço | Médio (Android nativo) |
| Encaixe | Alto |

---

### 5. Backup que você realmente usa

Exportar JSON manual funciona; o risco é **esquecer por semanas**.

**Ideias leves:**

- Lembrete semanal no app
- “Último backup: …” em Configurações
- Exportar para pasta fixa (SAF no Android)

**Ideias pesadas:** backup automático criptografado — provavelmente excesso para uso pessoal v1.

| Critério | Nota sugerida |
|----------|----------------|
| Impacto | Alto (segurança dos dados) |
| Esforço | Leve a médio |
| Encaixe | Muito alto |

---

## Impacto médio — polimento e uso diário

### 6. Faixa “Próximos” / agenda contínua

Os filtros **Hoje** e **Próx. 7 dias** existem, mas não há uma **linha do tempo** (hoje → amanhã → semana) sem navegar mês a mês.

Um bloco **“A seguir”** no topo do Calendário ou da Lista pode reduzir muitos toques.

| Critério | Nota sugerida |
|----------|----------------|
| Impacto | Médio |
| Esforço | Médio |
| Encaixe | Alto |

---

### 7. Desfazer após apagar

Apagar compromisso é deslizar + confirmar, sem desfazer. Notas já têm seleção múltipla; tarefas não.

**Vitória rápida:** snackbar “Desfazer” por 5–10 segundos.

| Critério | Nota sugerida |
|----------|----------------|
| Impacto | Médio |
| Esforço | Baixo–médio |
| Encaixe | Alto |

---

### 8. Ações em lote nas tarefas

O hook `useMultiSelect` existe só para **notas**. Na Lista, dá para reutilizar o padrão para:

- Marcar vários como concluídos
- Apagar vários (complementar às ações de mês)

| Critério | Nota sugerida |
|----------|----------------|
| Impacto | Médio |
| Esforço | Médio |
| Encaixe | Médio |

---

### 9. Etiquetas ou categorias

Cores são por hash do id da tarefa, não semânticas (trabalho, saúde, etc.). Etiquetas permitiriam filtro e visual mais claro no calendário.

| Critério | Nota sugerida |
|----------|----------------|
| Impacto | Médio |
| Esforço | Médio–alto |
| Encaixe | Depende de quantos “tipos” de compromisso você tem |

---

### 10. Ligar notas ↔ compromissos

Notas e tarefas vivem em armazenamentos paralelos. Um vínculo (“nota da consulta” ↔ compromisso) ajuda em consultas, viagens, etc., sem virar um segundo app.

| Critério | Nota sugerida |
|----------|----------------|
| Impacto | Médio |
| Esforço | Médio |
| Encaixe | Alto se usa Notas com frequência |

---

### 11. Estado vazio com “ocultar concluídos”

Com o filtro ativo, pode parecer que o mês está vazio quando só restam concluídos. Mensagem dedicada (“Só há concluídos — mostrar?”) evita confusão.

| Critério | Nota sugerida |
|----------|----------------|
| Impacto | Baixo–médio |
| Esforço | Baixo |
| Encaixe | Alto (já existe o toggle) |

---

### 12. Widget vs preferência do app

O widget já prioriza itens **pendentes** (bom). Não reflete o toggle **ocultar concluídos** das telas.

**Decisão de produto:** widget sempre “o que falta” **ou** espelhar a configuração do app.

| Critério | Nota sugerida |
|----------|----------------|
| Impacto | Baixo |
| Esforço | Baixo |
| Encaixe | Definir regra e documentar |

---

## Prioridade menor — só se doer no uso

| Ideia | Por que pode esperar |
|-------|----------------------|
| **Locale en-US** nas configurações | Tipo existe em `Settings`; UI e strings são só pt-BR |
| **Exportar .ics** | Útil com Google Calendar; desnecessário se o app é a única fonte |
| **Modelos** (“Consulta”, “Pagamento”) | Duplicar + padrões podem bastar |
| **Estatísticas** (concluídos/semana, atrasadas) | Filtros da Lista já cobrem o operacional |
| **Arquivar** em vez de apagar | Backup + importar mesclar já limitam desastre |
| **Reordenar** arrastando no dia | Prioridade manual é rara em agenda pessoal |
| **iOS / sync na nuvem** | Conflita com “APK pessoal, local” |

---

## Saúde do código (não visível, mas acelera evolução)

1. **Testes** — Hoje só `recurrence.test.ts`. Próximos alvos de alto valor:
   - `taskCompletion` (regras de auto-conclusão)
   - `listFilters`
   - Pausa/expiração de notificações

2. **i18n** — Objeto `t` único; `locale: 'en-US'` nos tipos sem UI. Novas strings: manter centralizadas em `src/lib/i18n.ts`.

3. **Mensagens de erro** — Vários `Alert.alert('Erro', …)` fora do i18n.

4. **README** — Ainda cita “3 abas”; o app tem **Notas** e mais filtros. Atualizar evita confusão futura.

---

## Framework de priorização

Para cada item, avalie de **1 a 5**:

| Dimensão | Pergunta |
|----------|----------|
| **Frequência** | Quantas vezes por semana eu usaria? |
| **Dor** | Quão ruim é o jeito atual de contornar? |
| **Esforço** | Dias de trabalho (incl. Android, widget, notificações)? |
| **Encaixe** | Continua “APK pessoal, sem conta, dados locais”? |

**Soma ou média** — ou escolha só itens com Frequência ≥ 4 e Esforço ≤ 3.

---

## Ordem sugerida (referência)

Ordem típica para agenda pessoal solo:

1. Exceções em recorrência *(se usa repetição muito)*
2. Vista padrão / agrupamento no Calendário
3. Snooze nas notificações
4. Lembrete de backup
5. Busca / achado global
6. Demais itens da lista média e baixa

Ajuste conforme **suas** dores reais (ex.: “reunião semanal que muda um dia”, “esqueço backup”, “lista do mês enorme”).

---

## Matriz resumida

| # | Item | Impacto | Esforço | Encaixe produto |
|---|------|---------|---------|-----------------|
| 1 | Recorrência por ocorrência | Alto | Alto | Alto |
| 2 | Calendário sem dia selecionado | Alto | Médio | Alto |
| 3 | Busca ampliada | Médio–alto | Médio | Alto |
| 4 | Snooze na notificação | Alto | Médio | Alto |
| 5 | Backup lembrado / automático leve | Alto | Leve–médio | Muito alto |
| 6 | Faixa “A seguir” | Médio | Médio | Alto |
| 7 | Desfazer apagar | Médio | Baixo–médio | Alto |
| 8 | Seleção múltipla em tarefas | Médio | Médio | Médio |
| 9 | Etiquetas | Médio | Médio–alto | Variável |
| 10 | Notas ↔ compromissos | Médio | Médio | Variável |
| 11 | Empty state com ocultar concluídos | Baixo–médio | Baixo | Alto |
| 12 | Widget vs ocultar concluídos | Baixo | Baixo | Decisão |

---

## Espaço para suas notas

### Minhas 3 maiores dores hoje

1. 
2. 
3. 

### Top 3 que vou implementar

1. 
2. 
3. 

### Explicitamente fora de escopo

- 

---

*Gerado para análise pessoal. Atualize este arquivo quando prioridades mudarem.*
