import { Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useRegistration } from "../../context/RegistrationContext";
import { Redirect, usePathname } from "expo-router";
import { useEffect } from "react";

export default function RegisterLayout() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { resetForm, currentStep } = useRegistration();
  const pathname = usePathname();

  // Réinitialiser le formulaire si on entre dans le processus d'inscription
  useEffect(() => {
    if (pathname === "/register/step1_profile") {
      resetForm();
    }
  }, [pathname]);

  // Redirection si déjà authentifié
  if (!authLoading && isAuthenticated) {
    return <Redirect href={"/" as any} />;
  }

  // Vérifier si l'utilisateur accède à une étape directement
  const stepNumber = pathname.match(/step(\d)_/)
    ? parseInt(pathname.match(/step(\d)_/)![1])
    : 0;

  // Rediriger vers l'étape appropriée si l'utilisateur tente d'accéder à une étape future
  if (stepNumber > currentStep && stepNumber !== 1) {
    const redirectPath = `/register/step${currentStep}_profile`;
    return <Redirect href={redirectPath as any} />;
  }

  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="step1_profile" />
      <Stack.Screen name="step2_physical" />
      <Stack.Screen name="step3_sedentary" />
      <Stack.Screen name="step4_target_weight" />
      <Stack.Screen name="step5_nutrition_plan" />
      <Stack.Screen name="step6_diet" />
      <Stack.Screen name="step7_activities" />
      <Stack.Screen name="step8_sessions" />
      <Stack.Screen name="step9_complete" />
    </Stack>
  );
}
