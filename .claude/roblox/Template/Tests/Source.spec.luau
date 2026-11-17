-- Checks over the code itself, for mistakes a machine can catch. Each one used to be a line in the lessons;
-- now this test catches it instead. It works the same in a brand new game with no remotes yet.

local fs = require("@lune/fs")
local Net = require("../Code/Shared/Net")

-- Every .luau or .lua file under `dir`, as { path, text }. Specs and the test runner are left out: they name old
-- calls on purpose. Scripts pasted into Studio (Tests/*.studio.luau) are kept in.
local function sources(dir: string): { { path: string, text: string } }
	local found = {}
	local function walk(at: string)
		if not fs.isDir(at) then
			return
		end
		for _, name in fs.readDir(at) do
			local path = `{at}/{name}`
			if fs.isDir(path) then
				walk(path)
			elseif
				string.match(name, "%.luau?$")
				and not string.match(name, "%.spec%.luau?$")
				and name ~= "run.luau"
			then
				table.insert(found, { path = path, text = fs.readFile(path) })
			end
		end
	end
	walk(dir)
	return found
end

-- The code with comments taken out, and calls wrapped over several lines joined up, so each call reads as one
-- line: `x:WaitForChild(\n\t"Name"` becomes `x:WaitForChild("Name"`.
local function flatten(text: string): string
	text = string.gsub(text, "%-%-%[(=*)%[.-%]%1%]", "")
	text = string.gsub(text, "%-%-[^\n]*", "")
	text = string.gsub(text, "%(%s+", "(")
	text = string.gsub(text, ",%s+", ", ")
	text = string.gsub(text, "%s+%)", ")")
	return text
end

-- Old Roblox calls AI still writes (Lua patterns), with what to use instead. selene catches the old global ones
-- (`wait`, `spawn`, `delay`, `tick`, `elapsedTime`, `workspace:FindPartOnRay`), but not methods on a variable.
local OLD_CALLS = {
	{ ":connect%(", ":Connect(" },
	{ "%.connect%(", "signal:Connect(" },
	{ ":disconnect%(", ":Disconnect(" },
	{ ":wait%(", ":Wait(" },
	{ ":[Rr]emove%(%)", ":Destroy()" },
	{ "SetPrimaryPartCFrame", "PivotTo" },
	{ "GetPrimaryPartCFrame", "GetPivot" },
	{ "FindPartOnRay", "workspace:Raycast" },
	{ ":GetModelCFrame%(", "GetPivot" },
	{ ":GetModelSize%(", "GetExtentsSize" },
	{ ":MakeJoints%(", "WeldConstraint" },
	{ ":BreakJoints%(", "destroying the welds" },
	{ "%.RotVelocity%f[^%w_]", "AssemblyAngularVelocity" },
}
-- The old body movers, by exact name: "BodyColors" and "BodyFrontAttachment" are current. (A part's old `.Velocity`
-- isn't listed: the type check already rejects it, and a table of your own may have a Velocity field.)
for _, mover in
	{ "BodyVelocity", "BodyGyro", "BodyPosition", "BodyForce", "BodyAngularVelocity", "BodyThrust" }
do
	table.insert(
		OLD_CALLS,
		{ `"{mover}"`, "a mover constraint (LinearVelocity, AlignPosition, AlignOrientation)" }
	)
end

-- Ways of finding the Remotes folder. After it comes `:WaitForChild("Name")`, `:FindFirstChild("Name")` or
-- `.Name`, or the folder is kept in a variable.
local FOLDER_FORMS = {
	':WaitForChild%("Remotes"[^)]*%)',
	':FindFirstChild%("Remotes"%)',
	"%.Remotes%f[^%w_]",
}
local LOOKUP_METHODS = { WaitForChild = true, FindFirstChild = true }

-- Every remote name one file looks up, or an error naming the line this test can't follow.
local function remoteLookups(path: string, text: string): { string }
	local names = {}
	local folders = {} -- variable names that hold the Remotes folder
	for line in string.gmatch(flatten(text) .. "\n", "([^\n]*)\n") do
		local rest
		for _, form in FOLDER_FORMS do
			local _, stop = string.find(line, form)
			if stop then
				rest = string.sub(line, stop + 1)
				break
			end
		end
		if rest and not string.find(line, '%.Name = "Remotes"') then
			local method, name = string.match(rest, ':(%a+)%("([%w_]+)"')
			local dotted = string.match(rest, "^%.([%w_]+)")
			local kept = string.match(line, "^%s*local ([%w_]+)%s*[:=]")
				or string.match(line, "^%s*([%w_]+)%s*=")
			if method then
				assert(
					LOOKUP_METHODS[method],
					`{path} looks up a remote with :{method}, which this test can't read: {line}`
				)
				table.insert(names, name)
			elseif dotted then
				table.insert(names, dotted)
			elseif kept then
				if string.sub(kept, 1, 1) ~= "_" then -- a name starting with _ is never used
					folders[kept] = true
				end
			else
				error(`{path} finds the Remotes folder in a way this test can't follow: {line}`)
			end
		end
	end

	-- Every use of a folder variable must be a lookup this test can read, so a new form can't slip past.
	local flat = flatten(text)
	local noStrings = string.gsub(flat, '"[^"\n]*"', '""')
	for folder in folders do
		local uses = 0
		for _ in string.gmatch(noStrings, `%f[%w_]{folder}%f[^%w_]`) do
			uses += 1
		end
		local read = 0
		for _ in string.gmatch(flat, `local {folder}%s*[:=]`) do
			read += 1
		end
		for _ in string.gmatch(flat, `\n%s*{folder}%s*=`) do
			read += 1
		end
		for _ in string.gmatch(flat, `%f[%w_]{folder} and `) do
			read += 1
		end
		for _ in string.gmatch(flat, `not {folder}%f[^%w_]`) do
			read += 1
		end
		for _ in string.gmatch(flat, `if {folder} then`) do
			read += 1
		end
		for method, name in string.gmatch(flat, `%f[%w_]{folder}:(%a+)%("([%w_]+)"`) do
			assert(
				LOOKUP_METHODS[method],
				`{path} looks up a remote with {folder}:{method}, which this test can't read`
			)
			table.insert(names, name)
			read += 1
		end
		for name in string.gmatch(flat, `%f[%w_]{folder}%.([%w_]+)`) do
			table.insert(names, name)
			read += 1
		end
		assert(
			uses == read,
			`{path} uses its Remotes folder "{folder}" {uses} times, and this test can read only {read} of them: `
				.. 'look it up with :WaitForChild("Name") or :FindFirstChild("Name")'
		)
	end
	-- Any lookup cast to a remote type names a remote, whichever folder it starts from: the server's own `remotes`,
	-- or one found through a helper that waits with a time limit.
	for method, name in string.gmatch(flat, ':(%a+)%("([%w_]+)"[^"()]*%)%s*::%s*%a*Remote') do
		if LOOKUP_METHODS[method] then
			table.insert(names, name)
		end
	end
	-- Each name once, though two of the ways above can both find it.
	local once, seen = {}, {}
	for _, name in names do
		if not seen[name] then
			seen[name] = true
			table.insert(once, name)
		end
	end
	return once
end

-- Every name one file declares twice at its top level (`local function free` twice, or `local x` then `local function
-- x`): the second hides the first for everything written below it, and neither selene nor the type check says so.
local function doubledLocals(text: string): { string }
	local seen: { [string]: boolean } = {}
	local doubled = {}
	for line in string.gmatch(text .. "\n", "([^\n]*)\n") do
		local name = string.match(line, "^local function ([%w_]+)")
			or string.match(line, "^local ([%w_]+)[%s:=]")
		if name then
			if seen[name] then
				table.insert(doubled, name)
			end
			seen[name] = true
		end
	end
	return doubled
end

-- Every pair of paths under `dir` that differ only in capitals (`Util.luau` and `util.luau`). Linux keeps both,
-- but a Mac or Windows can only hold one, so the game would break there.
local function caseClashes(dir: string): { string }
	local seen: { [string]: string } = {}
	local clashes = {}
	local function walk(at: string)
		if not fs.isDir(at) then
			return
		end
		for _, name in fs.readDir(at) do
			local path = `{at}/{name}`
			local key = string.lower(path)
			if seen[key] and seen[key] ~= path then
				table.insert(clashes, `{seen[key]} and {path}`)
			end
			seen[key] = path
			if fs.isDir(path) then
				walk(path)
			end
		end
	end
	walk(dir)
	return clashes
end

-- Every line that hands two or more locals one `if` expression ending in a call: `local cf, size = if m then
-- m:GetBoundingBox() else ...` keeps only the call's first value, so `size` is nil or the fallback. Two expressions
-- (`local a, b = if x then 1 else 2, if y then 3 else 4`) are fine.
local function ifSplits(text: string): { string }
	local found = {}
	for line in string.gmatch(flatten(text) .. "\n", "([^\n]*)\n") do
		local targets, rest = string.match(line, "^%s*local ([^=]+)=%s*(if%f[^%w_].*)$")
		if targets and string.find(targets, ",") and not string.find(rest, ", if%f[^%w_]") then
			if string.find(rest, "then [^%s]-%b()%s+else") or string.find(rest, "else [^%s]-%b()%s*$") then
				table.insert(found, line)
			end
		end
	end
	return found
end

-- Every DataStore call one file makes that isn't inside a pcall: the call's line, or one of the two before it, holds
-- `pcall(` (`local ok, v = pcall(function()` then `return store:GetAsync(key)`). Lessons: "Wrap every DataStore call
-- in pcall", now a check.
local DATASTORE_CALLS = {
	"GetAsync",
	"SetAsync",
	"UpdateAsync",
	"RemoveAsync",
	"IncrementAsync",
	"GetSortedAsync",
	"MessageAsync",
	"StartSessionAsync",
}
local function bareStoreCalls(text: string): { string }
	local found = {}
	local lines = {}
	for line in string.gmatch(flatten(text) .. "\n", "([^\n]*)\n") do
		table.insert(lines, line)
	end
	for i, line in lines do
		for _, call in DATASTORE_CALLS do
			if string.find(line, `:{call}%(`) then
				local near = line .. (lines[i - 1] or "") .. (lines[i - 2] or "")
				if not string.find(near, "pcall%(") then
					table.insert(found, line)
				end
			end
		end
	end
	return found
end

-- Emoji (U+1F000 and up, four bytes in UTF-8): Roblox draws them as black boxes on many devices, so icons are
-- pictures. Plain text symbols (a star, a triangle) are fine.
local function emojis(text: string): { string }
	local found = {}
	for line in string.gmatch(text .. "\n", "([^\n]*)\n") do
		if string.find(line, "\240\159") then
			table.insert(found, line)
		end
	end
	return found
end

-- In Lune, `_G` set by a script isn't seen by the modules it requires, so a test switch put there is never read
-- (a test meant to try several versions ran the same one each time). Hand switches
-- through a small shared module's table instead. A `.studio.luau` (pasted into execute_luau, where `_G` carries a
-- helper from one call to the next) may use it.
local function globalTables(text: string): { string }
	local found = {}
	for line in string.gmatch(flatten(text) .. "\n", "([^\n]*)\n") do
		if string.find(line, "%f[%w_]_G%f[^%w_]") then
			table.insert(found, line)
		end
	end
	return found
end

local tests = {
	["no two files differ only in capitals"] = function()
		for _, dir in { "Code", "Tests" } do
			local clashes = caseClashes(dir)
			assert(#clashes == 0, `{table.concat(clashes, "; ")} differ only in capitals: rename one`)
		end
	end,

	["no file declares a top-level name twice"] = function()
		for _, file in sources("Code") do
			local doubled = doubledLocals(file.text)
			assert(
				#doubled == 0,
				`{file.path} declares {table.concat(doubled, ", ")} twice at its top level: rename the newer one`
			)
		end
		local caught = doubledLocals("local function free()\nend\nlocal x = 1\nlocal function free()\nend\n")
		assert(#caught == 1 and caught[1] == "free", "the check must catch a second local function")
	end,

	["no old Roblox calls in the code"] = function()
		local files = sources("Code")
		for _, file in sources("Tests") do
			table.insert(files, file)
		end
		for _, file in files do
			local text = flatten(file.text)
			for _, pair in OLD_CALLS do
				-- The pattern as plain text for the message: `:GetMass%(` reads as `:GetMass(`.
				local shown = string.gsub(string.gsub(pair[1], "%%f%b[]", ""), "%%(.)", "%1")
				assert(not string.find(text, pair[1]), `{file.path} uses {shown}: use {pair[2]}`)
			end
		end
	end,

	["every remote the code looks up is named in Net.luau"] = function()
		local named = {}
		for _, list in { Net.Events, Net.Functions } do
			for _, name in list do
				named[name] = true
			end
		end
		for _, file in sources("Code") do
			for _, name in remoteLookups(file.path, file.text) do
				assert(
					named[name],
					`{file.path} looks up remote "{name}", which isn't in Code/Shared/Net.luau`
				)
			end
		end
	end,

	["the remote check reads every way of looking one up"] = function()
		local sample = [[
local remotes = ReplicatedStorage:WaitForChild("Remotes") :: Folder
local a = remotes:WaitForChild("A") :: RemoteEvent
local b = (ReplicatedStorage:WaitForChild("Remotes") :: Folder):WaitForChild(
	"B"
) :: RemoteEvent
local c = ReplicatedStorage:FindFirstChild("Remotes"):FindFirstChild("C")
local d = ReplicatedStorage.Remotes.D
-- local e = remotes:WaitForChild("NotThis")
local _unused = ReplicatedStorage:WaitForChild("Remotes")
]]
		local got = remoteLookups("sample", sample)
		table.sort(got)
		assert(table.concat(got, " ") == "A B C D", `read {table.concat(got, " ")}`)
		local odd =
			pcall(remoteLookups, "odd", 'local r = ReplicatedStorage:WaitForChild("Remotes")\nfire(r["X"])\n')
		assert(not odd, "a lookup it can't read must fail, not pass unseen")

		-- The server's own folder, a helper that waits, a variable called Remotes, and `if x then`.
		local more = [[
local remotes = Instance.new("Folder")
local e = remotes:WaitForChild("E") :: RemoteEvent
local f = (waitFor(remotes, "x"):WaitForChild("F", 5) :: RemoteFunction?)
local Remotes = ReplicatedStorage:WaitForChild("Remotes", 10)
if Remotes then
	local g = Remotes:WaitForChild("G")
end
]]
		got = remoteLookups("more", more)
		table.sort(got)
		assert(table.concat(got, " ") == "E F G", `read {table.concat(got, " ")}`)
	end,

	["no remote is named twice in Net.luau"] = function()
		local seen = {}
		for _, list in { Net.Events, Net.Functions } do
			for _, name in list do
				assert(not seen[name], `Code/Shared/Net.luau lists "{name}" twice: the server would make two`)
				seen[name] = true
			end
		end
	end,

	["no Lune-run file uses _G (a required module never sees it)"] = function()
		local files = sources("Code")
		for _, file in sources("Tests") do
			if string.sub(file.path, -12) ~= ".studio.luau" then
				table.insert(files, file)
			end
		end
		for _, file in files do
			local found = globalTables(file.text)
			assert(
				#found == 0,
				`{file.path} uses _G, which the modules it requires never see in Lune: hand it through a shared module's table: {found[1]}`
			)
		end
		assert(#globalTables("_G.Variant = 2\n") == 1, "the check must catch _G")
		assert(
			#globalTables("-- _G in a comment\nlocal my_G = 1\n") == 0,
			"a comment or a longer name is fine"
		)
	end,

	["no two locals take one if expression that ends in a call"] = function()
		for _, file in sources("Code") do
			local found = ifSplits(file.text)
			assert(
				#found == 0,
				`{file.path} gives two locals one if expression with a call, which keeps only its first value: `
					.. `use a plain if block: {found[1]}`
			)
		end
		local caught =
			ifSplits("local cf, size = if m then m:GetBoundingBox() else CFrame.new(), Vector3.zero\n")
		assert(#caught == 1, "the check must catch a call inside a two-local if expression")
		local fine = ifSplits("local a, b = if x then f() else 0, if y then g() else 1\n")
		assert(#fine == 0, "two if expressions, one per local, are fine")
	end,

	["every DataStore call is inside a pcall"] = function()
		for _, file in sources("Code") do
			local found = bareStoreCalls(file.text)
			assert(
				#found == 0,
				`{file.path} calls a DataStore outside a pcall (an error there stops the whole thread): {found[1]}`
			)
		end
		local caught = bareStoreCalls("local v = store:GetAsync(key)\n")
		assert(#caught == 1, "the check must catch a bare GetAsync")
		local fine = bareStoreCalls("local ok, v = pcall(function()\n\treturn store:GetAsync(key)\nend)\n")
		assert(#fine == 0, "a GetAsync inside pcall(function() ... end) is fine")
	end,

	["no emoji in the code: icons are pictures"] = function()
		for _, file in sources("Code") do
			local found = emojis(file.text)
			assert(
				#found == 0,
				`{file.path} has an emoji (a black box on many devices): use an ImageLabel: {found[1]}`
			)
		end
		assert(#emojis('label.Text = "\240\159\148\165 hot"') == 1, "the check must catch an emoji")
		assert(#emojis('label.Text = "\226\152\133"') == 0, "a text star is fine")
		assert(#emojis('label.Text = "a \226\128\148 b"') == 0, "a dash is fine")
	end,

	["no Studio-only script lives under Code"] = function()
		-- Lessons: a .studio.luau copied under Code/ for Rojo to sync and then deleted left Rojo's server dead (paste it
		-- into execute_luau instead).
		local function walk(at: string)
			for _, name in fs.readDir(at) do
				local path = `{at}/{name}`
				if fs.isDir(path) then
					walk(path)
				else
					assert(
						string.sub(name, -12) ~= ".studio.luau",
						`{path} is a Studio-only script under Code/: keep it in Tests/ and paste it into execute_luau`
					)
				end
			end
		end
		if fs.isDir("Code") then
			walk("Code")
		end
	end,

	["no test waits on MoveToFinished or sets a Source with [[ ]]"] = function()
		-- Lessons: MoveToFinished:Wait() inside execute_luau timed the call out on a blocked character; a Script or
		-- LocalScript Source written [[ ... ]] ends early at an index like t[a[1]] (write [=[ ... ]=]).
		local files = sources("Code")
		for _, file in sources("Tests") do
			table.insert(files, file)
		end
		for _, file in files do
			local text = flatten(file.text)
			assert(
				not string.find(text, "MoveToFinished:Wait%("),
				`{file.path} waits on MoveToFinished: a blocked character never fires it; poll the distance instead`
			)
			assert(
				not string.find(text, "Source%s*=%s*%[%["),
				`{file.path} sets a Source with [[ ]]: write [=[ ]=], or an index like t[a[1]] ends the string early`
			)
		end
	end,
}

return tests
