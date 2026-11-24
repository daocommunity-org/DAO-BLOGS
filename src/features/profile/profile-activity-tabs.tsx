"use client";

import { Tabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";

const tabClassName =
  "group relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-t-md px-1 pb-2 text-sm font-medium text-slate-300 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary data-active:font-semibold data-active:text-foreground motion-reduce:transition-none data-active:after:absolute data-active:after:inset-x-0 data-active:after:bottom-0 data-active:after:h-0.5 data-active:after:bg-primary";

const countClassName =
  "rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-slate-200 group-data-active:bg-primary/15 group-data-active:text-primary";

export function ProfileActivityTabs({
  likes,
  comments,
  likeCount,
  commentCount,
}: {
  likes: ReactNode;
  comments: ReactNode;
  likeCount: number;
  commentCount: number;
}) {
  return (
    <section className="w-full flex-1 flex flex-col">
      <Tabs.Root defaultValue="likes" className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-12 dashed-border-x flex-1 space-y-8">
        <Tabs.List aria-label="Profile activity" className="flex flex-wrap items-center gap-x-8 border-b border-border/40 pb-px">
          <Tabs.Tab value="likes" className={tabClassName}>
            Liked Articles <span className={countClassName}>{likeCount}</span>
          </Tabs.Tab>
          <Tabs.Tab value="comments" className={tabClassName}>
            Comments <span className={countClassName}>{commentCount}</span>
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="likes">{likes}</Tabs.Panel>
        <Tabs.Panel value="comments">{comments}</Tabs.Panel>
      </Tabs.Root>
    </section>
  );
}
