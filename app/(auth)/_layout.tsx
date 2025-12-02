import { Slot, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function AuthLayout() {
  const router = useRouter();
  const token = useSelector((state: any) => state.auth.accessToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Decide where to go based on token
    if (token) {
      router.replace("/(auth)/passcode"); // Logged-in user
    } else {
      router.replace("/(auth)/signin"); // Not logged in
    }

    // Stop showing blank screen after redirect
    setLoading(false);
  }, [token]);

  // Prevent rendering child screens until routing is decided
  if (loading) return null;

  return <Slot />;
}
