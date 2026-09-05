import Hero from "@/components/sections/Hero";
import SelectedWork from "@/components/sections/SelectedWork";
import Projects from "@/components/sections/Projects";
import SystemsExplorer from "@/components/sections/SystemsExplorer";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Expertise from "@/components/sections/Expertise";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <SelectedWork />
      <Projects />
      <SystemsExplorer />
      <About />
      <Experience />
      <Expertise />
      <Contact />
    </main>
  );
}
