import { Slot } from "expo-router";
import { Provider, useDispatch } from "react-redux";
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
import { useRouter } from "expo-router";

function AppContent() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const [appReady, setAppReady] = useState(false);

  const theme = useMemo(() => {
    return colorScheme === "light" ? DarkTheme : DefaultTheme;
  }, [colorScheme]);

  useEffect(() => {
    const loadAppState = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        const hasSeen = await AsyncStorage.getItem("hasSeenOnboarding");

        // FIRST TIME USER
        if (!hasSeen) {
          router.replace("/onboarding");
          return setAppReady(true);
        }

        // USER HAS TOKEN → LOG THEM IN
        if (accessToken && refreshToken) {
          dispatch(setTokens({ accessToken, refreshToken }));
          router.replace("/(auth)/passcode");
        } else {
          // USER NOT LOGGED IN
          dispatch(logout());
          router.replace("/(auth)/signin");
        }

        setAppReady(true);
      } catch (err) {
        dispatch(logout());
        router.replace("/(auth)/signin");
      }
    };

    loadAppState();
  }, []); // <-- RUN ONLY ON APP START

  // if (!appReady) return null;

  return (
    <ThemeProvider value={theme}>
      <Slot />
    </ThemeProvider>
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
