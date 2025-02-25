import React, { useState, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from "react-native";
import Colors from "@/constants/Colors";

interface CarouselProps {
  children: React.ReactNode[];
  style?: ViewStyle;
  onPageChange?: (index: number) => void;
}

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.8;
const SPACING = 10;

const Carousel: React.FC<CarouselProps> = ({
  children,
  style,
  onPageChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (ITEM_WIDTH + SPACING));
    if (index !== activeIndex) {
      setActiveIndex(index);
      onPageChange && onPageChange(index);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        snapToInterval={ITEM_WIDTH + SPACING}
        snapToAlignment="center"
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
      >
        {children.map((child, index) => (
          <View
            key={index}
            style={[
              styles.itemContainer,
              {
                width: ITEM_WIDTH,
                marginRight: index === children.length - 1 ? 0 : SPACING,
              },
            ]}
          >
            {child}
          </View>
        ))}
      </ScrollView>
      <View style={styles.indicatorContainer}>
        {children.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === activeIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  contentContainer: {
    paddingHorizontal: (width - ITEM_WIDTH) / 2,
    paddingVertical: 10,
  },
  itemContainer: {
    height: "100%",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray.light,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.brandBlue[0],
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default Carousel;
