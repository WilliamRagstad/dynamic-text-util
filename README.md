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

### Inline Expressions

### Source Functions

### Other Properties

Everything exported from the source file will be available in the template.


### Example
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