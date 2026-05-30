// Localize Western digits (0-9) to Arabic-Indic numerals (٠-٩) for display.

const AR = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicDigits(input: string): string {
  return input.replace(/[0-9]/g, (d) => AR[+d]);
}

// Elements whose text must stay in Latin script (brand name, urls, code…).
const SKIP_TAGS = new Set(["INPUT", "TEXTAREA", "SCRIPT", "STYLE", "CODE", "PRE"]);

function shouldSkip(node: Node): boolean {
  let el: Node | null = node;
  while (el) {
    if (el.nodeType === Node.ELEMENT_NODE) {
      const e = el as Element;
      if (SKIP_TAGS.has(e.tagName)) return true;
      if (e.hasAttribute("data-latin")) return true;
      if ((e as HTMLElement).isContentEditable) return true;
    }
    el = el.parentNode;
  }
  return false;
}

function localizeTextNode(node: Text) {
  const v = node.nodeValue;
  if (!v || !/[0-9]/.test(v)) return;
  if (shouldSkip(node)) return;
  node.nodeValue = toArabicDigits(v);
}

function walk(root: Node) {
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = tw.nextNode())) nodes.push(n as Text);
  for (const t of nodes) localizeTextNode(t);
}

/** Start a MutationObserver that keeps all rendered numbers in Arabic-Indic. */
export function startArabicNumerals(): () => void {
  walk(document.body);
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "characterData" && m.target.nodeType === Node.TEXT_NODE) {
        localizeTextNode(m.target as Text);
      }
      m.addedNodes.forEach((added) => {
        if (added.nodeType === Node.TEXT_NODE) localizeTextNode(added as Text);
        else if (added.nodeType === Node.ELEMENT_NODE) walk(added);
      });
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  });
  return () => observer.disconnect();
}
