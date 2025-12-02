import { View, Text, Image } from "react-native";

export default function ApLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <View className="flex-1 justify-center items-center space-y-4 ">
      <Image
        source={require("../../assets/images/logo.png")} // update this path to your RN assets folder
        style={{ width: 50, height: 50 }}
        className="animate-pulse"
        resizeMode="contain"
      />

      <Text className="text-lg font-semibold text-gray-700">{text}</Text>
    </View>
  );
}
