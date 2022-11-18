import { createTheme } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";

export const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: "Estedad",
  },
  palette: {
    background: {
      // default: "#fafafa",
    },
  },
});

export const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});
