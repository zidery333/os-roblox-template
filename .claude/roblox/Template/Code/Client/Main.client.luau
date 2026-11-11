--!strict
-- Client start. The client asks; the server decides.

local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Never wait for ever: a time limit, then one warning naming what's missing.
local remotes = ReplicatedStorage:WaitForChild("Remotes", 10)
if not remotes then
	warn("[Client] no Remotes folder after 10 seconds: is Code/Server/Main.server.luau running?")
end

print("[Client] ready")
