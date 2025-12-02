import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchUserTransactions } from "@/redux/features/transaction/transactionSlice";
import { Filter, X, Receipt } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import ApHomeHeader from "@/components/headers/homeheader";
import { useRouter } from "expo-router";
import ApScrollView from "@/components/scrollview/scrollview";
import ApSafeAreaView from "@/components/safeAreaView/safeAreaView";
import {
  Phone,
  Wifi,
  Tv,
  Wallet,
  Bolt,
  Smartphone,
  // Receipt,
} from "lucide-react-native";

const iconColors: Record<string, any> = {
  airtime: "#1E90FF", // Blue
  data: "#00C851", // Green
  cable: "#FF8800", // Orange
  electricity: "#FFC107", // Yellow
  wallet: "#6A5ACD", // Purple
  transfer: "#FF4444", // Red
  default: "#444444", // Grey
};

const serviceIcons: Record<string, any> = {
  airtime: Phone,
  data: Wifi,
  cable: Tv,
  electricity: Bolt,
  wallet: Wallet,
  transfer: Receipt,
};

export default function HistoryPage() {
  const dispatch = useDispatch<AppDispatch>();

  const getServiceIcon = (service: any) => {
    const key = (service || "").toLowerCase();

    return {
      Icon: serviceIcons[key] || Smartphone,
      color: iconColors[key] || iconColors.default,
    };
  };

  const router = useRouter();

  const { transactions, loading } = useSelector(
    (state: RootState) => state.transactions
  );

  const [statusFilter, setStatusFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchUserTransactions());
  }, []);

  const getTxnDate = (t: any) =>
    t?.transaction_date ? new Date(t.transaction_date) : new Date(t?.createdAt);

  const withinRange = (d: Date, window: "7days" | "30days" | "") => {
    if (!window) return true;
    const now = Date.now();
    const diffMs = window === "7days" ? 7 : 30;
    const after = new Date(now - diffMs * 24 * 60 * 60 * 1000);
    return d >= after;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "refund":
        return "text-green-700 bg-green-200";
      case "failed":
        return "text-red-700 bg-red-200";
      default:
        return "text-yellow-700 bg-yellow-200";
    }
  };

  const TYPE_TO_SERVICES: Record<string, string[]> = {
    "": [],
    airtime: ["airtime"],
    data: ["data"],
    electricity: ["electricity"],
    cable: ["cable_tv"],
    exam: ["exam_pin"],
    wallet: ["wallet"],
    other: ["other"],
  };

  const activeFiltersCount =
    (statusFilter ? 1 : 0) +
    (productFilter ? 1 : 0) +
    (dateFilter ? 1 : 0) +
    (transactionTypeFilter ? 1 : 0);

  const reversedTransactions = useMemo(
    () => (transactions || []).slice().reverse(),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    return reversedTransactions.filter((trans: any) => {
      const statusMatch =
        !statusFilter ||
        trans?.status?.toLowerCase() === statusFilter.toLowerCase();

      const haystack =
        [
          trans?.network,
          trans?.service,
          trans?.note,
          trans?.reference_no,
          trans?.mobile_no,
          trans?.company,
          trans?.package,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase() || "";

      const productMatch =
        !productFilter || haystack.includes(productFilter.toLowerCase());

      const dt = getTxnDate(trans);
      const dateMatch = withinRange(dt, dateFilter as any);

      const service = (trans?.service || "").toLowerCase();
      let typeMatch = true;

      if (transactionTypeFilter && transactionTypeFilter !== "other") {
        const allowed = TYPE_TO_SERVICES[transactionTypeFilter] || [];
        typeMatch = allowed.includes(service);
      } else if (transactionTypeFilter === "other") {
        const known = [
          "airtime",
          "data",
          "electricity",
          "cable_tv",
          "exam_pin",
          "wallet",
        ];
        typeMatch = !known.includes(service);
      }

      return statusMatch && productMatch && dateMatch && typeMatch;
    });
  }, [
    reversedTransactions,
    statusFilter,
    productFilter,
    dateFilter,
    transactionTypeFilter,
  ]);

  return (
    <ApSafeAreaView>
      <View className="pt-4">
        <ApHomeHeader />
      </View>

      {/* Search and Filter Bar */}
      <View className=" px-2 py-3 bg-white flex-row items-center gap-2 border-b border-gray-200">
        <TextInput
          placeholder="Search (service, ref, note...)"
          value={productFilter}
          onChangeText={setProductFilter}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />

        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className="flex-row items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg"
        >
          <Filter size={18} color="#555" />
          <Text className="text-sm text-gray-700">
            Filters {activeFiltersCount ? `• ${activeFiltersCount}` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row justify-between mb-2">
            <Text className="font-semibold text-gray-700">Filter</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={20} color="gray" />
            </TouchableOpacity>
          </View>

          {/* Status pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["", "success", "failed", "pending"].map((st) => (
              <TouchableOpacity
                key={st || "all"}
                onPress={() => setStatusFilter(st)}
                className={`px-4 py-1 rounded-full mr-2 ${
                  statusFilter === st ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-sm ${
                    statusFilter === st ? "text-white" : "text-gray-700"
                  }`}
                >
                  {st ? st[0].toUpperCase() + st.slice(1) : "All"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Date range */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            {[
              { label: "All Dates", value: "" },
              { label: "Last 7 Days", value: "7days" },
              { label: "Last 30 Days", value: "30days" },
            ].map((d) => (
              <TouchableOpacity
                key={d.value || "alldates"}
                onPress={() => setDateFilter(d.value)}
                className={`px-4 py-1 rounded-full mr-2 ${
                  dateFilter === d.value ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-sm ${
                    dateFilter === d.value ? "text-white" : "text-gray-700"
                  }`}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Transaction type */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            {[
              { label: "All", value: "" },
              { label: "Airtime", value: "airtime" },
              { label: "Data", value: "data" },
              { label: "Electricity", value: "electricity" },
              { label: "Cable TV", value: "cable" },
              { label: "Exam", value: "exam" },
              { label: "Wallet", value: "wallet" },
              { label: "Other", value: "other" },
            ].map((t) => (
              <TouchableOpacity
                key={t.value}
                onPress={() => setTransactionTypeFilter(t.value)}
                className={`px-4 py-1 rounded-full mr-2 ${
                  transactionTypeFilter === t.value
                    ? "bg-blue-500"
                    : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-sm ${
                    transactionTypeFilter === t.value
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Clear All */}
          {(statusFilter ||
            productFilter ||
            dateFilter ||
            transactionTypeFilter) && (
            <TouchableOpacity
              onPress={() => {
                setStatusFilter("");
                setProductFilter("");
                setDateFilter("");
                setTransactionTypeFilter("");
              }}
              className="mt-3"
            >
              <Text className="text-sm text-red-600">Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Transaction List */}
      <ApScrollView>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((trans: any) => (
            <TouchableOpacity
              key={trans?._id}
              onPress={() =>
                router.push({
                  pathname: "/(protected)/history/[id]",
                  params: { id: trans?._id },
                } as never)
              }
              className="bg-white p-4 mb-3 rounded-xl border border-gray-100 shadow-sm"
            >
              {/* Top Row */}
              <View className="flex-row items-center justify-between mb-3">
                {/* Service + Icon */}
                <View className="flex-row items-center gap-4">
                  {(() => {
                    const { Icon, color } = getServiceIcon(trans?.service);
                    return (
                      <View
                        className="rounded-full p-2"
                        style={{ backgroundColor: color, borderRadius: 50 }}
                      >
                        <Icon size={22} color="white" strokeWidth={2} />
                      </View>
                    );
                  })()}

                  <Text className="text-md text-gray-600 font-semibold capitalize">
                    {trans?.service || "Transaction"}
                  </Text>
                </View>

                {/* Status */}
                <View className="flex-row items-center gap-2">
                  <Text
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      trans.status
                    )}`}
                  >
                    {trans.status}
                  </Text>

                  {trans.status === "failed" && (
                    <Text
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        "success"
                      )}`}
                    >
                      refunded
                    </Text>
                  )}
                </View>
              </View>

              {/* Amount */}
              <Text className="text-[1.5rem] font-bold text-gray-900 ">
                ₦{Number(trans?.amount || 0).toLocaleString()}
              </Text>

              {/* Details */}

              {/* Balance Row */}
              <View className="flex-row justify-between mt-3">
                <Text className="text-gray-700 text-md">
                  <Text className="font-semibold text-md">Prev: </Text>₦
                  {Number(trans?.previous_balance || 0).toLocaleString()}
                </Text>

                <Text className="text-gray-700 text-md">
                  <Text className="font-semibold text-md">New: </Text>₦
                  {Number(trans?.new_balance || 0).toLocaleString()}
                </Text>
              </View>

              {/* Date */}
              <Text className="text-gray-500 text-[11px] mt-3">
                {getTxnDate(trans).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center py-10">
            <Receipt size={50} color="#bbb" />
            <Text className="text-gray-400 mt-3">No Transactions Found</Text>
          </View>
        )}
      </ApScrollView>
    </ApSafeAreaView>
  );
}
