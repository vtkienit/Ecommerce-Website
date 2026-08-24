import { useTheme } from "../../app/contexts/ThemeContext";
import LightIcon from "../../assets/icons/light.svg?react";
import DarkIcon from "../../assets/icons/dark.svg?react";
import clsx from "clsx";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      className="relative flex h-5 w-11 cursor-pointer items-center rounded-full border-none bg-primary px-1"
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

      <div
        className={clsx(
          "absolute left-px top-px h-[18px] w-[18px] rounded-full bg-white transition-all duration-200",
          theme === "dark" && "left-[26px]",
        )}
      />
    </button>
  );
};

export default ThemeToggle;
