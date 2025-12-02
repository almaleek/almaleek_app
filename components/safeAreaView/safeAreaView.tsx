import React from "react";
import { StatusBar, View, Dimensions } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface AppSafeAreaProps {
  children: React.ReactNode;
}

export default function ApSafeAreaView({ children }: AppSafeAreaProps) {
  const insets = useSafeAreaInsets();
  const { height, width } = Dimensions.get("window"); // <-- screen size

  return (
    <SafeAreaView
      className="flex-1 bg-white-100"
      style={{
        minHeight: height, // ensure full device height
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <StatusBar barStyle="dark-content" />

      {/* If you ever want to debug: console.log(height, width) */}

      <View
        className="flex-1 px-4"
        style={{
          minHeight: height - (insets.top + insets.bottom),
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
