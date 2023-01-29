import {useTranslation} from "react-i18next"
import {Link, LinkProps} from "react-router-dom"

import Button, {ButtonProps} from "@mui/material/Button"
import Tooltip from "@mui/material/Tooltip"
import Typography, {TypographyProps} from "@mui/material/Typography"
import Zoom from "@mui/material/Zoom"

export function ButtonLink({
  children,
  to,
  ...props
}: ButtonProps & {
  to: LinkProps["to"]
}) {
  return (
    <Link style={{color: "unset", textDecoration: "none"}} {...{to}}>
      <Button {...props}>{children}</Button>
    </Link>
  )
}

export function TextLink({
  children,
  isVisiblyLink = true,
  sx,
  to,
  tooltipText,
  ...props
}: TypographyProps & {
  isVisiblyLink?: boolean
  to: LinkProps["to"]
  tooltipText?: string
}) {
  const {t} = useTranslation()
  const color = isVisiblyLink ? "primary.main" : "text.primary"

  return tooltipText ? (
    <Typography
      sx={{
        a: {
          color,
          textDecoration: "none",
          ":hover": {
            textDecoration: isVisiblyLink ? "underline" : "none",
          },
        },
        ...sx,
      }}
      {...props}
    >
      <Tooltip followCursor TransitionComponent={Zoom} title={t(tooltipText)}>
        <Link {...{to}}>{children}</Link>
      </Tooltip>
    </Typography>
  ) : (
    <Typography
      sx={{
        a: {
          color,
          textDecoration: "none",
          ":hover": {
            textDecoration: isVisiblyLink ? "underline" : "none",
          },
        },
        ...sx,
      }}
      {...props}
    >
      <Link {...{to}}>{children}</Link>
    </Typography>
  )
}
