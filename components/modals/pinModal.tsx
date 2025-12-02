import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Lock } from "lucide-react-native";

type PinModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  loading?: boolean;
};

import { ActivityIndicator } from "react-native";

export default function PinModal({
  visible,
  onClose,
  onSubmit,
  loading = false,
}: PinModalProps) {
  const [pin, setPin] = useState<string>("");

  React.useEffect(() => {
    if (!visible) setPin("");
  }, [visible]);

  const handlePress = (num: string) => {
    if (pin.length >= 4 || loading) return; // prevent input while loading
    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      onSubmit(newPin);
    }
  };

  const handleDelete = () => {
    if (loading) return; // disable delete while loading
    setPin((prev) => prev.slice(0, -1));
  };

  const keypad: string[][] = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "del"],
  ];

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View className="flex-1 bg-white/70 justify-end">
        <View className="bg-green-50 rounded-t-3xl p-5 pb-10 relative">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <View />
            <TouchableOpacity
              onPress={() => {
                if (!loading) onClose();
                setPin("");
              }}
            >
              <Ionicons name="close" size={22} color="black" />
            </TouchableOpacity>
          </View>

          {/* Lock + Title */}
          <View className="items-center mb-6 mt-2">
            <Lock size={28} color="#32d47a" />
            <Text className="text-green-600 text-base mt-2">
              Transaction PIN
            </Text>

            {/* PIN Dots */}
            <View className="flex-row space-x-8 mt-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    pin.length > i ? "bg-[#32d47a]" : "bg-gray-500/40"
                  }`}
                />
              ))}
            </View>
          </View>

          {/* Keypad */}
          <View className="items-center">
            <View className="w-full">
              {keypad.map((row, rowIndex) => (
                <View
                  key={rowIndex}
                  className="flex-row justify-between my-3 px-10"
                >
                  {row.map((item, idx) => {
                    if (item === "")
                      return <View key={idx} className="w-12 " />;
                    if (item === "del")
                      return (
                        <TouchableOpacity key={idx} onPress={handleDelete}>
                          <Text className="text-[#32d47a] text-lg font-semibold">
                            Delete
                          </Text>
                        </TouchableOpacity>
                      );

                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => handlePress(item)}
                      >
                        <Text className="text-[#32d47a] rounded-full p-4 bg-white text-2xl font-semibold">
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {/* LOADING OVERLAY */}
          {loading && (
            <View className="absolute inset-0 bg-black/30 justify-center items-center rounded-t-3xl">
              <ActivityIndicator size="large" color="#32d47a" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
