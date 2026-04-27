import styles from "./ThemeToggle.module.css";
import { useTheme } from "../../contexts/ThemeProvider";
import LightIcon from "../../assets/icons/light.svg?react";
import DarkIcon from "../../assets/icons/dark.svg?react";
import clsx from "clsx";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      className={styles.toggle}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <div className={clsx(styles.toggle__thumb, theme === "dark" && styles["toggle__thumb--dark"])}>
        {theme === "light" ? (
          <LightIcon className={clsx(styles.toggle__icon, styles["toggle__icon--light"])} />
        ) : (
          <DarkIcon className={clsx(styles.toggle__icon, styles["toggle__icon--dark"])} />
        )}
      </div>

      <div className={clsx(styles.toggle__circle, theme === "dark" && styles["toggle__circle--active"])} />
    </button>
  );
};

export default ThemeToggle;