import {t} from "i18next"

import {categories} from "./constants"
import {Category} from "./models"

export function getDisplayText(text: string) {
  return text.split(" (")[0]
}

export function getInitials(text: string) {
  return getDisplayText(text)
    .split(" ")
    .map(t => t[0].toUpperCase())
    .join("")
}

export function getRootRoute(category: Category) {
  const {subcategories, timeframes} = categories[category]
  return `/${category}/${subcategories[0]}/${timeframes[0]}`
}

export function getSubcategoryText(subcategory: string) {
  return t("The best {{subcategory}}", {
    subcategory: t(subcategory),
  })
}

export function getTimeframeText(timeframe: string) {
  switch (timeframe) {
    case "all-time":
      return t("of all time")
    case "20th-century":
      return t("of the 20th century")
    case "21st-century":
      return t("of the 21st century")
    case "pre-1960":
    case "pre-1920":
      return t("prior to {{year}}", {year: timeframe.replace(/\D/g, "")})
    default:
      return t("of the {{decade}}s", {decade: timeframe.replace(/\D/g, "")})
  }
}

export function getCapitalizedCategory(category: Category) {
  switch (category) {
    case Category.baseball:
      return t("Baseball")
    case Category.basketball:
      return t("Basketball")
    case Category.football:
      return t("Football")
    case Category.hockey:
      return t("Hockey")
    case Category.soccer:
      return t("Soccer")
  }
}

export function getCapitalizedTimeframe(timeframe: string) {
  switch (timeframe) {
    case "all-time":
      return t("All Time")
    case "20th-century":
      return t("20th Century")
    case "21st-century":
      return t("21st Century")
    case "pre-1960":
    case "pre-1920":
      return t("Before {{year}}", {year: timeframe.replace(/\D/g, "")})
    default:
      return t("The {{decade}}s", {decade: timeframe.replace(/\D/g, "")})
  }
}

export function getCapitalizedSubcategory(subcategory: string) {
  switch (subcategory) {
    case "offensive-player":
      return t("Offensive Player")
    case "defensive-player":
      return t("Defensive Player")
    case "pitcher":
      return t("Pitcher")
    case "quarterback":
      return t("Quarterback")
    case "goalkeeper":
      return t("Goalkeeper")
    default:
      return t("Player")
  }
}

export function isCategory(category: unknown): category is Category {
  return typeof category === "string" && category in categories
}

export function isSubcategory(
  subcategory: unknown,
  category?: Category,
): subcategory is string {
  if (category) {
    return (
      typeof subcategory === "string" &&
      categories[category].subcategories.includes(subcategory)
    )
  }
  const allSubcategories = new Set()
  for (const {subcategories} of Object.values(categories)) {
    for (const subcategory of subcategories) {
      allSubcategories.add(subcategory)
    }
  }
  return allSubcategories.has(subcategory)
}

export function isTimeframe(
  timeframe: unknown,
  category?: Category,
): timeframe is string {
  if (category) {
    return (
      typeof timeframe === "string" &&
      categories[category].timeframes.includes(timeframe)
    )
  }
  const allTimeframes = new Set()
  for (const {timeframes} of Object.values(categories)) {
    for (const timeframe of timeframes) {
      allTimeframes.add(timeframe)
    }
  }
  return allTimeframes.has(timeframe)
}
