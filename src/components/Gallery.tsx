"use client";

import { useState } from "react";
import { Project } from "@/lib/projects";

/**
 * 纯图片作品：多张图横向滚动。点击图片可放大到全屏灯箱。
 */
export function Gallery({ project }: { project: Project }) {
  const [zoom, setZoom] = useState<string | null>(null);

  if (project.images.length === 0) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-xl bg-background-soft ring-1 ring-[var(--border)]">
        <span className="text-sm tracking-wide text-muted">无可展示图片</span>
      </div>
    );
  }

  return (
    <>
      <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:mx-0 md:px-0">
        {project.images.map((src, i) => (
          <button
            key={src}
            onClick={() => setZoom(src)}
            className="media-zoom w-[85%] flex-none cursor-zoom-in snap-start overflow-hidden rounded-xl bg-card ring-1 ring-[var(--border)] sm:w-[70%] md:w-[72%]"
            aria-label={`查看 ${project.title} 第 ${i + 1} 张图`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${project.title} ${i + 1}`}
              className="aspect-video h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* 灯箱 */}
      {zoom && (
        <div
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoom}
            alt={project.title}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </>
  );
}
