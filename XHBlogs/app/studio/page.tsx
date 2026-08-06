import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import StudioClient from "./StudioClient";

export const metadata = {
  title: "编辑台 | Linx",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return (
    <div className="min-h-screen pb-10">
      <Navbar />
      <PageTransition>
        <StudioClient />
      </PageTransition>
    </div>
  );
}
