--!strict
-- Client start. The client asks; the server decides.

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local _remotes = ReplicatedStorage:WaitForChild("Remotes")

print("[Client] ready")
