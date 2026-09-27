import { redirect } from "next/navigation"

export default function LegacyProductPage() {
  redirect("/product?id=1")
}
