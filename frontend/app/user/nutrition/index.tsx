import { Redirect } from "expo-router";

export default function IndexPage() {
  // Redirection automatique vers la page nutrition-discover
  return <Redirect href="/user/nutrition/nutrition-discover" />;
}
