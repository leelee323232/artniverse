export async function updateCommissionSortOrder(id: string, sortOrder: number): Promise<void> {
  await fetch(`/api/commission-requests/${id}/sort-order`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sortOrder }),
  })
}
