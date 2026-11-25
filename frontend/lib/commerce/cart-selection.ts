type SellerItem = { id: string; creatorId?: string | number | null };

export function sellerKey(item: SellerItem): string | null {
  const id = String(item.creatorId ?? "").trim();
  return id && id !== "0" ? id : null;
}

export function isSingleSeller(items: SellerItem[]): boolean {
  const seller = items[0] && sellerKey(items[0]);
  return !!seller && items.every(item => sellerKey(item) === seller);
}

export function toggleSellerItems<T extends SellerItem>(
  items: T[], selected: string[], targets: string[], checked: boolean,
): string[] {
  const valid = selected.filter(id => items.some(item => item.id === id));
  if (!checked) return valid.filter(id => !targets.includes(id));
  const next = [...new Set([...valid, ...targets])];
  const chosen = items.filter(item => next.includes(item.id));
  return isSingleSeller(chosen) ? chosen.map(item => item.id) : valid;
}
