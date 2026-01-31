import React, { memo } from "react";
import { View, Text, ScrollView } from "react-native";
import { ConfusionMatrixCellDTO } from "@/api/DTO/confusionMatrixCell.dto";
import RoomLightDTO from "@/api/DTO/roomLight.dto";
import { useConfusionMatrix, getCellBackgroundColor } from "@/hooks/models/useConfusionMatrix";

interface ConfusionMatrixTableProps {
  matrix: ConfusionMatrixCellDTO[];
  rooms: RoomLightDTO[];
}

const ConfusionMatrixTable = memo(function ConfusionMatrixTable({
  matrix,
  rooms,
}: ConfusionMatrixTableProps) {
  const {
    roomMap,
    displayedRoomIds,
    isTruncated,
    lookup,
    maxCount,
    totalRooms,
    maxRoomsDisplayed,
  } = useConfusionMatrix({ matrix, rooms });

  return (
    <View className="gap-2">
      {isTruncated && (
        <View className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
          <Text className="text-xs text-yellow-700 text-center">
            Affichage limité aux {maxRoomsDisplayed} premières salles (
            {totalRooms} au total)
          </Text>
        </View>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View className="items-center">
          {/* Header row */}
          <View className="flex-row">
            <View className="w-20 h-10 border border-gray-300 bg-gray-100 justify-center items-center">
              <Text className="text-xs">Réel ↓</Text>
            </View>
            {displayedRoomIds.map((rid) => (
              <View
                key={rid}
                className="w-16 h-10 border border-gray-300 bg-gray-100 justify-center items-center"
              >
                <Text className="text-xs text-center" numberOfLines={1}>
                  {roomMap.get(rid) ?? rid.slice(0, 4)}
                </Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {displayedRoomIds.map((actualId) => (
            <View key={actualId} className="flex-row">
              <View className="w-20 h-12 border border-gray-300 bg-gray-100 justify-center px-1">
                <Text className="text-xs" numberOfLines={2}>
                  {roomMap.get(actualId) ?? actualId.slice(0, 6)}
                </Text>
              </View>
              {displayedRoomIds.map((predictedId) => {
                const count = lookup.get(actualId)?.get(predictedId) ?? 0;
                const bgColor = getCellBackgroundColor(
                  actualId,
                  predictedId,
                  count,
                  maxCount
                );

                return (
                  <View
                    key={predictedId}
                    className="w-16 h-12 border border-gray-300 justify-center items-center"
                    style={{ backgroundColor: bgColor }}
                  >
                    <Text className="text-sm font-semibold">{count}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      <View className="flex-row items-center gap-4 mt-2">
        <View className="flex-row items-center gap-1">
          <View className="w-4 h-4 bg-green-400 rounded" />
          <Text className="text-xs text-gray-600">Correct</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-4 h-4 bg-red-400 rounded" />
          <Text className="text-xs text-gray-600">Erreur</Text>
        </View>
      </View>
    </View>
  );
});

export default ConfusionMatrixTable;
