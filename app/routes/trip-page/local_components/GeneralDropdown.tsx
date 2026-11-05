import type { SetURLSearchParams } from "react-router"
import { handleParamChange } from "~/utils/frontend-utils/search-param-utils"

const tripCategories = [
  "ADVENTURE",
  "CITY_BREAK",
  "BEACH",
  "MOUNTAIN",
  "CULTURAL",
  "CRUISE"
] as const

type TripCategory = (typeof tripCategories)[number]

const formatCategoryLabel = (category: TripCategory) =>
  category
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

export const GeneralDropdown = ({
  setSearchParams,
  searchParams
}: {
  setSearchParams: SetURLSearchParams
  searchParams: URLSearchParams
}) => {
  return (
    <select
      value={searchParams.get("category") || ""}
      onChange={(e) =>
        handleParamChange("category", e.target.value, setSearchParams)
      }
      className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl px-4 py-2.5 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
    >
      <option value="">All</option>
      {tripCategories.map((category) => (
        <option key={category} value={category}>
          {formatCategoryLabel(category)}
        </option>
      ))}
    </select>
  )
}
