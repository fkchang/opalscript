# OpalScript design

**This is experimental and will break (lots probably)**.

Working design docs - will be updated/amended/replaced/scrapped/thrown away etc.

### Nil compiles to native null

* Can no longer send methods to nil (all methods to nil will raise an exception)
* Ruby falsyness extended to javascript falsyness (0, "", [], false, null)

### No operator overloading

* Due to native nil/null, `==` must also be a native operator (cannot overwrite ==)

## Differences

### Language

* No operator overloading (+, -, /, *, ==, <, <=, >, >= all compile into native js operators)
* indexing works same as expected ([] and []= are real methods)
* nil is compiled directly to null (can no longer send methods to nil)
* no method missing at all (javascript proxys maybe?)
* to_s method calls always compiled to toString() to be native (ish)
* ConstantName.new() compiles into `new ContantName()`
* globals compile to javascript references (e.g., `$window` compiles to `window` so you can reference window object)
* `::` method calls are native property access (e.g. `[1, 2, 3]::length` => `[1, 2, 3].length` in js)
* last two allow us to do this: `$document::getElementById 'foo'` for a nicer js interaction (instead of x-strings)
* truthyness will now just mirror javascript (falsy values: false, nil/null, 0, [] etc) - cleaner generated code
* Blocks should be passed as normal arguments (as last arg)

### Hash

* Only strings as keys (hash is internally just a js object). All other keys are traversed to strings

### Symbols

* Do not exist (same as opal)

## Status

* Generator outputs 'null' for nil
* Generator now uses js truthy tests for if statements, && expressions and || expressions
* Parser now outputs all operators (+, -, /, *, <, <=, >=, >, ==, ===) as native js operators
* Gvars now compile into direct js variables (e.g. `$foo` compiles into `foo`)
* Blocks and block_pass are now passed as last arguments to methods (just a normal argument..)