import {useEffect, useState} from "react"
import {useTranslation} from "react-i18next"
import {QueryClient, QueryClientProvider} from "react-query"
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom"

import Box from "@mui/material/Box"
import CssBaseline from "@mui/material/CssBaseline"
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"

import Footer from "./components/Footer"
import GoogleButton from "./components/GoogleButton"
import NavBar from "./components/NavBar"
import Dashboard from "./pages/Dashboard"
import VoteApp from "./pages/VoteApp"
import {localDark} from "./utils/storage"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
})

export default function App() {
  const {t} = useTranslation()

  const localPrefersDark = localDark.get()
  const browserPrefersDark = useMediaQuery("(prefers-color-scheme: dark)")
  const [dark, setDark] = useState(
    typeof localPrefersDark === "boolean"
      ? localPrefersDark
      : browserPrefersDark,
  )

  const theme = responsiveFontSizes(
    createTheme({
      palette: {
        mode: dark ? "dark" : "light",
      },
      spacing: (factor = 1) => `${0.25 * factor}rem`,
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Box>
          <BrowserRouter>
            <ScrollToTop />
            <Box>
              <Box minHeight="100vh" minWidth="100vw">
                <NavBar {...{dark, toggleDark}} />
                <Box
                  alignItems="center"
                  display="flex"
                  flexDirection="column"
                  gap={6}
                  my={10}
                  px={4}
                  textAlign="center"
                >
                  <Typography variant="h1">{t("Who's the GOAT?")}</Typography>
                  <GoogleButton showHeading />
                </Box>
                <Routes>
                  <Route
                    path="/:category/:subcategory/:timeframe"
                    element={<VoteApp />}
                  />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="*" element={<Navigate replace to="/" />} />
                </Routes>
              </Box>
              <Footer />
            </Box>
          </BrowserRouter>
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  )

  function toggleDark() {
    localDark.set(!dark)
    setDark(!dark)
  }
}

function ScrollToTop() {
  const {pathname} = useLocation()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, searchParams])

  return null
}
