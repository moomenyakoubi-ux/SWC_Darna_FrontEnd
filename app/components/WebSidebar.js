import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

const MENU_WIDTH = 320;
const ANIMATION_DURATION = 300;

const getMenuItems = (menuStrings) => [
  { label: menuStrings.addContact, icon: 'person-add', route: 'AddContact' },
  { label: menuStrings.accountSettings, icon: 'settings', route: 'AccountSettings' },
  { label: menuStrings.language, icon: 'globe', route: 'Lingua' },
  { label: menuStrings.privacy, icon: 'shield-checkmark', route: 'PrivacyPolicy' },
  { label: menuStrings.terms, icon: 'document-text', route: 'Termini' },
  { label: menuStrings.copyright, icon: 'ribbon', route: 'Copyright' },
  { label: menuStrings.cookies, icon: 'ice-cream', route: 'CookiePolicy' },
  { label: menuStrings.aiUsage, icon: 'sparkles', route: 'AiUsage' },
  { label: menuStrings.support, icon: 'call', route: 'Support' },
];

const getActiveRouteNameFromState = (state) => {
  if (!state?.routes?.length) return null;
  const currentRoute = state.routes[state.index ?? 0];
  if (!currentRoute) return null;
  if (currentRoute.state) return getActiveRouteNameFromState(currentRoute.state);
  return currentRoute.name ?? null;
};

const resolveCurrentRouteName = (navigation) => {
  const directRoute = navigation?.getCurrentRoute?.();
  if (directRoute?.name) return directRoute.name;
  const state = navigation?.getState?.();
  return getActiveRouteNameFromState(state);
};

