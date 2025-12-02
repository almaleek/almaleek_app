import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import AppSafeAreaView from "@/components/safeAreaView/safeAreaView";
import WalletCard from "@/components/wallet/walletCard";
import ApHomeHeader from "@/components/headers/homeheader";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchUserTransactions } from "@/redux/features/transaction/transactionSlice";
import { currentUser } from "@/redux/features/user/userThunk";
import {
  Send,
  Download,
  Phone,
  Wifi,
  Bolt,
  GraduationCap,
  Tv2,
  Receipt,
} from "lucide-react-native";

import { useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import { Clock } from "lucide-react-native";
import { XCircle } from "lucide-react-native";
import AppScrollView from "@/components/scrollview/scrollview";
import ApSafeAreaView from "@/components/safeAreaView/safeAreaView";
const actions = [
  {
    id: 1,
    icon: <Send size={24} color="#3b82f6" />,
    label: "Tranfer",
    link: "(protected)/(services)/transfer",
  },

  {
    id: 2,
    icon: <Phone size={24} color="#3b82f6" />,
    label: "Airtime",
    link: "(protected)/(services)/airtime",
  },
  {
    id: 3,
    icon: <Wifi size={24} color="#10b981" />,
    label: "Data",
    link: "(protected)/(services)/data",
  },
  {
    id: 4,
    icon: <Bolt size={24} color="#facc15" />,
    label: "Electricity",
    link: "(protected)/(services)/electricity",
  },
  {
    id: 5,
    icon: <GraduationCap size={24} color="#3b82f6" />,
    label: "Exam",
    link: "(protected)/(services)/exam",
  },
  {
    id: 6,
    icon: <Tv2 size={24} color="#ef4444" />,
    label: "TV",
    link: "(protected)/(services)/cable",
  },
];

const QuickActionButton = ({ icon, label, link }: any) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(link as never)}
      className="bg-green-50 p-4 rounded-lg shadow-md items-center justify-center mb-3 w-[29%]"
    >
      {icon}
      <Text className="mt-2 text-sm text-gray-700 font-medium text-center">
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function RewardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.auth);
  const { transactions, loading } = useSelector(
    (state: RootState) => state.transactions
  );

  const [showBalance, setShowBalance] = React.useState(true);
  const toggleBalance = () => setShowBalance(!showBalance);

  useEffect(() => {
    dispatch(currentUser());
    dispatch(fetchUserTransactions());
  }, [dispatch]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return <CheckCircle className="text-green-500 w-5 h-5" />;
      case "failed":
        return <XCircle className="text-red-500 w-5 h-5" />;
      default:
        return <Clock className="text-yellow-500 w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "text-green-500 bg-green-100";
      case "failed":
        return "text-red-500 bg-red-100";
      default:
        return "text-yellow-500 bg-yellow-100";
    }
  };
  return (
    <ApSafeAreaView>
      <AppScrollView style={{ backgroundColor: "white" }}>
        <ApHomeHeader />
        <WalletCard
          user={user}
          showBalance={showBalance}
          toggleBalance={toggleBalance}
        />

        {/* Quick Actions */}
        <View className="flex-row flex-wrap justify-between mt-6 mb-6">
          {actions.map((action) => (
            <QuickActionButton
              key={action.id}
              icon={action.icon}
              label={action.label}
              link={action.link}
            />
          ))}
        </View>

        {/* Recent Transactions */}
        <View className="bg-white shadow-md rounded-lg p-6 mb-10">
          <Text className="text-lg font-semibold text-gray-700 mb-4">
            Transactions
          </Text>

          {loading ? (
            <View className="flex justify-center items-center py-4">
              <ActivityIndicator size="small" color="#6b7280" />
            </View>
          ) : transactions?.length > 0 ? (
            <>
              <View className="space-y-4 ">
                {transactions
                  .slice(-2)
                  .reverse()
                  .map((tx: any, index: number) => (
                    <View
                      key={index}
                      className="flex-row justify-between items-center  "
                    >
                      {/* Left side: Icon + Details */}
                      <View className="flex flex-row items-center gap-2">
                        <View className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Text
                            className={`textt-lg font-bold ${getStatusColor(
                              tx.status
                            )}`}
                          >
                            {getStatusIcon(tx.status)}
                          </Text>
                        </View>
                        <View className="mb-4">
                          <Text className=" ">{tx.product_name}</Text>
                          <Text className="font-bold text-lg">
                            {tx.service.charAt(0).toUpperCase() +
                              tx.service.slice(1).toLowerCase()}
                          </Text>
                          <Text className="text-md text-gray-400">
                            {new Date(tx.transaction_date).toLocaleString()}
                          </Text>
                        </View>
                      </View>

                      {/* Right side: Amount + Status */}
                      <View className="items-end ml-4">
                        <Text className="font-bold text-[1.3rem] text-gray-800">
                          ₦{tx.amount}
                        </Text>
                        <Text
                          className={`mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            tx.status
                          )}`}
                        >
                          {tx.status.charAt(0).toUpperCase() +
                            tx.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(protected)/(tabs)/history")}
              >
                <Text className="text-md text-white mt-1 text-center bg-green-600 p-2 rounded-full flex">
                  See all
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="text-center py-4">
              <View className="w-16 h-10 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                <Receipt width={32} height={32} color="#9ca3af" />
              </View>
              <Text className="text-gray-400 text-sm">
                No Transactions Found
              </Text>
              <Text className="text-gray-400/70 text-xs mt-1">
                Your transaction history will appear here
              </Text>
            </View>
          )}
        </View>
      </AppScrollView>
    </ApSafeAreaView>
  );
}
