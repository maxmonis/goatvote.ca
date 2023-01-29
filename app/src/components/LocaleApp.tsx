import {useState} from "react"
import {useTranslation} from "react-i18next"

import LanguageIcon from "@mui/icons-material/Language"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Tooltip from "@mui/material/Tooltip"

import {localLanguage} from "../utils/storage"

export default function LocaleApp({
  tooltipPlacement = "top",
}: {
  tooltipPlacement?: "left" | "top"
}) {
  const {
    i18n: {changeLanguage, language},
    t,
  } = useTranslation()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const onClose = () => setAnchorEl(null)

  return (
    <Box>
      <Tooltip placement={tooltipPlacement} title={t("Change language")}>
        <IconButton onClick={e => setAnchorEl(e.currentTarget)} size="small">
          <LanguageIcon />
          &nbsp;{language}
        </IconButton>
      </Tooltip>
      <Menu
        anchorOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
        keepMounted
        open={Boolean(anchorEl)}
        transformOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
        {...{anchorEl, onClose}}
      >
        {[
          {key: "en", name: "English"},
          {key: "es", name: "Spanish"},
        ].map(({key, name}) => (
          <MenuItem
            onClick={() => {
              onClose()
              changeLanguage(key)
              localLanguage.set(key)
            }}
            {...{key}}
          >
            {t(name)}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
