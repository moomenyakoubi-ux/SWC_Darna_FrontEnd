import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../styles/theme';

const GRADIENT_COLORS = ['#0066CC', '#00CCFF'];

export const GradientButton = ({ onPress, children, style, textStyle, disabled }) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}>
    <LinearGradient
      colors={GRADIENT_COLORS}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.button, style]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </LinearGradient>
  </TouchableOpacity>
);

export const GradientBubble = ({ children, style }) => (
  <LinearGradient
    colors={GRADIENT_COLORS}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.bubble, style]}
  >
    {children}
  </LinearGradient>
);

export const GradientPill = ({ onPress, children, style }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
    <LinearGradient
      colors={GRADIENT_COLORS}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.pill, style]}
    >
      {children}
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bubble: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    maxWidth: '80%',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
  },
});

export default GradientButton;
