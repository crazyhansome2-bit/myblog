import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import ProjectsBoard from './ProjectsBoard';
import {siteConfig} from "@/siteConfig";

export const metadata = {
  title: "项目矩阵 | " + siteConfig.title,
  description: "策划作品、系统拆解与个人项目展示",
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <div className="mt-28">
          <ProjectsBoard />
        </div>
      </PageTransition>
    </div>
  );
}
