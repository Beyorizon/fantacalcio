# Fantacalcio Web

App React (Vite) per gestire rose, news, regolamento e scambi.

## PWA

L'app è installabile (Android + iOS) e funziona offline per shell UI + risorse recenti.

- Manifest generato con `vite-plugin-pwa` (config in `vite.config.js`)
- Service Worker registrato in `src/main.jsx`
- Icone (maskable e apple-touch) in `public/icons/`
- Meta tag iOS in `index.html`
- Bottone “Installa” in `src/components/InstallButton.jsx` incluso nella `TopBar`

### Test

1. `npm run build` e `npm run preview`
2. DevTools → Lighthouse → PWA ≥ 90
3. Application → Manifest: icone/display/start_url OK
4. Application → Service Workers: attivo e "Claimed"

