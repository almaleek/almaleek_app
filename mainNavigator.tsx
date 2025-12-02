import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";

const AuthRedirectWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  const user = useSelector((state: any) => state.auth.user);
  const token = useSelector((state: any) => state.auth.accessToken);

  useEffect(() => {
    if (!hasRedirected) {
      if (user && token) {
        router.replace("/passcode"); // Authenticated
      } else {
        router.replace("/(auth)/signin"); // Unauthenticated
      }
      setHasRedirected(true);
    }
  }, [user, token, hasRedirected, router]);

  return <>{children}</>; // Always render children/Slot
};

export default AuthRedirectWrapper;
