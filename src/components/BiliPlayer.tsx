"use client";

import { useState } from "react";
import { Project } from "@/lib/projects";

/**
 * B站视频播放器：默认显示封面，点击后加载 iframe 播放。
 * 首屏不加载视频，省流量、加载快。
 * 当 project.pages 有多个分 P 时，横向滚动排列多个播放器。
 */
export function BiliPlayer({ project }: { project: Project }) {
  // 未填 BV 号：显示占位，不渲染播放器
  if (!project.bvid) {
    return (
      <div className="media-zoom relative flex aspect-video w-full items-center justify-center rounded-xl bg-background-soft ring-1 ring-[var(--border)]">
        {project.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <span className="text-sm tracking-wide text-muted">视频待上传</span>
        )}
      </div>
    );
  }

  // 分 P 列表：为空则默认单个第 1 P
  const pages = project.pages.length > 0 ? project.pages : [1];

  // 单个分 P：占满整行
  if (pages.length === 1) {
    return (
      <div className="w-full">
        <BiliPane project={project} page={pages[0]} showBadge={false} />
      </div>
    );
  }

  // 多个分 P：横向滚动，每个保持较大尺寸，超出容器即滑动
  return (
    <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:mx-0 md:px-0">
      {pages.map((p) => (
        <div
          key={p}
          className="w-[85%] flex-none snap-start sm:w-[70%] md:w-[72%]"
        >
          <BiliPane project={project} page={p} showBadge />
        </div>
      ))}
    </div>
  );
}

/** 单个分 P 播放窗：封面 + 点击播放 */
function BiliPane({
  project,
  page,
  showBadge,
}: {
  project: Project;
  page: number;
  showBadge: boolean;
}) {
  const [playing, setPlaying] = useState(false);

  const embedSrc = `https://player.bilibili.com/player.html?bvid=${project.bvid}&p=${page}&autoplay=1&high_quality=1&danmaku=0`;

  return (
    <div className="media-zoom relative aspect-video w-full rounded-xl bg-card ring-1 ring-[var(--border)]">
      {playing ? (
        <iframe
          src={embedSrc}
          title={`${project.title} P${page}`}
          className="absolute inset-0 h-full w-full rounded-xl"
          scrolling="no"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen"
        />
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className="group/btn absolute inset-0 h-full w-full cursor-pointer"
          aria-label={`播放 ${project.title} 第 ${page} P`}
        >
          {project.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.cover}
              alt={project.title}
              referrerPolicy="no-referrer"
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-background-soft text-muted">
              暂无封面
            </div>
          )}
          {/* 分 P 角标 */}
          {showBadge && (
            <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
              P{page}
            </span>
          )}
          {/* 播放按钮 */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background/85 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover/btn:scale-110">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                className="ml-1 text-foreground"
              >
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
