import React from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import ApTextInput from "@/components/textInput/textInput";
import ApButton from "@/components/button/button";
import { router, useRouter } from "expo-router";
import { requestPasswordReset } from "@/redux/features/user/userThunk";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const resultAction = await dispatch(requestPasswordReset(values));
      if (requestPasswordReset.fulfilled.match(resultAction)) {
        // toast.success("✅ Email verified successfully");
        router.replace({
          pathname: `/(auth)/signin`,
          params: { email: values.email },
        });
      } else {
        // toast.error(
        //   `❌ ${resultAction.payload || "Email verification failed"}`
        // );
      }
    } finally {
      setSubmitting(false); // stop Formik's loading
    }
  };
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-gray-50">
      <View className="flex-1 justify-center items-center px-4">
        <View className="bg-white/40 p-6 rounded-lg w-full max-w-sm">
          {/* Logo */}
          <View className="flex justify-center items-center mb-4">
            <Image
              source={require("@/assets/images/logo.png")} // <-- replace with your logo path
              className="w-24 h-24"
              resizeMode="contain"
            />
          </View>

          <Text className="text-2xl font-bold mb-4 text-center">
            Forgot Password
          </Text>
          <Text className="text-gray-600 text-sm mb-6 text-center">
            Enter your registered email!
          </Text>

          <Formik
            initialValues={{ email: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit, isSubmitting }) => (
              <View>
                <ApTextInput
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                />

                <ApButton
                  title={isSubmitting ? "Processing..." : "Submit"}
                  onPress={handleSubmit as any}
                  className="w-full mt-4"
                  disabled={isSubmitting}
                />
              </View>
            )}
          </Formik>

          <Text className="text-center mt-2 text-sm">
            Wrong email?{" "}
            <Pressable onPress={() => router.push("/(auth)/signin")}>
              <Text className="text-blue-600 underline">Sign Up Again</Text>
            </Pressable>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
