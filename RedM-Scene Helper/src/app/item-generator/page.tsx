"use client";
import { useEffect, useMemo, useState } from "react";

type Framework = "rsg" | "vorp" | "tpz";

type Item = {
  id: string;
  label: string;
  weight: string;
  desc: string;
  limit: string;
  type: string;
  decayTime: string;
  usable: boolean;
  unique: boolean;
  shouldClose: boolean;
  action: string;
  stackable: boolean;
  droppable: boolean;
};

export default function ItemGeneratorAndConverterPage() {
  const fullTitle = "REDM ITEM GENERATOR & CONVERTER";
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(fullTitle.slice(0, i));
      if (i >= fullTitle.length) clearInterval(id);
    }, 25);
    return () => clearInterval(id);
  }, []);

  const [activeTab, setActiveTab] = useState<"generator" | "converter">("generator");

  const [framework, setFramework] = useState<Framework>("vorp");
  const [aiLanguage, setAiLanguage] = useState("English");
  const [aiWeight, setAiWeight] = useState(false);
  const [aiDescription, setAiDescription] = useState(false);
  const [aiDegradation, setAiDegradation] = useState(false);
  const [aiAction, setAiAction] = useState(false);

  const [items, setItems] = useState<Item[]>([]);
  const addItem = () => {
    setItems((prev) => {
      const last = prev[prev.length - 1];
      const defaults: Item = {
        id: "",
        label: "",
        weight: last?.weight ?? "100",
        type: last?.type ?? (framework === "rsg" ? "item" : "item_standard"),
        decayTime: last?.decayTime ?? "0",
        limit: last?.limit ?? "10",
        usable: last?.usable ?? true,
        unique: last?.unique ?? false,
        shouldClose: last?.shouldClose ?? true,
        desc: last?.desc ?? "",
        action: last?.action ?? "EATABLE",
        stackable: last?.stackable ?? true,
        droppable: last?.droppable ?? true,
      };
      return [...prev, defaults];
    });
  };
  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        type: it.type || (framework === "rsg" ? "item" : "item_standard"),
      }))
    );
  }, [framework]);

  const [generatorOutput, setGeneratorOutput] = useState("");
  const [copied, setCopied] = useState<{ gen: boolean; conv: boolean }>({ gen: false, conv: false });

  const generateCode = () => {
    const itemsData = items
      .map((it) => ({
        id: it.id.trim(),
        label: it.label.trim(),
        weight: parseFloat(it.weight) || 0,
        description: it.desc.trim(),
        limit: parseInt(it.limit) || 0,
        type: (it.type || (framework === "rsg" ? "item" : "item_standard")).trim(),
        usable: !!it.usable,
        unique: !!it.unique,
        shouldClose: !!it.shouldClose,
        decayTime: parseInt(it.decayTime) || 0,
        action: it.action || "EATABLE",
        stackable: !!it.stackable,
        droppable: !!it.droppable,
      }))
      .filter((d) => d.id);

    if (itemsData.length === 0) {
      setGeneratorOutput("No valid items to generate.");
      return;
    }

    let out = "";
    if (framework === "rsg") {
      out += "-- Code generated for RSG (items.lua)\n\n";
      itemsData.forEach((item) => {
        out += `${item.id} = { name = '${item.id}', label = '${item.label}', weight = ${item.weight}, type = '${item.type}', image = '${item.id}.png', unique = ${item.unique}, useable = ${item.usable}, decay = ${item.decayTime > 0 ? item.decayTime : 'false'}, delete = true, shouldClose = ${item.shouldClose}, description = '${item.description}' },\n`;
      });
    } else if (framework === "vorp") {
      out += "-- Code generated for VORP (SQL)\n\n";
      itemsData.forEach((item) => {
        out += `INSERT INTO \`items\` (\`item\`, \`label\`, \`limit\`, \`can_remove\`, \`type\`, \`usable\`, \`groupId\`, \`metadata\`, \`desc\`, \`degradation\`, \`weight\`) VALUES ('${item.id}', '${item.label}', ${item.limit}, 1, '${item.type}', ${item.usable ? 1 : 0}, 1, '{}', '${item.description}', ${item.decayTime}, ${item.weight / 1000});\n`;
      });
    } else if (framework === "tpz") {
      out += "-- Code generated for TPZ (items_registrations.lua)\n\n";
      itemsData.forEach((item) => {
        out += `['${item.id}'] = {\n    label = '${item.label}',\n    weight = ${item.weight / 1000},\n    remove = ${item.usable ? 1 : 0},\n    description = '${item.description}',\n    action = '${item.action}',\n    stackable = ${item.stackable ? 1 : 0},\n    droppable = ${item.droppable ? 1 : 0},\n    closeInventory = ${item.shouldClose ? 1 : 0}\n},\n`;
      });
    }
    setGeneratorOutput(out);
  };

  const copyText = async (text: string, which: "gen" | "conv") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((c) => ({ ...c, [which]: true }));
      setTimeout(() => setCopied((c) => ({ ...c, [which]: false })), 1200);
    } catch {}
  };

  const [frameworkFrom, setFrameworkFrom] = useState<Framework>("rsg");
  const [frameworkTo, setFrameworkTo] = useState<Framework>("vorp");
  const [converterInput, setConverterInput] = useState("");
  const [converterOutput, setConverterOutput] = useState("");

  const convertCode = () => {
    const input = converterInput || "";
    const from = frameworkFrom;
    const to = frameworkTo;

    const sqlToItems = (text: string) => {
      const lines = text.split(/\r?\n/);
      const items: Array<{
        id: string;
        label: string;
        limit: number;
        type: string;
        usable: boolean;
        desc: string;
        degradation: number;
        weight: number;
      }> = [];
      const re = /VALUES\s*\(\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([^']*)'\s*,\s*(\d+)\s*,\s*\d+\s*,\s*'\{\}'\s*,\s*'([^']*)'\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)/i;
      lines.forEach((line) => {
        const m = line.match(re);
        if (m) {
          const [, id, label, limit, _canRemove, type, usable, desc, degradation, weightKg] = m;
          const weightGrams = Math.round(parseFloat(weightKg) * 1000);
          items.push({
            id,
            label,
            limit: parseInt(limit, 10),
            type,
            usable: Number(usable) === 1,
            desc,
            degradation: parseInt(degradation, 10),
            weight: weightGrams,
          });
        }
      });
      return items;
    };

    const itemsToRsgLua = (items: Array<any>) => {
      let out = "-- Converted from VORP to RSG (Lua)\n\n";
      items.forEach((item) => {
        const decayPart = item.degradation > 0 ? item.degradation : "false";
        out += `${item.id} = { name = '${item.id}', label = '${item.label}', weight = ${item.weight}, type = '${item.type || "item"}', image = '${item.id}.png', unique = false, useable = ${item.usable ? "true" : "false"}, decay = ${decayPart}, delete = true, shouldClose = true, description = '${item.desc || ""}' },\n`;
      });
      return out;
    };

    const rsgLuaToItems = (text: string) => {
      const lines = text.split(/\r?\n/);
      const items: Array<{
        id: string;
        label: string;
        weight: number;
        type: string;
        usable: boolean;
        desc: string;
        degradation: number;
        limit: number;
      }> = [];
      const re = /^\s*([a-zA-Z0-9_]+)\s*=\s*\{\s*name\s*=\s*'[^']*'\s*,\s*label\s*=\s*'([^']*)'\s*,\s*weight\s*=\s*([0-9.]+)\s*,\s*type\s*=\s*'([^']*)'\s*,\s*image\s*=\s*'[^']*'\s*,\s*unique\s*=\s*(true|false)\s*,\s*useable\s*=\s*(true|false)\s*,\s*decay\s*=\s*(false|[0-9.]+)\s*,\s*delete\s*=\s*(true|false)\s*,\s*shouldClose\s*=\s*(true|false)\s*,\s*description\s*=\s*'([^']*)'\s*\}\s*,?/i;
      lines.forEach((line) => {
        const m = line.match(re);
        if (m) {
          const [, id, label, weight, type, _unique, useable, decay, _del, _shouldClose, desc] = m;
          items.push({
            id,
            label,
            weight: parseFloat(weight) || 0,
            type,
            usable: useable === "true",
            desc,
            degradation: decay === "false" ? 0 : parseInt(decay, 10) || 0,
            limit: 10,
          });
        }
      });
      return items;
    };

    const itemsToVorpSql = (items: Array<any>) => {
      let out = "-- Converted from RSG (Lua) to VORP (SQL)\n\n";
      items.forEach((item) => {
        const weightKg = (item.weight || 0) / 1000;
        out += `INSERT INTO \`items\` (\`item\`, \`label\`, \`limit\`, \`can_remove\`, \`type\`, \`usable\`, \`groupId\`, \`metadata\`, \`desc\`, \`degradation\`, \`weight\`) VALUES ('${item.id}', '${item.label}', ${item.limit ?? 10}, 1, '${item.type || "item"}', ${item.usable ? 1 : 0}, 1, '{}', '${item.desc || ""}', ${item.degradation ?? 0}, ${weightKg});\n`;
      });
      return out;
    };

    let output = "";
    if (from === "vorp" && to === "rsg") {
      const items = sqlToItems(input);
      output = items.length ? itemsToRsgLua(items) : "No items detected in VORP SQL.";
    } else if (from === "rsg" && to === "vorp") {
      const items = rsgLuaToItems(input);
      output = items.length ? itemsToVorpSql(items) : "No items detected in RSG Lua.";
    } else {
      output = "Conversion not implemented for selected frameworks.";
    }

    setConverterOutput(output);
  };

  const isVorp = framework === "vorp";
  const isRsg = framework === "rsg";
  const isTpz = framework === "tpz";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header with typing animation */}
      <div className="text-center mb-8">
        <h1 className="heading text-3xl md:text-4xl text-white mb-2">
          {typed}
          <span className="typing-caret">|</span>
        </h1>
        <p className="text-neutral-300">Switch between Generator and Converter — styled to match the site's dark theme.</p>
      </div>

      <div className="mb-6 flex items-center justify-center gap-3">
        <button
          className={`px-4 py-2 rounded-2xl border transition ${
            activeTab === "generator"
              ? "bg-gradient-to-br from-rose-700 to-rose-500 text-white border-transparent"
              : "bg-neutral-900/70 text-neutral-200 border-white/10 hover:bg-neutral-900"
          }`}
          onClick={() => setActiveTab("generator")}
        >
          Item Generator
        </button>
        <button
          className={`px-4 py-2 rounded-2xl border transition ${
            activeTab === "converter"
              ? "bg-gradient-to-br from-rose-700 to-rose-500 text-white border-transparent"
              : "bg-neutral-900/70 text-neutral-200 border-white/10 hover:bg-neutral-900"
          }`}
          onClick={() => setActiveTab("converter")}
        >
          Item Converter
        </button>
      </div>

      {activeTab === "generator" ? (
        <section className="rounded-2xl border border-white/10 bg-neutral-950/60 p-6 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
          <header className="mb-6">
            <h2 className="heading text-xl text-white mb-1">BeTiuCia RedM Item Generator</h2>
            <p className="text-neutral-400">Tool for creating RedM items.</p>
          </header>

          <div className="flex flex-wrap gap-4 items-end mb-6">
            <div className="min-w-[220px]">
              <label htmlFor="framework-selector" className="block text-sm font-medium mb-1">Select Framework</label>
              <select
                id="framework-selector"
                className="control-select"
                value={framework}
                onChange={(e) => setFramework(e.target.value as Framework)}
              >
                <option value="rsg">RSG (items.lua)</option>
                <option value="vorp">VORP (SQL)</option>
                <option value="tpz">TPZ (items_registrations.lua)</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-4 items-end">
              <div className="min-w-[220px]">
                <label htmlFor="ai-language" className="block text-sm font-medium mb-1">Description Language</label>
                <select
                  id="ai-language"
                  className="control-select"
                  title="AI Language"
                  value={aiLanguage}
                  onChange={(e) => setAiLanguage(e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Português (Brasil)">Português (Brasil)</option>
                  <option value="Español">Español</option>
                  <option value="Deutsch">Deutsch (German)</option>
                  <option value="Français">Français (French)</option>
                  <option value="Italiano">Italiano (Italian)</option>
                  <option value="Русский">Русский (Russian)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-neutral-200">
                <input id="ai-weight" type="checkbox" className="scale-110" checked={aiWeight} onChange={(e) => setAiWeight(e.target.checked)} /> AI Weight
              </label>
              <label className="flex items-center gap-2 text-neutral-200">
                <input id="ai-description" type="checkbox" className="scale-110" checked={aiDescription} onChange={(e) => setAiDescription(e.target.checked)} /> AI Description
              </label>
              {!isTpz && (
                <label className="flex items-center gap-2 text-neutral-200" id="ai-degradation-group">
                  <input id="ai-degradation" type="checkbox" className="scale-110" checked={aiDegradation} onChange={(e) => setAiDegradation(e.target.checked)} /> AI Degradation
                </label>
              )}
              {isTpz && (
                <label className="flex items-center gap-2 text-neutral-200" id="ai-action-group">
                  <input id="ai-action" type="checkbox" className="scale-110" checked={aiAction} onChange={(e) => setAiAction(e.target.checked)} /> AI Action
                </label>
              )}
            </div>

            <button id="add-item-btn" className="primary-btn px-4 py-2 w-auto" onClick={addItem}>+ Add Item</button>
          </div>

          <div id="items-container" className="space-y-4">
            {items.map((it, idx) => (
              <div key={idx} className="item-form bg-neutral-900/60 border border-white/10 border-l-4 border-l-rose-600 rounded-2xl p-4">
                <div className="item-form-header flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Item #{idx + 1}</h3>
                  <button className="secondary-btn py-1 px-3" onClick={() => removeItem(idx)}>– Remove</button>
                </div>
                <div className="item-form-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Item ID (no spaces)</label>
                    <input type="text" className="w-full rounded-lg p-2 bg-neutral-950/60 border border-white/10 text-neutral-100" value={it.id} onChange={(e) => setItems((arr) => arr.map((v, i) => i === idx ? { ...v, id: e.target.value } : v))} placeholder="item_id" />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Display Name (Label)</label>
                    <input type="text" className="w-full rounded-lg p-2 bg-neutral-950/60 border border-white/10 text-neutral-100" value={it.label} onChange={(e) => setItems((arr) => arr.map((v, i) => i === idx ? { ...v, label: e.target.value } : v))} placeholder="Item Name (e.g., Boar Meat)" />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Weight (in grams)</label>
                    <input type="number" className="w-full rounded-lg p-2 bg-neutral-950/60 border border-white/10 text-neutral-100" value={it.weight} onChange={(e) => setItems((arr) => arr.map((v, i) => i === idx ? { ...v, weight: e.target.value } : v))} />
                  </div>
                  <div className="form-group sm:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input type="text" className="w-full rounded-lg p-2 bg-neutral-950/60 border border-white/10 text-neutral-100" value={it.desc} onChange={(e) => setItems((arr) => arr.map((v, i) => i === idx ? { ...v, desc: e.target.value } : v))} placeholder="A brief description..." />
                  </div>

                  {isVorp && (
                    <div className="form-group vorp-only-option">
                      <label className="block text-sm font-medium mb-1">Limit (Stack)</label>
                      <input type="number" className="w-full rounded-lg p-2 bg-neutral-950/60 border border-white/10 text-neutral-100" value={it.limit} onChange={(e) => setItems((arr) => arr.map((v, i) => i === idx ? { ...v, limit: e.target.value } : v))} />
                    </div>
                  )}

                  {!isTpz && (
                    <>
                      <div className="form-group not-tpz-option">
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <input type="text" className="w-full rounded-lg p-2 bg-neutral-950/60 border border-white/10 text-neutral-100" value={it.type} onChange={(e) => setItems((arr) => arr.map((v, i) => i === idx ? { ...v, type: e.target.value } : v))} />
                      </div>
                      <div className="form-group not-tpz-option">
                        <label className="block text-sm font-medium mb-1">Degradation Time (min)</label>
                        <input type="number" className="w-full rounded-lg p-2 bg-neutral-950/60 border border-white/10 text-neutral-100" value={it.decayTime} onChange={(e) => setItems((arr) => arr.map((v, i) => i === idx ? { ...v, decayTime: e.target.value } : v))} />
                      </div>
                    </>
                  )}

                  {isTpz && (
                    <div className="form-group tpz-only-option">
                      <label className="block text-sm font-medium mb-1">Action</label>
                      <select className="w-full rounded-lg p-2 bg-neutral-950/60 border border-white/10 text-neutral-100" value={it.action} onChange={(e) => setItems((arr) => arr.map((v, i) => i === idx ? { ...v, action: e.target.value } : v))}>
                        <option>USABLE</option>
                        <option>EATABLE</option>
                        <option>DRINKABLE</option>
                        <option>SMOKABLE</option>
                        <option>NONE</option>
                      </select>
                    </div>
                  )}

                  <div className="checkbox-group form-field">
                    <label className="flex items-center gap-2 text-neutral-200">
                      <input type="checkbox" className="scale-110 item-usable" checked={it.usable} onChange={(e) => setItems((arr) => arr.map((v, i) => i === idx ? { ...v, usable: e.target.checked } : v))} />
                      <span className="item-usable-label">{isTpz ? "Remove on Use?" : "Is Usable?"}</span>
                    </label>
                  </div>

                  {isRsg && (
                    <div className="checkbox-group form-field rsg-only-option">
                      <label className="flex items-center gap-2 text-neutral-200">
                        <input type="checkbox" className="scale-110 item-unique" checked={it.unique} onChange={(e) => setItems((arr) => arr.map((v, i) => i === idx ? { ...v, unique: e.target.checked } : v))} />
                        <span>Is Unique?</span>
                      </label>
                    </div>
                  )}

                  {(isRsg || isTpz) && (
                    <div className="checkbox-group form-field rsg-only-option tpz-flex-option">
                      <label className="flex items-center gap-2 text-neutral-200">
                        <input type="checkbox" className="scale-110 item-should-close" checked={it.shouldClose} onChange={(e) => setItems((arr) => arr.map((v, i) => i === idx ? { ...v, shouldClose: e.target.checked } : v))} />
                        <span>Close on Use?</span>
                      </label>
                    </div>
                  )}

                  {isTpz && (
                    <>
                      <div className="checkbox-group form-field tpz-flex-option">
                        <label className="flex items-center gap-2 text-neutral-200">
                          <input type="checkbox" className="scale-110 item-stackable" checked={it.stackable} onChange={(e) => setItems((arr) => arr.map((v, i) => i === idx ? { ...v, stackable: e.target.checked } : v))} />
                          <span>Stackable?</span>
                        </label>
                      </div>
                      <div className="checkbox-group form-field tpz-flex-option">
                        <label className="flex items-center gap-2 text-neutral-200">
                          <input type="checkbox" className="scale-110 item-droppable" checked={it.droppable} onChange={(e) => setItems((arr) => arr.map((v, i) => i === idx ? { ...v, droppable: e.target.checked } : v))} />
                          <span>Droppable?</span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button id="generate-code-btn" className="primary-btn w-full mb-3" onClick={generateCode}>GENERATE CODE</button>
            <div className="rounded-2xl border border-white/10 bg-neutral-900/70 p-4">
              <label htmlFor="output-code-generator" className="block text-sm font-medium mb-2">Generated Code</label>
              <textarea
                id="output-code-generator"
                className="w-full rounded-lg p-3 bg-neutral-950/60 border border-white/10 text-neutral-100 resize-none"
                rows={15}
                placeholder="Your generated code will appear here..."
                value={generatorOutput}
                onChange={(e) => setGeneratorOutput(e.target.value)}
                readOnly={false}
              />
              <button
                id="copy-btn-generator"
                className={`secondary-btn w-full mt-3 ${copied.gen ? "bg-green-700/70" : ""}`}
                onClick={() => copyText(generatorOutput, "gen")}
              >
                {copied.gen ? "Copied!" : "Copy Code"}
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-white/10 bg-neutral-950/60 p-6 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
          <header className="mb-6">
            <h2 className="heading text-xl text-white mb-1">Item Converter</h2>
          </header>

          {/* Direction controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="framework-from" className="block text-sm font-medium mb-1">From Framework</label>
              <select id="framework-from" className="control-select" value={frameworkFrom} onChange={(e) => setFrameworkFrom(e.target.value as Framework)}>
                <option value="rsg">RSG (Lua)</option>
                <option value="vorp">VORP (SQL)</option>
                <option value="tpz">TPZ (Lua)</option>
              </select>
            </div>
            <div>
              <label htmlFor="framework-to" className="block text-sm font-medium mb-1">To Framework</label>
              <select id="framework-to" className="control-select" value={frameworkTo} onChange={(e) => setFrameworkTo(e.target.value as Framework)}>
                <option value="rsg">RSG (Lua)</option>
                <option value="vorp">VORP (SQL)</option>
                <option value="tpz">TPZ (Lua)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label id="input-code-label" htmlFor="input-code" className="block text-sm font-medium mb-2">From</label>
              <textarea
                id="input-code"
                className="w-full rounded-lg p-3 bg-neutral-950/60 border border-white/10 text-neutral-100"
                rows={15}
                value={converterInput}
                onChange={(e) => setConverterInput(e.target.value)}
              />
            </div>
            <div>
              <label id="output-code-label" htmlFor="output-code-converter" className="block text-sm font-medium mb-2">To</label>
              <textarea
                id="output-code-converter"
                className="w-full rounded-lg p-3 bg-neutral-950/60 border border-white/10 text-neutral-100"
                rows={15}
                value={converterOutput}
                readOnly
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button id="convert-btn" className="primary-btn w-full sm:w-auto px-6 py-3" onClick={convertCode}>CONVERT CODE</button>
            <button
              id="copy-btn-converter"
              className={`secondary-btn w-full sm:w-auto px-6 py-3 ${copied.conv ? "bg-green-700/70" : ""}`}
              onClick={() => copyText(converterOutput, "conv")}
            >
              {copied.conv ? "Copied!" : "Copy Converted Code"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}