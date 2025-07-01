import { useSelector, useDispatch } from "react-redux";
import { toggleTheme, setTheme } from "../store/slices/uiSlice";

export const useTheme = () => {
  const theme = useSelector((state) => state.ui.theme);
  const dispatch = useDispatch();

  const toggle = () => {
    dispatch(toggleTheme());
  };

  const set = (newTheme) => {
    dispatch(setTheme(newTheme));
  };

  return {
    theme,
    toggle,
    set,
    isDark: theme === "dark",
    isLight: theme === "light",
  };
};
