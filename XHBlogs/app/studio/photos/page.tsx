import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import PhotoManager from "./PhotoManager";

export const metadata = {
  title: "相册管理 | Linx",
  robots: { index: false, follow: false },
};

export default function PhotoManagerPage() {
  return <div className="min-h-screen pb-10"><Navbar /><PageTransition><PhotoManager /></PageTransition></div>;
}
