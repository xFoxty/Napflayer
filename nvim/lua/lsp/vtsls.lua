return {
	root_markers = { "package.json", "tsconfig.json", "jsconfig.json", ".git" },
	settings = {
		typescript = {
			updateImportsOnFileMove = { enabled = "always" },
			suggest = { completeFunctionCalls = true },
		},
		javascript = {
			updateImportsOnFileMove = { enabled = "always" },
			suggest = { completeFunctionCalls = true },
		},
	},
}
