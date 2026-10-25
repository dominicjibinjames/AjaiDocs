"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { DocumentEditor } from "./document-editor";

const Editor = dynamic(() => import("./document-editor").then((mod) => mod.DocumentEditor), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-surface pt-16">
      <div className="h-16 bg-surface/90" />
      <div className="mx-auto mt-10 h-[70vh] w-full max-w-[840px] animate-pulse rounded-2xl bg-canvas" />
    </div>
  ),
});

export function DocumentEditorLoader(props: ComponentProps<typeof DocumentEditor>) {
  return <Editor {...props} />;
}
