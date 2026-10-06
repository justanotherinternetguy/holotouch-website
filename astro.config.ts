import { defineConfig } from 'astro/config';

export default defineConfig({
    site: 'https://holotouch.internetguy.dev',
    output: 'static',
    compressHTML: true,
    build: {
        inlineStylesheets: 'always'
    },
    devToolbar: { enabled: false }
});
