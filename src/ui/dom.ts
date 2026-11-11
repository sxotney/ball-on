// Tiny element builder: h('button', { class: 'x', onclick: fn, disabled: true }, 'Text').
type Attr = string | number | boolean | undefined | null | ((e: Event) => void);
type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, Attr> = {},
  ...children: (Child | Child[])[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (typeof value === 'function') node.addEventListener(key.slice(2), value as EventListener);
    else if (value === true) node.setAttribute(key, '');
    else node.setAttribute(key, String(value));
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child);
  }
  return node;
}

export const clear = (el: HTMLElement): void => el.replaceChildren();
