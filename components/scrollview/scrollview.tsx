import React from "react";
import { ScrollView, ViewStyle, Dimensions } from "react-native";

interface AppScrollViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
}

// Get screen height
const { height: screenHeight } = Dimensions.get("window");

export default function ApScrollView({
  children,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}: AppScrollViewProps) {
  return (
    <ScrollView
      style={[{ flex: 1 }, style]}
      contentContainerStyle={[
        {
          paddingVertical: 16,
          minHeight: screenHeight, // 🔥 ensures full-screen height
          flexGrow: 1,
          paddingBottom: 200,
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    >
      {children}
    </ScrollView>
  );
}
