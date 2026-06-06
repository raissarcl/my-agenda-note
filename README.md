# MyAgenda (APK pessoal Android)

App de agenda, calendário e notas em React Native (Expo), focado em uso pessoal.

## Funcionalidades

### Abas

- **Calendário**: mini calendário com feriados brasileiros + lista do mês ou do dia selecionado; botão para ocultar compromissos concluídos
- **Lista**: compromissos agrupados por dia no mês, busca por título e filtros rápidos
- **Lembretes**: lembretes rápidos sem data no calendário (reordenáveis); alerta no telemóvel opcional pelo ícone de sino (sem passo extra ao criar)
- **Notas**: cadernos e editor de texto rico

### Compromissos

- Criar, editar, excluir e duplicar
- Título, descrição, data, hora (ou dia inteiro)
- Recorrência: diária, dias úteis, semanal, mensal, dias personalizados (com data final obrigatória, máx. 1 ano)
- Conclusão por ocorrência; auto-conclusão de ocorrências passadas
- **Etiqueta opcional** (Trabalho, Pessoal, Saúde, etc.) — badge na lista só quando escolhida
- Cores automáticas por compromisso; destaque por período (**Manhã**, **Tarde**, **Noite**)
- Notificações locais com antecedência configurável, pausa até data, alerta forte
- Filtros na Lista: **Mês**, **Hoje**, **Próx. 7 dias**, **Atrasadas**, **Concluídas**
- Ocultar concluídos (Calendário e Lista), com mensagem clara quando só restam concluídos
- Ações do mês: apagar passadas não recorrentes; apagar recorrentes já encerradas

### Geral

- Backup local: exportar/importar JSON (mesclar ou substituir) — inclui compromissos, notas, lembretes rápidos e configurações
- Em **Configurações**: data do último backup e lembrete opcional (notificação local) para exportar de novo após 7, 14 ou 30 dias — o export continua manual
- Tema claro / escuro / sistema
- Locale pt-BR e hora em formato 24h
- Widget Android (tela inicial): próximo compromisso + resumo de hoje

## Stack

- Expo SDK 54 + React Native + TypeScript
- expo-router
- react-native-calendars
- expo-notifications
- Zustand + AsyncStorage
- date-fns

## Requisitos

- Node.js (recomendado: 22+)
- npm
- Java JDK 17
- Android Studio
- Android SDK + Platform-Tools (`adb`)

## Primeira execução (desenvolvimento)

```bash
npm install
npm run start
```

Depois:
- pressione `a` para abrir no emulador Android, ou
- escaneie o QR com Expo Go no celular.

## Ambiente Android local (Windows)

1. Instale Android Studio.
2. No Android Studio, abra **SDK Manager** e instale:
   - Android SDK Platform (API 34 ou superior)
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android SDK Platform-Tools
3. Configure variáveis de ambiente:
   - `JAVA_HOME`: caminho do JDK 17
   - `ANDROID_HOME`: `%LOCALAPPDATA%\Android\Sdk`
   - adicione em `Path`:
     - `%JAVA_HOME%\bin`
     - `%ANDROID_HOME%\platform-tools`

Verifique:

```bash
javac -version
adb --version
```

## Gerar APK local (sem cloud)

No root do projeto:

```bash
npx expo prebuild --platform android
```

Depois:

```bash
cd android
.\gradlew.bat assembleRelease
```

APK gerado em:

`android\app\build\outputs\apk\release\app-release.apk`

## Widget Android (home screen)

Há **dois tamanhos** no seletor de widgets:

- **MyAgenda (pequeno)** — resumo em poucas linhas
- **MyAgenda (médio)** — hoje, próximo compromisso e até 4 itens do dia

Toque no widget abre o app (`OPEN_APP`). Os dados são gravados em arquivo local ao salvar tarefas para o widget atualizar de forma confiável.

Para refletir alterações no widget após mudanças de código/config:

```bash
npx expo prebuild --platform android
cd android
.\gradlew.bat assembleRelease
```

No celular: tela inicial → Widgets → MyAgenda. Remova o widget antigo se ainda aparecer um nome antigo após atualizar o APK.

## Instalar APK no Motorola (USB)

1. No celular, habilite:
   - Opções do desenvolvedor
   - Depuração USB
2. Conecte via USB.
3. Rode:

```bash
adb devices
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

## Backup recomendado

- Use **Configurações > Exportar JSON** 1x por semana para Drive/Email (a app regista a data do último export).
- Opcional: ative **Lembrar de exportar backup** para receber um aviso local; toque na notificação abre Configurações.
- Em caso de troca de celular/reinstalação, use **Importar JSON** (mesclar ou substituir).
