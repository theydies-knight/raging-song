import * as ExternalPlugin from "./.quartz/plugins"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

ExternalPlugin.Explorer({
  sortFn: (a, b) => {
    if (a.isFolder !== b.isFolder) {
      return a.isFolder ? -1 : 1
    }

    const aName = a.displayName ?? ""
    const bName = b.displayName ?? ""
    const compareNames = () =>
      aName.localeCompare(bName, undefined, { numeric: true, sensitivity: "base" })

    if (a.isFolder) {
      return compareNames()
    }

    const aDate = a.data?.["explorer:frontmatterDate"]
    const bDate = b.data?.["explorer:frontmatterDate"]
    if (typeof aDate === "number" && typeof bDate === "number" && aDate !== bDate) {
      return bDate - aDate
    }
    if (typeof aDate === "number") return -1
    if (typeof bDate === "number") return 1
    return compareNames()
  },
})

const config = await loadQuartzConfig()
config.plugins.transformers.push({
  name: "explorer-frontmatter-date",
  extendContentIndex: ({ fileData }) => {
    const frontmatter = fileData.frontmatter
    if (typeof frontmatter !== "object" || frontmatter === null) return

    const date =
      (frontmatter as Record<string, unknown>).date ??
      (frontmatter as Record<string, unknown>).created
    const timestamp =
      date instanceof Date ? date.getTime() : typeof date === "string" ? Date.parse(date) : NaN

    if (Number.isFinite(timestamp)) {
      return { "explorer:frontmatterDate": timestamp }
    }
  },
})

export default config
export const layout = await loadQuartzLayout()
