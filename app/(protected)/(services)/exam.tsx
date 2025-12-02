import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";

import { RootState, AppDispatch } from "@/redux/store";
import {
  fetchDataPlans,
  getExamServices,
  purchaseExam,
} from "@/redux/features/easyAccess/service";
import { examLogos } from "@/constants/examlogo";

import ApSafeAreaView from "@/components/safeAreaView/safeAreaView";
import ApScrollView from "@/components/scrollview/scrollview";
import ApHeader from "@/components/headers/header";
import ApTextInput from "@/components/textInput/textInput";
import ApButton from "@/components/button/button";
import BannerCarousel from "@/components/carousel/banner";
import { useToast } from "@/components/toast/toastProvider";
import PinModal from "@/components/modals/pinModal";

export default function ExamScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();

  const defaultProvider = {
    name: "WEAC",
    logo: examLogos.default,
  };

  const examServices = useSelector(
    (state: RootState) => state.easyAccessdataPlans.examServices
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [providerModal, setProviderModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>("WEAC");

  const [unitPrice, setUnitPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const [pinCode, setPinCode] = useState("");
  const [pinVisible, setPinVisible] = useState(false);

  useEffect(() => {
    dispatch(getExamServices());
  }, [dispatch]);

  const handleCategorySelect = async (category: string) => {
    console.log(category, "the category");
    try {
      const result = await dispatch(
        fetchDataPlans({ category: category, network: category })
      );
      if (fetchDataPlans.fulfilled.match(result)) {
        const fetchedPrice = result.payload.plans[0]?.ourPrice || 0;
        setUnitPrice(fetchedPrice || 0);
        console.log(unitPrice, "the unit");
      } else {
        showToast(result.payload || "Failed to fetch plans", "error");
      }
    } catch {
      showToast("Unexpected error while fetching plans", "error");
    }
  };

  /** Fix provider name → key */
  const formatProvider = (prov?: string) =>
    typeof prov === "string"
      ? prov
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
      : "default";

  /** Validate user inputs */
  const validationSchema = Yup.object({
    quantity: Yup.number().required("Enter quantity").min(1, "Minimum 1"),
    phone: Yup.string()
      .matches(/^[0-9]{11}$/, "Must be an 11-digit phone number")
      .required("Phone number required"),
  });

  /** After entering PIN */
  const handleFormSubmit = async (formValues: any, enteredPin: string) => {
    if (!selectedProvider)
      return showToast("Please select an Exam Type", "error");

    if (!enteredPin || enteredPin.length !== 4) {
      showToast("Please enter a valid 4-digit PIN", "error");
      return;
    }

    try {
      const totalAmount = Number(formValues.quantity) * unitPrice;

      const payload = {
        type: selectedProvider?.code?.toLowerCase(),
        amount: totalAmount,
        phone: formValues.phone.trim(),
        userId: user?._id,
        planId: selectedProvider?._id,
        noOfPin: Number(formValues.quantity),
        pinCode: enteredPin,
      };

      console.log(payload);

      setLoading(true);

      const result = await dispatch(purchaseExam({ payload }));

      setLoading(false);

      // --- SUCCESS HANDLER ---
      if (purchaseExam.fulfilled.match(result)) {
        showToast("✅ Exam Pin purchase successful!", "success");
        const { request_id } = result.payload;
        router.push({
          pathname: "/(protected)/history/[id]",
          params: { id: request_id },
        });
      }

      const transactionId = result?.payload?.transactionId;

      if (transactionId) {
        router.push({
          pathname: "/(protected)/history/[id]",
          params: { id: transactionId },
        });
        return;
      }
      showToast(result?.payload || "Exam purchase failed..", "error");
    } catch (error: any) {
      setLoading(false);
      console.log("ERROR PROCESSING PAYMENT:", error);
      showToast(error?.message || "Something went wrong! Try again.", "error");
    } finally {
      setLoading(false);
      setPinVisible(false);
      setPinCode("");
    }
  };

  const banners = [
    require("../../../assets/images/banner1.png"),
    require("../../../assets/images/banner2.png"),
    require("../../../assets/images/banner3.png"),
  ];

  return (
    <ApSafeAreaView>
      <ApHeader title="Exam PIN Purchase" />

      <ApScrollView style={{ backgroundColor: "white" }}>
        <BannerCarousel
          images={banners}
          heightRatio={0.25}
          borderRadius={16}
          autoplayInterval={4000}
        />

        <Formik
          initialValues={{
            quantity: "",
            phone: "",
            type: selectedProvider?.code?.toLowerCase() || defaultProvider.name,
          }}
          validationSchema={validationSchema}
          onSubmit={() => {
            setPinVisible(true);
          }}
        >
          {({ handleChange, handleSubmit, values }) => (
            <View className="p-4">
              {/* Provider Selector */}
              <TouchableOpacity
                className="p-4 border-b border-gray-300 rounded-xl flex-row justify-between items-center mb-4"
                onPress={() => setProviderModal(true)}
              >
                <View className="flex-row items-center gap-3">
                  <Image
                    source={
                      selectedProvider
                        ? examLogos[formatProvider(selectedProvider.code)] ||
                          examLogos.default
                        : defaultProvider.logo
                    }
                    style={{ width: 35, height: 35, borderRadius: 8 }}
                  />

                  <Text className="text-gray-700 font-semibold">
                    {selectedProvider?.name || "Select Exam Type"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Quantity */}
              <ApTextInput
                label="Quantity"
                name="quantity"
                placeholder="Enter number of PINs"
                keyboardType="numeric"
                onChangeText={handleChange("quantity")}
              />

              {/* Phone */}
              <ApTextInput
                label="Phone Number"
                name="phone"
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                onChangeText={handleChange("phone")}
              />

              <ApTextInput
                label="Amount"
                name="amount"
                value={unitPrice.toString()} // controlled override
                editable={false} // disabled input
                placeholder="0"
              />

              {/* Total Amount (auto compute) */}
              <ApTextInput
                label="Amount"
                name="amount"
                valueOverride={String(Number(values.quantity) * unitPrice)}
                disabled={true}
                placeholder="0"
              />

              <ApButton
                title={loading ? "Processing..." : "Buy Exam"}
                onPress={handleSubmit as any}
                disabled={loading}
              />

              {/* Provider Modal */}
              <Modal visible={providerModal} transparent animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/40 px-4">
                  <View className="bg-white w-full rounded-2xl p-5">
                    <Text className="text-xl font-semibold mb-4 text-center">
                      Select Exam Type
                    </Text>

                    <ScrollView>
                      {examServices?.map((item: any) => (
                        <TouchableOpacity
                          key={item._id}
                          className="flex-row items-center p-3 border-b border-gray-200"
                          onPress={() => {
                            setSelectedProvider(item);
                            setProviderModal(false);
                            handleCategorySelect(item.code);
                          }}
                        >
                          <Image
                            source={
                              examLogos[formatProvider(item.code)] ||
                              examLogos.default
                            }
                            style={{ width: 40, height: 40, borderRadius: 50 }}
                          />
                          <Text className="ml-3 text-base font-semibold">
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <TouchableOpacity
                      className="mt-4 p-3 bg-red-500 rounded-lg"
                      onPress={() => setProviderModal(false)}
                    >
                      <Text className="text-white text-center font-semibold">
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <PinModal
                visible={pinVisible}
                loading={loading}
                onClose={() => {
                  if (!loading) setPinVisible(false);
                }}
                onSubmit={(pin) => {
                  setPinCode(pin);
                  handleFormSubmit(values, pin);
                }}
              />
            </View>
          )}
        </Formik>
      </ApScrollView>
    </ApSafeAreaView>
  );
}
