import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedProviders from "@/components/FeaturedProviders";
import FreeTools from "@/components/FreeTools";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Categories />
      <FeaturedProviders />
      <FreeTools />
      <Testimonials />
      <Footer />
    </main>
  );
}
