import { clsx, type ClassValue } from "clsx";

/** Merge conditional class names */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Smooth-scroll to a section id via Lenis (fallback: native) */
export function scrollToSection(id: string) {
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: string, o?: object) => void } }).__lenis;
  if (lenis) {
    lenis.scrollTo(`#${id}`, { offset: -84, duration: 1.4 });
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
}

/** Open the global terminal overlay from anywhere */
export function openTerminal() {
  window.dispatchEvent(new CustomEvent("portfolio:open-terminal"));
}
