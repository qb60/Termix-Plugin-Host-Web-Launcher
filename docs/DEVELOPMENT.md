# Разработка

Установите Git, Node.js 24 LTS и npm. Например, при установленном mise: `mise use --global node@24`, затем откройте новый терминал и проверьте `node --version`, `npm --version`.

```bash
npm ci
npm run format
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run validate
npm run pack
```

`build` должен идти перед CLI `validate`: валидатор проверяет существование `dist/backend.js` и `dist/frontend.js`. Результат упаковки — `host-web-launcher-1.0.0.tmxplug` в корне проекта. `node_modules`, `dist` и пакет не включаются в Git.

Основная логика — `src/frontend/launcher.ts`; регистрация и локализованные уведомления — `src/frontend/index.tsx`. Host editor автоматически создаётся из `contributes.settings.host`, записывает поля под `pluginSettings["host-web-launcher"]` и сохраняет их средствами ядра Termix. Самостоятельный `registerHostEditorSection` не нужен. Для host action отдельного поля `contributes.hostActions` в SDK нет: оно регистрируется через `app.registerHostAction`. `contributes.actions` обозначает другой механизм экспортируемых frontend actions и здесь не используется.

Сохранённые значения не перезаписываются при активации и повторном редактировании. Defaults задаёт ядро; runtime также корректно обрабатывает отсутствующие протокол и путь. Для веб-порта default намеренно отсутствует, чтобы HTTP и HTTPS использовали разные стандартные значения. Пустой порт в стандартной форме может сохраняться как `null` — это тоже означает стандартный порт.

`tests/frontend` запускается через preset SDK в jsdom. `renderWithApp` использует настоящие реестры SDK; открытие браузера подменяется. Проверки URL включают некорректные схемы, порты, IPv6, percent encoding и невозможность сменить origin через путь. Настоящие popup blockers, DNS, доступность сервиса, сохранение в БД и desktop требуют ручного теста.

Для ручной проверки включите developer mode в Termix, откройте Plugins → Install from file, выберите `.tmxplug`. Веб-браузер должен сохранить вкладку Termix, открыть отдельную вкладку назначения и не создавать workspace tab. Измените хост, сохраните, перезагрузите страницу и проверьте значения. Повторите с HTTP, HTTPS, IPv6 и установленным Web Endpoint. Проверьте disabled host и неверный порт. При `noopener` браузер возвращает `null` даже при успешном открытии — это не признак блокировки.

Не добавляйте `await` перед `window.open`: в исходниках ядра `runHostAction` вызывает `action.run` прямо. Сохранение пользовательского жеста зависит от этого пути; программные вызовы без клика могут блокироваться браузером.
