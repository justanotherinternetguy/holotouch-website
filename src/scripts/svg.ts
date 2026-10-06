const SVG = 'http://www.w3.org/2000/svg';

/** Makes an SVG element with the given attributes, appended to `parent` if given. */
export function el<K extends keyof SVGElementTagNameMap>(
    name: K, attrs: Record<string, string | number> = {}, parent?: Element | null
): SVGElementTagNameMap[K] {
    const node = document.createElementNS(SVG, name);
    for (const key in attrs) node.setAttribute(key, String(attrs[key]));
    if (parent) parent.appendChild(node);
    return node;
}
