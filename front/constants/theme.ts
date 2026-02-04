import { Platform } from "react-native";

// --- PALETTE DE BASE (CONSTANTES) ---
const obsidian = "#4879ff"; // Noir profond (Primary)
const pureWhite = "#FFFFFF";
const ashGray = "#F9FAFB"; // Gris très pâle (Background Page)
const borderGray = "#E5E7EB"; // Gris subtil (Bordures)
const textMain = "#111827"; // Gris presque noir (Textes)
const slateGray = "#374151";
const overlaySoft = "rgba(0,0,0,0.4)";
const overlay = "rgba(0,0,0,0.5)";
const overlayStrong = "rgba(0,0,0,0.7)";

// Couleurs fonctionnelles (Status)
const statusOrange = "#F97316"; 
const statusOrangeBg = "#FFF7ED"; 
const statusGreen = "#10B981"; 
const statusGreenBg = "#ECFDF5";
const statusRed = "#EF4444";
const statusRedBg = "#FEE2E2";
const statusBlue = "#3B82F6";
const statusBlueBg = "#DBEAFE";

export const Colors = {
  // --- ACTIONS PRINCIPALES ---
  primary: obsidian,          // Le bouton noir
  primaryDark: "#000000",     // Noir absolu
  primaryLight: slateGray,    // Un gris foncé (pour l'état 'pressed' ou 'hover')
  onPrimary: pureWhite,       // La couleur du TEXTE sur le bouton primary

  // --- COULEURS SÉMANTIQUES (NOTIFICATIONS/BADGES) ---
  success: statusGreen,
  successLight: statusGreenBg,
  warning: statusOrange,
  warningLight: statusOrangeBg,
  danger: statusRed,
  dangerLight: statusRedBg,
  info: statusBlue,
  infoLight: statusBlueBg,
  
  // --- BASES NEUTRES ---
  white: pureWhite,
  black: obsidian,
  transparent: "transparent",
  
  // --- HIÉRARCHIE DU TEXTE ---
  text: textMain,             // Titres, Body principal
  textSecondary: "#6B7280",   // Sous-titres, labels
  textMuted: "#9CA3AF",       // Placeholders, textes désactivés
  textInverted: pureWhite,    // Texte sur fond noir
  
  // --- ARRIÈRE-PLANS (SURFACES) ---
  background: ashGray,        // Le fond global de l'écran (Page)
  cardBackground: pureWhite,  // Les blocs de contenu (Cards)
  inputBackground: pureWhite, // Fond des inputs
  
  // --- BORDURES & LIGNES ---
  border: borderGray,         // La bordure standard
  borderLight: "#F3F4F6",     // Bordure très légère (dividers)
  
  // --- NAVIGATION (TAB BAR / ICONS) ---
  tabBarBackground: pureWhite,
  tabActive: obsidian,
  tabInactive: "#9CA3AF",
  icon: "#6B7280",            // Couleur par défaut des icônes (Feather/Ionicons)
  iconActive: obsidian,       // Couleur icône active

  // --- OVERLAYS ---
  overlaySoft,
  overlay,
  overlayStrong,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 6,
  md: 8, 
  lg: 12,
  xl: 16,
  full: 9999,
};

// Style "Vercel-like" : Pas d'ombres floues, mais des bordures nettes
export const Shadows = {
  sm: {
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  md: {
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: Colors.border,
    // Optionnel : petite ombre portée très subtile pour donner du relief aux cartes importantes
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
  },
  floating: {
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: Colors.border,
  },
};

export const Fonts = {
  weights: {
    regular: "Geist-Regular",
    medium: "Geist-Medium",
    semiBold: "Geist-SemiBold",
    bold: "Geist-Bold",
  },
  ios: {
    sans: "Geist-Regular", 
    heading: "Geist-Bold",
  },
  android: {
    sans: "Geist-Regular",
    heading: "Geist-Bold",
  },
  web: {
    sans: "'Geist', sans-serif",
    heading: "'Geist', sans-serif",
  },
};