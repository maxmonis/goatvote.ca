import {useEffect, useState} from "react"

export default function useViewport() {
  const [width, setWidth] = useState(window.innerWidth)

  const handleWindowResize = () => setWidth(window.innerWidth)

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize)

    return () => {
      window.removeEventListener("resize", handleWindowResize)
    }
  }, [])

  return width
}
