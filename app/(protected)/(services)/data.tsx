import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import ApHeader from "@/components/headers/header";
import ApSafeAreaView from "@/components/safeAreaView/safeAreaView";
import ApScrollView from "@/components/scrollview/scrollview";
import BannerCarousel from "@/components/carousel/banner";
import NetworkPhonePicker from "@/components/network/networkPicker";
import PinModal from "@/components/modals/pinModal";

import { useToast } from "@/components/toast/toastProvider";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";

import {
  getDataServices,
  fetchDataCategories,
  purchaseData,
  fetchDataPlans,
} from "@/redux/features/easyAccess/service";

import { RootState, AppDispatch } from "@/redux/store";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

// Network List
const networks = [
  { name: "MTN", logo: require("../../../assets/images/mtn.png") },
  { name: "Airtel", logo: require("../../../assets/images/airtel.png") },
  { name: "GLO", logo: require("../../../assets/images/glo.jpg") },
  { name: "9mobile", logo: require("../../../assets/images/9mobile.jpeg") },
];

// Banner Images
const banners = [
  require("../../../assets/images/banner1.png"),
  require("../../../assets/images/banner2.png"),
  require("../../../assets/images/banner3.png"),
];

export default function DataPlanScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();

  const [phone, setPhone] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);

  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("");

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [pinVisible, setPinVisible] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataPlans, setDataPlans] = useState({});

  const { user } = useSelector((state: RootState) => state.auth);
  const { plans, dataServices } = useSelector(
    (state: RootState) => state.easyAccessdataPlans
  );

  // LOAD DATA SERVICES
  useFocusEffect(
    useCallback(() => {
      dispatch(getDataServices("data") as any);
    }, [dispatch])
  );

  useEffect(() => {
    if (dataServices.length) {
      // Default network: MTN
      const defaultNetwork =
        dataServices.find((s: any) => s.name.toLowerCase() === "mtn") ||
        dataServices[0]; // fallback to first if MTN not found

      setSelectedNetwork({
        name: defaultNetwork.name,
        logo: defaultNetwork.image || require("../../../assets/images/mtn.png"),
      });

      // Fetch categories for default network
      (async () => {
        const result = await dispatch(
          fetchDataCategories({
            network: defaultNetwork.name.split(" ")[0],
            serviceType: "data",
          })
        );

        if (fetchDataCategories.fulfilled.match(result)) {
          const cats = result.payload || [];
          setCategories(cats);
          const firstCategory = cats[0] || "";
          setActiveTab(firstCategory);

          // Fetch plans for default category
          if (firstCategory) {
            handleDataPlan(firstCategory);
          }
        } else {
          showToast(result.payload || "Failed to fetch categories", "error");
        }
      })();
    }
  }, [dataServices]);

  const handleDataPlan = async (category: string) => {
    try {
      const result = await dispatch(
        fetchDataPlans({
          network: selectedNetwork.name.split(" ")[0],
          category,
        })
      );

      console.log(selectedNetwork.name, category, "data type!");

      if (fetchDataPlans.fulfilled.match(result)) {
        setDataPlans(result.payload as any);
      } else {
        showToast(result.payload || "Failed to fetch plans", "error");
      }
    } catch {
      showToast("Unexpected error while fetching plans", "error");
    }
  };
  // When user selects a network
  const handleNetworkSelect = async (net: (typeof networks)[0]) => {
    setSelectedNetwork(net);
    const result = await dispatch(
      fetchDataCategories({
        network: net.name.split(" ")[0],
        serviceType: "data",
      })
    );

    if (fetchDataCategories.fulfilled.match(result)) {
      const cats = result.payload || [];
      setCategories(cats);
      setActiveTab(cats[0] || "");
      handleDataPlan(activeTab);
    }
  };

  // Submit Purchase
  const handleFormSubmit = async (pinCode: string) => {
    const payload = {
      networkId: selectedNetwork.name.split(" ")[0].toLowerCase(),
      userId: user?._id,
      dataType: selectedPlan.category,
      planId: selectedPlan._id,
      phone,
      amount: selectedPlan.ourPrice,
      pinCode: pinCode,
    };

    try {
      setLoading(true);
      const resultAction = await dispatch(purchaseData(payload as any));
      if (purchaseData.fulfilled.match(resultAction)) {
        showToast("Data purchase successful!", "success");

        router.push({
          pathname: "/(protected)/history/[id]",
          params: { id: resultAction.payload.transactionId },
        });
      } else {
        const transactionId = resultAction.payload?.transactionId;
        if (transactionId) {
          router.push({
            pathname: "/(protected)/history/[id]",
            params: { id: transactionId },
          });
        } else {
          showToast(resultAction.payload?.error || "Purchase failed", "error");
        }
      }
    } finally {
      setLoading(false);
      setPinVisible(false);
      setPinCode("");
    }
  };

  return (
    <ApSafeAreaView>
      <ApScrollView style={{ backgroundColor: "white" }}>
        <ApHeader title="Data Plans" />

        <BannerCarousel
          images={banners}
          heightRatio={0.25}
          borderRadius={16}
          autoplayInterval={4000}
        />

        {/* Network Picker */}
        <NetworkPhonePicker
          selectedNetwork={selectedNetwork as any}
          setSelectedNetwork={(net) => handleNetworkSelect(net as any)}
          phone={phone}
          setPhone={setPhone}
          networks={dataServices.map((s: any) => ({
            name: s.name,
            image: s.image || require("../../../assets/images/mtn.png"),
          }))}
        />

        {/* Category Tabs */}
        <View className="px-4 mt-6">
          <Text className="text-gray-800 text-lg font-semibold mb-3">
            Data Plans
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setActiveTab(cat);
                  handleDataPlan(activeTab);
                }}
                className="mr-6 pb-2"
              >
                <Text
                  className={`text-base ${
                    activeTab === cat
                      ? "text-green-600 font-bold"
                      : "text-gray-500"
                  }`}
                >
                  {cat}
                </Text>
                {activeTab === cat && (
                  <View className="h-1 bg-green-600 mt-1 rounded-full" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Plans */}
        <View className="px-4 mt-4 flex-row flex-wrap justify-between">
          {plans.map((p, i) => (
            <TouchableOpacity
              key={i}
              className="w-[32%] bg-gray-100 border border-gray-200 rounded-xl p-4 mb-4"
              onPress={() => {
                setSelectedPlan(p);
                setPinVisible(true);
              }}
            >
              <Text className="text-[20px] font-semibold text-center">
                {p.name.match(/\d+(GB|MB)/i)?.[0]}
              </Text>

              <Text className="text-gray-600 text-sm mt-1 text-center bg-green-100 px-2 py-1 rounded-full">
                {p.validity}
              </Text>

              <Text className="text-green-600 font-semibold mt-1 text-center text-lg">
                ₦{p.ourPrice}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PIN MODAL */}
        <PinModal
          visible={pinVisible}
          onClose={() => setPinVisible(false)}
          loading={loading}
          onSubmit={(pin) => {
            setPinCode(pin);
            handleFormSubmit(pin);
          }}
        />
      </ApScrollView>
    </ApSafeAreaView>
  );
}
