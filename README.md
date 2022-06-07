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

### Example
```bash
dtu --file=./my_text_in.txt --source=./source.ts --output=./my_text_out.txt
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
```

## Development

All development is done in the GitHub repository and inside the `cli.ts` file.

Compile the source code using `deno compile --output dtu.exe .\cli.ts`