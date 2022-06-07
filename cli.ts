// deno-lint-ignore-file no-unused-vars ban-types
import { parse } from "https://deno.land/std/flags/mod.ts";

let DEBUG = false;
let VERSION = '1.0.0';

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
  const file = args.file;
  const source = args.source;
  const output = args.output;
  DEBUG = args.debug;
  if (args.help || (!file && !output)) {
    help();
    Deno.exit(0);
  }
  if (args.version) {
    console.log(`Version: ${VERSION}`);
    Deno.exit(0);
  }
  if (!file || !output) {
    console.error("Missing required arguments --file, --source or --output.\nSee --help for more information.");
    Deno.exit(1);
  }
  const compiled = await compileFile(file, source);
  Deno.writeTextFileSync(output, compiled);
}

function help() {
  console.log(`Dynamic Text Utility - A utility program for developers and authors for dynamic updates to static files.
By William Rågstad, 2022-06.

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
      expression: parseExpression(fileContents.substring(start + 3, end), sourceModule),
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

    // Construct an isolated function with arguments from the exported module
    const sourceModuleName = getVariableName(() => sourceModule);
    const funcStart =  `((${Object.keys(sourceModule).join(", ")}) =>`;
    const funcEnd = `).call({}, ${Object.keys(sourceModule).map(k => sourceModuleName + "." + k).join(", ")})`;
    
    for (let i = 0; i < templateStrings.length; i++) {
      const template = templateStrings[i];
      const result = eval(funcStart + template.expression + funcEnd);
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
 * Extract the name of a variable identifier
 * @param name An arrow function pointing to the variable name
 * @returns The name of the variable
 */
function getVariableName<TResult>(name: () => TResult) {
  const m = name.toString().split("=>")[1].trim();
  if (m == '') throw "The function does not contain a statement matching 'return name;'";
  return m;
}

/**
 * Convert an input template string to a valid JavaScript expression.
 * @param expression Input expression to compile
 * @returns JS expression that can be evaluated to return the result
 */
function parseExpression(expression: string, sourceModule: any) {
  expression = expression.trim();
  // If the expression is a single function identifier, call it
  if (
    expression.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) &&
    typeof sourceModule[expression] === "function"
  ) {
    return `${expression}()`;
  }
  // Otherwise, treat it as a valid JavaScript expression already
  return expression;
}

// Run the main function if this file is being run directly
if (import.meta.main) {
  main();
}