import React from "react";
import { View, Text, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import ApSafeAreaView from "@/components/safeAreaView/safeAreaView";
import ApScrollView from "@/components/scrollview/scrollview";
import ApHeader from "@/components/headers/header";

export default function ComingSoon() {
  return (
    <ApSafeAreaView>
      <ApHeader title="Transfer" />

      <ApScrollView style={{ backgroundColor: "white" }}>
        <View className="flex-1 bg-white items-center justify-center px-6">
          <StatusBar style="dark" />

          {/* <Image
            source={require("../assets/coming-soon.png")}
            className="w-60 h-60 mb-8"
            resizeMode="contain"
          /> */}

          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Coming Soon 🚀
          </Text>

          <Text className="text-center text-gray-500 text-base leading-relaxed">
            We’re working hard to bring you an amazing experience.
            {"\n"}Stay tuned!
          </Text>

          <View className="absolute bottom-20">
            <Text className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Almaleek
            </Text>
          </View>
        </View>
      </ApScrollView>
    </ApSafeAreaView>
  );
}
