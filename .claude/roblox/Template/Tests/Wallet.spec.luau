-- Tests for Code/Shared/Logic/Wallet. Each entry is one test.

local Wallet = require("../Code/Shared/Logic/Wallet")
local Economy = require("../Code/Shared/Config/Economy")

return {
	["adding coins works"] = function()
		assert(Wallet.add(10, 5) == 15, "10 + 5 should be 15")
	end,

	["coins never pass the cap"] = function()
		assert(Wallet.add(Economy.MaxCoins, 50) == Economy.MaxCoins, "should stop at MaxCoins")
	end,

	["you can't spend more than you have"] = function()
		assert(Wallet.canSpend(3, 5) == false, "3 coins can't buy a 5-coin thing")
	end,

	["spending takes the cost away"] = function()
		assert(Wallet.spend(10, 4) == 6, "10 - 4 should be 6")
	end,
}
