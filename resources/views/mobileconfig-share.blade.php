<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="apple-touch-icon" href="/apple-touch-icon.svg">
    <title>Installer Munki</title>
    <style>
        :root {
            color-scheme: light;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        * {
            box-sizing: border-box;
        }

        body {
            align-items: center;
            background:
                radial-gradient(circle at 20% 20%, rgb(219 234 254 / 90%), transparent 32%),
                radial-gradient(circle at 80% 0%, rgb(224 231 255 / 80%), transparent 28%),
                linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
            color: #0f172a;
            display: flex;
            margin: 0;
            min-height: 100vh;
            padding: 24px;
        }

        .language-picker {
            position: fixed;
            right: 18px;
            top: 18px;
            z-index: 10;
        }

        .sr-only {
            clip: rect(0, 0, 0, 0);
            border: 0;
            height: 1px;
            margin: -1px;
            overflow: hidden;
            padding: 0;
            position: absolute;
            white-space: nowrap;
            width: 1px;
        }

        .language-picker select {
            appearance: none;
            background: rgb(255 255 255 / 82%);
            border: 1px solid rgb(226 232 240 / 92%);
            border-radius: 999px;
            box-shadow: 0 14px 40px rgb(15 23 42 / 12%);
            color: #0f172a;
            cursor: pointer;
            font-size: 13px;
            font-weight: 900;
            padding: 10px 34px 10px 14px;
        }

        .language-picker::after {
            color: #64748b;
            content: "⌄";
            font-size: 14px;
            pointer-events: none;
            position: absolute;
            right: 14px;
            top: 9px;
        }

        main {
            margin: 0 auto;
            max-width: 760px;
            width: 100%;
        }

        .card {
            background: rgb(255 255 255 / 82%);
            border: 1px solid rgb(255 255 255 / 72%);
            border-radius: 30px;
            box-shadow: 0 28px 90px rgb(15 23 42 / 18%);
            overflow: hidden;
        }

        .hero {
            padding: 34px 34px 24px;
        }

        .eyebrow {
            color: #2563eb;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.12em;
            margin: 0 0 12px;
            text-transform: uppercase;
        }

        h1 {
            font-size: clamp(30px, 6vw, 48px);
            letter-spacing: -0.055em;
            line-height: 0.95;
            margin: 0;
        }

        .intro {
            color: #475569;
            font-size: 17px;
            line-height: 1.55;
            margin: 18px 0 0;
            max-width: 620px;
        }

        .steps {
            display: grid;
            gap: 14px;
            padding: 0 24px 24px;
        }

        .step {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 22px;
            display: grid;
            gap: 18px;
            padding: 22px;
        }

        .step-header {
            align-items: flex-start;
            display: flex;
            gap: 14px;
        }

        .number {
            align-items: center;
            background: #0f172a;
            border-radius: 999px;
            color: #ffffff;
            display: inline-flex;
            flex: 0 0 auto;
            font-weight: 900;
            height: 34px;
            justify-content: center;
            width: 34px;
        }

        h2 {
            font-size: 20px;
            letter-spacing: -0.02em;
            margin: 2px 0 6px;
        }

        p {
            color: #64748b;
            line-height: 1.55;
            margin: 0;
        }

        .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            padding-left: 48px;
        }

        .discreet-action {
            color: #64748b;
            font-size: 12px;
            padding-left: 48px;
            text-decoration: underline;
            text-underline-offset: 3px;
        }

        .discreet-action:hover {
            color: #475569;
        }

        .button {
            align-items: center;
            background: #2563eb;
            border-radius: 14px;
            color: #ffffff;
            display: inline-flex;
            font-weight: 900;
            gap: 8px;
            min-height: 46px;
            padding: 12px 16px;
            text-decoration: none;
        }

        .button.secondary {
            background: #eef2ff;
            color: #3730a3;
        }

        .hint {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            color: #475569;
            font-size: 14px;
            line-height: 1.5;
            margin-left: 48px;
            padding: 12px 14px;
        }

        .footer {
            color: #94a3b8;
            font-size: 13px;
            padding: 0 34px 30px;
        }

        @media (max-width: 640px) {
            body {
                padding: 58px 14px 14px;
            }

            .language-picker {
                right: 14px;
                top: 12px;
            }

            .hero {
                padding: 26px 22px 18px;
            }

            .steps {
                padding: 0 14px 14px;
            }

            .step {
                padding: 18px;
            }

            .actions,
            .discreet-action,
            .hint {
                margin-left: 0;
                padding-left: 0;
            }

            .button {
                justify-content: center;
                width: 100%;
            }

            .footer {
                padding: 0 22px 24px;
            }
        }
    </style>
