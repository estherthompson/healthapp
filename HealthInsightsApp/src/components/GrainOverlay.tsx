import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const GRAIN_COUNT = 320;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function seedRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function GrainOverlay() {
  const dots = useMemo(() => {
    return Array.from({ length: GRAIN_COUNT }, (_, i) => {
      const x = seedRandom(i * 1.1) * (SCREEN_WIDTH + 20) - 10;
      const y = seedRandom(i * 1.3 + 7) * (SCREEN_HEIGHT + 20) - 10;
      const size = 1 + Math.floor(seedRandom(i * 1.7) * 2);
      const opacity = 0.14 + seedRandom(i * 1.9) * 0.2;
      return { x, y, size, opacity };
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {dots.map((dot, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              opacity: dot.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  dot: {
    position: 'absolute',
    backgroundColor: '#000',
  },
});

const SEED = (i: number, j: number) => Math.sin(i * 1.1 + j * 1.3) * 10000 - Math.floor(Math.sin(i * 1.1 + j * 1.3) * 10000);

export function GrainStrip({ width, height, dotCount = 55 }: { width: number; height: number; dotCount?: number }) {
  const dots = useMemo(() => {
    return Array.from({ length: dotCount }, (_, i) => {
      const x = SEED(i, 0) * (width + 10) - 5;
      const y = SEED(i, 1) * (height + 10) - 5;
      const size = 1 + Math.floor(SEED(i, 2) * 2);
      const opacity = 0.12 + SEED(i, 3) * 0.22;
      return { x, y, size, opacity };
    });
  }, [width, height, dotCount]);

  return (
    <View style={[StyleSheet.absoluteFillObject, { width, height }]} pointerEvents="none">
      {dots.map((dot, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              opacity: dot.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}
