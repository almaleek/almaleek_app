import { View, Text, TouchableOpacity, Linking } from "react-native";
import React from "react";
import { Mail, Phone, Instagram, Twitter, Facebook } from "lucide-react-native";
import ApHeader from "@/components/headers/header";

export default function ContactUs() {
  const contactItems = [
    {
      icon: <Phone size={22} color="#2563eb" />, // blue-600
      text: "+234 08162399919",
      onPress: () => Linking.openURL("tel:+2348162399919"),
    },
    {
      icon: <Mail size={22} color="#2563eb" />,
      text: "support@almaleek.com.ng",
      onPress: () => Linking.openURL("mailto:support@almaleek.com.ng"),
    },
    {
      icon: <Instagram size={22} color="#db2777" />, // pink-600
      text: "@almaleek.com.ng",
      onPress: () => Linking.openURL("https://instagram.com/payonce.com.ng"),
    },
    {
      icon: <Twitter size={22} color="#3b82f6" />, // blue-400
      text: "@almaleek.com.ng",
      onPress: () => Linking.openURL("https://twitter.com/yourpage"),
    },
    {
      icon: <Facebook size={22} color="#1d4ed8" />, // blue-700
      text: "YourPage",
      onPress: () => Linking.openURL("https://facebook.com/yourpage"),
    },
  ];

  return (
    <View>
      <ApHeader title="Contact Us" link="/(protected)/(tabs)/profile" />

      {/* Card */}
      <View className="bg-white shadow-lg rounded-xl p-6 mt-4">
        <Text className="text-2xl font-bold text-center text-gray-800">
          Contact Us
        </Text>

        <Text className="text-center text-gray-500 mt-2 mb-6 text-sm">
          We'd love to hear from you. Reach us through any of the options below.
        </Text>

        {/* Contact List */}
        <View className="flex flex-col space-y-4">
          {contactItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={item.onPress}
              className="flex flex-row items-center space-x-4 p-3 rounded-lg bg-gray-50 border border-gray-200"
            >
              {item.icon}

              <Text className="text-gray-700 text-sm">{item.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
