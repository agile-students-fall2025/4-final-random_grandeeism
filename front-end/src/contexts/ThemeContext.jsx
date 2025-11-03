import { createContext, useEffect, useState } from "react";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    // Load theme from localStorage or default to "light"
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  const [effectiveTheme, setEffectiveTheme] = useState("light");

  // Update favicon based on theme
  const updateFavicon = (isDark) => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.href = isDark ? '/favicon-dark.svg' : '/favicon-light.svg';
    }
  };

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem("theme", theme);

    // Determine effective theme
    let newEffectiveTheme = "light";

    if (theme === "auto") {
      // Use system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      newEffectiveTheme = prefersDark ? "dark" : "light";
    } else {
      newEffectiveTheme = theme;
    }

    setEffectiveTheme(newEffectiveTheme);

    // Apply or remove dark class on document element
    if (newEffectiveTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Update favicon
    updateFavicon(newEffectiveTheme === "dark");
  }, [theme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme !== "auto") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e) => {
      const newEffectiveTheme = e.matches ? "dark" : "light";
      setEffectiveTheme(newEffectiveTheme);
      
      if (newEffectiveTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Update favicon when system theme changes
      updateFavicon(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Export context for use in hooks
export { ThemeContext };
