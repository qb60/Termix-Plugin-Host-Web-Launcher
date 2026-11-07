# Источники и решения

[English version](UPSTREAM.md)

Исследовано 6 ноября 2026 года; исходники `main` могут меняться. Runtime и CLI зафиксированы зависимостью `@termix-ssh/plugin-sdk` 1.0.20 и npm lockfile.

- [Plugin-Web-Endpoint](https://github.com/Termix-SSH/Plugin-Web-Endpoint): `src/frontend/index.tsx`, `endpoints.ts`, `HostEditorWebUiSection.tsx`, `web-endpoint-api.ts`, manifest/package. Взяты соглашения host action, host record и namespace, список эндпоинтов в редакторе и меню выбора через `HostActionContribution.items`. Прокси, туннели и embedded surfaces не переносились.
- [Официальный frontend contract](https://github.com/Termix-SSH/Termix/blob/main/packages/plugin-sdk/src/frontend.ts): `PluginHostRecord.ip`, `pluginSettings`, синхронный `HostActionContribution.run`.
- [Вызов действия в ядре](https://github.com/Termix-SSH/Termix/blob/main/src/ui/sidebar/host-contributions.ts): `runHostAction` напрямую вызывает `action.run(host, shell)` без `await` и таймера.
- [Desktop](https://github.com/Termix-SSH/Termix/blob/main/electron/main.cjs): `setWindowOpenHandler` вызывает `shell.openExternal` для HTTP/HTTPS и запрещает новое Electron-окно. Это анализ исходников, не GUI-тест.
- [Settings](https://docs.termix.site/develop/settings/): декларативные host settings автоматически получают форму и persistence. Для списка используется собственная секция в top group, доступная также хостам без SSH, и скрытое JSON-поле `endpoints` для сохранения ядром. У исходного Web Endpoint секция в SSH group.
- [Manifest](https://docs.termix.site/develop/manifest/), [Frontend](https://docs.termix.site/develop/frontend/), [Permissions](https://docs.termix.site/develop/permissions/), [Testing](https://docs.termix.site/develop/testing/), [Releasing](https://docs.termix.site/develop/releasing/), [Registries](https://docs.termix.site/develop/registries/).

Расхождения: страница Manifest упоминает API 1.2, исследованный `manifest.ts` содержит API 1.13.0. Выбран консервативный минимум `^1.9` и Termix `>=26.10.3` по используемому upstream host action контракту, а не предположение, что актуальная версия ядра совпадает с текстом страницы. Публикуемый пакет дополнительно проверяется установленным CLI.

SDK CLI 1.0.20 `commands/build.mjs` отказывается строить code plugin без `src/backend/index.*`, `commands/pack.mjs` требует `dist/backend.js`. Поэтому полностью frontend-only пакет штатным CLI сейчас не собрать. Единственный backend export — пустой `activate()`. Он не создаёт маршрутов, таблиц, сервисов, SSH-соединений или таймеров. Capability `hosts:read` не нужна: плагин не вызывает backend hosts API.

Указанный [Plugin-Template](https://github.com/Termix-SSH/Plugin-Template) при исследовании возвращал HTTP 404, в том числе при прямом запросе raw package.json. Контракты проверены по доступному Web Endpoint и установленному SDK; содержимое недоступного шаблона не выдумывалось.

Новый проект написан как сокращённая независимая реализация. License/NOTICE сохраняют upstream-атрибуцию; лицензия при упаковке входит в `.tmxplug`. Для публикации со связью fork используйте разделы 2–5 прилагаемого `SETUP_RU.md`: создайте fork оригинала, клонируйте его и замените рабочее дерево подготовленными исходниками отдельным коммитом, сохранив `.git`, LICENSE/NOTICE и историю оригинала. Подготовленный архив сам по себе Git-истории не содержит. Связь fork на GitHub возникает при создании fork; добавление remote `upstream` служит для работы с оригиналом локально.
