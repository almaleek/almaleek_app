import { Slot } from "expo-router";
import useAutoLogout from "@/hooks/use-auto-logout";

export default function ProtectedLayout() {
  useAutoLogout(180000);
  return <Slot />;
}
