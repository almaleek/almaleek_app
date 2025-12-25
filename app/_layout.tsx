import { Slot, useRouter } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "@/redux/store";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useMemo, useState } from "react";
import "../global.css";
import { ToastProvider } from "@/components/toast/toastProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setTokens, logout } from "@/redux/features/user/userSlice";
import ApLoader from "@/components/loaders/mainloader";
import { injectLogoutHandler } from "@/redux/apis/common/aixosInstance";

function AppContent() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  const router = useRouter();

  const [appReady, setAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  const theme = useMemo(
    () => (colorScheme === "dark" ? DefaultTheme : DarkTheme),
    [colorScheme]
  );

  useEffect(() => {
    injectLogoutHandler(() => {
      dispatch(logout());
      router.replace("/(auth)/signin");
    });
  }, []);

  useEffect(() => {
    const loadAppState = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        const hasSeen = await AsyncStorage.getItem("hasSeenOnboarding");
        const hasPasscode = await AsyncStorage.getItem("app_passcode");

        if (!hasSeen) {
          setInitialRoute("/onboarding");
          setAppReady(true);
          return;
        }

        // 2️⃣ User logged in
        if (accessToken && refreshToken) {
          dispatch(setTokens({ accessToken, refreshToken }));
          setInitialRoute("/(security)/passcode");
          setAppReady(true);
          return;
        }
        dispatch(logout());
        setInitialRoute("/(auth)/signin");
        setAppReady(true);
      } catch (err) {
        console.log("App load error:", err);
        dispatch(logout());
        setInitialRoute("/(auth)/signin");
        setAppReady(true);
      }
    };

    loadAppState();
  }, []);

  // Navigate after appReady
  useEffect(() => {
    if (appReady && initialRoute) {
      router.replace(initialRoute as any);
    }
  }, [appReady, initialRoute]);

  // Loading screen while deciding initial route
  if (!appReady) {
    return (
      // <ThemeProvider value={theme}>
      <ApLoader />
      // </ThemeProvider>
    );
  }

  // Render Slot (root navigator)
  return (
    // <ThemeProvider value={theme}>
    <Slot />
    // </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Provider>
  );
}
