"use client";

import type { ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import { Bold, Italic, List, ListOrdered, Type, Underline } from "lucide-react";

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      title={label}
      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-accent-soft text-accent" : "text-ink-secondary hover:bg-subdued hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ editor, readOnly }: { editor: Editor | null; readOnly: boolean }) {
  if (!editor) {
    return <div className="h-12" />;
  }

  return (
    <div className="sticky top-28 z-30 mb-6 w-full">
      <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-canvas/95 p-1.5 shadow-[0_4px_16px_rgba(28,26,23,0.06)] backdrop-blur-md">
        <ToolButton
          label="Body"
          active={editor.isActive("paragraph") && !editor.isActive("heading")}
          disabled={readOnly}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Type className="h-[18px] w-[18px]" />
          <span className="ml-1 hidden font-medium sm:inline">Body</span>
        </ToolButton>
        <span className="mx-1 h-4 w-px bg-subdued" />
        <ToolButton
          label="Bold"
          active={editor.isActive("bold")}
          disabled={readOnly}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-[18px] w-[18px]" />
        </ToolButton>
        <ToolButton
          label="Italic"
          active={editor.isActive("italic")}
          disabled={readOnly}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-[18px] w-[18px]" />
        </ToolButton>
        <ToolButton
          label="Underline"
          active={editor.isActive("underline")}
          disabled={readOnly}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-[18px] w-[18px]" />
        </ToolButton>
        <span className="mx-1 h-4 w-px bg-subdued" />
        <ToolButton
          label="H1"
          active={editor.isActive("heading", { level: 1 })}
          disabled={readOnly}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </ToolButton>
        <ToolButton
          label="H2"
          active={editor.isActive("heading", { level: 2 })}
          disabled={readOnly}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolButton>
        <ToolButton
          label="Bullets"
          active={editor.isActive("bulletList")}
          disabled={readOnly}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-[18px] w-[18px]" />
        </ToolButton>
        <ToolButton
          label="Numbers"
          active={editor.isActive("orderedList")}
          disabled={readOnly}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-[18px] w-[18px]" />
        </ToolButton>
      </div>
    </div>
  );
}
