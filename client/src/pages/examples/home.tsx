import HomePage from "../home";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function HomePageExample() {
  return (
    <ThemeProvider>
      <HomePage />
    </ThemeProvider>
  );
}
