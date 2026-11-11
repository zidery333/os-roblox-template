--!strict
-- Every remote this game uses, in one place.
-- The server makes them all at start, and the client looks them up by these names.
-- Add a name here before using it anywhere else, and give it a handler on the server in the same change.
-- Example: Events = { "RequestSpend" }, handled in Code/Server with
-- (remotes:WaitForChild("RequestSpend") :: RemoteEvent).OnServerEvent:Connect(...)

return {
	Events = {} :: { string },
	Functions = {} :: { string },
}
