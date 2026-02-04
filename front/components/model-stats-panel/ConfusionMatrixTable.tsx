import React, { memo } from "react";
import { View, Text, ScrollView } from "react-native";
import { ConfusionMatrixCellDTO } from "@/api/DTO/confusionMatrixCell.dto";
import RoomLightDTO from "@/api/DTO/roomLight.dto";
import { useConfusionMatrix, getCellBackgroundColor } from "@/hooks/models/useConfusionMatrix";
import { Colors, BorderRadius } from "@/constants/theme";

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
        <View
          className="rounded-md p-2"
          style={{
            backgroundColor: Colors.warningLight,
            borderWidth: 1,
            borderColor: Colors.warning,
          }}
        >
          <Text className="text-xs text-center" style={{ color: Colors.warning }}>
            Affichage limité aux {maxRoomsDisplayed} premières salles (
            {totalRooms} au total)
          </Text>
        </View>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View className="items-center">
          {/* Header row */}
          <View className="flex-row">
            <View
              className="w-20 h-10 justify-center items-center"
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                backgroundColor: Colors.inputBackground,
              }}
            >
              <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                Réel ↓
              </Text>
            </View>
            {displayedRoomIds.map((rid) => (
              <View
                key={rid}
                className="w-16 h-10 justify-center items-center"
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border,
                  backgroundColor: Colors.inputBackground,
                }}
              >
                <Text
                  className="text-xs text-center"
                  style={{ color: Colors.textSecondary }}
                  numberOfLines={1}
                >
                  {roomMap.get(rid) ?? rid.slice(0, 4)}
                </Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {displayedRoomIds.map((actualId) => (
            <View key={actualId} className="flex-row">
              <View
                className="w-20 h-12 justify-center px-1"
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border,
                  backgroundColor: Colors.inputBackground,
                }}
              >
                <Text className="text-xs" style={{ color: Colors.textSecondary }} numberOfLines={2}>
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
                    className="w-16 h-12 justify-center items-center"
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.border,
                      backgroundColor: bgColor,
                    }}
                  >
                    <Text className="text-sm font-semibold" style={{ color: Colors.text }}>
                      {count}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      <View className="flex-row items-center gap-4 mt-2">
        <View className="flex-row items-center gap-1">
          <View
            className="w-4 h-4 rounded"
            style={{ backgroundColor: Colors.success, borderRadius: BorderRadius.sm }}
          />
          <Text className="text-xs" style={{ color: Colors.textSecondary }}>
            Correct
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View
            className="w-4 h-4 rounded"
            style={{ backgroundColor: Colors.danger, borderRadius: BorderRadius.sm }}
          />
          <Text className="text-xs" style={{ color: Colors.textSecondary }}>
            Erreur
          </Text>
        </View>
      </View>
    </View>
  );
});

export default ConfusionMatrixTable;
