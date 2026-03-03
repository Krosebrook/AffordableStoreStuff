import { useWindowDimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";

const WEB_TOP_INSET = 67;
const WEB_BOTTOM_INSET = 34;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const nativeInsets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  return useMemo(() => {
    const insets = {
      top: isWeb ? WEB_TOP_INSET : nativeInsets.top,
      bottom: isWeb ? WEB_BOTTOM_INSET : nativeInsets.bottom,
      left: nativeInsets.left,
      right: nativeInsets.right,
    };

    const isTablet = width >= 768;
    const isDesktop = width >= 1024;

    const contentMaxWidth = isDesktop ? 600 : isTablet ? 540 : width;
    const contentPadding = isTablet ? 24 : 16;

    const productColumns = isDesktop ? 3 : 2;
    const productCardGap = 12;
    const productCardWidth = (Math.min(contentMaxWidth, width) - contentPadding * 2 - productCardGap * (productColumns - 1)) / productColumns;

    const categoryColumns = isTablet ? 8 : 6;
    const toolColumns = isTablet ? 4 : 2;
    const toolCardWidth = (Math.min(contentMaxWidth, width) - contentPadding * 2 - 12 * (toolColumns - 1)) / toolColumns;

    return {
      width,
      height,
      insets,
      isWeb,
      isTablet,
      isDesktop,
      contentMaxWidth,
      contentPadding,
      productColumns,
      productCardWidth,
      productCardGap,
      categoryColumns,
      toolColumns,
      toolCardWidth,
    };
  }, [width, height, nativeInsets, isWeb]);
}

export function useStableRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function getStableRating(id: number): string {
  const base = 4;
  const decimal = Math.floor(useStableRandom(id) * 5 + 5);
  return `${base}.${decimal}`;
}

export function getStableReviewCount(id: number): number {
  return Math.floor(useStableRandom(id * 7) * 200 + 10);
}

export function getStableDiscount(id: number): boolean {
  return useStableRandom(id * 13) > 0.5;
}
