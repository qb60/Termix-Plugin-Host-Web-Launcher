# Публикация

[English version](RELEASING.md)

Сначала замените владельца: `npm run configure -- GITHUB_USERNAME` (подставьте настоящее имя). Обновите версию одновременно в `manifest.json`, `package.json`, `package-lock.json` и первом разделе `CHANGELOG_RU.md`. Для package/lock удобно `npm version 1.0.2 --no-git-tag-version`; манифест и changelog редактируются отдельно. Поддерживайте английский `CHANGELOG.md` и русский `CHANGELOG_RU.md` согласованными.

1. Выполните проверки из DEVELOPMENT, закоммитьте и отправьте `main`.
2. В GitHub → Settings → Secrets and variables → Actions создайте repository secret `TERMIX_PLUGIN_SIGNING_KEY` с **содержимым** файла ключа CLI. Это base64 PKCS8 DER, не путь к файлу. Создайте repository variable `REGISTRY_PUBLIC_KEY` с public key в base64.
3. Actions → Release → Run workflow → Branch: main → Version: `1.0.2` → Run workflow.
4. Workflow проверяет версии, тестирует, строит, упаковывает, подписывает официальным CLI, проверяет подпись public key и только затем создаёт draft release с обоими файлами и публикует его. Для релиза нужен `contents: write`; используемый стандартный `GITHUB_TOKEN` ограничен этим репозиторием.
5. Откройте Releases → `v1.0.2`, проверьте `.tmxplug` и `.tmxplug.sig`, скачайте и выполните:

```bash
npx --no-install termix-plugin verify host-web-launcher-1.0.2.tmxplug --key 'YOUR_PUBLIC_KEY'
```

Без ключа, с неверным ключом или несогласованными версиями release не публикуется. Существующий тег не перезаписывается. После ошибки на шаге публикации проверьте draft и тег; удалять их вручную можно только если релиз ещё не был опубликован/проиндексирован. Уже опубликованный файл не заменяйте — выпускайте следующую версию.

Свой workflow выбран вместо общего official release workflow: общий рассчитан на dev-ветки, слияние и возможность unsigned community submissions; для этого проекта нужна обязательная подпись собственным ключом и обычный `main`.

Первый ключ создаётся локально командой `npx --no-install termix-plugin keygen --out /secure/offline/keys`. CLI печатает public key и key ID, но записывает только private key. Полный порядок настройки обоих проектов приведён в `SETUP_RU.md`, а архитектура доверия — в документации реестра SIGNING.
