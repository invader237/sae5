import { useCallback, useState } from "react";
import { login, register } from "@/api/auth.api";

type Mode = "login" | "register";

type UseAuthFormOptions = {
  onAuthenticated: (token: string) => Promise<void> | void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildErrorMessage = (
  status: number,
  body: any,
  defaultMsg: string
): string => {
  if (typeof body?.detail === "string") {
    return body.detail;
  }

  if (Array.isArray(body?.detail) && body.detail.length > 0) {
    const first = body.detail[0];
    const loc = (first.loc || []).join(".");
    const type = first.type || "";

    if (loc.includes("email") && type.includes("email")) {
      return "Merci de saisir une adresse e-mail valide.";
    }
    if (loc.includes("password")) {
      return "Le mot de passe saisi n'est pas valide.";
    }
    return "Certaines informations sont invalides, merci de vérifier le formulaire.";
  }

  if (status === 401) {
    return "Email ou mot de passe incorrect.";
  }
  if (status === 500) {
    return "Email ou mot de passe incorrect.";
  }
  if (status === 400) {
    return defaultMsg;
  }

  return "Une erreur est survenue. Merci de réessayer.";
};

export function useAuthForm({ onAuthenticated }: UseAuthFormOptions) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetFields = useCallback(() => {
    setEmail("");
    setUsername("");
    setPassword("");
  }, []);

  const switchMode = useCallback((newMode: Mode) => {
    setMode(newMode);
    setErrorMessage(null);
    resetFields();
  }, [resetFields]);

  const handleLogin = useCallback(async (fromRegister = false) => {
    if (!email || !password) {
      setErrorMessage("Merci de renseigner email et mot de passe.");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage("Merci de saisir une adresse e-mail valide.");
      return;
    }

    if (!fromRegister) setLoading(true);
    setErrorMessage(null);

    try {
      const res = await login({ email, password });
      const token = res.access_token;

      await onAuthenticated(token);
      resetFields();
    } catch (err: any) {
      console.log("LOGIN error", err);
      const status = err?.response?.status ?? 0;
      const body = err?.response?.data ?? null;

      const msg = buildErrorMessage(status, body, "Erreur lors de la connexion.");
      setErrorMessage(msg);
    } finally {
      if (!fromRegister) {
        setLoading(false);
      }
    }
  }, [email, password, onAuthenticated, resetFields]);

  const handleRegister = useCallback(async () => {
    if (!username || !email || !password) {
      setErrorMessage("Merci de remplir tous les champs.");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage("Merci de saisir une adresse e-mail valide.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await register({ username, email, password });
      await handleLogin(true);
    } catch (err: any) {
      console.log("REGISTER error", err);
      const status = err?.response?.status ?? 0;
      const body = err?.response?.data ?? null;

      const msg = buildErrorMessage(status, body, "Erreur lors de l'inscription.");
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [username, email, password, handleLogin]);

  return {
    mode,
    email,
    username,
    password,
    loading,
    errorMessage,
    setEmail,
    setUsername,
    setPassword,
    switchMode,
    handleLogin,
    handleRegister,
  };
}
