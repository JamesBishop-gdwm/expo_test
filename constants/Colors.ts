/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// REMOVED: The tint colors are now derived directly from the main palette below
// to ensure a more cohesive theme.

// Add our application colors
export const COLORS = {
  primary: "#781f19", // Falu Red
  secondary: "#224f4a", // Deep Jungle Green
  gold: "#e2c69f", // Gold Crayola
  offWhite: "#f6f6f6", // Cultured White

  // Grays for text and backgrounds
  textLight: "#11181C", // Dark gray for light mode text
  textDark: "#ECEDEE", // Light gray for dark mode text
  backgroundDark: "#1E1E1E", // A neutral, dark gray for backgrounds
  surfaceDark: "#242221", // A slightly lighter dark gray for cards/surfaces
};

export const Colors = {
  light: {
    text: COLORS.textLight,
    background: COLORS.offWhite,
    header: COLORS.primary,
    headerText: COLORS.offWhite,
    tint: COLORS.primary, // CHANGED: Using primary red for a cohesive theme.
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: COLORS.primary, // CHANGED: Consistent with the new tint color.
  },
  dark: {
    text: COLORS.textDark,
    background: COLORS.backgroundDark, // CHANGED: Using a more neutral dark background.
    header: COLORS.secondary, // CHANGED: Using a surface color for the header.
    headerText: COLORS.gold, // Gold text on a dark header looks great.
    tint: COLORS.gold, // CHANGED: Gold is the perfect bright accent for dark mode.
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: COLORS.gold, // CHANGED: Gold provides excellent contrast for selected items.
  },
};
