-- Runs every *.spec.luau in Tests/ and its subfolders with Lune, without Roblox open.
-- Run from the game's folder: lune run Tests/run.luau
-- A spec returns a table of named test functions. Two tests with one name would drop the first: selene's
-- duplicate_keys lint catches that, since ./check.sh lints Tests too.

local fs = require("@lune/fs")
local process = require("@lune/process")

local passed, failed = 0, 0

-- Spec paths under Tests/, like "Grid.spec.luau" or "Rules/Grid.spec.luau", sorted.
local function specs(): { string }
	local found = {}
	local function walk(dir: string, prefix: string)
		for _, name in fs.readDir(dir) do
			local path = `{dir}/{name}`
			if fs.isDir(path) then
				walk(path, `{prefix}{name}/`)
			elseif string.sub(name, -10) == ".spec.luau" then
				table.insert(found, prefix .. name)
			end
		end
	end
	walk("Tests", "")
	table.sort(found)
	return found
end

for _, file in specs() do
	local stem = string.sub(file, 1, -6)
	local ok, tests = pcall(function()
		return require("./" .. stem)
	end)
	if not ok then
		failed += 1
		print(`  FAIL  {file} would not load: {tests}`)
		continue
	end
	if type(tests) ~= "table" then
		failed += 1
		print(`  FAIL  {file} must return a table of tests, and returned {typeof(tests)}`)
		continue
	end
	local names = {}
	for name, test in tests do
		if type(test) == "function" then
			table.insert(names, name)
		else
			failed += 1
			print(`  FAIL  {stem}: {name} is a {typeof(test)}, not a test function`)
		end
	end
	if #names == 0 then
		failed += 1
		print(`  FAIL  {file} has no tests in it`)
	end
	table.sort(names)
	for _, name in names do
		local good, err = pcall(tests[name])
		if good then
			passed += 1
		else
			failed += 1
			print(`  FAIL  {stem}: {name}\n        {err}`)
		end
	end
end

if passed + failed == 0 then
	failed += 1
	print("  FAIL  no tests found in Tests/")
end

print(`  {passed} passed, {failed} failed`)
if failed > 0 then
	process.exit(1)
end
-- No exit when all passed: an error inside a thread a test started (task.spawn, task.delay) can't be caught
-- here, but Lune prints it and ends with a failure once the script ends on its own.
