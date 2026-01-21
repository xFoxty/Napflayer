require("keymaps")
require("options")
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
	vim.fn.system({
		"git",
		"clone",
		"--filter=blob:none",
		"https://github.com/folke/lazy.nvim.git",
		"--branch=stable",
		lazypath,
	})
end
vim.opt.rtp:prepend(lazypath)
local servers = { "lua_ls", "vtsls" }

_G.LSP_SERVERS = servers
require("lazy").setup("plugins")

local capabilities = vim.lsp.protocol.make_client_capabilities()

local ok, cmp_lsp = pcall(require, "cmp_nvim_lsp")
if ok then
	capabilities = cmp_lsp.default_capabilities(capabilities)
end

_G.LSP_CAPABILITIES = capabilities

for _, server in ipairs(servers) do
	local config = {}
	local ok, custom_config = pcall(require, "lsp." .. server)
	if ok then
		config = custom_config
	end
	config.capabilities = _G.LSP_CAPABILITIES
	vim.lsp.config(server, config)
	vim.lsp.enable(server)
end

local builtin = require("telescope.builtin")
vim.keymap.set("n", "<leader>ff", builtin.find_files, { desc = "查找文件" })
vim.keymap.set("n", "<leader>fg", builtin.live_grep, { desc = "全文搜索" })
vim.keymap.set("n", "<leader>fb", builtin.buffers, { desc = "切换缓冲区" })
