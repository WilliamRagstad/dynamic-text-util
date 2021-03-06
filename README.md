# Dynamic Text Utility
A utility program for developers and authors for dynamic updates to static files.

This terminal utility program is built on top of the Deno API.
It takes a file that shall be compiled and a source script
that contains all function mappings for each template string.
It then compiles the template strings and outputs the result
to the console.

It is intended to be used as a CLI utility for developers
and authors in build scripts to automate the process of
updating relevant dynamic information.

## Usage

Create a copy of the file that you want to make dynamic.
By simply adding `%{{ ... }}` to the parts that may change and need to be frequently updated, we can write JavaScript expressions inline or in a separate source file. In combination with this, a simple build-script can automatically update the file with the latest information at any time.

Blocks are also supported, using `%{{{ ... }}}` syntax. This is the same as `%{{ { ... } }}` which is translated into `() => { ... }` when compiled and runned.

Template expressions can also be escaped using `\%{{ ... }}` which ignores the whole block and just outputs the string literally as `%{{ ... }}`.
This is useful in case you want to use a template expression in a string that is not a template expression itself.
Some programming languages may use the same syntax of `%{{ ... }}` for something else, hence the support to escape the template expression.

### Inline Expressions

This tool allows you to write JavaScript expressions inline in any file.

`README.md`
```md
# Example Markdown
The meaning of life is %{{ 7 * Math.sqrt(9) * 2 }}.
```

### Block Expressions

Similarly, you can write JavaScript expressions in a block.

`README.md`
```md
# Example Markdown
The meaning of life is %{{{
  let x = 7;
  let y = Math.sqrt(9);
  return x * y * 2
}}}.
```

### Source Functions

To not have to write the same JavaScript expressions over and over again, you can write them in a separate file and link it when compiling the template.

`README.md`
```md
# Example Markdown
The meaning of life is %{{ answer }}.
```

And then link it to the source file:

`source.ts`
```ts
export function answer() {
  return 7 * Math.sqrt(9) * 2;
}
```

The syntax to simply reference the function in `%{{ answer }}` is syntactic sugar for calling the function with no arguments `%{{ answer() }}`. This is useful if you want to use the same function in multiple places.
This is a quality of life feature that is custom to this tool.
The motivation for this is that functions should always be called in template strings.

### Other Properties

Everything exported from the source file will be available in the template.
Only reference their name:

`source.ts`
```ts
export const name = 'Deno';
export const version = Deno.version.deno;
export const link = 'https://deno.land/';
```

`README.md`
```md
# Example Markdown
This is an example of a some dynamic text.
We use the %{{ name }} framework version %{{ version }}, get the latest version at %{{ link }}!
```

## More Examples
More examples can be found in the `examples` folder in the repository.

## Build-Script Example
```bash
deno run -A cli.ts -f ./my_text_in.txt -s ./source.ts -o ./my_text_out.txt
if [ $? -eq 0 ]; then
   echo "Successfully compiled file"
else
  echo "Failed to compile file"
fi
```

The script can also be run directly using Deno's `run` command
passing the `--file`, `--source` and `--output` flags. The
program will exit with a status code of 0 if the compilation
was successful.
```bash
deno run -A cli.ts --file=./my_text.txt --source=./source.ts --output=./my_text_out.txt
```

## Roadmap
 * [x] Add support for `%{{{ ... }}}` block expressions
 * [x] Support to escape `\%{{ ... }}` expressions
 * [ ] Fix so that the source file is optional, a file can contain only inline expressions
 * [ ] Fix so that the output file is optional, and the output is written to stdout if no output file is specified
 * [ ] Add support for multiple source files
 * [ ] Add support for directly passing input text with or without a source file, and output it to stdout or a file.

All **bugs** and **feature requests** can be reported on the official GitHub repository.
Any **feedback** and **contributions** are warmly welcome.