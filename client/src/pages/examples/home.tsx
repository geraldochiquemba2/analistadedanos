import HomePage from "../home";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export default function HomePageExample() {
  return (
    <ThemeProvider>
      <HomePage />
      <Toaster />
    </ThemeProvider>
  );
}
