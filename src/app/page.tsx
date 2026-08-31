import { getProjects } from "@/lib/notion";
import { BiliPlayer } from "@/components/BiliPlayer";
import { Reveal } from "@/components/Reveal";

export const revalidate = 60; // 每 60 秒重新读取 Notion

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="w-full">
      {/* 顶部导航 */}
      <header className="fixed top-0 left-0 z-50 w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
          <span className="font-display text-lg font-semibold">作品集</span>
          <nav className="flex gap-8 text-sm text-muted">
            <a href="#work" className="transition-colors hover:text-foreground">
              作品
            </a>
            <a
              href="#about"
              className="transition-colors hover:text-foreground"
            >
              关于
            </a>
          </nav>
        </div>
      </header>

      {/* Hero 首屏 */}
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 pt-32 pb-20 md:px-10">
        <Reveal>
          <p className="mb-6 text-sm uppercase tracking-[0.25em] text-accent">
            游戏设计 · 技术美术
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="font-display text-5xl leading-[1.05] font-light md:text-8xl">
            个人
            <br />
            作品集
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-muted">
            动作 3C、渲染。向下滚动浏览作品。
          </p>
        </Reveal>
      </section>

      {/* 作品列表 */}
      <section id="work" className="mx-auto max-w-6xl px-6 pb-32 md:px-10">
        <div className="flex flex-col gap-28 md:gap-40">
          {projects.map((project, i) => (
            <Reveal key={project.id}>
              <article className="group">
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <h2 className="font-display text-3xl font-light md:text-5xl">
                      {project.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      {project.category}
                    </p>
                  </div>
                  <span className="font-display text-lg text-muted">
                    {String(i + 1).padStart(2, "0")} / {project.year}
                  </span>
                </div>
                <BiliPlayer project={project} />
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
                  {project.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 关于 / 页脚 */}
      <section id="about" className="border-t hairline bg-background-soft">
        <div className="mx-auto max-w-6xl px-6 py-24 md:px-10">
          <Reveal>
            <h2 className="font-display text-3xl font-light md:text-5xl">
              关于我
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              技术美术，专注 3C 动作系统。技术储备偏重跑酷、射击与动作游戏，长期打磨运动手感、平台跳跃机关交互与多模态移动状态切换。
            </p>
            <a
              href="mailto:hello@example.com"
              className="mt-8 inline-block border-b border-accent pb-1 text-lg text-accent transition-opacity hover:opacity-70"
            >
              hello@example.com
            </a>
          </Reveal>
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-10 text-sm text-muted md:px-10">
          © {new Date().getFullYear()} 版权所有
        </div>
      </section>
    </main>
  );
}
