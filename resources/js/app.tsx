import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { createGlobalStyle } from 'styled-components';
import { I18nProvider } from './i18n';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #f5f7fb;
    color: #172033;
    font-family: 'Instrument Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  a {
    color: inherit;
  }
`;

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/index.tsx', { eager: true });
        const page = pages[`./Pages/${name}/index.tsx`];

        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <I18nProvider>
                <GlobalStyle />
                <App {...props} />
            </I18nProvider>,
        );
    },
});
