import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import VendorBanner from "@/components/VendorBanner";
import FeaturedProviders from "@/components/FeaturedProviders";
import FreeTools from "@/components/FreeTools";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <HowItWorks />
      <VendorBanner />
      <FeaturedProviders />
      <FreeTools />
      <Testimonials />
      <Footer />
    </main>
  );
}