</head>
<body>
    <label class="language-picker">
        <span class="sr-only">Language</span>
        <select id="locale-switcher" aria-label="Language">
            <option value="fr">🇫🇷 FR</option>
            <option value="en">🇬🇧 EN</option>
        </select>
    </label>

    <main>
        <section class="card" aria-labelledby="page-title">
            <div class="hero">
                <p class="eyebrow">Munkitop</p>
                <h1 id="page-title" data-i18n="title">Installer Munki sur ce Mac</h1>
                <p class="intro" data-i18n="intro" data-profile="{{ $profileName }}">
                    Deux téléchargements suffisent : l’application cliente Munki, puis le profil de configuration préparé pour {{ $profileName }}.
                </p>
            </div>

            <div class="steps">
                <article class="step">
                    <div class="step-header">
                        <span class="number">1</span>
                        <div>
                            <h2 data-i18n="stepClientTitle">Télécharger le logiciel Munki</h2>
                            <p data-i18n="stepClientText">Télécharge le package Munki, ouvre-le, puis suis l’installation standard macOS.</p>
                        </div>
                    </div>
                    <div class="actions">
                        <a class="button" href="{{ $clientDownloadUrl }}" target="_blank" rel="noreferrer" data-i18n="clientButton">
                            Télécharger Munki
                        </a>
                    </div>
                </article>

                <article class="step">
                    <div class="step-header">
                        <span class="number">2</span>
                        <div>
                            <h2 data-i18n="stepConfigTitle">Télécharger la configuration</h2>
                            <p data-i18n="stepConfigText">Télécharge le fichier de configuration, ouvre-le, puis valide son installation dans les Réglages Système.</p>
                        </div>
                    </div>
                    <div class="actions">
                        <a class="button secondary" href="{{ $downloadUrl }}" data-i18n="configButton" data-file="{{ $fileName }}">
                            Télécharger {{ $fileName }}
                        </a>
                    </div>
                    <p class="hint" data-i18n="hint">
                        Après l’ouverture du fichier, va dans Réglages Système. Sous le compte Apple, clique sur
                        <strong>Profil téléchargé</strong>, puis vérifie et installe le profil.
                    </p>
                    <a class="discreet-action" href="{{ $checkIntervalScriptUrl }}" download data-i18n="checkIntervalScript">
                        Télécharger le script pour changer la fréquence de vérification Munki.
                    </a>
                </article>
            </div>

            <p class="footer" data-i18n="footer">Tu peux fermer cette page une fois les deux étapes terminées.</p>
        </section>
    </main>
    <script>
        const STORAGE_KEY = 'munkitop.locale';
        const translations = {
            fr: {
                documentTitle: 'Installer Munki',
                languageLabel: 'Langue',
                title: 'Installer Munki sur ce Mac',
                intro: 'Deux téléchargements suffisent : l’application cliente Munki, puis le profil de configuration préparé pour {profile}.',
                stepClientTitle: 'Télécharger le logiciel Munki',
                stepClientText: 'Télécharge le package Munki, ouvre-le, puis suis l’installation standard macOS.',
                clientButton: 'Télécharger Munki',
                stepConfigTitle: 'Télécharger la configuration',
                stepConfigText: 'Télécharge le fichier de configuration, ouvre-le, puis valide son installation dans les Réglages Système.',
                configButton: 'Télécharger {file}',
                hint: 'Après l’ouverture du fichier, va dans Réglages Système. Sous le compte Apple, clique sur <strong>Profil téléchargé</strong>, puis vérifie et installe le profil.',
                footer: 'Tu peux fermer cette page une fois les deux étapes terminées.',
                checkIntervalScript: 'Télécharger le script pour changer la fréquence de vérification Munki.',
            },
            en: {
                documentTitle: 'Install Munki',
                languageLabel: 'Language',
                title: 'Install Munki on this Mac',
                intro: 'You only need two downloads: the Munki client app, then the configuration profile prepared for {profile}.',
                stepClientTitle: 'Download the Munki app',
                stepClientText: 'Download the Munki package, open it, then follow the standard macOS installation.',
                clientButton: 'Download Munki',
                stepConfigTitle: 'Download the configuration',
                stepConfigText: 'Download the configuration file, open it, then approve its installation in System Settings.',
                configButton: 'Download {file}',
                hint: 'After opening the file, go to System Settings. Under your Apple Account, click <strong>Downloaded Profile</strong>, then review and install the profile.',
                footer: 'You can close this page once both steps are complete.',
                checkIntervalScript: 'Download the script to change the Munki check interval.',
            },
        };

        function detectLocale() {
            const stored = window.localStorage.getItem(STORAGE_KEY);

            if (stored === 'fr' || stored === 'en') {
                return stored;
            }

            return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
        }

        function interpolate(text, element) {
            return text
                .replace('{profile}', element.dataset.profile ?? '')
                .replace('{file}', element.dataset.file ?? '');
        }

        function applyLocale(locale) {
            const dictionary = translations[locale] ?? translations.en;
            const switcher = document.getElementById('locale-switcher');

            document.documentElement.lang = locale;
            document.title = dictionary.documentTitle;
            switcher.value = locale;
            switcher.setAttribute('aria-label', dictionary.languageLabel);

            document.querySelector('.language-picker .sr-only').textContent = dictionary.languageLabel;

            document.querySelectorAll('[data-i18n]').forEach((element) => {
                const key = element.dataset.i18n;
                const translated = interpolate(dictionary[key] ?? '', element);

                if (key === 'hint') {
                    element.innerHTML = translated;
                    return;
                }

                element.textContent = translated;
            });
        }

        const initialLocale = detectLocale();
        const switcher = document.getElementById('locale-switcher');

        applyLocale(initialLocale);

        switcher.addEventListener('change', (event) => {
            const locale = event.target.value;

            window.localStorage.setItem(STORAGE_KEY, locale);
            applyLocale(locale);
        });
    </script>
</body>
</html>
