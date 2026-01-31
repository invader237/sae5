import { useMemo, useState, useCallback } from "react";
import { AccuracyOverTimePointDTO } from "@/api/DTO/accuracyOverTimePoint.dto";

const MAX_DAYS_DISPLAYED = 30;

interface UseAccuracyTimelineParams {
  data: AccuracyOverTimePointDTO[];
}

export function useAccuracyTimeline({ data }: UseAccuracyTimelineParams) {
  const [chartWidth, setChartWidth] = useState(0);
  const chartHeight = 160;
  const padding = 24;

  // Limit to last 30 days if too many entries
  const displayedData = useMemo(() => {
    return data.length > MAX_DAYS_DISPLAYED
      ? data.slice(-MAX_DAYS_DISPLAYED)
      : data;
  }, [data]);

  const isTruncated = data.length > MAX_DAYS_DISPLAYED;

  const points = useMemo(() => {
    if (!chartWidth || displayedData.length === 0) return "";
    const count = displayedData.length;
    const stepX = count > 1 ? (chartWidth - padding * 2) / (count - 1) : 0;
    return displayedData
      .map((point, idx) => {
        const x = padding + idx * stepX;
        const y = padding + (1 - point.accuracy) * (chartHeight - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");
  }, [chartWidth, displayedData, padding, chartHeight]);

  const dataPoints = useMemo(() => {
    if (!chartWidth || displayedData.length === 0) return [];
    const count = displayedData.length;
    const stepX = count > 1 ? (chartWidth - padding * 2) / (count - 1) : 0;
    return displayedData.map((point, idx) => ({
      key: point.bucket,
      x: padding + idx * stepX,
      y: padding + (1 - point.accuracy) * (chartHeight - padding * 2),
    }));
  }, [chartWidth, displayedData, padding, chartHeight]);

  const gridLines = useMemo(() => {
    if (!chartWidth) return [];
    return [1, 0.5, 0].map((v) => ({
      value: v,
      y: padding + (1 - v) * (chartHeight - padding * 2),
      x1: padding,
      x2: chartWidth - padding,
      label: Math.round(v * 100).toString(),
    }));
  }, [chartWidth, padding, chartHeight]);

  const dateRange = useMemo(() => {
    if (displayedData.length === 0) return { start: "", end: "" };
    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      });
    return {
      start: formatDate(displayedData[0].bucket),
      end: formatDate(displayedData[displayedData.length - 1].bucket),
    };
  }, [displayedData]);

  const handleLayout = useCallback(
    (event: { nativeEvent: { layout: { width: number } } }) => {
      setChartWidth(event.nativeEvent.layout.width);
    },
    []
  );

  return {
    chartWidth,
    chartHeight,
    padding,
    displayedData,
    isTruncated,
    points,
    dataPoints,
    gridLines,
    dateRange,
    handleLayout,
    maxDaysDisplayed: MAX_DAYS_DISPLAYED,
  };
}
