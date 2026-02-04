import React, { memo } from "react";
import { View, Text } from "react-native";
import Svg, { Polyline, Circle, Line, Text as SvgText } from "react-native-svg";
import { AccuracyOverTimePointDTO } from "@/api/DTO/accuracyOverTimePoint.dto";
import { useAccuracyTimeline } from "@/hooks/models/useAccuracyTimeline";
import { Colors, BorderRadius } from "@/constants/theme";

interface AccuracyTimelineProps {
  data: AccuracyOverTimePointDTO[];
}

const AccuracyTimeline = memo(function AccuracyTimeline({
  data,
}: AccuracyTimelineProps) {
  const {
    chartWidth,
    chartHeight,
    padding,
    isTruncated,
    points,
    dataPoints,
    gridLines,
    dateRange,
    handleLayout,
    maxDaysDisplayed,
  } = useAccuracyTimeline({ data });

  return (
    <View className="gap-2">
      {isTruncated && (
        <View
          className="rounded-md p-2"
          style={{
            backgroundColor: Colors.infoLight,
            borderWidth: 1,
            borderColor: Colors.info,
          }}
        >
          <Text className="text-xs text-center" style={{ color: Colors.info }}>
            Affichage des {maxDaysDisplayed} derniers jours
          </Text>
        </View>
      )}
      <View
        className="overflow-hidden"
        style={{
          backgroundColor: Colors.cardBackground,
          borderWidth: 1,
          borderColor: Colors.border,
          borderRadius: BorderRadius.lg,
        }}
        onLayout={handleLayout}
      >
        <View className="px-4 pt-4">
          <Text className="text-xs" style={{ color: Colors.textSecondary }}>
            Précision (%)
          </Text>
        </View>
        <View className="px-2 pb-4">
          <Svg width={chartWidth} height={chartHeight}>
            {/* Y-axis gridlines and labels */}
            {chartWidth > 0 &&
              gridLines.map((line) => (
                <React.Fragment key={`grid-${line.value}`}>
                  <Line
                    x1={line.x1}
                    y1={line.y}
                    x2={line.x2}
                    y2={line.y}
                    stroke={Colors.borderLight}
                    strokeWidth={1}
                  />
                  <SvgText
                    x={padding - 6}
                    y={line.y + 4}
                    fontSize={10}
                    fill={Colors.textMuted}
                    textAnchor="end"
                  >
                    {line.label}
                  </SvgText>
                </React.Fragment>
              ))}
            <Line
              x1={padding}
              y1={chartHeight - padding}
              x2={chartWidth - padding}
              y2={chartHeight - padding}
              stroke={Colors.border}
              strokeWidth={1}
            />
            <Line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={chartHeight - padding}
              stroke={Colors.border}
              strokeWidth={1}
            />
            {points && (
              <Polyline
                points={points}
                stroke={Colors.info}
                strokeWidth={2}
                fill="none"
              />
            )}
            {chartWidth > 0 &&
              dataPoints.map((point) => (
                <Circle
                  key={point.key}
                  cx={point.x}
                  cy={point.y}
                  r={3}
                  fill={Colors.info}
                />
              ))}
          </Svg>
        </View>
        <View className="flex-row justify-between px-4 pb-3">
          <Text className="text-xs" style={{ color: Colors.textSecondary }}>
            {dateRange.start}
          </Text>
          <Text className="text-xs" style={{ color: Colors.textSecondary }}>
            {dateRange.end}
          </Text>
        </View>
      </View>
    </View>
  );
});

export default AccuracyTimeline;
