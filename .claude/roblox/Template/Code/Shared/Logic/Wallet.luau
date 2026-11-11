--!strict
-- Pure rules: no Roblox services, no instances.
-- That way the tests can run them without Roblox open.
-- Only require other plain modules, by relative path, like require("../Config/Economy").

local Economy = require("../Config/Economy")

local Wallet = {}

function Wallet.add(coins: number, amount: number): number
	assert(amount >= 0, "amount must not be negative")
	return math.min(coins + amount, Economy.MaxCoins)
end

function Wallet.canSpend(coins: number, cost: number): boolean
	return cost >= 0 and coins >= cost
end

function Wallet.spend(coins: number, cost: number): number
	assert(Wallet.canSpend(coins, cost), "not enough coins")
	return coins - cost
end

return Wallet
