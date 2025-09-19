import Header from "./Header";
import Hero from "./Hero";
import Features from "./Features";
import Services from "./Services";
import Stats from "./Stats";
import CTA from "./CTA";
import Footer from "./Footer";

export default function Landing() {
   return (
      <div className="min-h-screen bg-white">
         <Header />
         <Hero />
         <Features />
         <Services />
         <Stats />
         <CTA />
         <Footer />
      </div>
   );
}


