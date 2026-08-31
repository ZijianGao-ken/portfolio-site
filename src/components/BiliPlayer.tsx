"use client";

import { useState } from "react";
import { Project } from "@/lib/projects";

/**
 * B站视频播放器：默认显示封面，点击后加载 iframe 播放。
 * 这样首屏不加载视频，省流量、加载快。
 */
export function BiliPlayer({ project }: { project: Project }) {
  const [playing, setPlaying] = useState(false);

  const embedSrc = `https://player.bilibili.com/player.html?bvid=${project.bvid}&autoplay=1&high_quality=1&danmaku=0`;

  // 未填 BV 号：显示占位，不渲染播放器
  if (!project.bvid) {
    return (
      <div className="media-zoom relative flex aspect-video w-full items-center justify-center rounded-xl bg-background-soft ring-1 ring-[var(--border)]">
        {project.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover}
            alt={project.title}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <span className="text-sm tracking-wide text-muted">视频待上传</span>
        )}
      </div>
    );
  }

  return (
    <div className="media-zoom relative aspect-video w-full rounded-xl bg-card ring-1 ring-[var(--border)]">
      {playing ? (
        <iframe
          src={embedSrc}
          title={project.title}
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
          aria-label={`播放 ${project.title}`}
        >
          {project.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.cover}
              alt={project.title}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-background-soft text-muted">
              暂无封面
            </div>
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
