"use client";
import { useEffect, useMemo, useRef, useState } from "react";

const colorTagToCss: Record<string, string> = {
  "~e~": "#ef4444",
  "~o~": "#f59e0b",
  "~d~": "#fb923c",
  "~m~": "#9ca3af",
  "~q~": "#ffffff",
  "~t~": "#d1d5db",
  "~v~": "#111827",
  "~u~": "#ec4899",
  "~pa~": "#3b82f6",
  "~t1~": "#8b5cf6",
  "~t2~": "#fb923c",
  "~t3~": "#60a5fa",
  "~t4~": "#f59e0b",
  "~t5~": "#fbcfe8",
  "~t6~": "#10b981",
  "~t7~": "#1d4ed8",
  "~t8~": "#fca5a5",
};

const colorOptions: { label: string; tag: string }[] = [
  { label: "Red", tag: "~e~" },
  { label: "Yellow", tag: "~o~" },
  { label: "Orange", tag: "~d~" },
  { label: "Grey", tag: "~m~" },
  { label: "White", tag: "~q~" },
  { label: "Light Grey", tag: "~t~" },
  { label: "Black", tag: "~v~" },
  { label: "Pink", tag: "~u~" },
  { label: "Blue", tag: "~pa~" },
  { label: "Purple", tag: "~t1~" },
  { label: "Orange 2", tag: "~t2~" },
  { label: "Light Blue", tag: "~t3~" },
  { label: "Yellow 2", tag: "~t4~" },
  { label: "Light Pink", tag: "~t5~" },
  { label: "Green", tag: "~t6~" },
  { label: "Dark Blue", tag: "~t7~" },
  { label: "Light Reddish", tag: "~t8~" },
];

