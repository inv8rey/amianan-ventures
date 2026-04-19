'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered, Quote, Code,
  Minus, Link2, Image as ImageIcon, Unlink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', class: 'text-primary underline' } }),
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing…' }),
    ],
    content: value,
    editorProps: {
      attributes: { class: 'tiptap prose-article min-h-[400px] px-1 focus:outline-none' },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  async function insertImage() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `content/${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('article-images')
        .upload(path, file)

      if (error) {
        toast.error('Image upload failed')
        return
      }

      const { data } = supabase.storage
        .from('article-images')
        .getPublicUrl(path)

      editor?.chain().focus().setImage({ src: data.publicUrl }).run()
    }
    input.click()
  }

  function addLink() {
    const url = window.prompt('Enter URL')
    if (!url) return
    editor?.chain().focus().setLink({ href: url }).run()
  }

  const ToolbarBtn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void
    active?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded text-sm transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded-lg border border-input bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border/40">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <span className="w-px h-5 bg-border/40 mx-1" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <span className="w-px h-5 bg-border/40 mx-1" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code block"
        >
          <Code className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Divider"
        >
          <Minus className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <span className="w-px h-5 bg-border/40 mx-1" />

        <ToolbarBtn onClick={addLink} active={editor.isActive('link')} title="Add link">
          <Link2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        {editor.isActive('link') && (
          <ToolbarBtn
            onClick={() => editor.chain().focus().unsetLink().run()}
            active={false}
            title="Remove link"
          >
            <Unlink className="h-3.5 w-3.5" />
          </ToolbarBtn>
        )}
        <ToolbarBtn onClick={insertImage} active={false} title="Insert image">
          <ImageIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>
      </div>

      {/* Editor */}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
