import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