export default function SceneHelperPage() {
  const [sceneText, setSceneText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [lineColor, setLineColor] = useState("~pa~");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number>(-1);
  const [perLineColor, setPerLineColor] = useState<Record<number, string>>({});
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const title1 = "NEED HELP MAKING A SCENE?";
  const title2 = "USE BTSHT.DEV SCENE HELPER";
  const [typed1, setTyped1] = useState("");
  const [typed2, setTyped2] = useState("");
  const [typingLine, setTypingLine] = useState<1 | 2>(1);
  useEffect(() => {
    let i = 0;
    const id1 = setInterval(() => {
      i += 1;
      setTyped1(title1.slice(0, i));
      if (i >= title1.length) {
        clearInterval(id1);
        setTypingLine(2);
        let j = 0;
        const id2 = setInterval(() => {
          j += 1;
          setTyped2(title2.slice(0, j));
          if (j >= title2.length) clearInterval(id2);
        }, 25);
      }
    }, 25);
    return () => clearInterval(id1);
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [editorHeight, setEditorHeight] = useState<number | null>(null);
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    let line = parseFloat(cs.lineHeight);
    if (!Number.isFinite(line)) {
      const fs = parseFloat(cs.fontSize) || 16;
      line = fs * 1.5;
    }
    const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    const border = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
    const h = Math.round(line * 15 + pad + border);
    setEditorHeight(h);
  }, []);

  const lines = useMemo(() => sceneText.split("\n"), [sceneText]);

  useEffect(() => {
    if (selectedLine >= lines.length) setSelectedLine(-1);
  }, [lines.length, selectedLine]);

  const applyColor = () => {
    if (selectedLine === -1) {
      const mapping: Record<number, string> = {};
      lines.forEach((_, i) => (mapping[i] = lineColor));
      setPerLineColor(mapping);
    } else {
      setPerLineColor((prev) => ({ ...prev, [selectedLine]: lineColor }));
    }
  };

  const buildGeneratedCode = () => {
    const code = lines
      .map((content, i) => {
        const tag = perLineColor[i] ?? lineColor;
        const bOpen = bold ? "<b>" : "";
        const bClose = bold ? "</b>" : "";
        const iOpen = italic ? "<i>" : "";
        const iClose = italic ? "</i>" : "";
        const alignOpen = `<align="${textAlign}">`;
        const alignClose = "</align>";
        return `<font size="${fontSize}">${tag}${alignOpen}${bOpen}${iOpen}${content}${iClose}${bClose}${alignClose}</font>`;
      })
      .join("\n");
    setGeneratedCode(code);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="heading text-3xl md:text-4xl text-white mb-2 leading-tight">
          <span className="block" aria-label={title1}>
            {typed1}
            {typingLine === 1 && <span className="typing-caret">|</span>}
          </span>
          <span className="block text-rose-400" aria-label={title2}>
            {typed2}
            {typingLine === 2 && <span className="typing-caret">|</span>}
          </span>
        </h1>
        <p className="text-neutral-300">Cleaner UI, responsive layout, and a generate button that outputs font-sized lines.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <section className="rounded-2xl border border-white/10 bg-neutral-950/60 p-6 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
          <h2 className="heading text-xl text-white mb-4">Editor</h2>

          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">Scene Text</label>
            <div
              className="flex rounded-lg overflow-hidden border border-white/10 bg-neutral-900/70"
              style={{ height: editorHeight ?? undefined }}
            >
              <div className="w-12 shrink-0 bg-neutral-900/80 text-neutral-400 text-sm select-none border-r border-white/10 overflow-y-auto">
                {lines.map((_, i) => (
                  <div
                    key={i}
                    className={`px-2 py-1 cursor-pointer ${
                      selectedLine === i ? "bg-rose-900/40 text-rose-300" : "hover:bg-rose-900/20"
                    }`}
                    onClick={() => setSelectedLine(i)}
                    title={`Select line ${i + 1}`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                rows={15}
                value={sceneText}
                onChange={(e) => setSceneText(e.target.value)}
                placeholder="Type your scene text here..."
                className="flex-1 p-3 bg-transparent outline-none text-neutral-100 placeholder:text-neutral-500 resize-none overflow-y-auto leading-6"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3 mb-5">
            <div className="w-full sm:w-auto flex-1 min-w-[140px]">
              <label className="block text-sm font-medium mb-1">Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="control-select"
              >
                {[12,14,16,18,20,24,28,32,36,42,48,50].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-auto flex-1 min-w-[180px]">
              <label className="block text-sm font-medium mb-1">Line Color</label>
              <select
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                className="control-select"
              >
                {colorOptions.map((opt) => (
                  <option key={opt.tag} value={opt.tag}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-auto flex-1 min-w-[180px]">
              <label className="block text-sm font-medium mb-1">Alignment</label>
              <select
                value={textAlign}
                onChange={(e) => setTextAlign(e.target.value as any)}
                className="control-select"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setBold((b) => !b)}
                className={`control-btn ${bold ? "ring-1 ring-rose-500" : ""}`}
                title="Bold"
              >
                B
              </button>
              <button
                onClick={() => setItalic((b) => !b)}
                className={`control-btn italic ${italic ? "ring-1 ring-rose-500" : ""}`}
                title="Italic"
              >
                I
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium mb-1">Select Line to Color</label>
            <div className="flex gap-2">
              <select
                value={selectedLine}
                onChange={(e) => setSelectedLine(parseInt(e.target.value))}
                className="control-select flex-1"
              >
                <option value={-1}>All Lines</option>
                {lines.map((_, i) => (
                  <option key={i} value={i}>{`Line ${i + 1}`}</option>
                ))}
              </select>
              <button onClick={applyColor} className="primary-btn">Apply</button>
            </div>
          </div>

          <button onClick={buildGeneratedCode} className="primary-btn w-full">Generate Code</button>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="heading text-lg text-white">Preview</h3>
              <div className="text-xs text-neutral-400">Font: {fontSize}px • Align: {textAlign}</div>
            </div>
            <div
              className="rounded-lg border border-rose-900/40 bg-neutral-900/60 p-4"
              style={{ height: editorHeight ?? undefined }}
            >
              <div className="w-full h-full whitespace-pre-wrap break-words overflow-y-auto" style={{ textAlign, fontSize }}>
                {lines.map((content, i) => {
                  const color = perLineColor[i] ?? lineColor;
                  const cssColor = colorTagToCss[color] ?? "#ffffff";
                  return (
                    <div key={i} className={`${bold ? "font-extrabold" : ""} ${italic ? "italic" : ""}`} style={{ color: cssColor }}>
                      {content || "\u00A0"}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="heading text-lg text-white">Generated Code</h3>
              <span className="text-xs text-neutral-400">Click Generate to update</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-neutral-900/70 p-4 mb-3">
              <pre className="whitespace-pre-wrap break-words text-sm">{generatedCode || "Generated code will appear here..."}</pre>
            </div>
            <button onClick={copyToClipboard} className={`secondary-btn w-full ${copied ? "bg-green-700/70" : ""}`}>
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}