import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AURORA_BLOBS } from '../constants/auroraGradient';

const BASE_COLOR = '#fffef7';

type AuroraBlobBackgroundProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Aurora background made from soft color blobs (layered gradients)
 * instead of a single linear band.
 */
export function AuroraBlobBackground({ children, style }: AuroraBlobBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[BASE_COLOR, '#fefce8', BASE_COLOR]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {AURORA_BLOBS.map((blob, i) => (
        <LinearGradient
          key={i}
          colors={blob.colors}
          locations={blob.locations}
          start={blob.start}
          end={blob.end}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
