import {useTranslation} from "react-i18next"
import {Link} from "react-router-dom"

import SportsBaseballIcon from "@mui/icons-material/SportsBaseball"
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball"
import SportsFootballIcon from "@mui/icons-material/SportsFootball"
import SportsHockeyIcon from "@mui/icons-material/SportsHockey"
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer"
import Box from "@mui/material/Box"
import MuiLink from "@mui/material/Link"
import Typography from "@mui/material/Typography"

import {getRootRoute} from "../shared/helpers"
import {Category} from "../shared/models"

import LocaleApp from "./LocaleApp"

export default function Footer() {
  const {t} = useTranslation()

  return (
    <Box
      alignItems="center"
      component="footer"
      display="flex"
      flexDirection="column"
      gap={2}
      justifyContent="flex-end"
      mt={50}
      pb={2}
      px={4}
      textAlign="center"
    >
      <Box
        display="flex"
        flexWrap="wrap"
        gap={4}
        justifyContent="center"
        maxWidth={250}
        mb={6}
        mx="auto"
        width="100%"
      >
        {Object.values(Category).map(category => (
          <Box
            alignItems="center"
            border={1}
            borderRadius={6}
            color="inherit"
            component={Link}
            display="flex"
            flex={0}
            flexDirection="column"
            gap={1}
            justifyContent="center"
            key={category}
            p={4}
            sx={{
              textDecoration: "none",
              transition: "transform 0.2s",
              ":hover": {
                transform: "scale(1.1)",
              },
            }}
            to={getRootRoute(category)}
            width="100%"
          >
            <Icon {...{category}} />
          </Box>
        ))}
      </Box>
      <LocaleApp />
      <Typography>
        {t("Search powered by")}&nbsp;
        <MuiLink
          href="https://www.mediawiki.org/wiki/API:Main_page"
          rel="noopener noreferrer"
          target="_blank"
        >
          Wikipedia
        </MuiLink>
      </Typography>
      <Typography variant="body2">
        <MuiLink
          href="https://maxmonis.com"
          mb={6}
          rel="noopener noreferrer"
          target="_blank"
        >
          © Max Monis 2022-{new Date().getFullYear()}
        </MuiLink>
      </Typography>
    </Box>
  )
}

function Icon({category}: {category: Category}) {
  const fontSize = "1.5rem"

  const icons: Record<Category, JSX.Element> = {
    [Category.baseball]: <SportsBaseballIcon sx={{fontSize}} />,
    [Category.basketball]: <SportsBasketballIcon sx={{fontSize}} />,
    [Category.football]: <SportsFootballIcon sx={{fontSize}} />,
    [Category.hockey]: <SportsHockeyIcon sx={{fontSize}} />,
    [Category.soccer]: <SportsSoccerIcon sx={{fontSize}} />,
  }

  return icons[category]
}
