import { useCallback, useEffect, useState } from "react"

const darkModeMatch = window.matchMedia("(prefers-color-scheme: dark)")
const useDarkMode = (): Boolean => {
  // Check the code above in the article if looking for `darkModeMatch` defenition
  const isDarkMode = () => darkModeMatch.matches

  // creating a property to store the dark mode value (true or false)
  const [isDark, setDark] = useState(isDarkMode())

  // Creating listener. It is safe to do so with `useCallback` hook
  const listener = useCallback(() => {
      const newValue = isDarkMode()
      if (isDark !== newValue) {
          setDark(newValue)
          console.log("Changing mode to ", newValue)
      }
  }, [isDark, setDark])

  // Subscribing to the changes
  useEffect(() => {
      // creating the subscription
      darkModeMatch.addEventListener("change", listener)

      // creating a way to unsubscribe and clean everything
      return () => darkModeMatch.removeEventListener("change", listener)
  }, [listener])

  // Returning current dark mode state value
  return isDark
}

export default useDarkMode