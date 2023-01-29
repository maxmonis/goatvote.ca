import {initReactI18next} from "react-i18next"

import i18n from "i18next"
import detector from "i18next-browser-languagedetector"

import {localLanguage} from "../utils/storage"

import en from "./en.json"
import es from "./es.json"

const englishResources = [
  "en",
  "en-AU",
  "en-BZ",
  "en-CA",
  "en-EG",
  "en-GB",
  "en-IE",
  "en-JM",
  "en-NZ",
  "en-TT",
  "en-US",
  "en-ZA",
].reduce((obj, key) => ({...obj, [key]: {translation: en}}), {})

const spanishResources = [
  "es",
  "es-AR",
  "es-BO",
  "es-CL",
  "es-CO",
  "es-CR",
  "es-DO",
  "es-EC",
  "es-GT",
  "es-HN",
  "es-MX",
  "es-NI",
  "es-PA",
  "es-PE",
  "es-PR",
  "es-PY",
  "es-SV",
  "es-UY",
  "es-VE",
].reduce((obj, key) => ({...obj, [key]: {translation: es}}), {})

const resources = {
  ...englishResources,
  ...spanishResources,
}

const languages = Object.keys(resources)
const lngKey = navigator.language.substring(0, 2)
const fallbackLng = ["en", "es"].includes(lngKey) ? lngKey : languages[0]
const storedLanguage = localLanguage.get()
const lng =
  storedLanguage && languages.includes(storedLanguage)
    ? storedLanguage
    : fallbackLng

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    fallbackLng,
    interpolation: {
      escapeValue: false,
    },
    lng,
    resources,
  })

i18n.languages = languages

export default i18n
