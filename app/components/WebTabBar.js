import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import { useAppTheme } from '../context/ThemeContext';

const COLLAPSED_TAB_BAR_WIDTH = 88;
const EXPANDED_TAB_BAR_WIDTH = 244;
const ANIMATION_DURATION = 220;

export const WEB_TAB_BAR_WIDTH = COLLAPSED_TAB_BAR_WIDTH;

// Estrae il nome della route attiva dallo stato di navigazione
const getActiveRouteName = (state) => {
  if (!state) return null;
  
  const route = state.routes[state.index];
  if (!route) return null;
  
  // Se la route ha uno stato annidato, naviga ricorsivamente
  if (route.state) {
    return getActiveRouteName(route.state);
  }
  
  return route.name;
};

// Verifica se una route è visibile nella tab bar (non nascosta)
const isRouteVisible = (route, descriptors) => {
  const descriptor = descriptors[route.key];
  if (!descriptor) return true;
  
  const options = descriptor.options;
  const isHidden =
    options?.tabBarStyle?.display === 'none' ||
    options?.tabBarItemStyle?.display === 'none';
  
  return !isHidden;
};

const WebTabBar = ({ state, descriptors, navigation }) => {
  if (Platform.OS !== 'web') return null;

  const { theme: appTheme } = useAppTheme();
  const styles = useMemo(() => createStyles(appTheme), [appTheme]);
  const [isExpanded, setIsExpanded] = useState(false);
  const widthAnim = useRef(new Animated.Value(COLLAPSED_TAB_BAR_WIDTH)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  
  // Ottieni lo stato di navigazione completo
  const rootState = useNavigationState((s) => s);
  
  // Calcola la route attiva reale (quella foglia)
  const actualActiveRouteName = getActiveRouteName(rootState);
  
  // Calcola la route attiva del tab navigator
  const tabActiveRoute = state.routes[state.index];
  const tabActiveRouteName = tabActiveRoute?.name;
  
  // Determina quale tab deve apparire come "selected"
  // Se la route attiva è visibile nella tab bar, usala
  // Altrimenti usa la route attiva del tab navigator
  let selectedTabName = tabActiveRouteName;
  
  if (actualActiveRouteName) {
    // Cerca se la route attuale è una delle tab visibili
    const isCurrentRouteVisibleTab = state.routes.some((route) => {
      return route.name === actualActiveRouteName && isRouteVisible(route, descriptors);
    });
    
    if (isCurrentRouteVisibleTab) {
      selectedTabName = actualActiveRouteName;
    }
    // Se la route attuale NON è una tab visibile, selectedTabName rimane tabActiveRouteName
    // Ma in realtà vogliamo che NESSUNA tab sia selezionata in quel caso
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: isExpanded ? EXPANDED_TAB_BAR_WIDTH : COLLAPSED_TAB_BAR_WIDTH,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(labelOpacity, {
        toValue: isExpanded ? 1 : 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isExpanded, labelOpacity, widthAnim]);

  const labelWidth = widthAnim.interpolate({
    inputRange: [COLLAPSED_TAB_BAR_WIDTH, EXPANDED_TAB_BAR_WIDTH],
    outputRange: [0, 136],
    extrapolate: 'clamp',
  });

  const labelGap = widthAnim.interpolate({
    inputRange: [COLLAPSED_TAB_BAR_WIDTH, EXPANDED_TAB_BAR_WIDTH],
    outputRange: [0, appTheme.spacing.md],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[styles.container, { width: widthAnim }]}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {state.routes.map((route) => {
        const { options } = descriptors[route.key];
        
        // Salta le tab nascoste
        if (!isRouteVisible(route, descriptors)) {
          return null;
        }

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;
        const labelText = typeof label === 'string' ? label : route.name;

        // La tab è focused se:
        // 1. La route attuale è questa tab (quando la route è visibile)
        // 2. OPPURE se siamo su una schermata nascosta e questa era l'ultima tab attiva
        // Ma in realtà vogliamo che quando siamo su schermata nascosta, NESSUNA tab sia focused
        
        const isCurrentRouteVisible = state.routes.some((r) => 
          r.name === actualActiveRouteName && isRouteVisible(r, descriptors)
        );
        
        const isFocused = isCurrentRouteVisible 
          ? route.name === actualActiveRouteName 
          : false; // Se siamo su schermata nascosta, nessuna tab è focused

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={({ hovered, pressed }) => [
              styles.item,
              styles.itemWeb,
              isExpanded ? styles.itemExpanded : styles.itemCollapsed,
              isFocused && styles.itemActive,
              !isFocused && hovered && styles.itemHovered,
              !isFocused && hovered && styles.itemHoveredTransform,
              pressed && styles.itemPressed,
            ]}
          >
            {({ hovered }) => {
              const icon =
                typeof options.tabBarIcon === 'function'
                  ? options.tabBarIcon({
                      focused: isFocused,
                      size: 22,
                      color: isFocused
                        ? appTheme.colors.card
                        : hovered
                          ? appTheme.colors.primary
                          : appTheme.colors.secondary,
                    })
                  : null;

              return (
                <>
                  {icon}
                  <Animated.View
                    style={[styles.labelWrap, { width: labelWidth, marginLeft: labelGap, opacity: labelOpacity }]}
                  >
                    <Text
                      style={[
                        styles.label,
                        isFocused && styles.labelActive,
                        !isFocused && hovered && styles.labelHovered,
                      ]}
                      numberOfLines={1}
                    >
                      {labelText}
                    </Text>
                  </Animated.View>
                </>
              );
            }}
          </Pressable>
        );
      })}
    </Animated.View>
  );
};

const createStyles = (appTheme) =>
  StyleSheet.create({
    container: {
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      paddingVertical: appTheme.spacing.lg,
      paddingHorizontal: appTheme.spacing.sm,
      backgroundColor: appTheme.colors.card,
      borderRightWidth: 1,
      borderRightColor: appTheme.colors.divider,
      gap: appTheme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'flex-start',
      ...appTheme.shadow.card,
      zIndex: 30,
    },
    item: {
      width: '100%',
      paddingVertical: appTheme.spacing.sm,
      paddingHorizontal: appTheme.spacing.xs,
      borderRadius: appTheme.radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 52,
    },
    itemWeb: {
      transitionProperty: 'background-color, transform, opacity',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    itemCollapsed: {
      justifyContent: 'center',
    },
    itemExpanded: {
      justifyContent: 'flex-start',
    },
    itemActive: {
      backgroundColor: appTheme.colors.secondary,
    },
    itemHovered: {
      backgroundColor: 'rgba(231, 0, 19, 0.10)',
    },
    itemHoveredTransform: {
      transform: [{ scale: 1.03 }],
    },
    itemPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.92,
    },
    labelWrap: {
      overflow: 'hidden',
    },
    label: {
      fontSize: 14,
      fontWeight: '700',
      color: appTheme.colors.text,
      textAlign: 'left',
    },
    labelHovered: {
      color: appTheme.colors.primary,
    },
    labelActive: {
      color: appTheme.colors.card,
    },
  });

export default WebTabBar;
