// deno-lint-ignore-file no-unused-vars ban-types
import { parse } from "https://deno.land/std/flags/mod.ts";

let DEBUG = false;

/**
 * A terminal utility program built on top of the Deno API.
 * It takes a file that shall be compiled and a source script
 * that contains all function mappings for each template string.
 * It then compiles the template strings and outputs the result
 * to the console.
 *
 * It is intended to be used as a CLI utility for developers
 * and authors in build scripts to automate the process of
 * updating relevant dynamic information.
 *
 * Example:
 * ```bash
 * dtu --file=./my_text_in.txt --source=./source.ts --output=./my_text_out.txt
 * if [ $? -eq 0 ]; then
 *    echo "Successfully compiled file"
 * else
 *   echo "Failed to compile file"
 * fi
 * ```
 *
 * The script can also be run directly using Deno's `run` command
 * passing the `--file`, `--source` and `--output` flags. The
 * program will exit with a status code of 0 if the compilation
 * was successful.
 * ```bash
 * deno run -A cli.ts --file=./my_text.txt --source=./source.ts
 * ```
 */

async function main() {
  const args = parse(Deno.args, {
    alias: {
      "file": "f",
      "source": "s",
      "output": "o",
      "help": "h",
      "debug": "d",
      "version": "v",
    },
    boolean: [
      "help",
      "debug",
    ],
    string: [
      "file",
      "source",
      "output",
    ],
    default: {
      "help": false,
      "debug": false,
    },
  });
  if (args.help) {
    help();
    Deno.exit(0);
  }
  const file = args.file;
  const source = args.source;
  const output = args.output;
  DEBUG = args.debug;
  if (!file || !source || !output) {
    console.error("Missing required arguments --file, --source and --output.\nSee --help for more information.");
    Deno.exit(1);
  }
  const compiled = await compileFile(file, source);
  Deno.writeTextFileSync(output, compiled);
}

function help() {
  console.log(`Dynamic Text Utility - A utility program for developers and authors for dynamic updates to static files.
By William Rågstad

Usage: dtu [options]

Options:
  --file, -f    The file to compile
  --source, -s  The source script that contains the template strings
  --output, -o  The output file to write the compiled file to
  --help, -h    Show this help message
`);
}

async function compileFile(file: string, source: string) {
  const fileContents = Deno.readTextFileSync(file);
  // Import source file as dynamic module
  const sourceModule = await import(source);

  // Get all template strings from the file
  const templateStrings = [];
  const startSym = "%{{";
  const endSym = "}}";
  let start = fileContents.indexOf(startSym, 0); // Start index of expression
  while(start !== -1) {
    const end = fileContents.indexOf(endSym, start); // End index of expression
    if (end === -1) throw `Unclosed template string at index ${start}`;
    templateStrings.push({
      start,
      end,
      expression: parseExpression(fileContents.substring(start + 3, end)),
    });
    start = fileContents.indexOf(startSym, end);
  }

  if (DEBUG) console.log("Template strings:", templateStrings);
  if (DEBUG) console.log("Source module:", sourceModule);
  
  // Compile each template string
  let compiled = "";
  if (templateStrings.length === 0) {
    compiled = fileContents;
  }
  else {
    // Append everything before the first template string
    compiled = fileContents.substring(0, templateStrings[0].start);
    
    for (let i = 0; i < templateStrings.length; i++) {
      const template = templateStrings[i];
      

      // const result = sourceModule[template.expression]();
      // const result = eval(template.expression);
      
      // Construct an isolated function with arguments from the exported module
      const func = `((${Object.keys(sourceModule).join(", ")}) =>
                    ${template.expression}).call({},
                      ${Object.keys(sourceModule).map(k => "sourceModule." + k).join(", ")}
                    )`;
      const result = eval(func);

      if (DEBUG) console.log(`Compiled expression ${template.expression} to ${result}`);
      compiled += result;
      // Append everything after the template string until the next template string
      if (i < templateStrings.length - 1) {
        compiled += fileContents.substring(template.end + 2, templateStrings[i + 1].start);
      }
      else {
        compiled += fileContents.substring(template.end + 2);
      }
    }
  }

  return compiled;
}

/**
 * Convert an input template string to a valid JavaScript expression.
 * @param expression Input expression to compile
 * @returns JS expression that can be evaluated to return the result
 */
function parseExpression(expression: string) {
  expression = expression.trim();
  // If the expression is a single identifier, call it as a function
  if (expression.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
    return `${expression}()`;
  }
  // Otherwise, treat it as a valid JavaScript expression already
  return expression;
}

// Run the main function if this file is being run directly
if (import.meta.main) {
  main();
}