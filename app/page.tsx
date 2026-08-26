import Hero from "@/components/sections/Hero";
import TechMarquee from "@/components/ui/TechMarquee";
import About from "@/components/sections/About";
import BentoSkills from "@/components/sections/BentoSkills";
import CaseStudies from "@/components/sections/CaseStudies";
import ArchitecturePlayground from "@/components/sections/ArchitecturePlayground";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import PageAmbience from "@/components/ui/PageAmbience";

/** Single-page canvas aggregating all sections */
export default function Home() {
  return (
    <>
      <PageAmbience />
      <main className="relative z-10">
        <Hero />
        <TechMarquee />
        <About />
        <BentoSkills />
        <CaseStudies />
        <ArchitecturePlayground />
        <Experience />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
