import { Redirect } from "expo-router";

export default function IndexPage() {
  // Redirection automatique vers la page sport-discover
  return <Redirect href="/user/sport/sport-discover" />;
}
