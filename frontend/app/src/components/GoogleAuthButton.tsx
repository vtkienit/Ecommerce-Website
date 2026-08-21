import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

type GoogleCredentialResponse = {
  credential: string;
  select_by: string;
};

type GoogleIdApi = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: "popup" | "redirect";
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type: "standard";
      theme: "outline" | "filled_black";
      size: "large";
      text: "signin_with" | "signup_with";
      shape: "rectangular";
      logo_alignment: "left";
      width: string;
      locale: string;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdApi;
      };
    };
  }
}

type GoogleAuthButtonProps = {
  mode: "login" | "register";
  onCredential: (credential: string) => void;
};

const scriptId = "google-identity-services";
const scriptSource = "https://accounts.google.com/gsi/client";

let initializedClientId: string | null = null;
let activeCredentialHandler: ((credential: string) => void) | null = null;

const forwardCredential = (response: GoogleCredentialResponse) => {
  activeCredentialHandler?.(response.credential);
};

export default function GoogleAuthButton({ mode, onCredential }: GoogleAuthButtonProps) {
  const { lang, t } = useLanguage();
  const { theme } = useTheme();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">(
    import.meta.env.GOOGLE_CLIENT_ID ? "loading" : "missing",
  );
  const [showConfigurationHelp, setShowConfigurationHelp] = useState(false);
  const clientId = import.meta.env.GOOGLE_CLIENT_ID?.trim();

  useEffect(() => {
    activeCredentialHandler = onCredential;

    return () => {
      if (activeCredentialHandler === onCredential) {
        activeCredentialHandler = null;
      }
    };
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let cancelled = false;

    const renderGoogleButton = () => {
      if (cancelled || !window.google || !buttonContainerRef.current) {
        return;
      }

      if (initializedClientId !== clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: forwardCredential,
          ux_mode: "popup",
        });
        initializedClientId = clientId;
      }

      const container = buttonContainerRef.current;
      container.replaceChildren();
      window.google.accounts.id.renderButton(container, {
        type: "standard",
        theme: theme === "dark" ? "filled_black" : "outline",
        size: "large",
        text: mode === "register" ? "signup_with" : "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: String(Math.min(container.clientWidth || 400, 400)),
        locale: lang,
      });
      setStatus("ready");
    };

    const handleScriptError = () => {
      if (!cancelled) {
        setStatus("error");
      }
    };

    if (window.google) {
      renderGoogleButton();
      return () => {
        cancelled = true;
      };
    }

    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = scriptSource;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", renderGoogleButton);
    script.addEventListener("error", handleScriptError);

    return () => {
      cancelled = true;
      script?.removeEventListener("load", renderGoogleButton);
      script?.removeEventListener("error", handleScriptError);
    };
  }, [clientId, lang, mode, theme]);

  if (!clientId) {
    return (
      <div>
        <button
          type="button"
          className="flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-border bg-bg px-4 font-medium text-text transition-colors hover:border-primary hover:bg-bg-secondary"
          onClick={() => setShowConfigurationHelp(true)}
        >
          <GoogleLogo />
          {mode === "register" ? t("registerWithGoogle") : t("loginWithGoogle")}
        </button>
        {showConfigurationHelp && (
          <p className="mt-2 text-sm leading-relaxed text-text-secondary" role="status">
            {t("googleClientMissing")}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="relative min-h-11 w-full">
        <div
          ref={buttonContainerRef}
          className="flex min-h-11 w-full items-center justify-center overflow-hidden rounded-md"
        />
        {status === "loading" && (
          <div className="absolute inset-0 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-bg text-sm text-text-secondary">
            <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
            {t("googleLoading")}
          </div>
        )}
      </div>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {t("googleLoadError")}
        </p>
      )}
      {status === "ready" && <span className="sr-only">Google Identity Services ready</span>}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  );
}
