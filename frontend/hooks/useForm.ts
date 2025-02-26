// Modification de useForm.ts

import { useState, useCallback } from "react";

type FormErrors<T> = Partial<Record<keyof T, string>>;

interface UseFormProps<T> {
  initialValues: T;
  validate?: (values: T) => FormErrors<T>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null); // Ajout d'un état pour l'erreur globale

  // Met à jour un champ spécifique
  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Efface l'erreur si le champ est modifié
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }

      // Efface l'erreur globale si un champ est modifié
      if (globalError) {
        setGlobalError(null);
      }
    },
    [errors, globalError]
  );

  // Marque un champ comme "touché" (pour validation à la perte de focus)
  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Valide le champ individuel s'il y a une fonction de validation
      if (validate) {
        const fieldErrors = validate(values);
        if (fieldErrors[name]) {
          setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
        }
      }
    },
    [values, validate]
  );

  // Réinitialise le formulaire
  const resetForm = useCallback(
    (newValues?: T) => {
      setValues(newValues || initialValues);
      setErrors({});
      setTouched({} as Record<keyof T, boolean>);
      setIsSubmitting(false);
      setGlobalError(null);
    },
    [initialValues]
  );

  // Met à jour plusieurs champs à la fois
  const setFieldValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Définit une erreur spécifique
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  // Soumet le formulaire
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Vérifie s'il y a des erreurs de validation
      let formErrors: FormErrors<T> = {};
      if (validate) {
        formErrors = validate(values);
      }

      // Marque tous les champs comme touchés
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Record<keyof T, boolean>);

      setTouched(allTouched);
      setErrors(formErrors);

      // S'il y a des erreurs, génère un message d'erreur global
      const hasErrors = Object.keys(formErrors).length > 0;

      if (hasErrors) {
        // Créer un message d'erreur global à partir des erreurs de champs
        const errorMessages = Object.values(formErrors).filter(Boolean);
        setGlobalError(
          errorMessages.length > 0
            ? "Veuillez corriger les erreurs suivantes : " +
                errorMessages.join(", ")
            : "Veuillez corriger les erreurs dans le formulaire"
        );
        return false;
      }

      // S'il n'y a pas d'erreurs, soumet le formulaire
      if (onSubmit) {
        setIsSubmitting(true);
        setGlobalError(null);
        try {
          await onSubmit(values);
        } catch (error: any) {
          console.error("Form submission error:", error);
          // Afficher l'erreur retournée par l'API ou une erreur générique
          setGlobalError(
            error.message ||
              "Une erreur est survenue lors de la soumission du formulaire"
          );
        } finally {
          setIsSubmitting(false);
        }
      }

      return !hasErrors;
    },
    [values, validate, onSubmit]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    globalError, // Exposer l'erreur globale
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValues,
    setFieldError,
    setGlobalError, // Exposer la fonction pour définir l'erreur globale
  };
}