const WebSidebar = ({ title, menuStrings, navigation, isRTL }) => {
  if (Platform.OS !== 'web') return null;

  const { theme: appTheme } = useAppTheme();
  const styles = useMemo(() => createStyles(appTheme), [appTheme]);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredRoute, setHoveredRoute] = useState(null);
  const [activeRoute, setActiveRoute] = useState(() => resolveCurrentRouteName(navigation));

  // Animation values
  const slideAnim = useMemo(() => new Animated.Value(MENU_WIDTH), []);
  const backdropOpacity = useMemo(() => new Animated.Value(0), []);
  const menuButtonScale = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    const syncActiveRoute = () => setActiveRoute(resolveCurrentRouteName(navigation));
    syncActiveRoute();
    if (!navigation?.addListener) return undefined;

    const unsubscribeState = navigation.addListener('state', syncActiveRoute);
    const unsubscribeFocus = navigation.addListener('focus', syncActiveRoute);

    return () => {
      if (typeof unsubscribeState === 'function') unsubscribeState();
      if (typeof unsubscribeFocus === 'function') unsubscribeFocus();
    };
  }, [navigation]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isOpen ? 0 : MENU_WIDTH,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: isOpen ? 1 : 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen, slideAnim, backdropOpacity]);

  const handleMenuPress = useCallback(() => {
    // Button press animation
    Animated.sequence([
      Animated.timing(menuButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(menuButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    setIsOpen(true);
  }, [menuButtonScale]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleMenuItemPress = useCallback((route) => {
    if (navigation?.isReady?.()) navigation.navigate(route);
    else if (navigation?.navigate) navigation.navigate(route);
    setActiveRoute(route);
    setIsOpen(false);
  }, [navigation]);

  return (
    <>
      {/* Hamburger Button - Fixed Top Right */}
      <Animated.View
        style={[
          styles.hamburgerContainer,
          { transform: [{ scale: menuButtonScale }] },
        ]}
      >
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={handleMenuPress}
          activeOpacity={0.8}
          onMouseEnter={() => {
            Animated.timing(menuButtonScale, {
              toValue: 1.05,
              duration: 150,
              useNativeDriver: true,
            }).start();
          }}
          onMouseLeave={() => {
            Animated.timing(menuButtonScale, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }).start();
          }}
        >
          <View style={styles.hamburgerIcon}>
            <View style={[styles.hamburgerLine, { backgroundColor: appTheme.colors.card }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: appTheme.colors.card }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: appTheme.colors.card }]} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Backdrop */}
      {isOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            style={[
              styles.backdropOverlay,
              { opacity: backdropOpacity },
            ]}
          />
        </TouchableOpacity>
      )}

      {/* Slide-out Menu */}
      <Animated.View
        style={[
          styles.sideMenu,
          isRTL && styles.sideMenuRtl,
          { transform: [{ translateX: isRTL ? -slideAnim : slideAnim }] },
        ]}
      >
        {/* Menu Header */}
        <View style={styles.menuHeader}>
          <Text style={[styles.menuTitle, isRTL && styles.rtlText]}>
            {menuStrings.userProfile || 'Menu'}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={appTheme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuItems}>
          {getMenuItems(menuStrings).map((item, index) => {
            const isActive = activeRoute === item.route;
            const isHovered = hoveredRoute === item.route;
            const iconColor = isActive
              ? appTheme.colors.primary
              : isHovered
                ? appTheme.colors.secondary
                : appTheme.colors.muted;
            const labelColor = isActive
              ? appTheme.colors.primary
              : isHovered
                ? appTheme.colors.text
                : appTheme.colors.text;

            return (
              <TouchableOpacity
                key={item.route}
                style={[
                  styles.menuItem,
                  styles.menuItemWeb,
                  isRTL && styles.menuItemRtl,
                  isActive && styles.menuItemActive,
                  !isActive && isHovered && styles.menuItemHover,
                ]}
                onMouseEnter={() => setHoveredRoute(item.route)}
                onMouseLeave={() => setHoveredRoute((current) => (current === item.route ? null : current))}
                onPress={() => handleMenuItemPress(item.route)}
              >
                <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                  <Ionicons name={item.icon} size={20} color={iconColor} />
                </View>
                <Text style={[styles.menuLabel, isRTL && styles.rtlText, { color: labelColor }]}>
                  {item.label}
                </Text>
                {isActive && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.menuFooter}>
          <Text style={[styles.footerText, isRTL && styles.rtlText]}>
            Darna
          </Text>
        </View>
      </Animated.View>
    </>
  );
};

const createStyles = (appTheme) =>
  StyleSheet.create({
    // Hamburger Button Styles
    hamburgerContainer: {
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 10001,
    },
    hamburgerButton: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: appTheme.colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      ...appTheme.shadow.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    hamburgerIcon: {
      width: 22,
      height: 16,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    hamburgerLine: {
      width: 22,
      height: 2.5,
      borderRadius: 1.5,
    },

    // Backdrop Styles
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9998,
    },
    backdropOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    // Menu Styles
    sideMenu: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: MENU_WIDTH,
      backgroundColor: appTheme.colors.card,
      zIndex: 9999,
      ...appTheme.shadow.card,
      shadowColor: '#000',
      shadowOffset: { width: -4, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    sideMenuRtl: {
      right: 'auto',
      left: 0,
      shadowOffset: { width: 4, height: 0 },
    },

    // Menu Header
    menuHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: appTheme.spacing.lg,
      paddingTop: 24,
      paddingBottom: appTheme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: appTheme.colors.divider,
    },
    menuTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: appTheme.colors.text,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: appTheme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Menu Items
    menuItems: {
      flex: 1,
      paddingHorizontal: appTheme.spacing.md,
      paddingTop: appTheme.spacing.lg,
      gap: appTheme.spacing.xs,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: appTheme.spacing.md,
    },
    menuItemRtl: {
      flexDirection: 'row-reverse',
    },
    menuItemWeb: {
      minHeight: 52,
      paddingVertical: 12,
      paddingHorizontal: appTheme.spacing.md,
      borderRadius: 12,
      backgroundColor: 'transparent',
      transitionProperty: 'background-color, transform',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
    },
    menuItemHover: {
      backgroundColor: 'rgba(231, 0, 19, 0.08)',
    },
    menuItemActive: {
      backgroundColor: 'rgba(231, 0, 19, 0.12)',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: appTheme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainerActive: {
      backgroundColor: 'rgba(231, 0, 19, 0.15)',
    },
    menuLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      transitionProperty: 'color',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
    },
    activeIndicator: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: appTheme.colors.primary,
    },

    // Menu Footer
    menuFooter: {
      paddingHorizontal: appTheme.spacing.lg,
      paddingVertical: appTheme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: appTheme.colors.divider,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      fontWeight: '700',
      color: appTheme.colors.muted,
      letterSpacing: 1,
    },

    rtlText: {
      textAlign: 'right',
      writingDirection: 'rtl',
    },
  });

export default WebSidebar;
