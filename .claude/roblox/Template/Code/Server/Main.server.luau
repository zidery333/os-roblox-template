--!strict
-- Server start. Makes every remote listed in Shared/Net, so names can't drift.
-- The server decides everything that matters: coins, damage, saves.

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Net = require(ReplicatedStorage.Shared.Net)

local remotes = Instance.new("Folder")
remotes.Name = "Remotes"

for _, name in Net.Events do
	local event = Instance.new("RemoteEvent")
	event.Name = name
	event.Parent = remotes
end

for _, name in Net.Functions do
	local fn = Instance.new("RemoteFunction")
	fn.Name = name
	fn.Parent = remotes
end

remotes.Parent = ReplicatedStorage

print("[Server] ready")
