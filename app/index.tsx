import { Redirect } from "expo-router";
import { useAppSelector } from "@/core/store/hooks";

export default function Index() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return <Redirect href={isAuthenticated ? "/(app)" : "/(auth)/login"} />;
}
