import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

/**
 * react-native-web hands native-driven animations to the Web Animations API,
 * where they can fail to start and leave the view stuck at its initial value.
 * Opacity and transform are cheap enough to drive from JS in the browser.
 */
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * Small motion helpers built on React Native's own Animated API rather than
 * Reanimated. They behave identically in the browser and in Expo Go, which
 * matters because the two are demoed side by side.
 */

type RevealProps = {
  children: React.ReactNode;
  /** Stagger, in ms. List items pass index * 60 or so. */
  delay?: number;
  /** How far the content travels on the way in. */
  offset?: number;
  style?: ViewStyle | ViewStyle[];
};

/** Fades and lifts its children into place once, on mount. */
export function Reveal({ children, delay = 0, offset = 14, style }: RevealProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );
}

type PressableScaleProps = PressableProps & {
  children: React.ReactNode;
  /** How far down the press goes. 1 disables the effect. */
  scaleTo?: number;
  style?: ViewStyle | ViewStyle[];
};

/**
 * Pressable that dips slightly when held. Used instead of an opacity change so
 * the gradient cards keep their colour while being pressed.
 */
export function PressableScale({
  children,
  scaleTo = 0.975,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const spring = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: USE_NATIVE_DRIVER,
      speed: 40,
      bounciness: 4,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        {...rest}
        style={style}
        onPressIn={(event) => {
          spring(scaleTo);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          spring(1);
          onPressOut?.(event);
        }}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
