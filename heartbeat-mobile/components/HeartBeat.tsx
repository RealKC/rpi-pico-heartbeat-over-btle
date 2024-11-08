import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

export function HeartBeat() {
  const MIN = 160;
  const MAX = 175;

  const rotationAnimation = useSharedValue(MAX);

  rotationAnimation.value = withRepeat(
    withSequence(
      withTiming(MAX, { duration: 200 }),
      withTiming(MIN, { duration: 200 }),
      withTiming(MIN, { duration: 200 }),
      withTiming(MAX, { duration: 200 })
    ),
    -1
  );

  const animatedStyle = useAnimatedStyle(() => ({
    fontSize: rotationAnimation.value,
  }));

  return (
    <View style={styles.view}>
      <Animated.Text style={[animatedStyle]}>♥</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    height: 250,
  },
});
