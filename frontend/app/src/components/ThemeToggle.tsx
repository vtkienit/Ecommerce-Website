import { useTheme } from "../contexts/ThemeProvider";
import LightIcon from "../assets/icons/light.svg?react";
import DarkIcon from "../assets/icons/dark.svg?react";
import clsx from "clsx";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      className="w-11 h-5 bg-primary rounded-full relative cursor-pointer border-none flex items-center px-[var(--space-1)]"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <div className={"flex w-full items-center"}>
        {theme === "light" ? (
          <LightIcon className={"w-[13px] h-[13px] text-yellow-500 ml-auto"} />
        ) : (
          <DarkIcon className={"w-[13px] h-[13px] text-yellow-500"} />
        )}
      </div>

      <div className={clsx
        ("w-[18px] h-[18px] bg-white rounded-full absolute top-[1px] left-[1px] transition-all duration-200"
        , theme === "dark" && "left-[26px]")} />
    </button>
  );
};

export default ThemeToggle;