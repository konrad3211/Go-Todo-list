import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,

  colors: {
    brand: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
  },

  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },

  styles: {
    global: (props: any) => ({
      body: {
        bg: mode("#F8FAFC", "#0B1120")(props),
        color: mode("gray.800", "whiteAlpha.900")(props),
      },
    }),
  },
});

export default theme;
