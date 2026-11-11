-- Checks over the code itself, for mistakes a machine can catch. Each one used to be a line in the lessons;
-- now this test catches it instead. It works the same in a brand new game with no remotes yet.

local fs = require("@lune/fs")
local Net = require("../Code/Shared/Net")

-- Every .luau file under `dir`, as { path, text }. Specs and the test runner are left out: they name old calls on
-- purpose. Scripts pasted into Studio (Tests/*.studio.luau) are kept in.
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
				string.sub(name, -5) == ".luau"
				and string.sub(name, -10) ~= ".spec.luau"
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
	{ ":GetMass%(", "AssemblyMass" },
	{ ":GetModelCFrame%(", "GetPivot" },
	{ ":GetModelSize%(", "GetExtentsSize" },
	{ ":MakeJoints%(", "WeldConstraint" },
	{ ":BreakJoints%(", "destroying the welds" },
	{ '"Body[%a]+"', "a mover constraint (LinearVelocity, AlignPosition, AlignOrientation)" },
	{ "%.Velocity%f[^%w_]", "AssemblyLinearVelocity" },
	{ "%.RotVelocity%f[^%w_]", "AssemblyAngularVelocity" },
}

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
	local lineNumber = 0
	for line in string.gmatch(flatten(text) .. "\n", "([^\n]*)\n") do
		lineNumber += 1
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
					`{path}:{lineNumber} looks up a remote with :{method}, which this test can't read`
				)
				table.insert(names, name)
			elseif dotted then
				table.insert(names, dotted)
			elseif kept then
				if string.sub(kept, 1, 1) ~= "_" then -- a name starting with _ is never used
					folders[kept] = true
				end
			else
				error(`{path}:{lineNumber} finds the Remotes folder in a way this test can't follow: {line}`)
			end
		end
	end

	-- Every use of a folder variable must be a lookup this test can read, so a new form can't slip past.
	local flat = flatten(text)
	for folder in folders do
		local uses = 0
		for _ in string.gmatch(flat, `%f[%w_]{folder}%f[^%w_]`) do
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
	return names
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
	end,
}

return tests
