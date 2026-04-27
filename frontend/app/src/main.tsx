import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./contexts/LanguageProvider.tsx";
import { ThemeProvider } from "./contexts/ThemeProvider.tsx";
import "./index.css";
import "./theme/theme.css";
import "./theme/colors.css";
import "./theme/spacing.css";
import "./theme/typography.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </HelmetProvider>
  </StrictMode>,
)
