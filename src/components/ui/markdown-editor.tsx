"use client";

import { useState } from "react";
import { Button } from "./button";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import MarkdownRenderer from "./markdown-renderer";

// Simple textarea component with split view
function SimpleTextareaEditor({
  value,
  onChange,
  placeholder,
  error,
  disabled,
  height,
  showPreview,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  height?: number;
  showPreview?: boolean;
}) {
  const previewMode = showPreview || false;

  if (previewMode) {
    return (
      <div className={`border rounded-md ${error ? "border-red-500" : "border-gray-300"}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ height: height ? `${height}px` : '400px' }}>
          {/* Editor Side */}
          <div className="border-r border-gray-300">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
              <span className="text-sm font-medium text-gray-700">Edit</span>
            </div>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full h-full p-3 resize-none focus:outline-none bg-transparent"
              style={{ height: 'calc(100% - 36px)' }}
            />
          </div>
          {/* Preview Side */}
          <div>
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
              <span className="text-sm font-medium text-gray-700">Preview</span>
            </div>
            <div
              className="p-4 overflow-y-auto bg-white"
              style={{ height: 'calc(100% - 36px)' }}
            >
              <MarkdownRenderer content={value} className="prose prose-sm max-w-none" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-md ${error ? "border-red-500" : "border-gray-300"}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{ height: height ? `${height}px` : '400px' }}
        className="w-full p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
      />
    </div>
  );
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  height?: number;
  hidePreview?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Enter product description in Markdown format...",
  error,
  disabled = false,
  height = 400,
  hidePreview = false,
}: MarkdownEditorProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [showPreview, setShowPreview] = useState(!hidePreview);

  const markdownHelp = `
## Markdown Cheatsheet

### Text Formatting
- **Bold text**: \`**text**\`
- *Italic text*: \`*text*\`
- ~~Strikethrough~~: \`~~text~~\`
- \`Inline code\`: \\\`code\\\`

### Headers
- # H1 Header
- ## H2 Header
- ### H3 Header

### Lists
- Bullet list: \`- Item\`
- Numbered list: \`1. Item\`
- Nested list: \`  - Sub item\`

### Links & Images
- Link: \`[Text](url)\`
- Image: \`![Alt text](image-url)\`

### Other Elements
- Blockquote: \`> Quote\`
- Horizontal rule: \`---\`
- Code block: \\\`\\\`\\\`language\ncode\n\\\`\\\`\\\`

### Tables
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
  `;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Description *</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="h-6 w-6 p-0"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
        {!hidePreview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Show Preview
              </>
            )}
          </Button>
        )}
      </div>

      {showHelp && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="font-medium text-sm mb-2">Markdown Help:</h4>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
            {markdownHelp}
          </pre>
        </div>
      )}

      <SimpleTextareaEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        height={height}
        showPreview={showPreview}
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="text-xs text-gray-500">
        Use Markdown syntax for rich text formatting. Supports bold, italic, lists, links, images, tables, and code blocks.
      </div>
    </div>
  );
}