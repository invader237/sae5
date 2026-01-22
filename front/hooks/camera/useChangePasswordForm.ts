import { useCallback, useState } from "react";
import { changePassword } from "@/api/auth.api";

type UseChangePasswordFormOptions = {
  token: string;
};

export function useChangePasswordForm({ token }: UseChangePasswordFormOptions) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const submit = useCallback(async () => {
    setSuccessMsg(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Merci de remplir tous les champs.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await changePassword(token, {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg("Mot de passe mis à jour avec succès.");
    } catch (error: any) {
      const detail =
        typeof error?.response?.data?.detail === "string"
          ? error.response.data.detail
          : "Impossible de modifier le mot de passe.";

      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  }, [confirmPassword, newPassword, oldPassword, token]);

  return {
    oldPassword,
    newPassword,
    confirmPassword,
    loading,
    errorMsg,
    successMsg,
    setOldPassword,
    setNewPassword,
    setConfirmPassword,
    submit,
  };
}
