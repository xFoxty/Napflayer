-- leader key
vim.g.maplocalleader = " "
vim.g.mapleader = " "
local keymap = vim.keymap.set

-- 插入模式下的 jj 退出
keymap("i", "jj", "<Esc>")

-- 插入模式下移动光标
keymap("i", "<C-h>", "<Left>")
keymap("i", "<C-l>", "<Right>")
keymap("i", "<C-k>", "<Up>")
keymap("i", "<C-j>", "<Down>")

-- 移动选中文本 (上下移动行)
keymap("v", "<leader>j", ":m '>+1<CR>gv=gv")
keymap("v", "<leader>k", ":m '<-2<CR>gv=gv")
keymap("n", "<leader>j", ":m .+1<CR>==")
keymap("n", "<leader>k", ":m .-2<CR>==")

-- x 不剪切
keymap("n", "x", '"_x')
