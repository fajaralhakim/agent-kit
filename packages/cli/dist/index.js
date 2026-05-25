#!/usr/bin/env node
import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// ../../node_modules/.bun/commander@13.1.0/node_modules/commander/lib/error.js
var require_error = __commonJS((exports) => {
  class CommanderError extends Error {
    constructor(exitCode, code, message) {
      super(message);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.code = code;
      this.exitCode = exitCode;
      this.nestedError = undefined;
    }
  }

  class InvalidArgumentError extends CommanderError {
    constructor(message) {
      super(1, "commander.invalidArgument", message);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
    }
  }
  exports.CommanderError = CommanderError;
  exports.InvalidArgumentError = InvalidArgumentError;
});

// ../../node_modules/.bun/commander@13.1.0/node_modules/commander/lib/argument.js
var require_argument = __commonJS((exports) => {
  var { InvalidArgumentError } = require_error();

  class Argument {
    constructor(name, description) {
      this.description = description || "";
      this.variadic = false;
      this.parseArg = undefined;
      this.defaultValue = undefined;
      this.defaultValueDescription = undefined;
      this.argChoices = undefined;
      switch (name[0]) {
        case "<":
          this.required = true;
          this._name = name.slice(1, -1);
          break;
        case "[":
          this.required = false;
          this._name = name.slice(1, -1);
          break;
        default:
          this.required = true;
          this._name = name;
          break;
      }
      if (this._name.length > 3 && this._name.slice(-3) === "...") {
        this.variadic = true;
        this._name = this._name.slice(0, -3);
      }
    }
    name() {
      return this._name;
    }
    _concatValue(value, previous) {
      if (previous === this.defaultValue || !Array.isArray(previous)) {
        return [value];
      }
      return previous.concat(value);
    }
    default(value, description) {
      this.defaultValue = value;
      this.defaultValueDescription = description;
      return this;
    }
    argParser(fn) {
      this.parseArg = fn;
      return this;
    }
    choices(values) {
      this.argChoices = values.slice();
      this.parseArg = (arg, previous) => {
        if (!this.argChoices.includes(arg)) {
          throw new InvalidArgumentError(`Allowed choices are ${this.argChoices.join(", ")}.`);
        }
        if (this.variadic) {
          return this._concatValue(arg, previous);
        }
        return arg;
      };
      return this;
    }
    argRequired() {
      this.required = true;
      return this;
    }
    argOptional() {
      this.required = false;
      return this;
    }
  }
  function humanReadableArgName(arg) {
    const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
    return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
  }
  exports.Argument = Argument;
  exports.humanReadableArgName = humanReadableArgName;
});

// ../../node_modules/.bun/commander@13.1.0/node_modules/commander/lib/help.js
var require_help = __commonJS((exports) => {
  var { humanReadableArgName } = require_argument();

  class Help {
    constructor() {
      this.helpWidth = undefined;
      this.minWidthToWrap = 40;
      this.sortSubcommands = false;
      this.sortOptions = false;
      this.showGlobalOptions = false;
    }
    prepareContext(contextOptions) {
      this.helpWidth = this.helpWidth ?? contextOptions.helpWidth ?? 80;
    }
    visibleCommands(cmd) {
      const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
      const helpCommand = cmd._getHelpCommand();
      if (helpCommand && !helpCommand._hidden) {
        visibleCommands.push(helpCommand);
      }
      if (this.sortSubcommands) {
        visibleCommands.sort((a, b) => {
          return a.name().localeCompare(b.name());
        });
      }
      return visibleCommands;
    }
    compareOptions(a, b) {
      const getSortKey = (option) => {
        return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
      };
      return getSortKey(a).localeCompare(getSortKey(b));
    }
    visibleOptions(cmd) {
      const visibleOptions = cmd.options.filter((option) => !option.hidden);
      const helpOption = cmd._getHelpOption();
      if (helpOption && !helpOption.hidden) {
        const removeShort = helpOption.short && cmd._findOption(helpOption.short);
        const removeLong = helpOption.long && cmd._findOption(helpOption.long);
        if (!removeShort && !removeLong) {
          visibleOptions.push(helpOption);
        } else if (helpOption.long && !removeLong) {
          visibleOptions.push(cmd.createOption(helpOption.long, helpOption.description));
        } else if (helpOption.short && !removeShort) {
          visibleOptions.push(cmd.createOption(helpOption.short, helpOption.description));
        }
      }
      if (this.sortOptions) {
        visibleOptions.sort(this.compareOptions);
      }
      return visibleOptions;
    }
    visibleGlobalOptions(cmd) {
      if (!this.showGlobalOptions)
        return [];
      const globalOptions = [];
      for (let ancestorCmd = cmd.parent;ancestorCmd; ancestorCmd = ancestorCmd.parent) {
        const visibleOptions = ancestorCmd.options.filter((option) => !option.hidden);
        globalOptions.push(...visibleOptions);
      }
      if (this.sortOptions) {
        globalOptions.sort(this.compareOptions);
      }
      return globalOptions;
    }
    visibleArguments(cmd) {
      if (cmd._argsDescription) {
        cmd.registeredArguments.forEach((argument) => {
          argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
        });
      }
      if (cmd.registeredArguments.find((argument) => argument.description)) {
        return cmd.registeredArguments;
      }
      return [];
    }
    subcommandTerm(cmd) {
      const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
      return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + (args ? " " + args : "");
    }
    optionTerm(option) {
      return option.flags;
    }
    argumentTerm(argument) {
      return argument.name();
    }
    longestSubcommandTermLength(cmd, helper) {
      return helper.visibleCommands(cmd).reduce((max, command) => {
        return Math.max(max, this.displayWidth(helper.styleSubcommandTerm(helper.subcommandTerm(command))));
      }, 0);
    }
    longestOptionTermLength(cmd, helper) {
      return helper.visibleOptions(cmd).reduce((max, option) => {
        return Math.max(max, this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option))));
      }, 0);
    }
    longestGlobalOptionTermLength(cmd, helper) {
      return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
        return Math.max(max, this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option))));
      }, 0);
    }
    longestArgumentTermLength(cmd, helper) {
      return helper.visibleArguments(cmd).reduce((max, argument) => {
        return Math.max(max, this.displayWidth(helper.styleArgumentTerm(helper.argumentTerm(argument))));
      }, 0);
    }
    commandUsage(cmd) {
      let cmdName = cmd._name;
      if (cmd._aliases[0]) {
        cmdName = cmdName + "|" + cmd._aliases[0];
      }
      let ancestorCmdNames = "";
      for (let ancestorCmd = cmd.parent;ancestorCmd; ancestorCmd = ancestorCmd.parent) {
        ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
      }
      return ancestorCmdNames + cmdName + " " + cmd.usage();
    }
    commandDescription(cmd) {
      return cmd.description();
    }
    subcommandDescription(cmd) {
      return cmd.summary() || cmd.description();
    }
    optionDescription(option) {
      const extraInfo = [];
      if (option.argChoices) {
        extraInfo.push(`choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`);
      }
      if (option.defaultValue !== undefined) {
        const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
        if (showDefault) {
          extraInfo.push(`default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`);
        }
      }
      if (option.presetArg !== undefined && option.optional) {
        extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
      }
      if (option.envVar !== undefined) {
        extraInfo.push(`env: ${option.envVar}`);
      }
      if (extraInfo.length > 0) {
        return `${option.description} (${extraInfo.join(", ")})`;
      }
      return option.description;
    }
    argumentDescription(argument) {
      const extraInfo = [];
      if (argument.argChoices) {
        extraInfo.push(`choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`);
      }
      if (argument.defaultValue !== undefined) {
        extraInfo.push(`default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`);
      }
      if (extraInfo.length > 0) {
        const extraDescription = `(${extraInfo.join(", ")})`;
        if (argument.description) {
          return `${argument.description} ${extraDescription}`;
        }
        return extraDescription;
      }
      return argument.description;
    }
    formatHelp(cmd, helper) {
      const termWidth = helper.padWidth(cmd, helper);
      const helpWidth = helper.helpWidth ?? 80;
      function callFormatItem(term, description) {
        return helper.formatItem(term, termWidth, description, helper);
      }
      let output = [
        `${helper.styleTitle("Usage:")} ${helper.styleUsage(helper.commandUsage(cmd))}`,
        ""
      ];
      const commandDescription = helper.commandDescription(cmd);
      if (commandDescription.length > 0) {
        output = output.concat([
          helper.boxWrap(helper.styleCommandDescription(commandDescription), helpWidth),
          ""
        ]);
      }
      const argumentList = helper.visibleArguments(cmd).map((argument) => {
        return callFormatItem(helper.styleArgumentTerm(helper.argumentTerm(argument)), helper.styleArgumentDescription(helper.argumentDescription(argument)));
      });
      if (argumentList.length > 0) {
        output = output.concat([
          helper.styleTitle("Arguments:"),
          ...argumentList,
          ""
        ]);
      }
      const optionList = helper.visibleOptions(cmd).map((option) => {
        return callFormatItem(helper.styleOptionTerm(helper.optionTerm(option)), helper.styleOptionDescription(helper.optionDescription(option)));
      });
      if (optionList.length > 0) {
        output = output.concat([
          helper.styleTitle("Options:"),
          ...optionList,
          ""
        ]);
      }
      if (helper.showGlobalOptions) {
        const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
          return callFormatItem(helper.styleOptionTerm(helper.optionTerm(option)), helper.styleOptionDescription(helper.optionDescription(option)));
        });
        if (globalOptionList.length > 0) {
          output = output.concat([
            helper.styleTitle("Global Options:"),
            ...globalOptionList,
            ""
          ]);
        }
      }
      const commandList = helper.visibleCommands(cmd).map((cmd2) => {
        return callFormatItem(helper.styleSubcommandTerm(helper.subcommandTerm(cmd2)), helper.styleSubcommandDescription(helper.subcommandDescription(cmd2)));
      });
      if (commandList.length > 0) {
        output = output.concat([
          helper.styleTitle("Commands:"),
          ...commandList,
          ""
        ]);
      }
      return output.join(`
`);
    }
    displayWidth(str) {
      return stripColor(str).length;
    }
    styleTitle(str) {
      return str;
    }
    styleUsage(str) {
      return str.split(" ").map((word) => {
        if (word === "[options]")
          return this.styleOptionText(word);
        if (word === "[command]")
          return this.styleSubcommandText(word);
        if (word[0] === "[" || word[0] === "<")
          return this.styleArgumentText(word);
        return this.styleCommandText(word);
      }).join(" ");
    }
    styleCommandDescription(str) {
      return this.styleDescriptionText(str);
    }
    styleOptionDescription(str) {
      return this.styleDescriptionText(str);
    }
    styleSubcommandDescription(str) {
      return this.styleDescriptionText(str);
    }
    styleArgumentDescription(str) {
      return this.styleDescriptionText(str);
    }
    styleDescriptionText(str) {
      return str;
    }
    styleOptionTerm(str) {
      return this.styleOptionText(str);
    }
    styleSubcommandTerm(str) {
      return str.split(" ").map((word) => {
        if (word === "[options]")
          return this.styleOptionText(word);
        if (word[0] === "[" || word[0] === "<")
          return this.styleArgumentText(word);
        return this.styleSubcommandText(word);
      }).join(" ");
    }
    styleArgumentTerm(str) {
      return this.styleArgumentText(str);
    }
    styleOptionText(str) {
      return str;
    }
    styleArgumentText(str) {
      return str;
    }
    styleSubcommandText(str) {
      return str;
    }
    styleCommandText(str) {
      return str;
    }
    padWidth(cmd, helper) {
      return Math.max(helper.longestOptionTermLength(cmd, helper), helper.longestGlobalOptionTermLength(cmd, helper), helper.longestSubcommandTermLength(cmd, helper), helper.longestArgumentTermLength(cmd, helper));
    }
    preformatted(str) {
      return /\n[^\S\r\n]/.test(str);
    }
    formatItem(term, termWidth, description, helper) {
      const itemIndent = 2;
      const itemIndentStr = " ".repeat(itemIndent);
      if (!description)
        return itemIndentStr + term;
      const paddedTerm = term.padEnd(termWidth + term.length - helper.displayWidth(term));
      const spacerWidth = 2;
      const helpWidth = this.helpWidth ?? 80;
      const remainingWidth = helpWidth - termWidth - spacerWidth - itemIndent;
      let formattedDescription;
      if (remainingWidth < this.minWidthToWrap || helper.preformatted(description)) {
        formattedDescription = description;
      } else {
        const wrappedDescription = helper.boxWrap(description, remainingWidth);
        formattedDescription = wrappedDescription.replace(/\n/g, `
` + " ".repeat(termWidth + spacerWidth));
      }
      return itemIndentStr + paddedTerm + " ".repeat(spacerWidth) + formattedDescription.replace(/\n/g, `
${itemIndentStr}`);
    }
    boxWrap(str, width) {
      if (width < this.minWidthToWrap)
        return str;
      const rawLines = str.split(/\r\n|\n/);
      const chunkPattern = /[\s]*[^\s]+/g;
      const wrappedLines = [];
      rawLines.forEach((line) => {
        const chunks = line.match(chunkPattern);
        if (chunks === null) {
          wrappedLines.push("");
          return;
        }
        let sumChunks = [chunks.shift()];
        let sumWidth = this.displayWidth(sumChunks[0]);
        chunks.forEach((chunk) => {
          const visibleWidth = this.displayWidth(chunk);
          if (sumWidth + visibleWidth <= width) {
            sumChunks.push(chunk);
            sumWidth += visibleWidth;
            return;
          }
          wrappedLines.push(sumChunks.join(""));
          const nextChunk = chunk.trimStart();
          sumChunks = [nextChunk];
          sumWidth = this.displayWidth(nextChunk);
        });
        wrappedLines.push(sumChunks.join(""));
      });
      return wrappedLines.join(`
`);
    }
  }
  function stripColor(str) {
    const sgrPattern = /\x1b\[\d*(;\d*)*m/g;
    return str.replace(sgrPattern, "");
  }
  exports.Help = Help;
  exports.stripColor = stripColor;
});

// ../../node_modules/.bun/commander@13.1.0/node_modules/commander/lib/option.js
var require_option = __commonJS((exports) => {
  var { InvalidArgumentError } = require_error();

  class Option {
    constructor(flags, description) {
      this.flags = flags;
      this.description = description || "";
      this.required = flags.includes("<");
      this.optional = flags.includes("[");
      this.variadic = /\w\.\.\.[>\]]$/.test(flags);
      this.mandatory = false;
      const optionFlags = splitOptionFlags(flags);
      this.short = optionFlags.shortFlag;
      this.long = optionFlags.longFlag;
      this.negate = false;
      if (this.long) {
        this.negate = this.long.startsWith("--no-");
      }
      this.defaultValue = undefined;
      this.defaultValueDescription = undefined;
      this.presetArg = undefined;
      this.envVar = undefined;
      this.parseArg = undefined;
      this.hidden = false;
      this.argChoices = undefined;
      this.conflictsWith = [];
      this.implied = undefined;
    }
    default(value, description) {
      this.defaultValue = value;
      this.defaultValueDescription = description;
      return this;
    }
    preset(arg) {
      this.presetArg = arg;
      return this;
    }
    conflicts(names) {
      this.conflictsWith = this.conflictsWith.concat(names);
      return this;
    }
    implies(impliedOptionValues) {
      let newImplied = impliedOptionValues;
      if (typeof impliedOptionValues === "string") {
        newImplied = { [impliedOptionValues]: true };
      }
      this.implied = Object.assign(this.implied || {}, newImplied);
      return this;
    }
    env(name) {
      this.envVar = name;
      return this;
    }
    argParser(fn) {
      this.parseArg = fn;
      return this;
    }
    makeOptionMandatory(mandatory = true) {
      this.mandatory = !!mandatory;
      return this;
    }
    hideHelp(hide = true) {
      this.hidden = !!hide;
      return this;
    }
    _concatValue(value, previous) {
      if (previous === this.defaultValue || !Array.isArray(previous)) {
        return [value];
      }
      return previous.concat(value);
    }
    choices(values) {
      this.argChoices = values.slice();
      this.parseArg = (arg, previous) => {
        if (!this.argChoices.includes(arg)) {
          throw new InvalidArgumentError(`Allowed choices are ${this.argChoices.join(", ")}.`);
        }
        if (this.variadic) {
          return this._concatValue(arg, previous);
        }
        return arg;
      };
      return this;
    }
    name() {
      if (this.long) {
        return this.long.replace(/^--/, "");
      }
      return this.short.replace(/^-/, "");
    }
    attributeName() {
      if (this.negate) {
        return camelcase(this.name().replace(/^no-/, ""));
      }
      return camelcase(this.name());
    }
    is(arg) {
      return this.short === arg || this.long === arg;
    }
    isBoolean() {
      return !this.required && !this.optional && !this.negate;
    }
  }

  class DualOptions {
    constructor(options) {
      this.positiveOptions = new Map;
      this.negativeOptions = new Map;
      this.dualOptions = new Set;
      options.forEach((option) => {
        if (option.negate) {
          this.negativeOptions.set(option.attributeName(), option);
        } else {
          this.positiveOptions.set(option.attributeName(), option);
        }
      });
      this.negativeOptions.forEach((value, key) => {
        if (this.positiveOptions.has(key)) {
          this.dualOptions.add(key);
        }
      });
    }
    valueFromOption(value, option) {
      const optionKey = option.attributeName();
      if (!this.dualOptions.has(optionKey))
        return true;
      const preset = this.negativeOptions.get(optionKey).presetArg;
      const negativeValue = preset !== undefined ? preset : false;
      return option.negate === (negativeValue === value);
    }
  }
  function camelcase(str) {
    return str.split("-").reduce((str2, word) => {
      return str2 + word[0].toUpperCase() + word.slice(1);
    });
  }
  function splitOptionFlags(flags) {
    let shortFlag;
    let longFlag;
    const shortFlagExp = /^-[^-]$/;
    const longFlagExp = /^--[^-]/;
    const flagParts = flags.split(/[ |,]+/).concat("guard");
    if (shortFlagExp.test(flagParts[0]))
      shortFlag = flagParts.shift();
    if (longFlagExp.test(flagParts[0]))
      longFlag = flagParts.shift();
    if (!shortFlag && shortFlagExp.test(flagParts[0]))
      shortFlag = flagParts.shift();
    if (!shortFlag && longFlagExp.test(flagParts[0])) {
      shortFlag = longFlag;
      longFlag = flagParts.shift();
    }
    if (flagParts[0].startsWith("-")) {
      const unsupportedFlag = flagParts[0];
      const baseError = `option creation failed due to '${unsupportedFlag}' in option flags '${flags}'`;
      if (/^-[^-][^-]/.test(unsupportedFlag))
        throw new Error(`${baseError}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`);
      if (shortFlagExp.test(unsupportedFlag))
        throw new Error(`${baseError}
- too many short flags`);
      if (longFlagExp.test(unsupportedFlag))
        throw new Error(`${baseError}
- too many long flags`);
      throw new Error(`${baseError}
- unrecognised flag format`);
    }
    if (shortFlag === undefined && longFlag === undefined)
      throw new Error(`option creation failed due to no flags found in '${flags}'.`);
    return { shortFlag, longFlag };
  }
  exports.Option = Option;
  exports.DualOptions = DualOptions;
});

// ../../node_modules/.bun/commander@13.1.0/node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS((exports) => {
  var maxDistance = 3;
  function editDistance(a, b) {
    if (Math.abs(a.length - b.length) > maxDistance)
      return Math.max(a.length, b.length);
    const d = [];
    for (let i = 0;i <= a.length; i++) {
      d[i] = [i];
    }
    for (let j = 0;j <= b.length; j++) {
      d[0][j] = j;
    }
    for (let j = 1;j <= b.length; j++) {
      for (let i = 1;i <= a.length; i++) {
        let cost = 1;
        if (a[i - 1] === b[j - 1]) {
          cost = 0;
        } else {
          cost = 1;
        }
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[a.length][b.length];
  }
  function suggestSimilar(word, candidates) {
    if (!candidates || candidates.length === 0)
      return "";
    candidates = Array.from(new Set(candidates));
    const searchingOptions = word.startsWith("--");
    if (searchingOptions) {
      word = word.slice(2);
      candidates = candidates.map((candidate) => candidate.slice(2));
    }
    let similar = [];
    let bestDistance = maxDistance;
    const minSimilarity = 0.4;
    candidates.forEach((candidate) => {
      if (candidate.length <= 1)
        return;
      const distance = editDistance(word, candidate);
      const length = Math.max(word.length, candidate.length);
      const similarity = (length - distance) / length;
      if (similarity > minSimilarity) {
        if (distance < bestDistance) {
          bestDistance = distance;
          similar = [candidate];
        } else if (distance === bestDistance) {
          similar.push(candidate);
        }
      }
    });
    similar.sort((a, b) => a.localeCompare(b));
    if (searchingOptions) {
      similar = similar.map((candidate) => `--${candidate}`);
    }
    if (similar.length > 1) {
      return `
(Did you mean one of ${similar.join(", ")}?)`;
    }
    if (similar.length === 1) {
      return `
(Did you mean ${similar[0]}?)`;
    }
    return "";
  }
  exports.suggestSimilar = suggestSimilar;
});

// ../../node_modules/.bun/commander@13.1.0/node_modules/commander/lib/command.js
var require_command = __commonJS((exports) => {
  var EventEmitter = __require("node:events").EventEmitter;
  var childProcess = __require("node:child_process");
  var path = __require("node:path");
  var fs = __require("node:fs");
  var process2 = __require("node:process");
  var { Argument, humanReadableArgName } = require_argument();
  var { CommanderError } = require_error();
  var { Help, stripColor } = require_help();
  var { Option, DualOptions } = require_option();
  var { suggestSimilar } = require_suggestSimilar();

  class Command extends EventEmitter {
    constructor(name) {
      super();
      this.commands = [];
      this.options = [];
      this.parent = null;
      this._allowUnknownOption = false;
      this._allowExcessArguments = false;
      this.registeredArguments = [];
      this._args = this.registeredArguments;
      this.args = [];
      this.rawArgs = [];
      this.processedArgs = [];
      this._scriptPath = null;
      this._name = name || "";
      this._optionValues = {};
      this._optionValueSources = {};
      this._storeOptionsAsProperties = false;
      this._actionHandler = null;
      this._executableHandler = false;
      this._executableFile = null;
      this._executableDir = null;
      this._defaultCommandName = null;
      this._exitCallback = null;
      this._aliases = [];
      this._combineFlagAndOptionalValue = true;
      this._description = "";
      this._summary = "";
      this._argsDescription = undefined;
      this._enablePositionalOptions = false;
      this._passThroughOptions = false;
      this._lifeCycleHooks = {};
      this._showHelpAfterError = false;
      this._showSuggestionAfterError = true;
      this._savedState = null;
      this._outputConfiguration = {
        writeOut: (str) => process2.stdout.write(str),
        writeErr: (str) => process2.stderr.write(str),
        outputError: (str, write) => write(str),
        getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : undefined,
        getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : undefined,
        getOutHasColors: () => useColor() ?? (process2.stdout.isTTY && process2.stdout.hasColors?.()),
        getErrHasColors: () => useColor() ?? (process2.stderr.isTTY && process2.stderr.hasColors?.()),
        stripColor: (str) => stripColor(str)
      };
      this._hidden = false;
      this._helpOption = undefined;
      this._addImplicitHelpCommand = undefined;
      this._helpCommand = undefined;
      this._helpConfiguration = {};
    }
    copyInheritedSettings(sourceCommand) {
      this._outputConfiguration = sourceCommand._outputConfiguration;
      this._helpOption = sourceCommand._helpOption;
      this._helpCommand = sourceCommand._helpCommand;
      this._helpConfiguration = sourceCommand._helpConfiguration;
      this._exitCallback = sourceCommand._exitCallback;
      this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
      this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
      this._allowExcessArguments = sourceCommand._allowExcessArguments;
      this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
      this._showHelpAfterError = sourceCommand._showHelpAfterError;
      this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
      return this;
    }
    _getCommandAndAncestors() {
      const result = [];
      for (let command = this;command; command = command.parent) {
        result.push(command);
      }
      return result;
    }
    command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
      let desc = actionOptsOrExecDesc;
      let opts = execOpts;
      if (typeof desc === "object" && desc !== null) {
        opts = desc;
        desc = null;
      }
      opts = opts || {};
      const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
      const cmd = this.createCommand(name);
      if (desc) {
        cmd.description(desc);
        cmd._executableHandler = true;
      }
      if (opts.isDefault)
        this._defaultCommandName = cmd._name;
      cmd._hidden = !!(opts.noHelp || opts.hidden);
      cmd._executableFile = opts.executableFile || null;
      if (args)
        cmd.arguments(args);
      this._registerCommand(cmd);
      cmd.parent = this;
      cmd.copyInheritedSettings(this);
      if (desc)
        return this;
      return cmd;
    }
    createCommand(name) {
      return new Command(name);
    }
    createHelp() {
      return Object.assign(new Help, this.configureHelp());
    }
    configureHelp(configuration) {
      if (configuration === undefined)
        return this._helpConfiguration;
      this._helpConfiguration = configuration;
      return this;
    }
    configureOutput(configuration) {
      if (configuration === undefined)
        return this._outputConfiguration;
      Object.assign(this._outputConfiguration, configuration);
      return this;
    }
    showHelpAfterError(displayHelp = true) {
      if (typeof displayHelp !== "string")
        displayHelp = !!displayHelp;
      this._showHelpAfterError = displayHelp;
      return this;
    }
    showSuggestionAfterError(displaySuggestion = true) {
      this._showSuggestionAfterError = !!displaySuggestion;
      return this;
    }
    addCommand(cmd, opts) {
      if (!cmd._name) {
        throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
      }
      opts = opts || {};
      if (opts.isDefault)
        this._defaultCommandName = cmd._name;
      if (opts.noHelp || opts.hidden)
        cmd._hidden = true;
      this._registerCommand(cmd);
      cmd.parent = this;
      cmd._checkForBrokenPassThrough();
      return this;
    }
    createArgument(name, description) {
      return new Argument(name, description);
    }
    argument(name, description, fn, defaultValue) {
      const argument = this.createArgument(name, description);
      if (typeof fn === "function") {
        argument.default(defaultValue).argParser(fn);
      } else {
        argument.default(fn);
      }
      this.addArgument(argument);
      return this;
    }
    arguments(names) {
      names.trim().split(/ +/).forEach((detail) => {
        this.argument(detail);
      });
      return this;
    }
    addArgument(argument) {
      const previousArgument = this.registeredArguments.slice(-1)[0];
      if (previousArgument && previousArgument.variadic) {
        throw new Error(`only the last argument can be variadic '${previousArgument.name()}'`);
      }
      if (argument.required && argument.defaultValue !== undefined && argument.parseArg === undefined) {
        throw new Error(`a default value for a required argument is never used: '${argument.name()}'`);
      }
      this.registeredArguments.push(argument);
      return this;
    }
    helpCommand(enableOrNameAndArgs, description) {
      if (typeof enableOrNameAndArgs === "boolean") {
        this._addImplicitHelpCommand = enableOrNameAndArgs;
        return this;
      }
      enableOrNameAndArgs = enableOrNameAndArgs ?? "help [command]";
      const [, helpName, helpArgs] = enableOrNameAndArgs.match(/([^ ]+) *(.*)/);
      const helpDescription = description ?? "display help for command";
      const helpCommand = this.createCommand(helpName);
      helpCommand.helpOption(false);
      if (helpArgs)
        helpCommand.arguments(helpArgs);
      if (helpDescription)
        helpCommand.description(helpDescription);
      this._addImplicitHelpCommand = true;
      this._helpCommand = helpCommand;
      return this;
    }
    addHelpCommand(helpCommand, deprecatedDescription) {
      if (typeof helpCommand !== "object") {
        this.helpCommand(helpCommand, deprecatedDescription);
        return this;
      }
      this._addImplicitHelpCommand = true;
      this._helpCommand = helpCommand;
      return this;
    }
    _getHelpCommand() {
      const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
      if (hasImplicitHelpCommand) {
        if (this._helpCommand === undefined) {
          this.helpCommand(undefined, undefined);
        }
        return this._helpCommand;
      }
      return null;
    }
    hook(event, listener) {
      const allowedValues = ["preSubcommand", "preAction", "postAction"];
      if (!allowedValues.includes(event)) {
        throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
      }
      if (this._lifeCycleHooks[event]) {
        this._lifeCycleHooks[event].push(listener);
      } else {
        this._lifeCycleHooks[event] = [listener];
      }
      return this;
    }
    exitOverride(fn) {
      if (fn) {
        this._exitCallback = fn;
      } else {
        this._exitCallback = (err) => {
          if (err.code !== "commander.executeSubCommandAsync") {
            throw err;
          } else {}
        };
      }
      return this;
    }
    _exit(exitCode, code, message) {
      if (this._exitCallback) {
        this._exitCallback(new CommanderError(exitCode, code, message));
      }
      process2.exit(exitCode);
    }
    action(fn) {
      const listener = (args) => {
        const expectedArgsCount = this.registeredArguments.length;
        const actionArgs = args.slice(0, expectedArgsCount);
        if (this._storeOptionsAsProperties) {
          actionArgs[expectedArgsCount] = this;
        } else {
          actionArgs[expectedArgsCount] = this.opts();
        }
        actionArgs.push(this);
        return fn.apply(this, actionArgs);
      };
      this._actionHandler = listener;
      return this;
    }
    createOption(flags, description) {
      return new Option(flags, description);
    }
    _callParseArg(target, value, previous, invalidArgumentMessage) {
      try {
        return target.parseArg(value, previous);
      } catch (err) {
        if (err.code === "commander.invalidArgument") {
          const message = `${invalidArgumentMessage} ${err.message}`;
          this.error(message, { exitCode: err.exitCode, code: err.code });
        }
        throw err;
      }
    }
    _registerOption(option) {
      const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
      if (matchingOption) {
        const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
        throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
      }
      this.options.push(option);
    }
    _registerCommand(command) {
      const knownBy = (cmd) => {
        return [cmd.name()].concat(cmd.aliases());
      };
      const alreadyUsed = knownBy(command).find((name) => this._findCommand(name));
      if (alreadyUsed) {
        const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
        const newCmd = knownBy(command).join("|");
        throw new Error(`cannot add command '${newCmd}' as already have command '${existingCmd}'`);
      }
      this.commands.push(command);
    }
    addOption(option) {
      this._registerOption(option);
      const oname = option.name();
      const name = option.attributeName();
      if (option.negate) {
        const positiveLongFlag = option.long.replace(/^--no-/, "--");
        if (!this._findOption(positiveLongFlag)) {
          this.setOptionValueWithSource(name, option.defaultValue === undefined ? true : option.defaultValue, "default");
        }
      } else if (option.defaultValue !== undefined) {
        this.setOptionValueWithSource(name, option.defaultValue, "default");
      }
      const handleOptionValue = (val, invalidValueMessage, valueSource) => {
        if (val == null && option.presetArg !== undefined) {
          val = option.presetArg;
        }
        const oldValue = this.getOptionValue(name);
        if (val !== null && option.parseArg) {
          val = this._callParseArg(option, val, oldValue, invalidValueMessage);
        } else if (val !== null && option.variadic) {
          val = option._concatValue(val, oldValue);
        }
        if (val == null) {
          if (option.negate) {
            val = false;
          } else if (option.isBoolean() || option.optional) {
            val = true;
          } else {
            val = "";
          }
        }
        this.setOptionValueWithSource(name, val, valueSource);
      };
      this.on("option:" + oname, (val) => {
        const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
        handleOptionValue(val, invalidValueMessage, "cli");
      });
      if (option.envVar) {
        this.on("optionEnv:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "env");
        });
      }
      return this;
    }
    _optionEx(config, flags, description, fn, defaultValue) {
      if (typeof flags === "object" && flags instanceof Option) {
        throw new Error("To add an Option object use addOption() instead of option() or requiredOption()");
      }
      const option = this.createOption(flags, description);
      option.makeOptionMandatory(!!config.mandatory);
      if (typeof fn === "function") {
        option.default(defaultValue).argParser(fn);
      } else if (fn instanceof RegExp) {
        const regex = fn;
        fn = (val, def) => {
          const m = regex.exec(val);
          return m ? m[0] : def;
        };
        option.default(defaultValue).argParser(fn);
      } else {
        option.default(fn);
      }
      return this.addOption(option);
    }
    option(flags, description, parseArg, defaultValue) {
      return this._optionEx({}, flags, description, parseArg, defaultValue);
    }
    requiredOption(flags, description, parseArg, defaultValue) {
      return this._optionEx({ mandatory: true }, flags, description, parseArg, defaultValue);
    }
    combineFlagAndOptionalValue(combine = true) {
      this._combineFlagAndOptionalValue = !!combine;
      return this;
    }
    allowUnknownOption(allowUnknown = true) {
      this._allowUnknownOption = !!allowUnknown;
      return this;
    }
    allowExcessArguments(allowExcess = true) {
      this._allowExcessArguments = !!allowExcess;
      return this;
    }
    enablePositionalOptions(positional = true) {
      this._enablePositionalOptions = !!positional;
      return this;
    }
    passThroughOptions(passThrough = true) {
      this._passThroughOptions = !!passThrough;
      this._checkForBrokenPassThrough();
      return this;
    }
    _checkForBrokenPassThrough() {
      if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
        throw new Error(`passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`);
      }
    }
    storeOptionsAsProperties(storeAsProperties = true) {
      if (this.options.length) {
        throw new Error("call .storeOptionsAsProperties() before adding options");
      }
      if (Object.keys(this._optionValues).length) {
        throw new Error("call .storeOptionsAsProperties() before setting option values");
      }
      this._storeOptionsAsProperties = !!storeAsProperties;
      return this;
    }
    getOptionValue(key) {
      if (this._storeOptionsAsProperties) {
        return this[key];
      }
      return this._optionValues[key];
    }
    setOptionValue(key, value) {
      return this.setOptionValueWithSource(key, value, undefined);
    }
    setOptionValueWithSource(key, value, source) {
      if (this._storeOptionsAsProperties) {
        this[key] = value;
      } else {
        this._optionValues[key] = value;
      }
      this._optionValueSources[key] = source;
      return this;
    }
    getOptionValueSource(key) {
      return this._optionValueSources[key];
    }
    getOptionValueSourceWithGlobals(key) {
      let source;
      this._getCommandAndAncestors().forEach((cmd) => {
        if (cmd.getOptionValueSource(key) !== undefined) {
          source = cmd.getOptionValueSource(key);
        }
      });
      return source;
    }
    _prepareUserArgs(argv, parseOptions) {
      if (argv !== undefined && !Array.isArray(argv)) {
        throw new Error("first parameter to parse must be array or undefined");
      }
      parseOptions = parseOptions || {};
      if (argv === undefined && parseOptions.from === undefined) {
        if (process2.versions?.electron) {
          parseOptions.from = "electron";
        }
        const execArgv = process2.execArgv ?? [];
        if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
          parseOptions.from = "eval";
        }
      }
      if (argv === undefined) {
        argv = process2.argv;
      }
      this.rawArgs = argv.slice();
      let userArgs;
      switch (parseOptions.from) {
        case undefined:
        case "node":
          this._scriptPath = argv[1];
          userArgs = argv.slice(2);
          break;
        case "electron":
          if (process2.defaultApp) {
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
          } else {
            userArgs = argv.slice(1);
          }
          break;
        case "user":
          userArgs = argv.slice(0);
          break;
        case "eval":
          userArgs = argv.slice(1);
          break;
        default:
          throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`);
      }
      if (!this._name && this._scriptPath)
        this.nameFromFilename(this._scriptPath);
      this._name = this._name || "program";
      return userArgs;
    }
    parse(argv, parseOptions) {
      this._prepareForParse();
      const userArgs = this._prepareUserArgs(argv, parseOptions);
      this._parseCommand([], userArgs);
      return this;
    }
    async parseAsync(argv, parseOptions) {
      this._prepareForParse();
      const userArgs = this._prepareUserArgs(argv, parseOptions);
      await this._parseCommand([], userArgs);
      return this;
    }
    _prepareForParse() {
      if (this._savedState === null) {
        this.saveStateBeforeParse();
      } else {
        this.restoreStateBeforeParse();
      }
    }
    saveStateBeforeParse() {
      this._savedState = {
        _name: this._name,
        _optionValues: { ...this._optionValues },
        _optionValueSources: { ...this._optionValueSources }
      };
    }
    restoreStateBeforeParse() {
      if (this._storeOptionsAsProperties)
        throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);
      this._name = this._savedState._name;
      this._scriptPath = null;
      this.rawArgs = [];
      this._optionValues = { ...this._savedState._optionValues };
      this._optionValueSources = { ...this._savedState._optionValueSources };
      this.args = [];
      this.processedArgs = [];
    }
    _checkForMissingExecutable(executableFile, executableDir, subcommandName) {
      if (fs.existsSync(executableFile))
        return;
      const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
      const executableMissing = `'${executableFile}' does not exist
 - if '${subcommandName}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
      throw new Error(executableMissing);
    }
    _executeSubCommand(subcommand, args) {
      args = args.slice();
      let launchWithNode = false;
      const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
      function findFile(baseDir, baseName) {
        const localBin = path.resolve(baseDir, baseName);
        if (fs.existsSync(localBin))
          return localBin;
        if (sourceExt.includes(path.extname(baseName)))
          return;
        const foundExt = sourceExt.find((ext) => fs.existsSync(`${localBin}${ext}`));
        if (foundExt)
          return `${localBin}${foundExt}`;
        return;
      }
      this._checkForMissingMandatoryOptions();
      this._checkForConflictingOptions();
      let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
      let executableDir = this._executableDir || "";
      if (this._scriptPath) {
        let resolvedScriptPath;
        try {
          resolvedScriptPath = fs.realpathSync(this._scriptPath);
        } catch {
          resolvedScriptPath = this._scriptPath;
        }
        executableDir = path.resolve(path.dirname(resolvedScriptPath), executableDir);
      }
      if (executableDir) {
        let localFile = findFile(executableDir, executableFile);
        if (!localFile && !subcommand._executableFile && this._scriptPath) {
          const legacyName = path.basename(this._scriptPath, path.extname(this._scriptPath));
          if (legacyName !== this._name) {
            localFile = findFile(executableDir, `${legacyName}-${subcommand._name}`);
          }
        }
        executableFile = localFile || executableFile;
      }
      launchWithNode = sourceExt.includes(path.extname(executableFile));
      let proc;
      if (process2.platform !== "win32") {
        if (launchWithNode) {
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process2.execArgv).concat(args);
          proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
        } else {
          proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
        }
      } else {
        this._checkForMissingExecutable(executableFile, executableDir, subcommand._name);
        args.unshift(executableFile);
        args = incrementNodeInspectorPort(process2.execArgv).concat(args);
        proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
      }
      if (!proc.killed) {
        const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
        signals.forEach((signal) => {
          process2.on(signal, () => {
            if (proc.killed === false && proc.exitCode === null) {
              proc.kill(signal);
            }
          });
        });
      }
      const exitCallback = this._exitCallback;
      proc.on("close", (code) => {
        code = code ?? 1;
        if (!exitCallback) {
          process2.exit(code);
        } else {
          exitCallback(new CommanderError(code, "commander.executeSubCommandAsync", "(close)"));
        }
      });
      proc.on("error", (err) => {
        if (err.code === "ENOENT") {
          this._checkForMissingExecutable(executableFile, executableDir, subcommand._name);
        } else if (err.code === "EACCES") {
          throw new Error(`'${executableFile}' not executable`);
        }
        if (!exitCallback) {
          process2.exit(1);
        } else {
          const wrappedError = new CommanderError(1, "commander.executeSubCommandAsync", "(error)");
          wrappedError.nestedError = err;
          exitCallback(wrappedError);
        }
      });
      this.runningCommand = proc;
    }
    _dispatchSubcommand(commandName, operands, unknown) {
      const subCommand = this._findCommand(commandName);
      if (!subCommand)
        this.help({ error: true });
      subCommand._prepareForParse();
      let promiseChain;
      promiseChain = this._chainOrCallSubCommandHook(promiseChain, subCommand, "preSubcommand");
      promiseChain = this._chainOrCall(promiseChain, () => {
        if (subCommand._executableHandler) {
          this._executeSubCommand(subCommand, operands.concat(unknown));
        } else {
          return subCommand._parseCommand(operands, unknown);
        }
      });
      return promiseChain;
    }
    _dispatchHelpCommand(subcommandName) {
      if (!subcommandName) {
        this.help();
      }
      const subCommand = this._findCommand(subcommandName);
      if (subCommand && !subCommand._executableHandler) {
        subCommand.help();
      }
      return this._dispatchSubcommand(subcommandName, [], [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]);
    }
    _checkNumberOfArguments() {
      this.registeredArguments.forEach((arg, i) => {
        if (arg.required && this.args[i] == null) {
          this.missingArgument(arg.name());
        }
      });
      if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
        return;
      }
      if (this.args.length > this.registeredArguments.length) {
        this._excessArguments(this.args);
      }
    }
    _processArguments() {
      const myParseArg = (argument, value, previous) => {
        let parsedValue = value;
        if (value !== null && argument.parseArg) {
          const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
          parsedValue = this._callParseArg(argument, value, previous, invalidValueMessage);
        }
        return parsedValue;
      };
      this._checkNumberOfArguments();
      const processedArgs = [];
      this.registeredArguments.forEach((declaredArg, index) => {
        let value = declaredArg.defaultValue;
        if (declaredArg.variadic) {
          if (index < this.args.length) {
            value = this.args.slice(index);
            if (declaredArg.parseArg) {
              value = value.reduce((processed, v) => {
                return myParseArg(declaredArg, v, processed);
              }, declaredArg.defaultValue);
            }
          } else if (value === undefined) {
            value = [];
          }
        } else if (index < this.args.length) {
          value = this.args[index];
          if (declaredArg.parseArg) {
            value = myParseArg(declaredArg, value, declaredArg.defaultValue);
          }
        }
        processedArgs[index] = value;
      });
      this.processedArgs = processedArgs;
    }
    _chainOrCall(promise, fn) {
      if (promise && promise.then && typeof promise.then === "function") {
        return promise.then(() => fn());
      }
      return fn();
    }
    _chainOrCallHooks(promise, event) {
      let result = promise;
      const hooks = [];
      this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== undefined).forEach((hookedCommand) => {
        hookedCommand._lifeCycleHooks[event].forEach((callback) => {
          hooks.push({ hookedCommand, callback });
        });
      });
      if (event === "postAction") {
        hooks.reverse();
      }
      hooks.forEach((hookDetail) => {
        result = this._chainOrCall(result, () => {
          return hookDetail.callback(hookDetail.hookedCommand, this);
        });
      });
      return result;
    }
    _chainOrCallSubCommandHook(promise, subCommand, event) {
      let result = promise;
      if (this._lifeCycleHooks[event] !== undefined) {
        this._lifeCycleHooks[event].forEach((hook) => {
          result = this._chainOrCall(result, () => {
            return hook(this, subCommand);
          });
        });
      }
      return result;
    }
    _parseCommand(operands, unknown) {
      const parsed = this.parseOptions(unknown);
      this._parseOptionsEnv();
      this._parseOptionsImplied();
      operands = operands.concat(parsed.operands);
      unknown = parsed.unknown;
      this.args = operands.concat(unknown);
      if (operands && this._findCommand(operands[0])) {
        return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
      }
      if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
        return this._dispatchHelpCommand(operands[1]);
      }
      if (this._defaultCommandName) {
        this._outputHelpIfRequested(unknown);
        return this._dispatchSubcommand(this._defaultCommandName, operands, unknown);
      }
      if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
        this.help({ error: true });
      }
      this._outputHelpIfRequested(parsed.unknown);
      this._checkForMissingMandatoryOptions();
      this._checkForConflictingOptions();
      const checkForUnknownOptions = () => {
        if (parsed.unknown.length > 0) {
          this.unknownOption(parsed.unknown[0]);
        }
      };
      const commandEvent = `command:${this.name()}`;
      if (this._actionHandler) {
        checkForUnknownOptions();
        this._processArguments();
        let promiseChain;
        promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
        promiseChain = this._chainOrCall(promiseChain, () => this._actionHandler(this.processedArgs));
        if (this.parent) {
          promiseChain = this._chainOrCall(promiseChain, () => {
            this.parent.emit(commandEvent, operands, unknown);
          });
        }
        promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
        return promiseChain;
      }
      if (this.parent && this.parent.listenerCount(commandEvent)) {
        checkForUnknownOptions();
        this._processArguments();
        this.parent.emit(commandEvent, operands, unknown);
      } else if (operands.length) {
        if (this._findCommand("*")) {
          return this._dispatchSubcommand("*", operands, unknown);
        }
        if (this.listenerCount("command:*")) {
          this.emit("command:*", operands, unknown);
        } else if (this.commands.length) {
          this.unknownCommand();
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      } else if (this.commands.length) {
        checkForUnknownOptions();
        this.help({ error: true });
      } else {
        checkForUnknownOptions();
        this._processArguments();
      }
    }
    _findCommand(name) {
      if (!name)
        return;
      return this.commands.find((cmd) => cmd._name === name || cmd._aliases.includes(name));
    }
    _findOption(arg) {
      return this.options.find((option) => option.is(arg));
    }
    _checkForMissingMandatoryOptions() {
      this._getCommandAndAncestors().forEach((cmd) => {
        cmd.options.forEach((anOption) => {
          if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === undefined) {
            cmd.missingMandatoryOptionValue(anOption);
          }
        });
      });
    }
    _checkForConflictingLocalOptions() {
      const definedNonDefaultOptions = this.options.filter((option) => {
        const optionKey = option.attributeName();
        if (this.getOptionValue(optionKey) === undefined) {
          return false;
        }
        return this.getOptionValueSource(optionKey) !== "default";
      });
      const optionsWithConflicting = definedNonDefaultOptions.filter((option) => option.conflictsWith.length > 0);
      optionsWithConflicting.forEach((option) => {
        const conflictingAndDefined = definedNonDefaultOptions.find((defined) => option.conflictsWith.includes(defined.attributeName()));
        if (conflictingAndDefined) {
          this._conflictingOption(option, conflictingAndDefined);
        }
      });
    }
    _checkForConflictingOptions() {
      this._getCommandAndAncestors().forEach((cmd) => {
        cmd._checkForConflictingLocalOptions();
      });
    }
    parseOptions(argv) {
      const operands = [];
      const unknown = [];
      let dest = operands;
      const args = argv.slice();
      function maybeOption(arg) {
        return arg.length > 1 && arg[0] === "-";
      }
      let activeVariadicOption = null;
      while (args.length) {
        const arg = args.shift();
        if (arg === "--") {
          if (dest === unknown)
            dest.push(arg);
          dest.push(...args);
          break;
        }
        if (activeVariadicOption && !maybeOption(arg)) {
          this.emit(`option:${activeVariadicOption.name()}`, arg);
          continue;
        }
        activeVariadicOption = null;
        if (maybeOption(arg)) {
          const option = this._findOption(arg);
          if (option) {
            if (option.required) {
              const value = args.shift();
              if (value === undefined)
                this.optionMissingArgument(option);
              this.emit(`option:${option.name()}`, value);
            } else if (option.optional) {
              let value = null;
              if (args.length > 0 && !maybeOption(args[0])) {
                value = args.shift();
              }
              this.emit(`option:${option.name()}`, value);
            } else {
              this.emit(`option:${option.name()}`);
            }
            activeVariadicOption = option.variadic ? option : null;
            continue;
          }
        }
        if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
          const option = this._findOption(`-${arg[1]}`);
          if (option) {
            if (option.required || option.optional && this._combineFlagAndOptionalValue) {
              this.emit(`option:${option.name()}`, arg.slice(2));
            } else {
              this.emit(`option:${option.name()}`);
              args.unshift(`-${arg.slice(2)}`);
            }
            continue;
          }
        }
        if (/^--[^=]+=/.test(arg)) {
          const index = arg.indexOf("=");
          const option = this._findOption(arg.slice(0, index));
          if (option && (option.required || option.optional)) {
            this.emit(`option:${option.name()}`, arg.slice(index + 1));
            continue;
          }
        }
        if (maybeOption(arg)) {
          dest = unknown;
        }
        if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
          if (this._findCommand(arg)) {
            operands.push(arg);
            if (args.length > 0)
              unknown.push(...args);
            break;
          } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
            operands.push(arg);
            if (args.length > 0)
              operands.push(...args);
            break;
          } else if (this._defaultCommandName) {
            unknown.push(arg);
            if (args.length > 0)
              unknown.push(...args);
            break;
          }
        }
        if (this._passThroughOptions) {
          dest.push(arg);
          if (args.length > 0)
            dest.push(...args);
          break;
        }
        dest.push(arg);
      }
      return { operands, unknown };
    }
    opts() {
      if (this._storeOptionsAsProperties) {
        const result = {};
        const len = this.options.length;
        for (let i = 0;i < len; i++) {
          const key = this.options[i].attributeName();
          result[key] = key === this._versionOptionName ? this._version : this[key];
        }
        return result;
      }
      return this._optionValues;
    }
    optsWithGlobals() {
      return this._getCommandAndAncestors().reduce((combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()), {});
    }
    error(message, errorOptions) {
      this._outputConfiguration.outputError(`${message}
`, this._outputConfiguration.writeErr);
      if (typeof this._showHelpAfterError === "string") {
        this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
      } else if (this._showHelpAfterError) {
        this._outputConfiguration.writeErr(`
`);
        this.outputHelp({ error: true });
      }
      const config = errorOptions || {};
      const exitCode = config.exitCode || 1;
      const code = config.code || "commander.error";
      this._exit(exitCode, code, message);
    }
    _parseOptionsEnv() {
      this.options.forEach((option) => {
        if (option.envVar && option.envVar in process2.env) {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === undefined || ["default", "config", "env"].includes(this.getOptionValueSource(optionKey))) {
            if (option.required || option.optional) {
              this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
            } else {
              this.emit(`optionEnv:${option.name()}`);
            }
          }
        }
      });
    }
    _parseOptionsImplied() {
      const dualHelper = new DualOptions(this.options);
      const hasCustomOptionValue = (optionKey) => {
        return this.getOptionValue(optionKey) !== undefined && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
      };
      this.options.filter((option) => option.implied !== undefined && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(this.getOptionValue(option.attributeName()), option)).forEach((option) => {
        Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
          this.setOptionValueWithSource(impliedKey, option.implied[impliedKey], "implied");
        });
      });
    }
    missingArgument(name) {
      const message = `error: missing required argument '${name}'`;
      this.error(message, { code: "commander.missingArgument" });
    }
    optionMissingArgument(option) {
      const message = `error: option '${option.flags}' argument missing`;
      this.error(message, { code: "commander.optionMissingArgument" });
    }
    missingMandatoryOptionValue(option) {
      const message = `error: required option '${option.flags}' not specified`;
      this.error(message, { code: "commander.missingMandatoryOptionValue" });
    }
    _conflictingOption(option, conflictingOption) {
      const findBestOptionFromValue = (option2) => {
        const optionKey = option2.attributeName();
        const optionValue = this.getOptionValue(optionKey);
        const negativeOption = this.options.find((target) => target.negate && optionKey === target.attributeName());
        const positiveOption = this.options.find((target) => !target.negate && optionKey === target.attributeName());
        if (negativeOption && (negativeOption.presetArg === undefined && optionValue === false || negativeOption.presetArg !== undefined && optionValue === negativeOption.presetArg)) {
          return negativeOption;
        }
        return positiveOption || option2;
      };
      const getErrorMessage = (option2) => {
        const bestOption = findBestOptionFromValue(option2);
        const optionKey = bestOption.attributeName();
        const source = this.getOptionValueSource(optionKey);
        if (source === "env") {
          return `environment variable '${bestOption.envVar}'`;
        }
        return `option '${bestOption.flags}'`;
      };
      const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
      this.error(message, { code: "commander.conflictingOption" });
    }
    unknownOption(flag) {
      if (this._allowUnknownOption)
        return;
      let suggestion = "";
      if (flag.startsWith("--") && this._showSuggestionAfterError) {
        let candidateFlags = [];
        let command = this;
        do {
          const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
          candidateFlags = candidateFlags.concat(moreFlags);
          command = command.parent;
        } while (command && !command._enablePositionalOptions);
        suggestion = suggestSimilar(flag, candidateFlags);
      }
      const message = `error: unknown option '${flag}'${suggestion}`;
      this.error(message, { code: "commander.unknownOption" });
    }
    _excessArguments(receivedArgs) {
      if (this._allowExcessArguments)
        return;
      const expected = this.registeredArguments.length;
      const s = expected === 1 ? "" : "s";
      const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
      const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
      this.error(message, { code: "commander.excessArguments" });
    }
    unknownCommand() {
      const unknownName = this.args[0];
      let suggestion = "";
      if (this._showSuggestionAfterError) {
        const candidateNames = [];
        this.createHelp().visibleCommands(this).forEach((command) => {
          candidateNames.push(command.name());
          if (command.alias())
            candidateNames.push(command.alias());
        });
        suggestion = suggestSimilar(unknownName, candidateNames);
      }
      const message = `error: unknown command '${unknownName}'${suggestion}`;
      this.error(message, { code: "commander.unknownCommand" });
    }
    version(str, flags, description) {
      if (str === undefined)
        return this._version;
      this._version = str;
      flags = flags || "-V, --version";
      description = description || "output the version number";
      const versionOption = this.createOption(flags, description);
      this._versionOptionName = versionOption.attributeName();
      this._registerOption(versionOption);
      this.on("option:" + versionOption.name(), () => {
        this._outputConfiguration.writeOut(`${str}
`);
        this._exit(0, "commander.version", str);
      });
      return this;
    }
    description(str, argsDescription) {
      if (str === undefined && argsDescription === undefined)
        return this._description;
      this._description = str;
      if (argsDescription) {
        this._argsDescription = argsDescription;
      }
      return this;
    }
    summary(str) {
      if (str === undefined)
        return this._summary;
      this._summary = str;
      return this;
    }
    alias(alias) {
      if (alias === undefined)
        return this._aliases[0];
      let command = this;
      if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
        command = this.commands[this.commands.length - 1];
      }
      if (alias === command._name)
        throw new Error("Command alias can't be the same as its name");
      const matchingCommand = this.parent?._findCommand(alias);
      if (matchingCommand) {
        const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
        throw new Error(`cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`);
      }
      command._aliases.push(alias);
      return this;
    }
    aliases(aliases) {
      if (aliases === undefined)
        return this._aliases;
      aliases.forEach((alias) => this.alias(alias));
      return this;
    }
    usage(str) {
      if (str === undefined) {
        if (this._usage)
          return this._usage;
        const args = this.registeredArguments.map((arg) => {
          return humanReadableArgName(arg);
        });
        return [].concat(this.options.length || this._helpOption !== null ? "[options]" : [], this.commands.length ? "[command]" : [], this.registeredArguments.length ? args : []).join(" ");
      }
      this._usage = str;
      return this;
    }
    name(str) {
      if (str === undefined)
        return this._name;
      this._name = str;
      return this;
    }
    nameFromFilename(filename) {
      this._name = path.basename(filename, path.extname(filename));
      return this;
    }
    executableDir(path2) {
      if (path2 === undefined)
        return this._executableDir;
      this._executableDir = path2;
      return this;
    }
    helpInformation(contextOptions) {
      const helper = this.createHelp();
      const context = this._getOutputContext(contextOptions);
      helper.prepareContext({
        error: context.error,
        helpWidth: context.helpWidth,
        outputHasColors: context.hasColors
      });
      const text = helper.formatHelp(this, helper);
      if (context.hasColors)
        return text;
      return this._outputConfiguration.stripColor(text);
    }
    _getOutputContext(contextOptions) {
      contextOptions = contextOptions || {};
      const error = !!contextOptions.error;
      let baseWrite;
      let hasColors;
      let helpWidth;
      if (error) {
        baseWrite = (str) => this._outputConfiguration.writeErr(str);
        hasColors = this._outputConfiguration.getErrHasColors();
        helpWidth = this._outputConfiguration.getErrHelpWidth();
      } else {
        baseWrite = (str) => this._outputConfiguration.writeOut(str);
        hasColors = this._outputConfiguration.getOutHasColors();
        helpWidth = this._outputConfiguration.getOutHelpWidth();
      }
      const write = (str) => {
        if (!hasColors)
          str = this._outputConfiguration.stripColor(str);
        return baseWrite(str);
      };
      return { error, write, hasColors, helpWidth };
    }
    outputHelp(contextOptions) {
      let deprecatedCallback;
      if (typeof contextOptions === "function") {
        deprecatedCallback = contextOptions;
        contextOptions = undefined;
      }
      const outputContext = this._getOutputContext(contextOptions);
      const eventContext = {
        error: outputContext.error,
        write: outputContext.write,
        command: this
      };
      this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", eventContext));
      this.emit("beforeHelp", eventContext);
      let helpInformation = this.helpInformation({ error: outputContext.error });
      if (deprecatedCallback) {
        helpInformation = deprecatedCallback(helpInformation);
        if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
          throw new Error("outputHelp callback must return a string or a Buffer");
        }
      }
      outputContext.write(helpInformation);
      if (this._getHelpOption()?.long) {
        this.emit(this._getHelpOption().long);
      }
      this.emit("afterHelp", eventContext);
      this._getCommandAndAncestors().forEach((command) => command.emit("afterAllHelp", eventContext));
    }
    helpOption(flags, description) {
      if (typeof flags === "boolean") {
        if (flags) {
          this._helpOption = this._helpOption ?? undefined;
        } else {
          this._helpOption = null;
        }
        return this;
      }
      flags = flags ?? "-h, --help";
      description = description ?? "display help for command";
      this._helpOption = this.createOption(flags, description);
      return this;
    }
    _getHelpOption() {
      if (this._helpOption === undefined) {
        this.helpOption(undefined, undefined);
      }
      return this._helpOption;
    }
    addHelpOption(option) {
      this._helpOption = option;
      return this;
    }
    help(contextOptions) {
      this.outputHelp(contextOptions);
      let exitCode = Number(process2.exitCode ?? 0);
      if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
        exitCode = 1;
      }
      this._exit(exitCode, "commander.help", "(outputHelp)");
    }
    addHelpText(position, text) {
      const allowedValues = ["beforeAll", "before", "after", "afterAll"];
      if (!allowedValues.includes(position)) {
        throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
      }
      const helpEvent = `${position}Help`;
      this.on(helpEvent, (context) => {
        let helpStr;
        if (typeof text === "function") {
          helpStr = text({ error: context.error, command: context.command });
        } else {
          helpStr = text;
        }
        if (helpStr) {
          context.write(`${helpStr}
`);
        }
      });
      return this;
    }
    _outputHelpIfRequested(args) {
      const helpOption = this._getHelpOption();
      const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
      if (helpRequested) {
        this.outputHelp();
        this._exit(0, "commander.helpDisplayed", "(outputHelp)");
      }
    }
  }
  function incrementNodeInspectorPort(args) {
    return args.map((arg) => {
      if (!arg.startsWith("--inspect")) {
        return arg;
      }
      let debugOption;
      let debugHost = "127.0.0.1";
      let debugPort = "9229";
      let match;
      if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
        debugOption = match[1];
      } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
        debugOption = match[1];
        if (/^\d+$/.test(match[3])) {
          debugPort = match[3];
        } else {
          debugHost = match[3];
        }
      } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
        debugOption = match[1];
        debugHost = match[3];
        debugPort = match[4];
      }
      if (debugOption && debugPort !== "0") {
        return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
      }
      return arg;
    });
  }
  function useColor() {
    if (process2.env.NO_COLOR || process2.env.FORCE_COLOR === "0" || process2.env.FORCE_COLOR === "false")
      return false;
    if (process2.env.FORCE_COLOR || process2.env.CLICOLOR_FORCE !== undefined)
      return true;
    return;
  }
  exports.Command = Command;
  exports.useColor = useColor;
});

// ../../node_modules/.bun/commander@13.1.0/node_modules/commander/index.js
var require_commander = __commonJS((exports) => {
  var { Argument } = require_argument();
  var { Command } = require_command();
  var { CommanderError, InvalidArgumentError } = require_error();
  var { Help } = require_help();
  var { Option } = require_option();
  exports.program = new Command;
  exports.createCommand = (name) => new Command(name);
  exports.createOption = (flags, description) => new Option(flags, description);
  exports.createArgument = (name, description) => new Argument(name, description);
  exports.Command = Command;
  exports.Option = Option;
  exports.Argument = Argument;
  exports.Help = Help;
  exports.CommanderError = CommanderError;
  exports.InvalidArgumentError = InvalidArgumentError;
  exports.InvalidOptionArgumentError = InvalidArgumentError;
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/utils.js
var require_utils = __commonJS((exports) => {
  exports.__esModule = true;
  exports.extend = extend;
  exports.indexOf = indexOf;
  exports.escapeExpression = escapeExpression;
  exports.isEmpty = isEmpty;
  exports.createFrame = createFrame;
  exports.blockParams = blockParams;
  exports.appendContextPath = appendContextPath;
  var escape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;",
    "=": "&#x3D;"
  };
  var badChars = /[&<>"'`=]/g;
  var possible = /[&<>"'`=]/;
  function escapeChar(chr) {
    return escape[chr];
  }
  function extend(obj) {
    for (var i = 1;i < arguments.length; i++) {
      for (var key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          obj[key] = arguments[i][key];
        }
      }
    }
    return obj;
  }
  var toString = Object.prototype.toString;
  exports.toString = toString;
  var isFunction = function isFunction2(value) {
    return typeof value === "function";
  };
  if (isFunction(/x/)) {
    exports.isFunction = isFunction = function(value) {
      return typeof value === "function" && toString.call(value) === "[object Function]";
    };
  }
  exports.isFunction = isFunction;
  var isArray = Array.isArray || function(value) {
    return value && typeof value === "object" ? toString.call(value) === "[object Array]" : false;
  };
  exports.isArray = isArray;
  function indexOf(array, value) {
    for (var i = 0, len = array.length;i < len; i++) {
      if (array[i] === value) {
        return i;
      }
    }
    return -1;
  }
  function escapeExpression(string) {
    if (typeof string !== "string") {
      if (string && string.toHTML) {
        return string.toHTML();
      } else if (string == null) {
        return "";
      } else if (!string) {
        return string + "";
      }
      string = "" + string;
    }
    if (!possible.test(string)) {
      return string;
    }
    return string.replace(badChars, escapeChar);
  }
  function isEmpty(value) {
    if (!value && value !== 0) {
      return true;
    } else if (isArray(value) && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }
  function createFrame(object) {
    var frame = extend({}, object);
    frame._parent = object;
    return frame;
  }
  function blockParams(params, ids) {
    params.path = ids;
    return params;
  }
  function appendContextPath(contextPath, id) {
    return (contextPath ? contextPath + "." : "") + id;
  }
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/exception.js
var require_exception = __commonJS((exports, module) => {
  exports.__esModule = true;
  var errorProps = ["description", "fileName", "lineNumber", "endLineNumber", "message", "name", "number", "stack"];
  function Exception(message, node) {
    var loc = node && node.loc, line = undefined, endLineNumber = undefined, column = undefined, endColumn = undefined;
    if (loc) {
      line = loc.start.line;
      endLineNumber = loc.end.line;
      column = loc.start.column;
      endColumn = loc.end.column;
      message += " - " + line + ":" + column;
    }
    var tmp = Error.prototype.constructor.call(this, message);
    for (var idx = 0;idx < errorProps.length; idx++) {
      this[errorProps[idx]] = tmp[errorProps[idx]];
    }
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Exception);
    }
    try {
      if (loc) {
        this.lineNumber = line;
        this.endLineNumber = endLineNumber;
        if (Object.defineProperty) {
          Object.defineProperty(this, "column", {
            value: column,
            enumerable: true
          });
          Object.defineProperty(this, "endColumn", {
            value: endColumn,
            enumerable: true
          });
        } else {
          this.column = column;
          this.endColumn = endColumn;
        }
      }
    } catch (nop) {}
  }
  Exception.prototype = new Error;
  exports.default = Exception;
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/helpers/block-helper-missing.js
var require_block_helper_missing = __commonJS((exports, module) => {
  exports.__esModule = true;
  var _utils = require_utils();
  exports.default = function(instance) {
    instance.registerHelper("blockHelperMissing", function(context, options) {
      var { inverse, fn } = options;
      if (context === true) {
        return fn(this);
      } else if (context === false || context == null) {
        return inverse(this);
      } else if (_utils.isArray(context)) {
        if (context.length > 0) {
          if (options.ids) {
            options.ids = [options.name];
          }
          return instance.helpers.each(context, options);
        } else {
          return inverse(this);
        }
      } else {
        if (options.data && options.ids) {
          var data = _utils.createFrame(options.data);
          data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
          options = { data };
        }
        return fn(context, options);
      }
    });
  };
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/helpers/each.js
var require_each = __commonJS((exports, module) => {
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _utils = require_utils();
  var _exception = require_exception();
  var _exception2 = _interopRequireDefault(_exception);
  exports.default = function(instance) {
    instance.registerHelper("each", function(context, options) {
      if (!options) {
        throw new _exception2["default"]("Must pass iterator to #each");
      }
      var { fn, inverse } = options, i = 0, ret = "", data = undefined, contextPath = undefined;
      if (options.data && options.ids) {
        contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + ".";
      }
      if (_utils.isFunction(context)) {
        context = context.call(this);
      }
      if (options.data) {
        data = _utils.createFrame(options.data);
      }
      function execIteration(field, index, last) {
        if (data) {
          data.key = field;
          data.index = index;
          data.first = index === 0;
          data.last = !!last;
          if (contextPath) {
            data.contextPath = contextPath + field;
          }
        }
        ret = ret + fn(context[field], {
          data,
          blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
        });
      }
      if (context && typeof context === "object") {
        if (_utils.isArray(context)) {
          for (var j = context.length;i < j; i++) {
            if (i in context) {
              execIteration(i, i, i === context.length - 1);
            }
          }
        } else if (typeof Symbol === "function" && context[Symbol.iterator]) {
          var newContext = [];
          var iterator = context[Symbol.iterator]();
          for (var it = iterator.next();!it.done; it = iterator.next()) {
            newContext.push(it.value);
          }
          context = newContext;
          for (var j = context.length;i < j; i++) {
            execIteration(i, i, i === context.length - 1);
          }
        } else {
          (function() {
            var priorKey = undefined;
            Object.keys(context).forEach(function(key) {
              if (priorKey !== undefined) {
                execIteration(priorKey, i - 1);
              }
              priorKey = key;
              i++;
            });
            if (priorKey !== undefined) {
              execIteration(priorKey, i - 1, true);
            }
          })();
        }
      }
      if (i === 0) {
        ret = inverse(this);
      }
      return ret;
    });
  };
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/helpers/helper-missing.js
var require_helper_missing = __commonJS((exports, module) => {
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _exception = require_exception();
  var _exception2 = _interopRequireDefault(_exception);
  exports.default = function(instance) {
    instance.registerHelper("helperMissing", function() {
      if (arguments.length === 1) {
        return;
      } else {
        throw new _exception2["default"]('Missing helper: "' + arguments[arguments.length - 1].name + '"');
      }
    });
  };
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/helpers/if.js
var require_if = __commonJS((exports, module) => {
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _utils = require_utils();
  var _exception = require_exception();
  var _exception2 = _interopRequireDefault(_exception);
  exports.default = function(instance) {
    instance.registerHelper("if", function(conditional, options) {
      if (arguments.length != 2) {
        throw new _exception2["default"]("#if requires exactly one argument");
      }
      if (_utils.isFunction(conditional)) {
        conditional = conditional.call(this);
      }
      if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    });
    instance.registerHelper("unless", function(conditional, options) {
      if (arguments.length != 2) {
        throw new _exception2["default"]("#unless requires exactly one argument");
      }
      return instance.helpers["if"].call(this, conditional, {
        fn: options.inverse,
        inverse: options.fn,
        hash: options.hash
      });
    });
  };
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/helpers/log.js
var require_log = __commonJS((exports, module) => {
  exports.__esModule = true;
  exports.default = function(instance) {
    instance.registerHelper("log", function() {
      var args = [undefined], options = arguments[arguments.length - 1];
      for (var i = 0;i < arguments.length - 1; i++) {
        args.push(arguments[i]);
      }
      var level = 1;
      if (options.hash.level != null) {
        level = options.hash.level;
      } else if (options.data && options.data.level != null) {
        level = options.data.level;
      }
      args[0] = level;
      instance.log.apply(instance, args);
    });
  };
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/helpers/lookup.js
var require_lookup = __commonJS((exports, module) => {
  exports.__esModule = true;
  exports.default = function(instance) {
    instance.registerHelper("lookup", function(obj, field, options) {
      if (!obj) {
        return obj;
      }
      return options.lookupProperty(obj, field);
    });
  };
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/helpers/with.js
var require_with = __commonJS((exports, module) => {
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _utils = require_utils();
  var _exception = require_exception();
  var _exception2 = _interopRequireDefault(_exception);
  exports.default = function(instance) {
    instance.registerHelper("with", function(context, options) {
      if (arguments.length != 2) {
        throw new _exception2["default"]("#with requires exactly one argument");
      }
      if (_utils.isFunction(context)) {
        context = context.call(this);
      }
      var fn = options.fn;
      if (!_utils.isEmpty(context)) {
        var data = options.data;
        if (options.data && options.ids) {
          data = _utils.createFrame(options.data);
          data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
        }
        return fn(context, {
          data,
          blockParams: _utils.blockParams([context], [data && data.contextPath])
        });
      } else {
        return options.inverse(this);
      }
    });
  };
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/helpers.js
var require_helpers = __commonJS((exports) => {
  exports.__esModule = true;
  exports.registerDefaultHelpers = registerDefaultHelpers;
  exports.moveHelperToHooks = moveHelperToHooks;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _helpersBlockHelperMissing = require_block_helper_missing();
  var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);
  var _helpersEach = require_each();
  var _helpersEach2 = _interopRequireDefault(_helpersEach);
  var _helpersHelperMissing = require_helper_missing();
  var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);
  var _helpersIf = require_if();
  var _helpersIf2 = _interopRequireDefault(_helpersIf);
  var _helpersLog = require_log();
  var _helpersLog2 = _interopRequireDefault(_helpersLog);
  var _helpersLookup = require_lookup();
  var _helpersLookup2 = _interopRequireDefault(_helpersLookup);
  var _helpersWith = require_with();
  var _helpersWith2 = _interopRequireDefault(_helpersWith);
  function registerDefaultHelpers(instance) {
    _helpersBlockHelperMissing2["default"](instance);
    _helpersEach2["default"](instance);
    _helpersHelperMissing2["default"](instance);
    _helpersIf2["default"](instance);
    _helpersLog2["default"](instance);
    _helpersLookup2["default"](instance);
    _helpersWith2["default"](instance);
  }
  function moveHelperToHooks(instance, helperName, keepHelper) {
    if (instance.helpers[helperName]) {
      instance.hooks[helperName] = instance.helpers[helperName];
      if (!keepHelper) {
        instance.helpers[helperName] = undefined;
      }
    }
  }
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/decorators/inline.js
var require_inline = __commonJS((exports, module) => {
  exports.__esModule = true;
  var _utils = require_utils();
  exports.default = function(instance) {
    instance.registerDecorator("inline", function(fn, props, container, options) {
      var ret = fn;
      if (!props.partials) {
        props.partials = {};
        ret = function(context, options2) {
          var original = container.partials;
          container.partials = _utils.extend({}, original, props.partials);
          var ret2 = fn(context, options2);
          container.partials = original;
          return ret2;
        };
      }
      props.partials[options.args[0]] = options.fn;
      return ret;
    });
  };
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/decorators.js
var require_decorators = __commonJS((exports) => {
  exports.__esModule = true;
  exports.registerDefaultDecorators = registerDefaultDecorators;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _decoratorsInline = require_inline();
  var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);
  function registerDefaultDecorators(instance) {
    _decoratorsInline2["default"](instance);
  }
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/logger.js
var require_logger = __commonJS((exports, module) => {
  exports.__esModule = true;
  var _utils = require_utils();
  var logger = {
    methodMap: ["debug", "info", "warn", "error"],
    level: "info",
    lookupLevel: function lookupLevel(level) {
      if (typeof level === "string") {
        var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
        if (levelMap >= 0) {
          level = levelMap;
        } else {
          level = parseInt(level, 10);
        }
      }
      return level;
    },
    log: function log(level) {
      level = logger.lookupLevel(level);
      if (typeof console !== "undefined" && logger.lookupLevel(logger.level) <= level) {
        var method = logger.methodMap[level];
        if (!console[method]) {
          method = "log";
        }
        for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1;_key < _len; _key++) {
          message[_key - 1] = arguments[_key];
        }
        console[method].apply(console, message);
      }
    }
  };
  exports.default = logger;
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/internal/proto-access.js
var require_proto_access = __commonJS((exports) => {
  exports.__esModule = true;
  exports.createProtoAccessControl = createProtoAccessControl;
  exports.resultIsAllowed = resultIsAllowed;
  exports.resetLoggedProperties = resetLoggedProperties;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _utils = require_utils();
  var _logger = require_logger();
  var _logger2 = _interopRequireDefault(_logger);
  var loggedProperties = Object.create(null);
  function createProtoAccessControl(runtimeOptions) {
    var propertyWhiteList = Object.create(null);
    propertyWhiteList["__proto__"] = false;
    _utils.extend(propertyWhiteList, runtimeOptions.allowedProtoProperties);
    var methodWhiteList = Object.create(null);
    methodWhiteList["constructor"] = false;
    methodWhiteList["__defineGetter__"] = false;
    methodWhiteList["__defineSetter__"] = false;
    methodWhiteList["__lookupGetter__"] = false;
    methodWhiteList["__lookupSetter__"] = false;
    _utils.extend(methodWhiteList, runtimeOptions.allowedProtoMethods);
    return {
      properties: {
        whitelist: propertyWhiteList,
        defaultValue: runtimeOptions.allowProtoPropertiesByDefault
      },
      methods: {
        whitelist: methodWhiteList,
        defaultValue: runtimeOptions.allowProtoMethodsByDefault
      }
    };
  }
  function resultIsAllowed(result, protoAccessControl, propertyName) {
    if (typeof result === "function") {
      return checkWhiteList(protoAccessControl.methods, propertyName);
    } else {
      return checkWhiteList(protoAccessControl.properties, propertyName);
    }
  }
  function checkWhiteList(protoAccessControlForType, propertyName) {
    if (protoAccessControlForType.whitelist[propertyName] !== undefined) {
      return protoAccessControlForType.whitelist[propertyName] === true;
    }
    if (protoAccessControlForType.defaultValue !== undefined) {
      return protoAccessControlForType.defaultValue;
    }
    logUnexpecedPropertyAccessOnce(propertyName);
    return false;
  }
  function logUnexpecedPropertyAccessOnce(propertyName) {
    if (loggedProperties[propertyName] !== true) {
      loggedProperties[propertyName] = true;
      _logger2["default"].log("error", 'Handlebars: Access has been denied to resolve the property "' + propertyName + `" because it is not an "own property" of its parent.
` + `You can add a runtime option to disable the check or this warning:
` + "See https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details");
    }
  }
  function resetLoggedProperties() {
    Object.keys(loggedProperties).forEach(function(propertyName) {
      delete loggedProperties[propertyName];
    });
  }
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/base.js
var require_base = __commonJS((exports) => {
  exports.__esModule = true;
  exports.HandlebarsEnvironment = HandlebarsEnvironment;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _utils = require_utils();
  var _exception = require_exception();
  var _exception2 = _interopRequireDefault(_exception);
  var _helpers = require_helpers();
  var _decorators = require_decorators();
  var _logger = require_logger();
  var _logger2 = _interopRequireDefault(_logger);
  var _internalProtoAccess = require_proto_access();
  var VERSION = "4.7.9";
  exports.VERSION = VERSION;
  var COMPILER_REVISION = 8;
  exports.COMPILER_REVISION = COMPILER_REVISION;
  var LAST_COMPATIBLE_COMPILER_REVISION = 7;
  exports.LAST_COMPATIBLE_COMPILER_REVISION = LAST_COMPATIBLE_COMPILER_REVISION;
  var REVISION_CHANGES = {
    1: "<= 1.0.rc.2",
    2: "== 1.0.0-rc.3",
    3: "== 1.0.0-rc.4",
    4: "== 1.x.x",
    5: "== 2.0.0-alpha.x",
    6: ">= 2.0.0-beta.1",
    7: ">= 4.0.0 <4.3.0",
    8: ">= 4.3.0"
  };
  exports.REVISION_CHANGES = REVISION_CHANGES;
  var objectType = "[object Object]";
  function HandlebarsEnvironment(helpers, partials, decorators) {
    this.helpers = helpers || {};
    this.partials = partials || {};
    this.decorators = decorators || {};
    _helpers.registerDefaultHelpers(this);
    _decorators.registerDefaultDecorators(this);
  }
  HandlebarsEnvironment.prototype = {
    constructor: HandlebarsEnvironment,
    logger: _logger2["default"],
    log: _logger2["default"].log,
    registerHelper: function registerHelper(name, fn) {
      if (_utils.toString.call(name) === objectType) {
        if (fn) {
          throw new _exception2["default"]("Arg not supported with multiple helpers");
        }
        _utils.extend(this.helpers, name);
      } else {
        this.helpers[name] = fn;
      }
    },
    unregisterHelper: function unregisterHelper(name) {
      delete this.helpers[name];
    },
    registerPartial: function registerPartial(name, partial) {
      if (_utils.toString.call(name) === objectType) {
        _utils.extend(this.partials, name);
      } else {
        if (typeof partial === "undefined") {
          throw new _exception2["default"]('Attempting to register a partial called "' + name + '" as undefined');
        }
        this.partials[name] = partial;
      }
    },
    unregisterPartial: function unregisterPartial(name) {
      delete this.partials[name];
    },
    registerDecorator: function registerDecorator(name, fn) {
      if (_utils.toString.call(name) === objectType) {
        if (fn) {
          throw new _exception2["default"]("Arg not supported with multiple decorators");
        }
        _utils.extend(this.decorators, name);
      } else {
        this.decorators[name] = fn;
      }
    },
    unregisterDecorator: function unregisterDecorator(name) {
      delete this.decorators[name];
    },
    resetLoggedPropertyAccesses: function resetLoggedPropertyAccesses() {
      _internalProtoAccess.resetLoggedProperties();
    }
  };
  var log = _logger2["default"].log;
  exports.log = log;
  exports.createFrame = _utils.createFrame;
  exports.logger = _logger2["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/safe-string.js
var require_safe_string = __commonJS((exports, module) => {
  exports.__esModule = true;
  function SafeString(string) {
    this.string = string;
  }
  SafeString.prototype.toString = SafeString.prototype.toHTML = function() {
    return "" + this.string;
  };
  exports.default = SafeString;
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/internal/wrapHelper.js
var require_wrapHelper = __commonJS((exports) => {
  exports.__esModule = true;
  exports.wrapHelper = wrapHelper;
  function wrapHelper(helper, transformOptionsFn) {
    if (typeof helper !== "function") {
      return helper;
    }
    var wrapper = function wrapper2() {
      var options = arguments[arguments.length - 1];
      arguments[arguments.length - 1] = transformOptionsFn(options);
      return helper.apply(this, arguments);
    };
    return wrapper;
  }
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/runtime.js
var require_runtime = __commonJS((exports) => {
  exports.__esModule = true;
  exports.checkRevision = checkRevision;
  exports.template = template;
  exports.wrapProgram = wrapProgram;
  exports.resolvePartial = resolvePartial;
  exports.invokePartial = invokePartial;
  exports.noop = noop;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};
      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key))
            newObj[key] = obj[key];
        }
      }
      newObj["default"] = obj;
      return newObj;
    }
  }
  var _utils = require_utils();
  var Utils = _interopRequireWildcard(_utils);
  var _exception = require_exception();
  var _exception2 = _interopRequireDefault(_exception);
  var _base = require_base();
  var _helpers = require_helpers();
  var _internalWrapHelper = require_wrapHelper();
  var _internalProtoAccess = require_proto_access();
  function checkRevision(compilerInfo) {
    var compilerRevision = compilerInfo && compilerInfo[0] || 1, currentRevision = _base.COMPILER_REVISION;
    if (compilerRevision >= _base.LAST_COMPATIBLE_COMPILER_REVISION && compilerRevision <= _base.COMPILER_REVISION) {
      return;
    }
    if (compilerRevision < _base.LAST_COMPATIBLE_COMPILER_REVISION) {
      var runtimeVersions = _base.REVISION_CHANGES[currentRevision], compilerVersions = _base.REVISION_CHANGES[compilerRevision];
      throw new _exception2["default"]("Template was precompiled with an older version of Handlebars than the current runtime. " + "Please update your precompiler to a newer version (" + runtimeVersions + ") or downgrade your runtime to an older version (" + compilerVersions + ").");
    } else {
      throw new _exception2["default"]("Template was precompiled with a newer version of Handlebars than the current runtime. " + "Please update your runtime to a newer version (" + compilerInfo[1] + ").");
    }
  }
  function template(templateSpec, env) {
    if (!env) {
      throw new _exception2["default"]("No environment passed to template");
    }
    if (!templateSpec || !templateSpec.main) {
      throw new _exception2["default"]("Unknown template object: " + typeof templateSpec);
    }
    templateSpec.main.decorator = templateSpec.main_d;
    env.VM.checkRevision(templateSpec.compiler);
    var templateWasPrecompiledWithCompilerV7 = templateSpec.compiler && templateSpec.compiler[0] === 7;
    function invokePartialWrapper(partial, context, options) {
      if (options.hash) {
        context = Utils.extend({}, context, options.hash);
        if (options.ids) {
          options.ids[0] = true;
        }
      }
      partial = env.VM.resolvePartial.call(this, partial, context, options);
      options.hooks = this.hooks;
      options.protoAccessControl = this.protoAccessControl;
      var result = env.VM.invokePartial.call(this, partial, context, options);
      if (result == null && env.compile) {
        options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
        result = options.partials[options.name](context, options);
      }
      if (result != null) {
        if (options.indent) {
          var lines = result.split(`
`);
          for (var i = 0, l = lines.length;i < l; i++) {
            if (!lines[i] && i + 1 === l) {
              break;
            }
            lines[i] = options.indent + lines[i];
          }
          result = lines.join(`
`);
        }
        return result;
      } else {
        throw new _exception2["default"]("The partial " + options.name + " could not be compiled when running in runtime-only mode");
      }
    }
    var container = {
      strict: function strict(obj, name, loc) {
        if (!obj || !(name in obj)) {
          throw new _exception2["default"]('"' + name + '" not defined in ' + obj, {
            loc
          });
        }
        return container.lookupProperty(obj, name);
      },
      lookupProperty: function lookupProperty(parent, propertyName) {
        var result = parent[propertyName];
        if (result == null) {
          return result;
        }
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return result;
        }
        if (_internalProtoAccess.resultIsAllowed(result, container.protoAccessControl, propertyName)) {
          return result;
        }
        return;
      },
      lookup: function lookup(depths, name) {
        var len = depths.length;
        for (var i = 0;i < len; i++) {
          var result = depths[i] && container.lookupProperty(depths[i], name);
          if (result != null) {
            return result;
          }
        }
      },
      lambda: function lambda(current, context) {
        return typeof current === "function" ? current.call(context) : current;
      },
      escapeExpression: Utils.escapeExpression,
      invokePartial: invokePartialWrapper,
      fn: function fn(i) {
        var ret2 = templateSpec[i];
        ret2.decorator = templateSpec[i + "_d"];
        return ret2;
      },
      programs: [],
      program: function program2(i, data, declaredBlockParams, blockParams, depths) {
        var programWrapper = this.programs[i], fn = this.fn(i);
        if (data || depths || blockParams || declaredBlockParams) {
          programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = wrapProgram(this, i, fn);
        }
        return programWrapper;
      },
      data: function data(value, depth) {
        while (value && depth--) {
          value = value._parent;
        }
        return value;
      },
      mergeIfNeeded: function mergeIfNeeded(param, common) {
        var obj = param || common;
        if (param && common && param !== common) {
          obj = Utils.extend({}, common, param);
        }
        return obj;
      },
      nullContext: Object.seal({}),
      noop: env.VM.noop,
      compilerInfo: templateSpec.compiler
    };
    function ret(context) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var data = options.data;
      ret._setup(options);
      if (!options.partial && templateSpec.useData) {
        data = initData(context, data);
      }
      var depths = undefined, blockParams = templateSpec.useBlockParams ? [] : undefined;
      if (templateSpec.useDepths) {
        if (options.depths) {
          depths = context != options.depths[0] ? [context].concat(options.depths) : options.depths;
        } else {
          depths = [context];
        }
      }
      function main(context2) {
        return "" + templateSpec.main(container, context2, container.helpers, container.partials, data, blockParams, depths);
      }
      main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
      return main(context, options);
    }
    ret.isTop = true;
    ret._setup = function(options) {
      if (!options.partial) {
        var mergedHelpers = {};
        addHelpers(mergedHelpers, env.helpers, container);
        addHelpers(mergedHelpers, options.helpers, container);
        container.helpers = mergedHelpers;
        if (templateSpec.usePartial) {
          container.partials = container.mergeIfNeeded(options.partials, env.partials);
        }
        if (templateSpec.usePartial || templateSpec.useDecorators) {
          container.decorators = Utils.extend({}, env.decorators, options.decorators);
        }
        container.hooks = {};
        container.protoAccessControl = _internalProtoAccess.createProtoAccessControl(options);
        var keepHelperInHelpers = options.allowCallsToHelperMissing || templateWasPrecompiledWithCompilerV7;
        _helpers.moveHelperToHooks(container, "helperMissing", keepHelperInHelpers);
        _helpers.moveHelperToHooks(container, "blockHelperMissing", keepHelperInHelpers);
      } else {
        container.protoAccessControl = options.protoAccessControl;
        container.helpers = options.helpers;
        container.partials = options.partials;
        container.decorators = options.decorators;
        container.hooks = options.hooks;
      }
    };
    ret._child = function(i, data, blockParams, depths) {
      if (templateSpec.useBlockParams && !blockParams) {
        throw new _exception2["default"]("must pass block params");
      }
      if (templateSpec.useDepths && !depths) {
        throw new _exception2["default"]("must pass parent depths");
      }
      return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
    };
    return ret;
  }
  function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
    function prog(context) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var currentDepths = depths;
      if (depths && context != depths[0] && !(context === container.nullContext && depths[0] === null)) {
        currentDepths = [context].concat(depths);
      }
      return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
    }
    prog = executeDecorators(fn, prog, container, depths, data, blockParams);
    prog.program = i;
    prog.depth = depths ? depths.length : 0;
    prog.blockParams = declaredBlockParams || 0;
    return prog;
  }
  function resolvePartial(partial, context, options) {
    if (!partial) {
      if (options.name === "@partial-block") {
        partial = lookupOwnProperty(options.data, "partial-block");
      } else {
        partial = lookupOwnProperty(options.partials, options.name);
      }
    } else if (!partial.call && !options.name) {
      options.name = partial;
      partial = lookupOwnProperty(options.partials, partial);
    }
    return partial;
  }
  function invokePartial(partial, context, options) {
    var currentPartialBlock = lookupOwnProperty(options.data, "partial-block");
    options.partial = true;
    if (options.ids) {
      options.data.contextPath = options.ids[0] || options.data.contextPath;
    }
    var partialBlock = undefined;
    if (options.fn && options.fn !== noop) {
      (function() {
        options.data = _base.createFrame(options.data);
        var fn = options.fn;
        partialBlock = options.data["partial-block"] = function partialBlockWrapper(context2) {
          var options2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
          options2.data = _base.createFrame(options2.data);
          options2.data["partial-block"] = currentPartialBlock;
          return fn(context2, options2);
        };
        if (fn.partials) {
          options.partials = Utils.extend({}, options.partials, fn.partials);
        }
      })();
    }
    if (partial === undefined && partialBlock) {
      partial = partialBlock;
    }
    if (partial === undefined) {
      throw new _exception2["default"]("The partial " + options.name + " could not be found");
    } else if (partial instanceof Function) {
      return partial(context, options);
    }
  }
  function noop() {
    return "";
  }
  function lookupOwnProperty(obj, name) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, name)) {
      return obj[name];
    }
  }
  function initData(context, data) {
    if (!data || !("root" in data)) {
      data = data ? _base.createFrame(data) : {};
      data.root = context;
    }
    return data;
  }
  function executeDecorators(fn, prog, container, depths, data, blockParams) {
    if (fn.decorator) {
      var props = {};
      prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
      Utils.extend(prog, props);
    }
    return prog;
  }
  function addHelpers(mergedHelpers, helpers, container) {
    if (!helpers)
      return;
    Object.keys(helpers).forEach(function(helperName) {
      var helper = helpers[helperName];
      mergedHelpers[helperName] = passLookupPropertyOption(helper, container);
    });
  }
  function passLookupPropertyOption(helper, container) {
    var lookupProperty = container.lookupProperty;
    return _internalWrapHelper.wrapHelper(helper, function(options) {
      options.lookupProperty = lookupProperty;
      return options;
    });
  }
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/no-conflict.js
var require_no_conflict = __commonJS((exports, module) => {
  exports.__esModule = true;
  exports.default = function(Handlebars) {
    (function() {
      if (typeof globalThis === "object")
        return;
      Object.prototype.__defineGetter__("__magic__", function() {
        return this;
      });
      __magic__.globalThis = __magic__;
      delete Object.prototype.__magic__;
    })();
    var $Handlebars = globalThis.Handlebars;
    Handlebars.noConflict = function() {
      if (globalThis.Handlebars === Handlebars) {
        globalThis.Handlebars = $Handlebars;
      }
      return Handlebars;
    };
  };
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars.runtime.js
var require_handlebars_runtime = __commonJS((exports, module) => {
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};
      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key))
            newObj[key] = obj[key];
        }
      }
      newObj["default"] = obj;
      return newObj;
    }
  }
  var _handlebarsBase = require_base();
  var base = _interopRequireWildcard(_handlebarsBase);
  var _handlebarsSafeString = require_safe_string();
  var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);
  var _handlebarsException = require_exception();
  var _handlebarsException2 = _interopRequireDefault(_handlebarsException);
  var _handlebarsUtils = require_utils();
  var Utils = _interopRequireWildcard(_handlebarsUtils);
  var _handlebarsRuntime = require_runtime();
  var runtime = _interopRequireWildcard(_handlebarsRuntime);
  var _handlebarsNoConflict = require_no_conflict();
  var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);
  function create() {
    var hb = new base.HandlebarsEnvironment;
    Utils.extend(hb, base);
    hb.SafeString = _handlebarsSafeString2["default"];
    hb.Exception = _handlebarsException2["default"];
    hb.Utils = Utils;
    hb.escapeExpression = Utils.escapeExpression;
    hb.VM = runtime;
    hb.template = function(spec) {
      return runtime.template(spec, hb);
    };
    return hb;
  }
  var inst = create();
  inst.create = create;
  _handlebarsNoConflict2["default"](inst);
  inst["default"] = inst;
  exports.default = inst;
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/compiler/ast.js
var require_ast = __commonJS((exports, module) => {
  exports.__esModule = true;
  var AST = {
    helpers: {
      helperExpression: function helperExpression(node) {
        return node.type === "SubExpression" || (node.type === "MustacheStatement" || node.type === "BlockStatement") && !!(node.params && node.params.length || node.hash);
      },
      scopedId: function scopedId(path4) {
        return /^\.|this\b/.test(path4.original);
      },
      simpleId: function simpleId(path4) {
        return path4.parts.length === 1 && !AST.helpers.scopedId(path4) && !path4.depth;
      }
    }
  };
  exports.default = AST;
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/compiler/parser.js
var require_parser = __commonJS((exports, module) => {
  exports.__esModule = true;
  var handlebars = function() {
    var parser = {
      trace: function trace() {},
      yy: {},
      symbols_: { error: 2, root: 3, program: 4, EOF: 5, program_repetition0: 6, statement: 7, mustache: 8, block: 9, rawBlock: 10, partial: 11, partialBlock: 12, content: 13, COMMENT: 14, CONTENT: 15, openRawBlock: 16, rawBlock_repetition0: 17, END_RAW_BLOCK: 18, OPEN_RAW_BLOCK: 19, helperName: 20, openRawBlock_repetition0: 21, openRawBlock_option0: 22, CLOSE_RAW_BLOCK: 23, openBlock: 24, block_option0: 25, closeBlock: 26, openInverse: 27, block_option1: 28, OPEN_BLOCK: 29, openBlock_repetition0: 30, openBlock_option0: 31, openBlock_option1: 32, CLOSE: 33, OPEN_INVERSE: 34, openInverse_repetition0: 35, openInverse_option0: 36, openInverse_option1: 37, openInverseChain: 38, OPEN_INVERSE_CHAIN: 39, openInverseChain_repetition0: 40, openInverseChain_option0: 41, openInverseChain_option1: 42, inverseAndProgram: 43, INVERSE: 44, inverseChain: 45, inverseChain_option0: 46, OPEN_ENDBLOCK: 47, OPEN: 48, mustache_repetition0: 49, mustache_option0: 50, OPEN_UNESCAPED: 51, mustache_repetition1: 52, mustache_option1: 53, CLOSE_UNESCAPED: 54, OPEN_PARTIAL: 55, partialName: 56, partial_repetition0: 57, partial_option0: 58, openPartialBlock: 59, OPEN_PARTIAL_BLOCK: 60, openPartialBlock_repetition0: 61, openPartialBlock_option0: 62, param: 63, sexpr: 64, OPEN_SEXPR: 65, sexpr_repetition0: 66, sexpr_option0: 67, CLOSE_SEXPR: 68, hash: 69, hash_repetition_plus0: 70, hashSegment: 71, ID: 72, EQUALS: 73, blockParams: 74, OPEN_BLOCK_PARAMS: 75, blockParams_repetition_plus0: 76, CLOSE_BLOCK_PARAMS: 77, path: 78, dataName: 79, STRING: 80, NUMBER: 81, BOOLEAN: 82, UNDEFINED: 83, NULL: 84, DATA: 85, pathSegments: 86, SEP: 87, $accept: 0, $end: 1 },
      terminals_: { 2: "error", 5: "EOF", 14: "COMMENT", 15: "CONTENT", 18: "END_RAW_BLOCK", 19: "OPEN_RAW_BLOCK", 23: "CLOSE_RAW_BLOCK", 29: "OPEN_BLOCK", 33: "CLOSE", 34: "OPEN_INVERSE", 39: "OPEN_INVERSE_CHAIN", 44: "INVERSE", 47: "OPEN_ENDBLOCK", 48: "OPEN", 51: "OPEN_UNESCAPED", 54: "CLOSE_UNESCAPED", 55: "OPEN_PARTIAL", 60: "OPEN_PARTIAL_BLOCK", 65: "OPEN_SEXPR", 68: "CLOSE_SEXPR", 72: "ID", 73: "EQUALS", 75: "OPEN_BLOCK_PARAMS", 77: "CLOSE_BLOCK_PARAMS", 80: "STRING", 81: "NUMBER", 82: "BOOLEAN", 83: "UNDEFINED", 84: "NULL", 85: "DATA", 87: "SEP" },
      productions_: [0, [3, 2], [4, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [13, 1], [10, 3], [16, 5], [9, 4], [9, 4], [24, 6], [27, 6], [38, 6], [43, 2], [45, 3], [45, 1], [26, 3], [8, 5], [8, 5], [11, 5], [12, 3], [59, 5], [63, 1], [63, 1], [64, 5], [69, 1], [71, 3], [74, 3], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [56, 1], [56, 1], [79, 2], [78, 1], [86, 3], [86, 1], [6, 0], [6, 2], [17, 0], [17, 2], [21, 0], [21, 2], [22, 0], [22, 1], [25, 0], [25, 1], [28, 0], [28, 1], [30, 0], [30, 2], [31, 0], [31, 1], [32, 0], [32, 1], [35, 0], [35, 2], [36, 0], [36, 1], [37, 0], [37, 1], [40, 0], [40, 2], [41, 0], [41, 1], [42, 0], [42, 1], [46, 0], [46, 1], [49, 0], [49, 2], [50, 0], [50, 1], [52, 0], [52, 2], [53, 0], [53, 1], [57, 0], [57, 2], [58, 0], [58, 1], [61, 0], [61, 2], [62, 0], [62, 1], [66, 0], [66, 2], [67, 0], [67, 1], [70, 1], [70, 2], [76, 1], [76, 2]],
      performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
        var $0 = $$.length - 1;
        switch (yystate) {
          case 1:
            return $$[$0 - 1];
            break;
          case 2:
            this.$ = yy.prepareProgram($$[$0]);
            break;
          case 3:
            this.$ = $$[$0];
            break;
          case 4:
            this.$ = $$[$0];
            break;
          case 5:
            this.$ = $$[$0];
            break;
          case 6:
            this.$ = $$[$0];
            break;
          case 7:
            this.$ = $$[$0];
            break;
          case 8:
            this.$ = $$[$0];
            break;
          case 9:
            this.$ = {
              type: "CommentStatement",
              value: yy.stripComment($$[$0]),
              strip: yy.stripFlags($$[$0], $$[$0]),
              loc: yy.locInfo(this._$)
            };
            break;
          case 10:
            this.$ = {
              type: "ContentStatement",
              original: $$[$0],
              value: $$[$0],
              loc: yy.locInfo(this._$)
            };
            break;
          case 11:
            this.$ = yy.prepareRawBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
            break;
          case 12:
            this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1] };
            break;
          case 13:
            this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], false, this._$);
            break;
          case 14:
            this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], true, this._$);
            break;
          case 15:
            this.$ = { open: $$[$0 - 5], path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
            break;
          case 16:
            this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
            break;
          case 17:
            this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
            break;
          case 18:
            this.$ = { strip: yy.stripFlags($$[$0 - 1], $$[$0 - 1]), program: $$[$0] };
            break;
          case 19:
            var inverse = yy.prepareBlock($$[$0 - 2], $$[$0 - 1], $$[$0], $$[$0], false, this._$), program2 = yy.prepareProgram([inverse], $$[$0 - 1].loc);
            program2.chained = true;
            this.$ = { strip: $$[$0 - 2].strip, program: program2, chain: true };
            break;
          case 20:
            this.$ = $$[$0];
            break;
          case 21:
            this.$ = { path: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 2], $$[$0]) };
            break;
          case 22:
            this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
            break;
          case 23:
            this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
            break;
          case 24:
            this.$ = {
              type: "PartialStatement",
              name: $$[$0 - 3],
              params: $$[$0 - 2],
              hash: $$[$0 - 1],
              indent: "",
              strip: yy.stripFlags($$[$0 - 4], $$[$0]),
              loc: yy.locInfo(this._$)
            };
            break;
          case 25:
            this.$ = yy.preparePartialBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
            break;
          case 26:
            this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 4], $$[$0]) };
            break;
          case 27:
            this.$ = $$[$0];
            break;
          case 28:
            this.$ = $$[$0];
            break;
          case 29:
            this.$ = {
              type: "SubExpression",
              path: $$[$0 - 3],
              params: $$[$0 - 2],
              hash: $$[$0 - 1],
              loc: yy.locInfo(this._$)
            };
            break;
          case 30:
            this.$ = { type: "Hash", pairs: $$[$0], loc: yy.locInfo(this._$) };
            break;
          case 31:
            this.$ = { type: "HashPair", key: yy.id($$[$0 - 2]), value: $$[$0], loc: yy.locInfo(this._$) };
            break;
          case 32:
            this.$ = yy.id($$[$0 - 1]);
            break;
          case 33:
            this.$ = $$[$0];
            break;
          case 34:
            this.$ = $$[$0];
            break;
          case 35:
            this.$ = { type: "StringLiteral", value: $$[$0], original: $$[$0], loc: yy.locInfo(this._$) };
            break;
          case 36:
            this.$ = { type: "NumberLiteral", value: Number($$[$0]), original: Number($$[$0]), loc: yy.locInfo(this._$) };
            break;
          case 37:
            this.$ = { type: "BooleanLiteral", value: $$[$0] === "true", original: $$[$0] === "true", loc: yy.locInfo(this._$) };
            break;
          case 38:
            this.$ = { type: "UndefinedLiteral", original: undefined, value: undefined, loc: yy.locInfo(this._$) };
            break;
          case 39:
            this.$ = { type: "NullLiteral", original: null, value: null, loc: yy.locInfo(this._$) };
            break;
          case 40:
            this.$ = $$[$0];
            break;
          case 41:
            this.$ = $$[$0];
            break;
          case 42:
            this.$ = yy.preparePath(true, $$[$0], this._$);
            break;
          case 43:
            this.$ = yy.preparePath(false, $$[$0], this._$);
            break;
          case 44:
            $$[$0 - 2].push({ part: yy.id($$[$0]), original: $$[$0], separator: $$[$0 - 1] });
            this.$ = $$[$0 - 2];
            break;
          case 45:
            this.$ = [{ part: yy.id($$[$0]), original: $$[$0] }];
            break;
          case 46:
            this.$ = [];
            break;
          case 47:
            $$[$0 - 1].push($$[$0]);
            break;
          case 48:
            this.$ = [];
            break;
          case 49:
            $$[$0 - 1].push($$[$0]);
            break;
          case 50:
            this.$ = [];
            break;
          case 51:
            $$[$0 - 1].push($$[$0]);
            break;
          case 58:
            this.$ = [];
            break;
          case 59:
            $$[$0 - 1].push($$[$0]);
            break;
          case 64:
            this.$ = [];
            break;
          case 65:
            $$[$0 - 1].push($$[$0]);
            break;
          case 70:
            this.$ = [];
            break;
          case 71:
            $$[$0 - 1].push($$[$0]);
            break;
          case 78:
            this.$ = [];
            break;
          case 79:
            $$[$0 - 1].push($$[$0]);
            break;
          case 82:
            this.$ = [];
            break;
          case 83:
            $$[$0 - 1].push($$[$0]);
            break;
          case 86:
            this.$ = [];
            break;
          case 87:
            $$[$0 - 1].push($$[$0]);
            break;
          case 90:
            this.$ = [];
            break;
          case 91:
            $$[$0 - 1].push($$[$0]);
            break;
          case 94:
            this.$ = [];
            break;
          case 95:
            $$[$0 - 1].push($$[$0]);
            break;
          case 98:
            this.$ = [$$[$0]];
            break;
          case 99:
            $$[$0 - 1].push($$[$0]);
            break;
          case 100:
            this.$ = [$$[$0]];
            break;
          case 101:
            $$[$0 - 1].push($$[$0]);
            break;
        }
      },
      table: [{ 3: 1, 4: 2, 5: [2, 46], 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 1: [3] }, { 5: [1, 4] }, { 5: [2, 2], 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: 11, 14: [1, 12], 15: [1, 20], 16: 17, 19: [1, 23], 24: 15, 27: 16, 29: [1, 21], 34: [1, 22], 39: [2, 2], 44: [2, 2], 47: [2, 2], 48: [1, 13], 51: [1, 14], 55: [1, 18], 59: 19, 60: [1, 24] }, { 1: [2, 1] }, { 5: [2, 47], 14: [2, 47], 15: [2, 47], 19: [2, 47], 29: [2, 47], 34: [2, 47], 39: [2, 47], 44: [2, 47], 47: [2, 47], 48: [2, 47], 51: [2, 47], 55: [2, 47], 60: [2, 47] }, { 5: [2, 3], 14: [2, 3], 15: [2, 3], 19: [2, 3], 29: [2, 3], 34: [2, 3], 39: [2, 3], 44: [2, 3], 47: [2, 3], 48: [2, 3], 51: [2, 3], 55: [2, 3], 60: [2, 3] }, { 5: [2, 4], 14: [2, 4], 15: [2, 4], 19: [2, 4], 29: [2, 4], 34: [2, 4], 39: [2, 4], 44: [2, 4], 47: [2, 4], 48: [2, 4], 51: [2, 4], 55: [2, 4], 60: [2, 4] }, { 5: [2, 5], 14: [2, 5], 15: [2, 5], 19: [2, 5], 29: [2, 5], 34: [2, 5], 39: [2, 5], 44: [2, 5], 47: [2, 5], 48: [2, 5], 51: [2, 5], 55: [2, 5], 60: [2, 5] }, { 5: [2, 6], 14: [2, 6], 15: [2, 6], 19: [2, 6], 29: [2, 6], 34: [2, 6], 39: [2, 6], 44: [2, 6], 47: [2, 6], 48: [2, 6], 51: [2, 6], 55: [2, 6], 60: [2, 6] }, { 5: [2, 7], 14: [2, 7], 15: [2, 7], 19: [2, 7], 29: [2, 7], 34: [2, 7], 39: [2, 7], 44: [2, 7], 47: [2, 7], 48: [2, 7], 51: [2, 7], 55: [2, 7], 60: [2, 7] }, { 5: [2, 8], 14: [2, 8], 15: [2, 8], 19: [2, 8], 29: [2, 8], 34: [2, 8], 39: [2, 8], 44: [2, 8], 47: [2, 8], 48: [2, 8], 51: [2, 8], 55: [2, 8], 60: [2, 8] }, { 5: [2, 9], 14: [2, 9], 15: [2, 9], 19: [2, 9], 29: [2, 9], 34: [2, 9], 39: [2, 9], 44: [2, 9], 47: [2, 9], 48: [2, 9], 51: [2, 9], 55: [2, 9], 60: [2, 9] }, { 20: 25, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 36, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 37, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 39: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 4: 38, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 15: [2, 48], 17: 39, 18: [2, 48] }, { 20: 41, 56: 40, 64: 42, 65: [1, 43], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 44, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 5: [2, 10], 14: [2, 10], 15: [2, 10], 18: [2, 10], 19: [2, 10], 29: [2, 10], 34: [2, 10], 39: [2, 10], 44: [2, 10], 47: [2, 10], 48: [2, 10], 51: [2, 10], 55: [2, 10], 60: [2, 10] }, { 20: 45, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 46, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 47, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 41, 56: 48, 64: 42, 65: [1, 43], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [2, 78], 49: 49, 65: [2, 78], 72: [2, 78], 80: [2, 78], 81: [2, 78], 82: [2, 78], 83: [2, 78], 84: [2, 78], 85: [2, 78] }, { 23: [2, 33], 33: [2, 33], 54: [2, 33], 65: [2, 33], 68: [2, 33], 72: [2, 33], 75: [2, 33], 80: [2, 33], 81: [2, 33], 82: [2, 33], 83: [2, 33], 84: [2, 33], 85: [2, 33] }, { 23: [2, 34], 33: [2, 34], 54: [2, 34], 65: [2, 34], 68: [2, 34], 72: [2, 34], 75: [2, 34], 80: [2, 34], 81: [2, 34], 82: [2, 34], 83: [2, 34], 84: [2, 34], 85: [2, 34] }, { 23: [2, 35], 33: [2, 35], 54: [2, 35], 65: [2, 35], 68: [2, 35], 72: [2, 35], 75: [2, 35], 80: [2, 35], 81: [2, 35], 82: [2, 35], 83: [2, 35], 84: [2, 35], 85: [2, 35] }, { 23: [2, 36], 33: [2, 36], 54: [2, 36], 65: [2, 36], 68: [2, 36], 72: [2, 36], 75: [2, 36], 80: [2, 36], 81: [2, 36], 82: [2, 36], 83: [2, 36], 84: [2, 36], 85: [2, 36] }, { 23: [2, 37], 33: [2, 37], 54: [2, 37], 65: [2, 37], 68: [2, 37], 72: [2, 37], 75: [2, 37], 80: [2, 37], 81: [2, 37], 82: [2, 37], 83: [2, 37], 84: [2, 37], 85: [2, 37] }, { 23: [2, 38], 33: [2, 38], 54: [2, 38], 65: [2, 38], 68: [2, 38], 72: [2, 38], 75: [2, 38], 80: [2, 38], 81: [2, 38], 82: [2, 38], 83: [2, 38], 84: [2, 38], 85: [2, 38] }, { 23: [2, 39], 33: [2, 39], 54: [2, 39], 65: [2, 39], 68: [2, 39], 72: [2, 39], 75: [2, 39], 80: [2, 39], 81: [2, 39], 82: [2, 39], 83: [2, 39], 84: [2, 39], 85: [2, 39] }, { 23: [2, 43], 33: [2, 43], 54: [2, 43], 65: [2, 43], 68: [2, 43], 72: [2, 43], 75: [2, 43], 80: [2, 43], 81: [2, 43], 82: [2, 43], 83: [2, 43], 84: [2, 43], 85: [2, 43], 87: [1, 50] }, { 72: [1, 35], 86: 51 }, { 23: [2, 45], 33: [2, 45], 54: [2, 45], 65: [2, 45], 68: [2, 45], 72: [2, 45], 75: [2, 45], 80: [2, 45], 81: [2, 45], 82: [2, 45], 83: [2, 45], 84: [2, 45], 85: [2, 45], 87: [2, 45] }, { 52: 52, 54: [2, 82], 65: [2, 82], 72: [2, 82], 80: [2, 82], 81: [2, 82], 82: [2, 82], 83: [2, 82], 84: [2, 82], 85: [2, 82] }, { 25: 53, 38: 55, 39: [1, 57], 43: 56, 44: [1, 58], 45: 54, 47: [2, 54] }, { 28: 59, 43: 60, 44: [1, 58], 47: [2, 56] }, { 13: 62, 15: [1, 20], 18: [1, 61] }, { 33: [2, 86], 57: 63, 65: [2, 86], 72: [2, 86], 80: [2, 86], 81: [2, 86], 82: [2, 86], 83: [2, 86], 84: [2, 86], 85: [2, 86] }, { 33: [2, 40], 65: [2, 40], 72: [2, 40], 80: [2, 40], 81: [2, 40], 82: [2, 40], 83: [2, 40], 84: [2, 40], 85: [2, 40] }, { 33: [2, 41], 65: [2, 41], 72: [2, 41], 80: [2, 41], 81: [2, 41], 82: [2, 41], 83: [2, 41], 84: [2, 41], 85: [2, 41] }, { 20: 64, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 26: 65, 47: [1, 66] }, { 30: 67, 33: [2, 58], 65: [2, 58], 72: [2, 58], 75: [2, 58], 80: [2, 58], 81: [2, 58], 82: [2, 58], 83: [2, 58], 84: [2, 58], 85: [2, 58] }, { 33: [2, 64], 35: 68, 65: [2, 64], 72: [2, 64], 75: [2, 64], 80: [2, 64], 81: [2, 64], 82: [2, 64], 83: [2, 64], 84: [2, 64], 85: [2, 64] }, { 21: 69, 23: [2, 50], 65: [2, 50], 72: [2, 50], 80: [2, 50], 81: [2, 50], 82: [2, 50], 83: [2, 50], 84: [2, 50], 85: [2, 50] }, { 33: [2, 90], 61: 70, 65: [2, 90], 72: [2, 90], 80: [2, 90], 81: [2, 90], 82: [2, 90], 83: [2, 90], 84: [2, 90], 85: [2, 90] }, { 20: 74, 33: [2, 80], 50: 71, 63: 72, 64: 75, 65: [1, 43], 69: 73, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 72: [1, 79] }, { 23: [2, 42], 33: [2, 42], 54: [2, 42], 65: [2, 42], 68: [2, 42], 72: [2, 42], 75: [2, 42], 80: [2, 42], 81: [2, 42], 82: [2, 42], 83: [2, 42], 84: [2, 42], 85: [2, 42], 87: [1, 50] }, { 20: 74, 53: 80, 54: [2, 84], 63: 81, 64: 75, 65: [1, 43], 69: 82, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 26: 83, 47: [1, 66] }, { 47: [2, 55] }, { 4: 84, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 39: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 47: [2, 20] }, { 20: 85, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 86, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 26: 87, 47: [1, 66] }, { 47: [2, 57] }, { 5: [2, 11], 14: [2, 11], 15: [2, 11], 19: [2, 11], 29: [2, 11], 34: [2, 11], 39: [2, 11], 44: [2, 11], 47: [2, 11], 48: [2, 11], 51: [2, 11], 55: [2, 11], 60: [2, 11] }, { 15: [2, 49], 18: [2, 49] }, { 20: 74, 33: [2, 88], 58: 88, 63: 89, 64: 75, 65: [1, 43], 69: 90, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 65: [2, 94], 66: 91, 68: [2, 94], 72: [2, 94], 80: [2, 94], 81: [2, 94], 82: [2, 94], 83: [2, 94], 84: [2, 94], 85: [2, 94] }, { 5: [2, 25], 14: [2, 25], 15: [2, 25], 19: [2, 25], 29: [2, 25], 34: [2, 25], 39: [2, 25], 44: [2, 25], 47: [2, 25], 48: [2, 25], 51: [2, 25], 55: [2, 25], 60: [2, 25] }, { 20: 92, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 74, 31: 93, 33: [2, 60], 63: 94, 64: 75, 65: [1, 43], 69: 95, 70: 76, 71: 77, 72: [1, 78], 75: [2, 60], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 74, 33: [2, 66], 36: 96, 63: 97, 64: 75, 65: [1, 43], 69: 98, 70: 76, 71: 77, 72: [1, 78], 75: [2, 66], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 74, 22: 99, 23: [2, 52], 63: 100, 64: 75, 65: [1, 43], 69: 101, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 74, 33: [2, 92], 62: 102, 63: 103, 64: 75, 65: [1, 43], 69: 104, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [1, 105] }, { 33: [2, 79], 65: [2, 79], 72: [2, 79], 80: [2, 79], 81: [2, 79], 82: [2, 79], 83: [2, 79], 84: [2, 79], 85: [2, 79] }, { 33: [2, 81] }, { 23: [2, 27], 33: [2, 27], 54: [2, 27], 65: [2, 27], 68: [2, 27], 72: [2, 27], 75: [2, 27], 80: [2, 27], 81: [2, 27], 82: [2, 27], 83: [2, 27], 84: [2, 27], 85: [2, 27] }, { 23: [2, 28], 33: [2, 28], 54: [2, 28], 65: [2, 28], 68: [2, 28], 72: [2, 28], 75: [2, 28], 80: [2, 28], 81: [2, 28], 82: [2, 28], 83: [2, 28], 84: [2, 28], 85: [2, 28] }, { 23: [2, 30], 33: [2, 30], 54: [2, 30], 68: [2, 30], 71: 106, 72: [1, 107], 75: [2, 30] }, { 23: [2, 98], 33: [2, 98], 54: [2, 98], 68: [2, 98], 72: [2, 98], 75: [2, 98] }, { 23: [2, 45], 33: [2, 45], 54: [2, 45], 65: [2, 45], 68: [2, 45], 72: [2, 45], 73: [1, 108], 75: [2, 45], 80: [2, 45], 81: [2, 45], 82: [2, 45], 83: [2, 45], 84: [2, 45], 85: [2, 45], 87: [2, 45] }, { 23: [2, 44], 33: [2, 44], 54: [2, 44], 65: [2, 44], 68: [2, 44], 72: [2, 44], 75: [2, 44], 80: [2, 44], 81: [2, 44], 82: [2, 44], 83: [2, 44], 84: [2, 44], 85: [2, 44], 87: [2, 44] }, { 54: [1, 109] }, { 54: [2, 83], 65: [2, 83], 72: [2, 83], 80: [2, 83], 81: [2, 83], 82: [2, 83], 83: [2, 83], 84: [2, 83], 85: [2, 83] }, { 54: [2, 85] }, { 5: [2, 13], 14: [2, 13], 15: [2, 13], 19: [2, 13], 29: [2, 13], 34: [2, 13], 39: [2, 13], 44: [2, 13], 47: [2, 13], 48: [2, 13], 51: [2, 13], 55: [2, 13], 60: [2, 13] }, { 38: 55, 39: [1, 57], 43: 56, 44: [1, 58], 45: 111, 46: 110, 47: [2, 76] }, { 33: [2, 70], 40: 112, 65: [2, 70], 72: [2, 70], 75: [2, 70], 80: [2, 70], 81: [2, 70], 82: [2, 70], 83: [2, 70], 84: [2, 70], 85: [2, 70] }, { 47: [2, 18] }, { 5: [2, 14], 14: [2, 14], 15: [2, 14], 19: [2, 14], 29: [2, 14], 34: [2, 14], 39: [2, 14], 44: [2, 14], 47: [2, 14], 48: [2, 14], 51: [2, 14], 55: [2, 14], 60: [2, 14] }, { 33: [1, 113] }, { 33: [2, 87], 65: [2, 87], 72: [2, 87], 80: [2, 87], 81: [2, 87], 82: [2, 87], 83: [2, 87], 84: [2, 87], 85: [2, 87] }, { 33: [2, 89] }, { 20: 74, 63: 115, 64: 75, 65: [1, 43], 67: 114, 68: [2, 96], 69: 116, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [1, 117] }, { 32: 118, 33: [2, 62], 74: 119, 75: [1, 120] }, { 33: [2, 59], 65: [2, 59], 72: [2, 59], 75: [2, 59], 80: [2, 59], 81: [2, 59], 82: [2, 59], 83: [2, 59], 84: [2, 59], 85: [2, 59] }, { 33: [2, 61], 75: [2, 61] }, { 33: [2, 68], 37: 121, 74: 122, 75: [1, 120] }, { 33: [2, 65], 65: [2, 65], 72: [2, 65], 75: [2, 65], 80: [2, 65], 81: [2, 65], 82: [2, 65], 83: [2, 65], 84: [2, 65], 85: [2, 65] }, { 33: [2, 67], 75: [2, 67] }, { 23: [1, 123] }, { 23: [2, 51], 65: [2, 51], 72: [2, 51], 80: [2, 51], 81: [2, 51], 82: [2, 51], 83: [2, 51], 84: [2, 51], 85: [2, 51] }, { 23: [2, 53] }, { 33: [1, 124] }, { 33: [2, 91], 65: [2, 91], 72: [2, 91], 80: [2, 91], 81: [2, 91], 82: [2, 91], 83: [2, 91], 84: [2, 91], 85: [2, 91] }, { 33: [2, 93] }, { 5: [2, 22], 14: [2, 22], 15: [2, 22], 19: [2, 22], 29: [2, 22], 34: [2, 22], 39: [2, 22], 44: [2, 22], 47: [2, 22], 48: [2, 22], 51: [2, 22], 55: [2, 22], 60: [2, 22] }, { 23: [2, 99], 33: [2, 99], 54: [2, 99], 68: [2, 99], 72: [2, 99], 75: [2, 99] }, { 73: [1, 108] }, { 20: 74, 63: 125, 64: 75, 65: [1, 43], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 5: [2, 23], 14: [2, 23], 15: [2, 23], 19: [2, 23], 29: [2, 23], 34: [2, 23], 39: [2, 23], 44: [2, 23], 47: [2, 23], 48: [2, 23], 51: [2, 23], 55: [2, 23], 60: [2, 23] }, { 47: [2, 19] }, { 47: [2, 77] }, { 20: 74, 33: [2, 72], 41: 126, 63: 127, 64: 75, 65: [1, 43], 69: 128, 70: 76, 71: 77, 72: [1, 78], 75: [2, 72], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 5: [2, 24], 14: [2, 24], 15: [2, 24], 19: [2, 24], 29: [2, 24], 34: [2, 24], 39: [2, 24], 44: [2, 24], 47: [2, 24], 48: [2, 24], 51: [2, 24], 55: [2, 24], 60: [2, 24] }, { 68: [1, 129] }, { 65: [2, 95], 68: [2, 95], 72: [2, 95], 80: [2, 95], 81: [2, 95], 82: [2, 95], 83: [2, 95], 84: [2, 95], 85: [2, 95] }, { 68: [2, 97] }, { 5: [2, 21], 14: [2, 21], 15: [2, 21], 19: [2, 21], 29: [2, 21], 34: [2, 21], 39: [2, 21], 44: [2, 21], 47: [2, 21], 48: [2, 21], 51: [2, 21], 55: [2, 21], 60: [2, 21] }, { 33: [1, 130] }, { 33: [2, 63] }, { 72: [1, 132], 76: 131 }, { 33: [1, 133] }, { 33: [2, 69] }, { 15: [2, 12], 18: [2, 12] }, { 14: [2, 26], 15: [2, 26], 19: [2, 26], 29: [2, 26], 34: [2, 26], 47: [2, 26], 48: [2, 26], 51: [2, 26], 55: [2, 26], 60: [2, 26] }, { 23: [2, 31], 33: [2, 31], 54: [2, 31], 68: [2, 31], 72: [2, 31], 75: [2, 31] }, { 33: [2, 74], 42: 134, 74: 135, 75: [1, 120] }, { 33: [2, 71], 65: [2, 71], 72: [2, 71], 75: [2, 71], 80: [2, 71], 81: [2, 71], 82: [2, 71], 83: [2, 71], 84: [2, 71], 85: [2, 71] }, { 33: [2, 73], 75: [2, 73] }, { 23: [2, 29], 33: [2, 29], 54: [2, 29], 65: [2, 29], 68: [2, 29], 72: [2, 29], 75: [2, 29], 80: [2, 29], 81: [2, 29], 82: [2, 29], 83: [2, 29], 84: [2, 29], 85: [2, 29] }, { 14: [2, 15], 15: [2, 15], 19: [2, 15], 29: [2, 15], 34: [2, 15], 39: [2, 15], 44: [2, 15], 47: [2, 15], 48: [2, 15], 51: [2, 15], 55: [2, 15], 60: [2, 15] }, { 72: [1, 137], 77: [1, 136] }, { 72: [2, 100], 77: [2, 100] }, { 14: [2, 16], 15: [2, 16], 19: [2, 16], 29: [2, 16], 34: [2, 16], 44: [2, 16], 47: [2, 16], 48: [2, 16], 51: [2, 16], 55: [2, 16], 60: [2, 16] }, { 33: [1, 138] }, { 33: [2, 75] }, { 33: [2, 32] }, { 72: [2, 101], 77: [2, 101] }, { 14: [2, 17], 15: [2, 17], 19: [2, 17], 29: [2, 17], 34: [2, 17], 39: [2, 17], 44: [2, 17], 47: [2, 17], 48: [2, 17], 51: [2, 17], 55: [2, 17], 60: [2, 17] }],
      defaultActions: { 4: [2, 1], 54: [2, 55], 56: [2, 20], 60: [2, 57], 73: [2, 81], 82: [2, 85], 86: [2, 18], 90: [2, 89], 101: [2, 53], 104: [2, 93], 110: [2, 19], 111: [2, 77], 116: [2, 97], 119: [2, 63], 122: [2, 69], 135: [2, 75], 136: [2, 32] },
      parseError: function parseError(str, hash) {
        throw new Error(str);
      },
      parse: function parse(input) {
        var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
        this.lexer.setInput(input);
        this.lexer.yy = this.yy;
        this.yy.lexer = this.lexer;
        this.yy.parser = this;
        if (typeof this.lexer.yylloc == "undefined")
          this.lexer.yylloc = {};
        var yyloc = this.lexer.yylloc;
        lstack.push(yyloc);
        var ranges = this.lexer.options && this.lexer.options.ranges;
        if (typeof this.yy.parseError === "function")
          this.parseError = this.yy.parseError;
        function popStack(n) {
          stack.length = stack.length - 2 * n;
          vstack.length = vstack.length - n;
          lstack.length = lstack.length - n;
        }
        function lex() {
          var token;
          token = self.lexer.lex() || 1;
          if (typeof token !== "number") {
            token = self.symbols_[token] || token;
          }
          return token;
        }
        var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
        while (true) {
          state = stack[stack.length - 1];
          if (this.defaultActions[state]) {
            action = this.defaultActions[state];
          } else {
            if (symbol === null || typeof symbol == "undefined") {
              symbol = lex();
            }
            action = table[state] && table[state][symbol];
          }
          if (typeof action === "undefined" || !action.length || !action[0]) {
            var errStr = "";
            if (!recovering) {
              expected = [];
              for (p in table[state])
                if (this.terminals_[p] && p > 2) {
                  expected.push("'" + this.terminals_[p] + "'");
                }
              if (this.lexer.showPosition) {
                errStr = "Parse error on line " + (yylineno + 1) + `:
` + this.lexer.showPosition() + `
Expecting ` + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
              } else {
                errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1 ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
              }
              this.parseError(errStr, { text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected });
            }
          }
          if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
          }
          switch (action[0]) {
            case 1:
              stack.push(symbol);
              vstack.push(this.lexer.yytext);
              lstack.push(this.lexer.yylloc);
              stack.push(action[1]);
              symbol = null;
              if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0)
                  recovering--;
              } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
              }
              break;
            case 2:
              len = this.productions_[action[1]][1];
              yyval.$ = vstack[vstack.length - len];
              yyval._$ = { first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column };
              if (ranges) {
                yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
              }
              r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
              if (typeof r !== "undefined") {
                return r;
              }
              if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
              }
              stack.push(this.productions_[action[1]][0]);
              vstack.push(yyval.$);
              lstack.push(yyval._$);
              newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
              stack.push(newState);
              break;
            case 3:
              return true;
          }
        }
        return true;
      }
    };
    var lexer = function() {
      var lexer2 = {
        EOF: 1,
        parseError: function parseError(str, hash) {
          if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
          } else {
            throw new Error(str);
          }
        },
        setInput: function setInput(input) {
          this._input = input;
          this._more = this._less = this.done = false;
          this.yylineno = this.yyleng = 0;
          this.yytext = this.matched = this.match = "";
          this.conditionStack = ["INITIAL"];
          this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 };
          if (this.options.ranges)
            this.yylloc.range = [0, 0];
          this.offset = 0;
          return this;
        },
        input: function input() {
          var ch = this._input[0];
          this.yytext += ch;
          this.yyleng++;
          this.offset++;
          this.match += ch;
          this.matched += ch;
          var lines = ch.match(/(?:\r\n?|\n).*/g);
          if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
          } else {
            this.yylloc.last_column++;
          }
          if (this.options.ranges)
            this.yylloc.range[1]++;
          this._input = this._input.slice(1);
          return ch;
        },
        unput: function unput(ch) {
          var len = ch.length;
          var lines = ch.split(/(?:\r\n?|\n)/g);
          this._input = ch + this._input;
          this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
          this.offset -= len;
          var oldLines = this.match.split(/(?:\r\n?|\n)/g);
          this.match = this.match.substr(0, this.match.length - 1);
          this.matched = this.matched.substr(0, this.matched.length - 1);
          if (lines.length - 1)
            this.yylineno -= lines.length - 1;
          var r = this.yylloc.range;
          this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
          };
          if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
          }
          return this;
        },
        more: function more() {
          this._more = true;
          return this;
        },
        less: function less(n) {
          this.unput(this.match.slice(n));
        },
        pastInput: function pastInput() {
          var past = this.matched.substr(0, this.matched.length - this.match.length);
          return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
        },
        upcomingInput: function upcomingInput() {
          var next = this.match;
          if (next.length < 20) {
            next += this._input.substr(0, 20 - next.length);
          }
          return (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(/\n/g, "");
        },
        showPosition: function showPosition() {
          var pre = this.pastInput();
          var c = new Array(pre.length + 1).join("-");
          return pre + this.upcomingInput() + `
` + c + "^";
        },
        next: function next() {
          if (this.done) {
            return this.EOF;
          }
          if (!this._input)
            this.done = true;
          var token, match, tempMatch, index, col, lines;
          if (!this._more) {
            this.yytext = "";
            this.match = "";
          }
          var rules = this._currentRules();
          for (var i = 0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
              match = tempMatch;
              index = i;
              if (!this.options.flex)
                break;
            }
          }
          if (match) {
            lines = match[0].match(/(?:\r\n?|\n).*/g);
            if (lines)
              this.yylineno += lines.length;
            this.yylloc = {
              first_line: this.yylloc.last_line,
              last_line: this.yylineno + 1,
              first_column: this.yylloc.last_column,
              last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length
            };
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            if (this.options.ranges) {
              this.yylloc.range = [this.offset, this.offset += this.yyleng];
            }
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);
            if (this.done && this._input)
              this.done = false;
            if (token)
              return token;
            else
              return;
          }
          if (this._input === "") {
            return this.EOF;
          } else {
            return this.parseError("Lexical error on line " + (this.yylineno + 1) + `. Unrecognized text.
` + this.showPosition(), { text: "", token: null, line: this.yylineno });
          }
        },
        lex: function lex() {
          var r = this.next();
          if (typeof r !== "undefined") {
            return r;
          } else {
            return this.lex();
          }
        },
        begin: function begin(condition) {
          this.conditionStack.push(condition);
        },
        popState: function popState() {
          return this.conditionStack.pop();
        },
        _currentRules: function _currentRules() {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        },
        topState: function topState() {
          return this.conditionStack[this.conditionStack.length - 2];
        },
        pushState: function begin(condition) {
          this.begin(condition);
        }
      };
      lexer2.options = {};
      lexer2.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
        function strip(start, end) {
          return yy_.yytext = yy_.yytext.substring(start, yy_.yyleng - end + start);
        }
        var YYSTATE = YY_START;
        switch ($avoiding_name_collisions) {
          case 0:
            if (yy_.yytext.slice(-2) === "\\\\") {
              strip(0, 1);
              this.begin("mu");
            } else if (yy_.yytext.slice(-1) === "\\") {
              strip(0, 1);
              this.begin("emu");
            } else {
              this.begin("mu");
            }
            if (yy_.yytext)
              return 15;
            break;
          case 1:
            return 15;
            break;
          case 2:
            this.popState();
            return 15;
            break;
          case 3:
            this.begin("raw");
            return 15;
            break;
          case 4:
            this.popState();
            if (this.conditionStack[this.conditionStack.length - 1] === "raw") {
              return 15;
            } else {
              strip(5, 9);
              return "END_RAW_BLOCK";
            }
            break;
          case 5:
            return 15;
            break;
          case 6:
            this.popState();
            return 14;
            break;
          case 7:
            return 65;
            break;
          case 8:
            return 68;
            break;
          case 9:
            return 19;
            break;
          case 10:
            this.popState();
            this.begin("raw");
            return 23;
            break;
          case 11:
            return 55;
            break;
          case 12:
            return 60;
            break;
          case 13:
            return 29;
            break;
          case 14:
            return 47;
            break;
          case 15:
            this.popState();
            return 44;
            break;
          case 16:
            this.popState();
            return 44;
            break;
          case 17:
            return 34;
            break;
          case 18:
            return 39;
            break;
          case 19:
            return 51;
            break;
          case 20:
            return 48;
            break;
          case 21:
            this.unput(yy_.yytext);
            this.popState();
            this.begin("com");
            break;
          case 22:
            this.popState();
            return 14;
            break;
          case 23:
            return 48;
            break;
          case 24:
            return 73;
            break;
          case 25:
            return 72;
            break;
          case 26:
            return 72;
            break;
          case 27:
            return 87;
            break;
          case 28:
            break;
          case 29:
            this.popState();
            return 54;
            break;
          case 30:
            this.popState();
            return 33;
            break;
          case 31:
            yy_.yytext = strip(1, 2).replace(/\\"/g, '"');
            return 80;
            break;
          case 32:
            yy_.yytext = strip(1, 2).replace(/\\'/g, "'");
            return 80;
            break;
          case 33:
            return 85;
            break;
          case 34:
            return 82;
            break;
          case 35:
            return 82;
            break;
          case 36:
            return 83;
            break;
          case 37:
            return 84;
            break;
          case 38:
            return 81;
            break;
          case 39:
            return 75;
            break;
          case 40:
            return 77;
            break;
          case 41:
            return 72;
            break;
          case 42:
            yy_.yytext = yy_.yytext.replace(/\\([\\\]])/g, "$1");
            return 72;
            break;
          case 43:
            return "INVALID";
            break;
          case 44:
            return 5;
            break;
        }
      };
      lexer2.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:\{\{\{\{(?=[^\/]))/, /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/, /^(?:[^\x00]+?(?=(\{\{\{\{)))/, /^(?:[\s\S]*?--(~)?\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{\{\{)/, /^(?:\}\}\}\})/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#>)/, /^(?:\{\{(~)?#\*?)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^\s*(~)?\}\})/, /^(?:\{\{(~)?\s*else\s*(~)?\}\})/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{(~)?!--)/, /^(?:\{\{(~)?![\s\S]*?\}\})/, /^(?:\{\{(~)?\*?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)|])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:undefined(?=([~}\s)])))/, /^(?:null(?=([~}\s)])))/, /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/, /^(?:as\s+\|)/, /^(?:\|)/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/, /^(?:\[(\\\]|[^\]])*\])/, /^(?:.)/, /^(?:$)/];
      lexer2.conditions = { mu: { rules: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44], inclusive: false }, emu: { rules: [2], inclusive: false }, com: { rules: [6], inclusive: false }, raw: { rules: [3, 4, 5], inclusive: false }, INITIAL: { rules: [0, 1, 44], inclusive: true } };
      return lexer2;
    }();
    parser.lexer = lexer;
    function Parser() {
      this.yy = {};
    }
    Parser.prototype = parser;
    parser.Parser = Parser;
    return new Parser;
  }();
  exports.default = handlebars;
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/compiler/visitor.js
var require_visitor = __commonJS((exports, module) => {
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _exception = require_exception();
  var _exception2 = _interopRequireDefault(_exception);
  function Visitor() {
    this.parents = [];
  }
  Visitor.prototype = {
    constructor: Visitor,
    mutating: false,
    acceptKey: function acceptKey(node, name) {
      var value = this.accept(node[name]);
      if (this.mutating) {
        if (value && !Visitor.prototype[value.type]) {
          throw new _exception2["default"]('Unexpected node type "' + value.type + '" found when accepting ' + name + " on " + node.type);
        }
        node[name] = value;
      }
    },
    acceptRequired: function acceptRequired(node, name) {
      this.acceptKey(node, name);
      if (!node[name]) {
        throw new _exception2["default"](node.type + " requires " + name);
      }
    },
    acceptArray: function acceptArray(array) {
      for (var i = 0, l = array.length;i < l; i++) {
        this.acceptKey(array, i);
        if (!array[i]) {
          array.splice(i, 1);
          i--;
          l--;
        }
      }
    },
    accept: function accept(object) {
      if (!object) {
        return;
      }
      if (!this[object.type]) {
        throw new _exception2["default"]("Unknown type: " + object.type, object);
      }
      if (this.current) {
        this.parents.unshift(this.current);
      }
      this.current = object;
      var ret = this[object.type](object);
      this.current = this.parents.shift();
      if (!this.mutating || ret) {
        return ret;
      } else if (ret !== false) {
        return object;
      }
    },
    Program: function Program(program2) {
      this.acceptArray(program2.body);
    },
    MustacheStatement: visitSubExpression,
    Decorator: visitSubExpression,
    BlockStatement: visitBlock,
    DecoratorBlock: visitBlock,
    PartialStatement: visitPartial,
    PartialBlockStatement: function PartialBlockStatement(partial) {
      visitPartial.call(this, partial);
      this.acceptKey(partial, "program");
    },
    ContentStatement: function ContentStatement() {},
    CommentStatement: function CommentStatement() {},
    SubExpression: visitSubExpression,
    PathExpression: function PathExpression() {},
    StringLiteral: function StringLiteral() {},
    NumberLiteral: function NumberLiteral() {},
    BooleanLiteral: function BooleanLiteral() {},
    UndefinedLiteral: function UndefinedLiteral() {},
    NullLiteral: function NullLiteral() {},
    Hash: function Hash(hash) {
      this.acceptArray(hash.pairs);
    },
    HashPair: function HashPair(pair) {
      this.acceptRequired(pair, "value");
    }
  };
  function visitSubExpression(mustache) {
    this.acceptRequired(mustache, "path");
    this.acceptArray(mustache.params);
    this.acceptKey(mustache, "hash");
  }
  function visitBlock(block) {
    visitSubExpression.call(this, block);
    this.acceptKey(block, "program");
    this.acceptKey(block, "inverse");
  }
  function visitPartial(partial) {
    this.acceptRequired(partial, "name");
    this.acceptArray(partial.params);
    this.acceptKey(partial, "hash");
  }
  exports.default = Visitor;
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/compiler/whitespace-control.js
var require_whitespace_control = __commonJS((exports, module) => {
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _visitor = require_visitor();
  var _visitor2 = _interopRequireDefault(_visitor);
  function WhitespaceControl() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    this.options = options;
  }
  WhitespaceControl.prototype = new _visitor2["default"];
  WhitespaceControl.prototype.Program = function(program2) {
    var doStandalone = !this.options.ignoreStandalone;
    var isRoot = !this.isRootSeen;
    this.isRootSeen = true;
    var body = program2.body;
    for (var i = 0, l = body.length;i < l; i++) {
      var current = body[i], strip = this.accept(current);
      if (!strip) {
        continue;
      }
      var _isPrevWhitespace = isPrevWhitespace(body, i, isRoot), _isNextWhitespace = isNextWhitespace(body, i, isRoot), openStandalone = strip.openStandalone && _isPrevWhitespace, closeStandalone = strip.closeStandalone && _isNextWhitespace, inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;
      if (strip.close) {
        omitRight(body, i, true);
      }
      if (strip.open) {
        omitLeft(body, i, true);
      }
      if (doStandalone && inlineStandalone) {
        omitRight(body, i);
        if (omitLeft(body, i)) {
          if (current.type === "PartialStatement") {
            current.indent = /([ \t]+$)/.exec(body[i - 1].original)[1];
          }
        }
      }
      if (doStandalone && openStandalone) {
        omitRight((current.program || current.inverse).body);
        omitLeft(body, i);
      }
      if (doStandalone && closeStandalone) {
        omitRight(body, i);
        omitLeft((current.inverse || current.program).body);
      }
    }
    return program2;
  };
  WhitespaceControl.prototype.BlockStatement = WhitespaceControl.prototype.DecoratorBlock = WhitespaceControl.prototype.PartialBlockStatement = function(block) {
    this.accept(block.program);
    this.accept(block.inverse);
    var program2 = block.program || block.inverse, inverse = block.program && block.inverse, firstInverse = inverse, lastInverse = inverse;
    if (inverse && inverse.chained) {
      firstInverse = inverse.body[0].program;
      while (lastInverse.chained) {
        lastInverse = lastInverse.body[lastInverse.body.length - 1].program;
      }
    }
    var strip = {
      open: block.openStrip.open,
      close: block.closeStrip.close,
      openStandalone: isNextWhitespace(program2.body),
      closeStandalone: isPrevWhitespace((firstInverse || program2).body)
    };
    if (block.openStrip.close) {
      omitRight(program2.body, null, true);
    }
    if (inverse) {
      var inverseStrip = block.inverseStrip;
      if (inverseStrip.open) {
        omitLeft(program2.body, null, true);
      }
      if (inverseStrip.close) {
        omitRight(firstInverse.body, null, true);
      }
      if (block.closeStrip.open) {
        omitLeft(lastInverse.body, null, true);
      }
      if (!this.options.ignoreStandalone && isPrevWhitespace(program2.body) && isNextWhitespace(firstInverse.body)) {
        omitLeft(program2.body);
        omitRight(firstInverse.body);
      }
    } else if (block.closeStrip.open) {
      omitLeft(program2.body, null, true);
    }
    return strip;
  };
  WhitespaceControl.prototype.Decorator = WhitespaceControl.prototype.MustacheStatement = function(mustache) {
    return mustache.strip;
  };
  WhitespaceControl.prototype.PartialStatement = WhitespaceControl.prototype.CommentStatement = function(node) {
    var strip = node.strip || {};
    return {
      inlineStandalone: true,
      open: strip.open,
      close: strip.close
    };
  };
  function isPrevWhitespace(body, i, isRoot) {
    if (i === undefined) {
      i = body.length;
    }
    var prev = body[i - 1], sibling = body[i - 2];
    if (!prev) {
      return isRoot;
    }
    if (prev.type === "ContentStatement") {
      return (sibling || !isRoot ? /\r?\n\s*?$/ : /(^|\r?\n)\s*?$/).test(prev.original);
    }
  }
  function isNextWhitespace(body, i, isRoot) {
    if (i === undefined) {
      i = -1;
    }
    var next = body[i + 1], sibling = body[i + 2];
    if (!next) {
      return isRoot;
    }
    if (next.type === "ContentStatement") {
      return (sibling || !isRoot ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(next.original);
    }
  }
  function omitRight(body, i, multiple) {
    var current = body[i == null ? 0 : i + 1];
    if (!current || current.type !== "ContentStatement" || !multiple && current.rightStripped) {
      return;
    }
    var original = current.value;
    current.value = current.value.replace(multiple ? /^\s+/ : /^[ \t]*\r?\n?/, "");
    current.rightStripped = current.value !== original;
  }
  function omitLeft(body, i, multiple) {
    var current = body[i == null ? body.length - 1 : i - 1];
    if (!current || current.type !== "ContentStatement" || !multiple && current.leftStripped) {
      return;
    }
    var original = current.value;
    current.value = current.value.replace(multiple ? /\s+$/ : /[ \t]+$/, "");
    current.leftStripped = current.value !== original;
    return current.leftStripped;
  }
  exports.default = WhitespaceControl;
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/compiler/helpers.js
var require_helpers2 = __commonJS((exports) => {
  exports.__esModule = true;
  exports.SourceLocation = SourceLocation;
  exports.id = id;
  exports.stripFlags = stripFlags;
  exports.stripComment = stripComment;
  exports.preparePath = preparePath;
  exports.prepareMustache = prepareMustache;
  exports.prepareRawBlock = prepareRawBlock;
  exports.prepareBlock = prepareBlock;
  exports.prepareProgram = prepareProgram;
  exports.preparePartialBlock = preparePartialBlock;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _exception = require_exception();
  var _exception2 = _interopRequireDefault(_exception);
  function validateClose(open, close) {
    close = close.path ? close.path.original : close;
    if (open.path.original !== close) {
      var errorNode = { loc: open.path.loc };
      throw new _exception2["default"](open.path.original + " doesn't match " + close, errorNode);
    }
  }
  function SourceLocation(source, locInfo) {
    this.source = source;
    this.start = {
      line: locInfo.first_line,
      column: locInfo.first_column
    };
    this.end = {
      line: locInfo.last_line,
      column: locInfo.last_column
    };
  }
  function id(token) {
    if (/^\[.*\]$/.test(token)) {
      return token.substring(1, token.length - 1);
    } else {
      return token;
    }
  }
  function stripFlags(open, close) {
    return {
      open: open.charAt(2) === "~",
      close: close.charAt(close.length - 3) === "~"
    };
  }
  function stripComment(comment) {
    return comment.replace(/^\{\{~?!-?-?/, "").replace(/-?-?~?\}\}$/, "");
  }
  function preparePath(data, parts, loc) {
    loc = this.locInfo(loc);
    var original = data ? "@" : "", dig = [], depth = 0;
    for (var i = 0, l = parts.length;i < l; i++) {
      var part = parts[i].part, isLiteral = parts[i].original !== part;
      original += (parts[i].separator || "") + part;
      if (!isLiteral && (part === ".." || part === "." || part === "this")) {
        if (dig.length > 0) {
          throw new _exception2["default"]("Invalid path: " + original, { loc });
        } else if (part === "..") {
          depth++;
        }
      } else {
        dig.push(part);
      }
    }
    return {
      type: "PathExpression",
      data,
      depth,
      parts: dig,
      original,
      loc
    };
  }
  function prepareMustache(path4, params, hash, open, strip, locInfo) {
    var escapeFlag = open.charAt(3) || open.charAt(2), escaped = escapeFlag !== "{" && escapeFlag !== "&";
    var decorator = /\*/.test(open);
    return {
      type: decorator ? "Decorator" : "MustacheStatement",
      path: path4,
      params,
      hash,
      escaped,
      strip,
      loc: this.locInfo(locInfo)
    };
  }
  function prepareRawBlock(openRawBlock, contents, close, locInfo) {
    validateClose(openRawBlock, close);
    locInfo = this.locInfo(locInfo);
    var program2 = {
      type: "Program",
      body: contents,
      strip: {},
      loc: locInfo
    };
    return {
      type: "BlockStatement",
      path: openRawBlock.path,
      params: openRawBlock.params,
      hash: openRawBlock.hash,
      program: program2,
      openStrip: {},
      inverseStrip: {},
      closeStrip: {},
      loc: locInfo
    };
  }
  function prepareBlock(openBlock, program2, inverseAndProgram, close, inverted, locInfo) {
    if (close && close.path) {
      validateClose(openBlock, close);
    }
    var decorator = /\*/.test(openBlock.open);
    program2.blockParams = openBlock.blockParams;
    var inverse = undefined, inverseStrip = undefined;
    if (inverseAndProgram) {
      if (decorator) {
        throw new _exception2["default"]("Unexpected inverse block on decorator", inverseAndProgram);
      }
      if (inverseAndProgram.chain) {
        inverseAndProgram.program.body[0].closeStrip = close.strip;
      }
      inverseStrip = inverseAndProgram.strip;
      inverse = inverseAndProgram.program;
    }
    if (inverted) {
      inverted = inverse;
      inverse = program2;
      program2 = inverted;
    }
    return {
      type: decorator ? "DecoratorBlock" : "BlockStatement",
      path: openBlock.path,
      params: openBlock.params,
      hash: openBlock.hash,
      program: program2,
      inverse,
      openStrip: openBlock.strip,
      inverseStrip,
      closeStrip: close && close.strip,
      loc: this.locInfo(locInfo)
    };
  }
  function prepareProgram(statements, loc) {
    if (!loc && statements.length) {
      var firstLoc = statements[0].loc, lastLoc = statements[statements.length - 1].loc;
      if (firstLoc && lastLoc) {
        loc = {
          source: firstLoc.source,
          start: {
            line: firstLoc.start.line,
            column: firstLoc.start.column
          },
          end: {
            line: lastLoc.end.line,
            column: lastLoc.end.column
          }
        };
      }
    }
    return {
      type: "Program",
      body: statements,
      strip: {},
      loc
    };
  }
  function preparePartialBlock(open, program2, close, locInfo) {
    validateClose(open, close);
    return {
      type: "PartialBlockStatement",
      name: open.path,
      params: open.params,
      hash: open.hash,
      program: program2,
      openStrip: open.strip,
      closeStrip: close && close.strip,
      loc: this.locInfo(locInfo)
    };
  }
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/compiler/base.js
var require_base2 = __commonJS((exports) => {
  exports.__esModule = true;
  exports.parseWithoutProcessing = parseWithoutProcessing;
  exports.parse = parse;
  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};
      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key))
            newObj[key] = obj[key];
        }
      }
      newObj["default"] = obj;
      return newObj;
    }
  }
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _parser = require_parser();
  var _parser2 = _interopRequireDefault(_parser);
  var _whitespaceControl = require_whitespace_control();
  var _whitespaceControl2 = _interopRequireDefault(_whitespaceControl);
  var _helpers = require_helpers2();
  var Helpers = _interopRequireWildcard(_helpers);
  var _exception = require_exception();
  var _exception2 = _interopRequireDefault(_exception);
  var _utils = require_utils();
  exports.parser = _parser2["default"];
  var yy = {};
  _utils.extend(yy, Helpers);
  function parseWithoutProcessing(input, options) {
    if (input.type === "Program") {
      validateInputAst(input);
      return input;
    }
    _parser2["default"].yy = yy;
    yy.locInfo = function(locInfo) {
      return new yy.SourceLocation(options && options.srcName, locInfo);
    };
    var ast = _parser2["default"].parse(input);
    return ast;
  }
  function parse(input, options) {
    var ast = parseWithoutProcessing(input, options);
    var strip = new _whitespaceControl2["default"](options);
    return strip.accept(ast);
  }
  function validateInputAst(ast) {
    validateAstNode(ast);
  }
  function validateAstNode(node) {
    if (node == null) {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(validateAstNode);
      return;
    }
    if (typeof node !== "object") {
      return;
    }
    if (node.type === "PathExpression") {
      if (!isValidDepth(node.depth)) {
        throw new _exception2["default"]("Invalid AST: PathExpression.depth must be an integer");
      }
      if (!Array.isArray(node.parts)) {
        throw new _exception2["default"]("Invalid AST: PathExpression.parts must be an array");
      }
      for (var i = 0;i < node.parts.length; i++) {
        if (typeof node.parts[i] !== "string") {
          throw new _exception2["default"]("Invalid AST: PathExpression.parts must only contain strings");
        }
      }
    } else if (node.type === "NumberLiteral") {
      if (typeof node.value !== "number" || !isFinite(node.value)) {
        throw new _exception2["default"]("Invalid AST: NumberLiteral.value must be a number");
      }
    } else if (node.type === "BooleanLiteral") {
      if (typeof node.value !== "boolean") {
        throw new _exception2["default"]("Invalid AST: BooleanLiteral.value must be a boolean");
      }
    }
    Object.keys(node).forEach(function(propertyName) {
      if (propertyName === "loc") {
        return;
      }
      validateAstNode(node[propertyName]);
    });
  }
  function isValidDepth(depth) {
    return typeof depth === "number" && isFinite(depth) && Math.floor(depth) === depth && depth >= 0;
  }
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/compiler/compiler.js
var require_compiler = __commonJS((exports) => {
  exports.__esModule = true;
  exports.Compiler = Compiler;
  exports.precompile = precompile;
  exports.compile = compile;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _exception = require_exception();
  var _exception2 = _interopRequireDefault(_exception);
  var _utils = require_utils();
  var _ast = require_ast();
  var _ast2 = _interopRequireDefault(_ast);
  var slice = [].slice;
  function Compiler() {}
  Compiler.prototype = {
    compiler: Compiler,
    equals: function equals(other) {
      var len = this.opcodes.length;
      if (other.opcodes.length !== len) {
        return false;
      }
      for (var i = 0;i < len; i++) {
        var opcode = this.opcodes[i], otherOpcode = other.opcodes[i];
        if (opcode.opcode !== otherOpcode.opcode || !argEquals(opcode.args, otherOpcode.args)) {
          return false;
        }
      }
      len = this.children.length;
      for (var i = 0;i < len; i++) {
        if (!this.children[i].equals(other.children[i])) {
          return false;
        }
      }
      return true;
    },
    guid: 0,
    compile: function compile2(program2, options) {
      this.sourceNode = [];
      this.opcodes = [];
      this.children = [];
      this.options = options;
      this.stringParams = options.stringParams;
      this.trackIds = options.trackIds;
      options.blockParams = options.blockParams || [];
      options.knownHelpers = _utils.extend(Object.create(null), {
        helperMissing: true,
        blockHelperMissing: true,
        each: true,
        if: true,
        unless: true,
        with: true,
        log: true,
        lookup: true
      }, options.knownHelpers);
      return this.accept(program2);
    },
    compileProgram: function compileProgram(program2) {
      var childCompiler = new this.compiler, result = childCompiler.compile(program2, this.options), guid = this.guid++;
      this.usePartial = this.usePartial || result.usePartial;
      this.children[guid] = result;
      this.useDepths = this.useDepths || result.useDepths;
      return guid;
    },
    accept: function accept(node) {
      if (!this[node.type]) {
        throw new _exception2["default"]("Unknown type: " + node.type, node);
      }
      this.sourceNode.unshift(node);
      var ret = this[node.type](node);
      this.sourceNode.shift();
      return ret;
    },
    Program: function Program(program2) {
      this.options.blockParams.unshift(program2.blockParams);
      var body = program2.body, bodyLength = body.length;
      for (var i = 0;i < bodyLength; i++) {
        this.accept(body[i]);
      }
      this.options.blockParams.shift();
      this.isSimple = bodyLength === 1;
      this.blockParams = program2.blockParams ? program2.blockParams.length : 0;
      return this;
    },
    BlockStatement: function BlockStatement(block) {
      transformLiteralToPath(block);
      var { program: program2, inverse } = block;
      program2 = program2 && this.compileProgram(program2);
      inverse = inverse && this.compileProgram(inverse);
      var type = this.classifySexpr(block);
      if (type === "helper") {
        this.helperSexpr(block, program2, inverse);
      } else if (type === "simple") {
        this.simpleSexpr(block);
        this.opcode("pushProgram", program2);
        this.opcode("pushProgram", inverse);
        this.opcode("emptyHash");
        this.opcode("blockValue", block.path.original);
      } else {
        this.ambiguousSexpr(block, program2, inverse);
        this.opcode("pushProgram", program2);
        this.opcode("pushProgram", inverse);
        this.opcode("emptyHash");
        this.opcode("ambiguousBlockValue");
      }
      this.opcode("append");
    },
    DecoratorBlock: function DecoratorBlock(decorator) {
      var program2 = decorator.program && this.compileProgram(decorator.program);
      var params = this.setupFullMustacheParams(decorator, program2, undefined), path4 = decorator.path;
      this.useDecorators = true;
      this.opcode("registerDecorator", params.length, path4.original);
    },
    PartialStatement: function PartialStatement(partial) {
      this.usePartial = true;
      var program2 = partial.program;
      if (program2) {
        program2 = this.compileProgram(partial.program);
      }
      var params = partial.params;
      if (params.length > 1) {
        throw new _exception2["default"]("Unsupported number of partial arguments: " + params.length, partial);
      } else if (!params.length) {
        if (this.options.explicitPartialContext) {
          this.opcode("pushLiteral", "undefined");
        } else {
          params.push({ type: "PathExpression", parts: [], depth: 0 });
        }
      }
      var partialName = partial.name.original, isDynamic = partial.name.type === "SubExpression";
      if (isDynamic) {
        this.accept(partial.name);
      }
      this.setupFullMustacheParams(partial, program2, undefined, true);
      var indent = partial.indent || "";
      if (this.options.preventIndent && indent) {
        this.opcode("appendContent", indent);
        indent = "";
      }
      this.opcode("invokePartial", isDynamic, partialName, indent);
      this.opcode("append");
    },
    PartialBlockStatement: function PartialBlockStatement(partialBlock) {
      this.PartialStatement(partialBlock);
    },
    MustacheStatement: function MustacheStatement(mustache) {
      this.SubExpression(mustache);
      if (mustache.escaped && !this.options.noEscape) {
        this.opcode("appendEscaped");
      } else {
        this.opcode("append");
      }
    },
    Decorator: function Decorator(decorator) {
      this.DecoratorBlock(decorator);
    },
    ContentStatement: function ContentStatement(content) {
      if (content.value) {
        this.opcode("appendContent", content.value);
      }
    },
    CommentStatement: function CommentStatement() {},
    SubExpression: function SubExpression(sexpr) {
      transformLiteralToPath(sexpr);
      var type = this.classifySexpr(sexpr);
      if (type === "simple") {
        this.simpleSexpr(sexpr);
      } else if (type === "helper") {
        this.helperSexpr(sexpr);
      } else {
        this.ambiguousSexpr(sexpr);
      }
    },
    ambiguousSexpr: function ambiguousSexpr(sexpr, program2, inverse) {
      var path4 = sexpr.path, name = path4.parts[0], isBlock = program2 != null || inverse != null;
      this.opcode("getContext", path4.depth);
      this.opcode("pushProgram", program2);
      this.opcode("pushProgram", inverse);
      path4.strict = true;
      this.accept(path4);
      this.opcode("invokeAmbiguous", name, isBlock);
    },
    simpleSexpr: function simpleSexpr(sexpr) {
      var path4 = sexpr.path;
      path4.strict = true;
      this.accept(path4);
      this.opcode("resolvePossibleLambda");
    },
    helperSexpr: function helperSexpr(sexpr, program2, inverse) {
      var params = this.setupFullMustacheParams(sexpr, program2, inverse), path4 = sexpr.path, name = path4.parts[0];
      if (this.options.knownHelpers[name]) {
        this.opcode("invokeKnownHelper", params.length, name);
      } else if (this.options.knownHelpersOnly) {
        throw new _exception2["default"]("You specified knownHelpersOnly, but used the unknown helper " + name, sexpr);
      } else {
        path4.strict = true;
        path4.falsy = true;
        this.accept(path4);
        this.opcode("invokeHelper", params.length, path4.original, _ast2["default"].helpers.simpleId(path4));
      }
    },
    PathExpression: function PathExpression(path4) {
      this.addDepth(path4.depth);
      this.opcode("getContext", path4.depth);
      var name = path4.parts[0], scoped = _ast2["default"].helpers.scopedId(path4), blockParamId = !path4.depth && !scoped && this.blockParamIndex(name);
      if (blockParamId) {
        this.opcode("lookupBlockParam", blockParamId, path4.parts);
      } else if (!name) {
        this.opcode("pushContext");
      } else if (path4.data) {
        this.options.data = true;
        this.opcode("lookupData", path4.depth, path4.parts, path4.strict);
      } else {
        this.opcode("lookupOnContext", path4.parts, path4.falsy, path4.strict, scoped);
      }
    },
    StringLiteral: function StringLiteral(string) {
      this.opcode("pushString", string.value);
    },
    NumberLiteral: function NumberLiteral(number) {
      this.opcode("pushLiteral", number.value);
    },
    BooleanLiteral: function BooleanLiteral(bool) {
      this.opcode("pushLiteral", bool.value);
    },
    UndefinedLiteral: function UndefinedLiteral() {
      this.opcode("pushLiteral", "undefined");
    },
    NullLiteral: function NullLiteral() {
      this.opcode("pushLiteral", "null");
    },
    Hash: function Hash(hash) {
      var pairs = hash.pairs, i = 0, l = pairs.length;
      this.opcode("pushHash");
      for (;i < l; i++) {
        this.pushParam(pairs[i].value);
      }
      while (i--) {
        this.opcode("assignToHash", pairs[i].key);
      }
      this.opcode("popHash");
    },
    opcode: function opcode(name) {
      this.opcodes.push({
        opcode: name,
        args: slice.call(arguments, 1),
        loc: this.sourceNode[0].loc
      });
    },
    addDepth: function addDepth(depth) {
      if (!depth) {
        return;
      }
      this.useDepths = true;
    },
    classifySexpr: function classifySexpr(sexpr) {
      var isSimple = _ast2["default"].helpers.simpleId(sexpr.path);
      var isBlockParam = isSimple && !!this.blockParamIndex(sexpr.path.parts[0]);
      var isHelper = !isBlockParam && _ast2["default"].helpers.helperExpression(sexpr);
      var isEligible = !isBlockParam && (isHelper || isSimple);
      if (isEligible && !isHelper) {
        var _name = sexpr.path.parts[0], options = this.options;
        if (options.knownHelpers[_name]) {
          isHelper = true;
        } else if (options.knownHelpersOnly) {
          isEligible = false;
        }
      }
      if (isHelper) {
        return "helper";
      } else if (isEligible) {
        return "ambiguous";
      } else {
        return "simple";
      }
    },
    pushParams: function pushParams(params) {
      for (var i = 0, l = params.length;i < l; i++) {
        this.pushParam(params[i]);
      }
    },
    pushParam: function pushParam(val) {
      var value = val.value != null ? val.value : val.original || "";
      if (this.stringParams) {
        if (value.replace) {
          value = value.replace(/^(\.?\.\/)*/g, "").replace(/\//g, ".");
        }
        if (val.depth) {
          this.addDepth(val.depth);
        }
        this.opcode("getContext", val.depth || 0);
        this.opcode("pushStringParam", value, val.type);
        if (val.type === "SubExpression") {
          this.accept(val);
        }
      } else {
        if (this.trackIds) {
          var blockParamIndex = undefined;
          if (val.parts && !_ast2["default"].helpers.scopedId(val) && !val.depth) {
            blockParamIndex = this.blockParamIndex(val.parts[0]);
          }
          if (blockParamIndex) {
            var blockParamChild = val.parts.slice(1).join(".");
            this.opcode("pushId", "BlockParam", blockParamIndex, blockParamChild);
          } else {
            value = val.original || value;
            if (value.replace) {
              value = value.replace(/^this(?:\.|$)/, "").replace(/^\.\//, "").replace(/^\.$/, "");
            }
            this.opcode("pushId", val.type, value);
          }
        }
        this.accept(val);
      }
    },
    setupFullMustacheParams: function setupFullMustacheParams(sexpr, program2, inverse, omitEmpty) {
      var params = sexpr.params;
      this.pushParams(params);
      this.opcode("pushProgram", program2);
      this.opcode("pushProgram", inverse);
      if (sexpr.hash) {
        this.accept(sexpr.hash);
      } else {
        this.opcode("emptyHash", omitEmpty);
      }
      return params;
    },
    blockParamIndex: function blockParamIndex(name) {
      for (var depth = 0, len = this.options.blockParams.length;depth < len; depth++) {
        var blockParams = this.options.blockParams[depth], param = blockParams && _utils.indexOf(blockParams, name);
        if (blockParams && param >= 0) {
          return [depth, param];
        }
      }
    }
  };
  function precompile(input, options, env) {
    if (input == null || typeof input !== "string" && input.type !== "Program") {
      throw new _exception2["default"]("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
    }
    options = options || {};
    if (!("data" in options)) {
      options.data = true;
    }
    if (options.compat) {
      options.useDepths = true;
    }
    var ast = env.parse(input, options), environment = new env.Compiler().compile(ast, options);
    return new env.JavaScriptCompiler().compile(environment, options);
  }
  function compile(input, options, env) {
    if (options === undefined)
      options = {};
    if (input == null || typeof input !== "string" && input.type !== "Program") {
      throw new _exception2["default"]("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
    }
    options = _utils.extend({}, options);
    if (!("data" in options)) {
      options.data = true;
    }
    if (options.compat) {
      options.useDepths = true;
    }
    var compiled = undefined;
    function compileInput() {
      var ast = env.parse(input, options), environment = new env.Compiler().compile(ast, options), templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
      return env.template(templateSpec);
    }
    function ret(context, execOptions) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled.call(this, context, execOptions);
    }
    ret._setup = function(setupOptions) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled._setup(setupOptions);
    };
    ret._child = function(i, data, blockParams, depths) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled._child(i, data, blockParams, depths);
    };
    return ret;
  }
  function argEquals(a, b) {
    if (a === b) {
      return true;
    }
    if (_utils.isArray(a) && _utils.isArray(b) && a.length === b.length) {
      for (var i = 0;i < a.length; i++) {
        if (!argEquals(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
  }
  function transformLiteralToPath(sexpr) {
    if (!sexpr.path.parts) {
      var literal = sexpr.path;
      sexpr.path = {
        type: "PathExpression",
        data: false,
        depth: 0,
        parts: [literal.original + ""],
        original: literal.original + "",
        loc: literal.loc
      };
    }
  }
});

// ../../node_modules/.bun/source-map@0.6.1/node_modules/source-map/lib/base64.js
var require_base64 = __commonJS((exports) => {
  var intToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
  exports.encode = function(number) {
    if (0 <= number && number < intToCharMap.length) {
      return intToCharMap[number];
    }
    throw new TypeError("Must be between 0 and 63: " + number);
  };
  exports.decode = function(charCode) {
    var bigA = 65;
    var bigZ = 90;
    var littleA = 97;
    var littleZ = 122;
    var zero = 48;
    var nine = 57;
    var plus = 43;
    var slash = 47;
    var littleOffset = 26;
    var numberOffset = 52;
    if (bigA <= charCode && charCode <= bigZ) {
      return charCode - bigA;
    }
    if (littleA <= charCode && charCode <= littleZ) {
      return charCode - littleA + littleOffset;
    }
    if (zero <= charCode && charCode <= nine) {
      return charCode - zero + numberOffset;
    }
    if (charCode == plus) {
      return 62;
    }
    if (charCode == slash) {
      return 63;
    }
    return -1;
  };
});

// ../../node_modules/.bun/source-map@0.6.1/node_modules/source-map/lib/base64-vlq.js
var require_base64_vlq = __commonJS((exports) => {
  var base64 = require_base64();
  var VLQ_BASE_SHIFT = 5;
  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
  var VLQ_BASE_MASK = VLQ_BASE - 1;
  var VLQ_CONTINUATION_BIT = VLQ_BASE;
  function toVLQSigned(aValue) {
    return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
  }
  function fromVLQSigned(aValue) {
    var isNegative = (aValue & 1) === 1;
    var shifted = aValue >> 1;
    return isNegative ? -shifted : shifted;
  }
  exports.encode = function base64VLQ_encode(aValue) {
    var encoded = "";
    var digit;
    var vlq = toVLQSigned(aValue);
    do {
      digit = vlq & VLQ_BASE_MASK;
      vlq >>>= VLQ_BASE_SHIFT;
      if (vlq > 0) {
        digit |= VLQ_CONTINUATION_BIT;
      }
      encoded += base64.encode(digit);
    } while (vlq > 0);
    return encoded;
  };
  exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
    var strLen = aStr.length;
    var result = 0;
    var shift = 0;
    var continuation, digit;
    do {
      if (aIndex >= strLen) {
        throw new Error("Expected more digits in base 64 VLQ value.");
      }
      digit = base64.decode(aStr.charCodeAt(aIndex++));
      if (digit === -1) {
        throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
      }
      continuation = !!(digit & VLQ_CONTINUATION_BIT);
      digit &= VLQ_BASE_MASK;
      result = result + (digit << shift);
      shift += VLQ_BASE_SHIFT;
    } while (continuation);
    aOutParam.value = fromVLQSigned(result);
    aOutParam.rest = aIndex;
  };
});

// ../../node_modules/.bun/source-map@0.6.1/node_modules/source-map/lib/util.js
var require_util = __commonJS((exports) => {
  function getArg(aArgs, aName, aDefaultValue) {
    if (aName in aArgs) {
      return aArgs[aName];
    } else if (arguments.length === 3) {
      return aDefaultValue;
    } else {
      throw new Error('"' + aName + '" is a required argument.');
    }
  }
  exports.getArg = getArg;
  var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
  var dataUrlRegexp = /^data:.+\,.+$/;
  function urlParse(aUrl) {
    var match = aUrl.match(urlRegexp);
    if (!match) {
      return null;
    }
    return {
      scheme: match[1],
      auth: match[2],
      host: match[3],
      port: match[4],
      path: match[5]
    };
  }
  exports.urlParse = urlParse;
  function urlGenerate(aParsedUrl) {
    var url = "";
    if (aParsedUrl.scheme) {
      url += aParsedUrl.scheme + ":";
    }
    url += "//";
    if (aParsedUrl.auth) {
      url += aParsedUrl.auth + "@";
    }
    if (aParsedUrl.host) {
      url += aParsedUrl.host;
    }
    if (aParsedUrl.port) {
      url += ":" + aParsedUrl.port;
    }
    if (aParsedUrl.path) {
      url += aParsedUrl.path;
    }
    return url;
  }
  exports.urlGenerate = urlGenerate;
  function normalize(aPath) {
    var path4 = aPath;
    var url = urlParse(aPath);
    if (url) {
      if (!url.path) {
        return aPath;
      }
      path4 = url.path;
    }
    var isAbsolute = exports.isAbsolute(path4);
    var parts = path4.split(/\/+/);
    for (var part, up = 0, i = parts.length - 1;i >= 0; i--) {
      part = parts[i];
      if (part === ".") {
        parts.splice(i, 1);
      } else if (part === "..") {
        up++;
      } else if (up > 0) {
        if (part === "") {
          parts.splice(i + 1, up);
          up = 0;
        } else {
          parts.splice(i, 2);
          up--;
        }
      }
    }
    path4 = parts.join("/");
    if (path4 === "") {
      path4 = isAbsolute ? "/" : ".";
    }
    if (url) {
      url.path = path4;
      return urlGenerate(url);
    }
    return path4;
  }
  exports.normalize = normalize;
  function join(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }
    if (aPath === "") {
      aPath = ".";
    }
    var aPathUrl = urlParse(aPath);
    var aRootUrl = urlParse(aRoot);
    if (aRootUrl) {
      aRoot = aRootUrl.path || "/";
    }
    if (aPathUrl && !aPathUrl.scheme) {
      if (aRootUrl) {
        aPathUrl.scheme = aRootUrl.scheme;
      }
      return urlGenerate(aPathUrl);
    }
    if (aPathUrl || aPath.match(dataUrlRegexp)) {
      return aPath;
    }
    if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
      aRootUrl.host = aPath;
      return urlGenerate(aRootUrl);
    }
    var joined = aPath.charAt(0) === "/" ? aPath : normalize(aRoot.replace(/\/+$/, "") + "/" + aPath);
    if (aRootUrl) {
      aRootUrl.path = joined;
      return urlGenerate(aRootUrl);
    }
    return joined;
  }
  exports.join = join;
  exports.isAbsolute = function(aPath) {
    return aPath.charAt(0) === "/" || urlRegexp.test(aPath);
  };
  function relative(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }
    aRoot = aRoot.replace(/\/$/, "");
    var level = 0;
    while (aPath.indexOf(aRoot + "/") !== 0) {
      var index = aRoot.lastIndexOf("/");
      if (index < 0) {
        return aPath;
      }
      aRoot = aRoot.slice(0, index);
      if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
        return aPath;
      }
      ++level;
    }
    return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
  }
  exports.relative = relative;
  var supportsNullProto = function() {
    var obj = Object.create(null);
    return !("__proto__" in obj);
  }();
  function identity(s) {
    return s;
  }
  function toSetString(aStr) {
    if (isProtoString(aStr)) {
      return "$" + aStr;
    }
    return aStr;
  }
  exports.toSetString = supportsNullProto ? identity : toSetString;
  function fromSetString(aStr) {
    if (isProtoString(aStr)) {
      return aStr.slice(1);
    }
    return aStr;
  }
  exports.fromSetString = supportsNullProto ? identity : fromSetString;
  function isProtoString(s) {
    if (!s) {
      return false;
    }
    var length = s.length;
    if (length < 9) {
      return false;
    }
    if (s.charCodeAt(length - 1) !== 95 || s.charCodeAt(length - 2) !== 95 || s.charCodeAt(length - 3) !== 111 || s.charCodeAt(length - 4) !== 116 || s.charCodeAt(length - 5) !== 111 || s.charCodeAt(length - 6) !== 114 || s.charCodeAt(length - 7) !== 112 || s.charCodeAt(length - 8) !== 95 || s.charCodeAt(length - 9) !== 95) {
      return false;
    }
    for (var i = length - 10;i >= 0; i--) {
      if (s.charCodeAt(i) !== 36) {
        return false;
      }
    }
    return true;
  }
  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
    var cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp !== 0 || onlyCompareOriginal) {
      return cmp;
    }
    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp !== 0) {
      return cmp;
    }
    return strcmp(mappingA.name, mappingB.name);
  }
  exports.compareByOriginalPositions = compareByOriginalPositions;
  function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
    var cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp !== 0 || onlyCompareGenerated) {
      return cmp;
    }
    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp !== 0) {
      return cmp;
    }
    return strcmp(mappingA.name, mappingB.name);
  }
  exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;
  function strcmp(aStr1, aStr2) {
    if (aStr1 === aStr2) {
      return 0;
    }
    if (aStr1 === null) {
      return 1;
    }
    if (aStr2 === null) {
      return -1;
    }
    if (aStr1 > aStr2) {
      return 1;
    }
    return -1;
  }
  function compareByGeneratedPositionsInflated(mappingA, mappingB) {
    var cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp !== 0) {
      return cmp;
    }
    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp !== 0) {
      return cmp;
    }
    return strcmp(mappingA.name, mappingB.name);
  }
  exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
  function parseSourceMapInput(str) {
    return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ""));
  }
  exports.parseSourceMapInput = parseSourceMapInput;
  function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
    sourceURL = sourceURL || "";
    if (sourceRoot) {
      if (sourceRoot[sourceRoot.length - 1] !== "/" && sourceURL[0] !== "/") {
        sourceRoot += "/";
      }
      sourceURL = sourceRoot + sourceURL;
    }
    if (sourceMapURL) {
      var parsed = urlParse(sourceMapURL);
      if (!parsed) {
        throw new Error("sourceMapURL could not be parsed");
      }
      if (parsed.path) {
        var index = parsed.path.lastIndexOf("/");
        if (index >= 0) {
          parsed.path = parsed.path.substring(0, index + 1);
        }
      }
      sourceURL = join(urlGenerate(parsed), sourceURL);
    }
    return normalize(sourceURL);
  }
  exports.computeSourceURL = computeSourceURL;
});

// ../../node_modules/.bun/source-map@0.6.1/node_modules/source-map/lib/array-set.js
var require_array_set = __commonJS((exports) => {
  var util = require_util();
  var has = Object.prototype.hasOwnProperty;
  var hasNativeMap = typeof Map !== "undefined";
  function ArraySet() {
    this._array = [];
    this._set = hasNativeMap ? new Map : Object.create(null);
  }
  ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
    var set = new ArraySet;
    for (var i = 0, len = aArray.length;i < len; i++) {
      set.add(aArray[i], aAllowDuplicates);
    }
    return set;
  };
  ArraySet.prototype.size = function ArraySet_size() {
    return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
  };
  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
    var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
    var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
    var idx = this._array.length;
    if (!isDuplicate || aAllowDuplicates) {
      this._array.push(aStr);
    }
    if (!isDuplicate) {
      if (hasNativeMap) {
        this._set.set(aStr, idx);
      } else {
        this._set[sStr] = idx;
      }
    }
  };
  ArraySet.prototype.has = function ArraySet_has(aStr) {
    if (hasNativeMap) {
      return this._set.has(aStr);
    } else {
      var sStr = util.toSetString(aStr);
      return has.call(this._set, sStr);
    }
  };
  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
    if (hasNativeMap) {
      var idx = this._set.get(aStr);
      if (idx >= 0) {
        return idx;
      }
    } else {
      var sStr = util.toSetString(aStr);
      if (has.call(this._set, sStr)) {
        return this._set[sStr];
      }
    }
    throw new Error('"' + aStr + '" is not in the set.');
  };
  ArraySet.prototype.at = function ArraySet_at(aIdx) {
    if (aIdx >= 0 && aIdx < this._array.length) {
      return this._array[aIdx];
    }
    throw new Error("No element indexed by " + aIdx);
  };
  ArraySet.prototype.toArray = function ArraySet_toArray() {
    return this._array.slice();
  };
  exports.ArraySet = ArraySet;
});

// ../../node_modules/.bun/source-map@0.6.1/node_modules/source-map/lib/mapping-list.js
var require_mapping_list = __commonJS((exports) => {
  var util = require_util();
  function generatedPositionAfter(mappingA, mappingB) {
    var lineA = mappingA.generatedLine;
    var lineB = mappingB.generatedLine;
    var columnA = mappingA.generatedColumn;
    var columnB = mappingB.generatedColumn;
    return lineB > lineA || lineB == lineA && columnB >= columnA || util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
  }
  function MappingList() {
    this._array = [];
    this._sorted = true;
    this._last = { generatedLine: -1, generatedColumn: 0 };
  }
  MappingList.prototype.unsortedForEach = function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };
  MappingList.prototype.add = function MappingList_add(aMapping) {
    if (generatedPositionAfter(this._last, aMapping)) {
      this._last = aMapping;
      this._array.push(aMapping);
    } else {
      this._sorted = false;
      this._array.push(aMapping);
    }
  };
  MappingList.prototype.toArray = function MappingList_toArray() {
    if (!this._sorted) {
      this._array.sort(util.compareByGeneratedPositionsInflated);
      this._sorted = true;
    }
    return this._array;
  };
  exports.MappingList = MappingList;
});

// ../../node_modules/.bun/source-map@0.6.1/node_modules/source-map/lib/source-map-generator.js
var require_source_map_generator = __commonJS((exports) => {
  var base64VLQ = require_base64_vlq();
  var util = require_util();
  var ArraySet = require_array_set().ArraySet;
  var MappingList = require_mapping_list().MappingList;
  function SourceMapGenerator(aArgs) {
    if (!aArgs) {
      aArgs = {};
    }
    this._file = util.getArg(aArgs, "file", null);
    this._sourceRoot = util.getArg(aArgs, "sourceRoot", null);
    this._skipValidation = util.getArg(aArgs, "skipValidation", false);
    this._sources = new ArraySet;
    this._names = new ArraySet;
    this._mappings = new MappingList;
    this._sourcesContents = null;
  }
  SourceMapGenerator.prototype._version = 3;
  SourceMapGenerator.fromSourceMap = function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator({
      file: aSourceMapConsumer.file,
      sourceRoot
    });
    aSourceMapConsumer.eachMapping(function(mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };
      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util.relative(sourceRoot, newMapping.source);
        }
        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };
        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }
      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function(sourceFile) {
      var sourceRelative = sourceFile;
      if (sourceRoot !== null) {
        sourceRelative = util.relative(sourceRoot, sourceFile);
      }
      if (!generator._sources.has(sourceRelative)) {
        generator._sources.add(sourceRelative);
      }
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };
  SourceMapGenerator.prototype.addMapping = function SourceMapGenerator_addMapping(aArgs) {
    var generated = util.getArg(aArgs, "generated");
    var original = util.getArg(aArgs, "original", null);
    var source = util.getArg(aArgs, "source", null);
    var name = util.getArg(aArgs, "name", null);
    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }
    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }
    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }
    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source,
      name
    });
  };
  SourceMapGenerator.prototype.setSourceContent = function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util.relative(this._sourceRoot, source);
    }
    if (aSourceContent != null) {
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      delete this._sourcesContents[util.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };
  SourceMapGenerator.prototype.applySourceMap = function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error("SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, " + `or the source map's "file" property. Both were omitted.`);
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    if (sourceRoot != null) {
      sourceFile = util.relative(sourceRoot, sourceFile);
    }
    var newSources = new ArraySet;
    var newNames = new ArraySet;
    this._mappings.unsortedForEach(function(mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util.join(aSourceMapPath, mapping.source);
          }
          if (sourceRoot != null) {
            mapping.source = util.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }
      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }
      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }
    }, this);
    this._sources = newSources;
    this._names = newNames;
    aSourceMapConsumer.sources.forEach(function(sourceFile2) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile2);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile2 = util.join(aSourceMapPath, sourceFile2);
        }
        if (sourceRoot != null) {
          sourceFile2 = util.relative(sourceRoot, sourceFile2);
        }
        this.setSourceContent(sourceFile2, content);
      }
    }, this);
  };
  SourceMapGenerator.prototype._validateMapping = function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource, aName) {
    if (aOriginal && typeof aOriginal.line !== "number" && typeof aOriginal.column !== "number") {
      throw new Error("original.line and original.column are not numbers -- you probably meant to omit " + "the original mapping entirely and only map the generated position. If so, pass " + "null for the original mapping instead of an object with empty or null values.");
    }
    if (aGenerated && "line" in aGenerated && "column" in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) {
      return;
    } else if (aGenerated && "line" in aGenerated && "column" in aGenerated && aOriginal && "line" in aOriginal && "column" in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) {
      return;
    } else {
      throw new Error("Invalid mapping: " + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };
  SourceMapGenerator.prototype._serializeMappings = function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = "";
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;
    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length;i < len; i++) {
      mapping = mappings[i];
      next = "";
      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ";";
          previousGeneratedLine++;
        }
      } else {
        if (i > 0) {
          if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ",";
        }
      }
      next += base64VLQ.encode(mapping.generatedColumn - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;
      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;
        next += base64VLQ.encode(mapping.originalLine - 1 - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;
        next += base64VLQ.encode(mapping.originalColumn - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;
        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }
      result += next;
    }
    return result;
  };
  SourceMapGenerator.prototype._generateSourcesContent = function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function(source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util.relative(aSourceRoot, source);
      }
      var key = util.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key] : null;
    }, this);
  };
  SourceMapGenerator.prototype.toJSON = function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }
    return map;
  };
  SourceMapGenerator.prototype.toString = function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };
  exports.SourceMapGenerator = SourceMapGenerator;
});

// ../../node_modules/.bun/source-map@0.6.1/node_modules/source-map/lib/binary-search.js
var require_binary_search = __commonJS((exports) => {
  exports.GREATEST_LOWER_BOUND = 1;
  exports.LEAST_UPPER_BOUND = 2;
  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
    var cmp = aCompare(aNeedle, aHaystack[mid], true);
    if (cmp === 0) {
      return mid;
    } else if (cmp > 0) {
      if (aHigh - mid > 1) {
        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
      }
      if (aBias == exports.LEAST_UPPER_BOUND) {
        return aHigh < aHaystack.length ? aHigh : -1;
      } else {
        return mid;
      }
    } else {
      if (mid - aLow > 1) {
        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
      }
      if (aBias == exports.LEAST_UPPER_BOUND) {
        return mid;
      } else {
        return aLow < 0 ? -1 : aLow;
      }
    }
  }
  exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
    if (aHaystack.length === 0) {
      return -1;
    }
    var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare, aBias || exports.GREATEST_LOWER_BOUND);
    if (index < 0) {
      return -1;
    }
    while (index - 1 >= 0) {
      if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
        break;
      }
      --index;
    }
    return index;
  };
});

// ../../node_modules/.bun/source-map@0.6.1/node_modules/source-map/lib/quick-sort.js
var require_quick_sort = __commonJS((exports) => {
  function swap(ary, x, y) {
    var temp = ary[x];
    ary[x] = ary[y];
    ary[y] = temp;
  }
  function randomIntInRange(low, high) {
    return Math.round(low + Math.random() * (high - low));
  }
  function doQuickSort(ary, comparator, p, r) {
    if (p < r) {
      var pivotIndex = randomIntInRange(p, r);
      var i = p - 1;
      swap(ary, pivotIndex, r);
      var pivot = ary[r];
      for (var j = p;j < r; j++) {
        if (comparator(ary[j], pivot) <= 0) {
          i += 1;
          swap(ary, i, j);
        }
      }
      swap(ary, i + 1, j);
      var q = i + 1;
      doQuickSort(ary, comparator, p, q - 1);
      doQuickSort(ary, comparator, q + 1, r);
    }
  }
  exports.quickSort = function(ary, comparator) {
    doQuickSort(ary, comparator, 0, ary.length - 1);
  };
});

// ../../node_modules/.bun/source-map@0.6.1/node_modules/source-map/lib/source-map-consumer.js
var require_source_map_consumer = __commonJS((exports) => {
  var util = require_util();
  var binarySearch = require_binary_search();
  var ArraySet = require_array_set().ArraySet;
  var base64VLQ = require_base64_vlq();
  var quickSort = require_quick_sort().quickSort;
  function SourceMapConsumer(aSourceMap, aSourceMapURL) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === "string") {
      sourceMap = util.parseSourceMapInput(aSourceMap);
    }
    return sourceMap.sections != null ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL) : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
  }
  SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
    return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
  };
  SourceMapConsumer.prototype._version = 3;
  SourceMapConsumer.prototype.__generatedMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, "_generatedMappings", {
    configurable: true,
    enumerable: true,
    get: function() {
      if (!this.__generatedMappings) {
        this._parseMappings(this._mappings, this.sourceRoot);
      }
      return this.__generatedMappings;
    }
  });
  SourceMapConsumer.prototype.__originalMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, "_originalMappings", {
    configurable: true,
    enumerable: true,
    get: function() {
      if (!this.__originalMappings) {
        this._parseMappings(this._mappings, this.sourceRoot);
      }
      return this.__originalMappings;
    }
  });
  SourceMapConsumer.prototype._charIsMappingSeparator = function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };
  SourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };
  SourceMapConsumer.GENERATED_ORDER = 1;
  SourceMapConsumer.ORIGINAL_ORDER = 2;
  SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
  SourceMapConsumer.LEAST_UPPER_BOUND = 2;
  SourceMapConsumer.prototype.eachMapping = function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;
    var mappings;
    switch (order) {
      case SourceMapConsumer.GENERATED_ORDER:
        mappings = this._generatedMappings;
        break;
      case SourceMapConsumer.ORIGINAL_ORDER:
        mappings = this._originalMappings;
        break;
      default:
        throw new Error("Unknown order of iteration.");
    }
    var sourceRoot = this.sourceRoot;
    mappings.map(function(mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
      return {
        source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };
  SourceMapConsumer.prototype.allGeneratedPositionsFor = function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, "line");
    var needle = {
      source: util.getArg(aArgs, "source"),
      originalLine: line,
      originalColumn: util.getArg(aArgs, "column", 0)
    };
    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }
    var mappings = [];
    var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];
      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, "generatedLine", null),
            column: util.getArg(mapping, "generatedColumn", null),
            lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
          });
          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;
        while (mapping && mapping.originalLine === line && mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, "generatedLine", null),
            column: util.getArg(mapping, "generatedColumn", null),
            lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
          });
          mapping = this._originalMappings[++index];
        }
      }
    }
    return mappings;
  };
  exports.SourceMapConsumer = SourceMapConsumer;
  function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === "string") {
      sourceMap = util.parseSourceMapInput(aSourceMap);
    }
    var version = util.getArg(sourceMap, "version");
    var sources = util.getArg(sourceMap, "sources");
    var names = util.getArg(sourceMap, "names", []);
    var sourceRoot = util.getArg(sourceMap, "sourceRoot", null);
    var sourcesContent = util.getArg(sourceMap, "sourcesContent", null);
    var mappings = util.getArg(sourceMap, "mappings");
    var file = util.getArg(sourceMap, "file", null);
    if (version != this._version) {
      throw new Error("Unsupported version: " + version);
    }
    if (sourceRoot) {
      sourceRoot = util.normalize(sourceRoot);
    }
    sources = sources.map(String).map(util.normalize).map(function(source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source) ? util.relative(sourceRoot, source) : source;
    });
    this._names = ArraySet.fromArray(names.map(String), true);
    this._sources = ArraySet.fromArray(sources, true);
    this._absoluteSources = this._sources.toArray().map(function(s) {
      return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
    });
    this.sourceRoot = sourceRoot;
    this.sourcesContent = sourcesContent;
    this._mappings = mappings;
    this._sourceMapURL = aSourceMapURL;
    this.file = file;
  }
  BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
  BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;
  BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }
    if (this._sources.has(relativeSource)) {
      return this._sources.indexOf(relativeSource);
    }
    var i;
    for (i = 0;i < this._absoluteSources.length; ++i) {
      if (this._absoluteSources[i] == aSource) {
        return i;
      }
    }
    return -1;
  };
  BasicSourceMapConsumer.fromSourceMap = function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);
    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(), smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function(s) {
      return util.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });
    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];
    for (var i = 0, length = generatedMappings.length;i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;
      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;
        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }
        destOriginalMappings.push(destMapping);
      }
      destGeneratedMappings.push(destMapping);
    }
    quickSort(smc.__originalMappings, util.compareByOriginalPositions);
    return smc;
  };
  BasicSourceMapConsumer.prototype._version = 3;
  Object.defineProperty(BasicSourceMapConsumer.prototype, "sources", {
    get: function() {
      return this._absoluteSources.slice();
    }
  });
  function Mapping() {
    this.generatedLine = 0;
    this.generatedColumn = 0;
    this.source = null;
    this.originalLine = null;
    this.originalColumn = null;
    this.name = null;
  }
  BasicSourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;
    while (index < length) {
      if (aStr.charAt(index) === ";") {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      } else if (aStr.charAt(index) === ",") {
        index++;
      } else {
        mapping = new Mapping;
        mapping.generatedLine = generatedLine;
        for (end = index;end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);
        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64VLQ.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }
          if (segment.length === 2) {
            throw new Error("Found a source, but no line and column");
          }
          if (segment.length === 3) {
            throw new Error("Found a source and line, but no column");
          }
          cachedSegments[str] = segment;
        }
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;
        if (segment.length > 1) {
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          mapping.originalLine += 1;
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;
          if (segment.length > 4) {
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }
        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === "number") {
          originalMappings.push(mapping);
        }
      }
    }
    quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;
    quickSort(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };
  BasicSourceMapConsumer.prototype._findMapping = function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator, aBias) {
    if (aNeedle[aLineName] <= 0) {
      throw new TypeError("Line must be greater than or equal to 1, got " + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError("Column must be greater than or equal to 0, got " + aNeedle[aColumnName]);
    }
    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };
  BasicSourceMapConsumer.prototype.computeColumnSpans = function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0;index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];
        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }
      mapping.lastGeneratedColumn = Infinity;
    }
  };
  BasicSourceMapConsumer.prototype.originalPositionFor = function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, "line"),
      generatedColumn: util.getArg(aArgs, "column")
    };
    var index = this._findMapping(needle, this._generatedMappings, "generatedLine", "generatedColumn", util.compareByGeneratedPositionsDeflated, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
    if (index >= 0) {
      var mapping = this._generatedMappings[index];
      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, "source", null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util.getArg(mapping, "name", null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source,
          line: util.getArg(mapping, "originalLine", null),
          column: util.getArg(mapping, "originalColumn", null),
          name
        };
      }
    }
    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };
  BasicSourceMapConsumer.prototype.hasContentsOfAllSources = function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(sc) {
      return sc == null;
    });
  };
  BasicSourceMapConsumer.prototype.sourceContentFor = function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }
    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }
    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }
    var url;
    if (this.sourceRoot != null && (url = util.urlParse(this.sourceRoot))) {
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file" && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
      }
      if ((!url.path || url.path == "/") && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }
    if (nullOnMissing) {
      return null;
    } else {
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };
  BasicSourceMapConsumer.prototype.generatedPositionFor = function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, "source");
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }
    var needle = {
      source,
      originalLine: util.getArg(aArgs, "line"),
      originalColumn: util.getArg(aArgs, "column")
    };
    var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
    if (index >= 0) {
      var mapping = this._originalMappings[index];
      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, "generatedLine", null),
          column: util.getArg(mapping, "generatedColumn", null),
          lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
        };
      }
    }
    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };
  exports.BasicSourceMapConsumer = BasicSourceMapConsumer;
  function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === "string") {
      sourceMap = util.parseSourceMapInput(aSourceMap);
    }
    var version = util.getArg(sourceMap, "version");
    var sections = util.getArg(sourceMap, "sections");
    if (version != this._version) {
      throw new Error("Unsupported version: " + version);
    }
    this._sources = new ArraySet;
    this._names = new ArraySet;
    var lastOffset = {
      line: -1,
      column: 0
    };
    this._sections = sections.map(function(s) {
      if (s.url) {
        throw new Error("Support for url field in sections not implemented.");
      }
      var offset = util.getArg(s, "offset");
      var offsetLine = util.getArg(offset, "line");
      var offsetColumn = util.getArg(offset, "column");
      if (offsetLine < lastOffset.line || offsetLine === lastOffset.line && offsetColumn < lastOffset.column) {
        throw new Error("Section offsets must be ordered and non-overlapping.");
      }
      lastOffset = offset;
      return {
        generatedOffset: {
          generatedLine: offsetLine + 1,
          generatedColumn: offsetColumn + 1
        },
        consumer: new SourceMapConsumer(util.getArg(s, "map"), aSourceMapURL)
      };
    });
  }
  IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
  IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;
  IndexedSourceMapConsumer.prototype._version = 3;
  Object.defineProperty(IndexedSourceMapConsumer.prototype, "sources", {
    get: function() {
      var sources = [];
      for (var i = 0;i < this._sections.length; i++) {
        for (var j = 0;j < this._sections[i].consumer.sources.length; j++) {
          sources.push(this._sections[i].consumer.sources[j]);
        }
      }
      return sources;
    }
  });
  IndexedSourceMapConsumer.prototype.originalPositionFor = function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, "line"),
      generatedColumn: util.getArg(aArgs, "column")
    };
    var sectionIndex = binarySearch.search(needle, this._sections, function(needle2, section2) {
      var cmp = needle2.generatedLine - section2.generatedOffset.generatedLine;
      if (cmp) {
        return cmp;
      }
      return needle2.generatedColumn - section2.generatedOffset.generatedColumn;
    });
    var section = this._sections[sectionIndex];
    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }
    return section.consumer.originalPositionFor({
      line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn - (section.generatedOffset.generatedLine === needle.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
      bias: aArgs.bias
    });
  };
  IndexedSourceMapConsumer.prototype.hasContentsOfAllSources = function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function(s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };
  IndexedSourceMapConsumer.prototype.sourceContentFor = function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0;i < this._sections.length; i++) {
      var section = this._sections[i];
      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    } else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };
  IndexedSourceMapConsumer.prototype.generatedPositionFor = function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0;i < this._sections.length; i++) {
      var section = this._sections[i];
      if (section.consumer._findSourceIndex(util.getArg(aArgs, "source")) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line + (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column + (section.generatedOffset.generatedLine === generatedPosition.line ? section.generatedOffset.generatedColumn - 1 : 0)
        };
        return ret;
      }
    }
    return {
      line: null,
      column: null
    };
  };
  IndexedSourceMapConsumer.prototype._parseMappings = function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0;i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0;j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];
        var source = section.consumer._sources.at(mapping.source);
        source = util.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);
        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }
        var adjustedMapping = {
          source,
          generatedLine: mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn + (section.generatedOffset.generatedLine === mapping.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name
        };
        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === "number") {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }
    quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util.compareByOriginalPositions);
  };
  exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;
});

// ../../node_modules/.bun/source-map@0.6.1/node_modules/source-map/lib/source-node.js
var require_source_node = __commonJS((exports) => {
  var SourceMapGenerator = require_source_map_generator().SourceMapGenerator;
  var util = require_util();
  var REGEX_NEWLINE = /(\r?\n)/;
  var NEWLINE_CODE = 10;
  var isSourceNode = "$$$isSourceNode$$$";
  function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
    this.children = [];
    this.sourceContents = {};
    this.line = aLine == null ? null : aLine;
    this.column = aColumn == null ? null : aColumn;
    this.source = aSource == null ? null : aSource;
    this.name = aName == null ? null : aName;
    this[isSourceNode] = true;
    if (aChunks != null)
      this.add(aChunks);
  }
  SourceNode.fromStringWithSourceMap = function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    var node = new SourceNode;
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var remainingLinesIndex = 0;
    var shiftNextLine = function() {
      var lineContents = getNextLine();
      var newLine = getNextLine() || "";
      return lineContents + newLine;
      function getNextLine() {
        return remainingLinesIndex < remainingLines.length ? remainingLines[remainingLinesIndex++] : undefined;
      }
    };
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;
    var lastMapping = null;
    aSourceMapConsumer.eachMapping(function(mapping) {
      if (lastMapping !== null) {
        if (lastGeneratedLine < mapping.generatedLine) {
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
        } else {
          var nextLine = remainingLines[remainingLinesIndex] || "";
          var code = nextLine.substr(0, mapping.generatedColumn - lastGeneratedColumn);
          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn - lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          lastMapping = mapping;
          return;
        }
      }
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[remainingLinesIndex] || "";
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    if (remainingLinesIndex < remainingLines.length) {
      if (lastMapping) {
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      node.add(remainingLines.splice(remainingLinesIndex).join(""));
    }
    aSourceMapConsumer.sources.forEach(function(sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });
    return node;
    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath ? util.join(aRelativePath, mapping.source) : mapping.source;
        node.add(new SourceNode(mapping.originalLine, mapping.originalColumn, source, code, mapping.name));
      }
    }
  };
  SourceNode.prototype.add = function SourceNode_add(aChunk) {
    if (Array.isArray(aChunk)) {
      aChunk.forEach(function(chunk) {
        this.add(chunk);
      }, this);
    } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      if (aChunk) {
        this.children.push(aChunk);
      }
    } else {
      throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
    }
    return this;
  };
  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
    if (Array.isArray(aChunk)) {
      for (var i = aChunk.length - 1;i >= 0; i--) {
        this.prepend(aChunk[i]);
      }
    } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      this.children.unshift(aChunk);
    } else {
      throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
    }
    return this;
  };
  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
    var chunk;
    for (var i = 0, len = this.children.length;i < len; i++) {
      chunk = this.children[i];
      if (chunk[isSourceNode]) {
        chunk.walk(aFn);
      } else {
        if (chunk !== "") {
          aFn(chunk, {
            source: this.source,
            line: this.line,
            column: this.column,
            name: this.name
          });
        }
      }
    }
  };
  SourceNode.prototype.join = function SourceNode_join(aSep) {
    var newChildren;
    var i;
    var len = this.children.length;
    if (len > 0) {
      newChildren = [];
      for (i = 0;i < len - 1; i++) {
        newChildren.push(this.children[i]);
        newChildren.push(aSep);
      }
      newChildren.push(this.children[i]);
      this.children = newChildren;
    }
    return this;
  };
  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
    var lastChild = this.children[this.children.length - 1];
    if (lastChild[isSourceNode]) {
      lastChild.replaceRight(aPattern, aReplacement);
    } else if (typeof lastChild === "string") {
      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
    } else {
      this.children.push("".replace(aPattern, aReplacement));
    }
    return this;
  };
  SourceNode.prototype.setSourceContent = function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
  };
  SourceNode.prototype.walkSourceContents = function SourceNode_walkSourceContents(aFn) {
    for (var i = 0, len = this.children.length;i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }
    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length;i < len; i++) {
      aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  };
  SourceNode.prototype.toString = function SourceNode_toString() {
    var str = "";
    this.walk(function(chunk) {
      str += chunk;
    });
    return str;
  };
  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
    var generated = {
      code: "",
      line: 1,
      column: 0
    };
    var map = new SourceMapGenerator(aArgs);
    var sourceMappingActive = false;
    var lastOriginalSource = null;
    var lastOriginalLine = null;
    var lastOriginalColumn = null;
    var lastOriginalName = null;
    this.walk(function(chunk, original) {
      generated.code += chunk;
      if (original.source !== null && original.line !== null && original.column !== null) {
        if (lastOriginalSource !== original.source || lastOriginalLine !== original.line || lastOriginalColumn !== original.column || lastOriginalName !== original.name) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
        lastOriginalSource = original.source;
        lastOriginalLine = original.line;
        lastOriginalColumn = original.column;
        lastOriginalName = original.name;
        sourceMappingActive = true;
      } else if (sourceMappingActive) {
        map.addMapping({
          generated: {
            line: generated.line,
            column: generated.column
          }
        });
        lastOriginalSource = null;
        sourceMappingActive = false;
      }
      for (var idx = 0, length = chunk.length;idx < length; idx++) {
        if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
          generated.line++;
          generated.column = 0;
          if (idx + 1 === length) {
            lastOriginalSource = null;
            sourceMappingActive = false;
          } else if (sourceMappingActive) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column
              },
              generated: {
                line: generated.line,
                column: generated.column
              },
              name: original.name
            });
          }
        } else {
          generated.column++;
        }
      }
    });
    this.walkSourceContents(function(sourceFile, sourceContent) {
      map.setSourceContent(sourceFile, sourceContent);
    });
    return { code: generated.code, map };
  };
  exports.SourceNode = SourceNode;
});

// ../../node_modules/.bun/source-map@0.6.1/node_modules/source-map/source-map.js
var require_source_map = __commonJS((exports) => {
  exports.SourceMapGenerator = require_source_map_generator().SourceMapGenerator;
  exports.SourceMapConsumer = require_source_map_consumer().SourceMapConsumer;
  exports.SourceNode = require_source_node().SourceNode;
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/compiler/code-gen.js
var require_code_gen = __commonJS((exports, module) => {
  exports.__esModule = true;
  var _utils = require_utils();
  var SourceNode = undefined;
  try {
    if (typeof define !== "function" || !define.amd) {
      SourceMap = require_source_map();
      SourceNode = SourceMap.SourceNode;
    }
  } catch (err) {}
  var SourceMap;
  if (!SourceNode) {
    SourceNode = function(line, column, srcFile, chunks) {
      this.src = "";
      if (chunks) {
        this.add(chunks);
      }
    };
    SourceNode.prototype = {
      add: function add(chunks) {
        if (_utils.isArray(chunks)) {
          chunks = chunks.join("");
        }
        this.src += chunks;
      },
      prepend: function prepend(chunks) {
        if (_utils.isArray(chunks)) {
          chunks = chunks.join("");
        }
        this.src = chunks + this.src;
      },
      toStringWithSourceMap: function toStringWithSourceMap() {
        return { code: this.toString() };
      },
      toString: function toString() {
        return this.src;
      }
    };
  }
  function castChunk(chunk, codeGen, loc) {
    if (_utils.isArray(chunk)) {
      var ret = [];
      for (var i = 0, len = chunk.length;i < len; i++) {
        ret.push(codeGen.wrap(chunk[i], loc));
      }
      return ret;
    } else if (typeof chunk === "boolean" || typeof chunk === "number") {
      return chunk + "";
    }
    return chunk;
  }
  function CodeGen(srcFile) {
    this.srcFile = srcFile;
    this.source = [];
  }
  CodeGen.prototype = {
    isEmpty: function isEmpty() {
      return !this.source.length;
    },
    prepend: function prepend(source, loc) {
      this.source.unshift(this.wrap(source, loc));
    },
    push: function push(source, loc) {
      this.source.push(this.wrap(source, loc));
    },
    merge: function merge() {
      var source = this.empty();
      this.each(function(line) {
        source.add(["  ", line, `
`]);
      });
      return source;
    },
    each: function each(iter) {
      for (var i = 0, len = this.source.length;i < len; i++) {
        iter(this.source[i]);
      }
    },
    empty: function empty() {
      var loc = this.currentLocation || { start: {} };
      return new SourceNode(loc.start.line, loc.start.column, this.srcFile);
    },
    wrap: function wrap(chunk) {
      var loc = arguments.length <= 1 || arguments[1] === undefined ? this.currentLocation || { start: {} } : arguments[1];
      if (chunk instanceof SourceNode) {
        return chunk;
      }
      chunk = castChunk(chunk, this, loc);
      return new SourceNode(loc.start.line, loc.start.column, this.srcFile, chunk);
    },
    functionCall: function functionCall(fn, type, params) {
      params = this.generateList(params);
      return this.wrap([fn, type ? "." + type + "(" : "(", params, ")"]);
    },
    quotedString: function quotedString(str) {
      return '"' + (str + "").replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + '"';
    },
    objectLiteral: function objectLiteral(obj) {
      var _this = this;
      var pairs = [];
      Object.keys(obj).forEach(function(key) {
        var value = castChunk(obj[key], _this);
        if (value !== "undefined") {
          pairs.push([_this.quotedString(key), ":", value]);
        }
      });
      var ret = this.generateList(pairs);
      ret.prepend("{");
      ret.add("}");
      return ret;
    },
    generateList: function generateList(entries) {
      var ret = this.empty();
      for (var i = 0, len = entries.length;i < len; i++) {
        if (i) {
          ret.add(",");
        }
        ret.add(castChunk(entries[i], this));
      }
      return ret;
    },
    generateArray: function generateArray(entries) {
      var ret = this.generateList(entries);
      ret.prepend("[");
      ret.add("]");
      return ret;
    }
  };
  exports.default = CodeGen;
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/compiler/javascript-compiler.js
var require_javascript_compiler = __commonJS((exports, module) => {
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _base = require_base();
  var _exception = require_exception();
  var _exception2 = _interopRequireDefault(_exception);
  var _utils = require_utils();
  var _codeGen = require_code_gen();
  var _codeGen2 = _interopRequireDefault(_codeGen);
  function Literal(value) {
    this.value = value;
  }
  function JavaScriptCompiler() {}
  JavaScriptCompiler.prototype = {
    nameLookup: function nameLookup(parent, name) {
      return this.internalNameLookup(parent, name);
    },
    depthedLookup: function depthedLookup(name) {
      return [this.aliasable("container.lookup"), "(depths, ", JSON.stringify(name), ")"];
    },
    compilerInfo: function compilerInfo() {
      var revision = _base.COMPILER_REVISION, versions = _base.REVISION_CHANGES[revision];
      return [revision, versions];
    },
    appendToBuffer: function appendToBuffer(source, location, explicit) {
      if (!_utils.isArray(source)) {
        source = [source];
      }
      source = this.source.wrap(source, location);
      if (this.environment.isSimple) {
        return ["return ", source, ";"];
      } else if (explicit) {
        return ["buffer += ", source, ";"];
      } else {
        source.appendToBuffer = true;
        return source;
      }
    },
    initializeBuffer: function initializeBuffer() {
      return this.quotedString("");
    },
    internalNameLookup: function internalNameLookup(parent, name) {
      this.lookupPropertyFunctionIsUsed = true;
      return ["lookupProperty(", parent, ",", JSON.stringify(name), ")"];
    },
    lookupPropertyFunctionIsUsed: false,
    compile: function compile(environment, options, context, asObject) {
      this.environment = environment;
      this.options = options;
      this.stringParams = this.options.stringParams;
      this.trackIds = this.options.trackIds;
      this.precompile = !asObject;
      this.name = this.environment.name;
      this.isChild = !!context;
      this.context = context || {
        decorators: [],
        programs: [],
        environments: []
      };
      this.preamble();
      this.stackSlot = 0;
      this.stackVars = [];
      this.aliases = {};
      this.registers = { list: [] };
      this.hashes = [];
      this.compileStack = [];
      this.inlineStack = [];
      this.blockParams = [];
      this.compileChildren(environment, options);
      this.useDepths = this.useDepths || environment.useDepths || environment.useDecorators || this.options.compat;
      this.useBlockParams = this.useBlockParams || environment.useBlockParams;
      var opcodes = environment.opcodes, opcode = undefined, firstLoc = undefined, i = undefined, l = undefined;
      for (i = 0, l = opcodes.length;i < l; i++) {
        opcode = opcodes[i];
        this.source.currentLocation = opcode.loc;
        firstLoc = firstLoc || opcode.loc;
        this[opcode.opcode].apply(this, opcode.args);
      }
      this.source.currentLocation = firstLoc;
      this.pushSource("");
      if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
        throw new _exception2["default"]("Compile completed with content left on stack");
      }
      if (!this.decorators.isEmpty()) {
        this.useDecorators = true;
        this.decorators.prepend(["var decorators = container.decorators, ", this.lookupPropertyFunctionVarDeclaration(), `;
`]);
        this.decorators.push("return fn;");
        if (asObject) {
          this.decorators = Function.apply(this, ["fn", "props", "container", "depth0", "data", "blockParams", "depths", this.decorators.merge()]);
        } else {
          this.decorators.prepend(`function(fn, props, container, depth0, data, blockParams, depths) {
`);
          this.decorators.push(`}
`);
          this.decorators = this.decorators.merge();
        }
      } else {
        this.decorators = undefined;
      }
      var fn = this.createFunctionContext(asObject);
      if (!this.isChild) {
        var ret = {
          compiler: this.compilerInfo(),
          main: fn
        };
        if (this.decorators) {
          ret.main_d = this.decorators;
          ret.useDecorators = true;
        }
        var _context = this.context;
        var programs = _context.programs;
        var decorators = _context.decorators;
        for (i = 0, l = programs.length;i < l; i++) {
          ret[i] = programs[i];
          if (decorators[i]) {
            ret[i + "_d"] = decorators[i];
            ret.useDecorators = true;
          }
        }
        if (this.environment.usePartial) {
          ret.usePartial = true;
        }
        if (this.options.data) {
          ret.useData = true;
        }
        if (this.useDepths) {
          ret.useDepths = true;
        }
        if (this.useBlockParams) {
          ret.useBlockParams = true;
        }
        if (this.options.compat) {
          ret.compat = true;
        }
        if (!asObject) {
          ret.compiler = JSON.stringify(ret.compiler);
          this.source.currentLocation = { start: { line: 1, column: 0 } };
          ret = this.objectLiteral(ret);
          if (options.srcName) {
            ret = ret.toStringWithSourceMap({ file: options.destName });
            ret.map = ret.map && ret.map.toString();
          } else {
            ret = ret.toString();
          }
        } else {
          ret.compilerOptions = this.options;
        }
        return ret;
      } else {
        return fn;
      }
    },
    preamble: function preamble() {
      this.lastContext = 0;
      this.source = new _codeGen2["default"](this.options.srcName);
      this.decorators = new _codeGen2["default"](this.options.srcName);
    },
    createFunctionContext: function createFunctionContext(asObject) {
      var _this = this;
      var varDeclarations = "";
      var locals = this.stackVars.concat(this.registers.list);
      if (locals.length > 0) {
        varDeclarations += ", " + locals.join(", ");
      }
      var aliasCount = 0;
      Object.keys(this.aliases).forEach(function(alias) {
        var node = _this.aliases[alias];
        if (node.children && node.referenceCount > 1) {
          varDeclarations += ", alias" + ++aliasCount + "=" + alias;
          node.children[0] = "alias" + aliasCount;
        }
      });
      if (this.lookupPropertyFunctionIsUsed) {
        varDeclarations += ", " + this.lookupPropertyFunctionVarDeclaration();
      }
      var params = ["container", "depth0", "helpers", "partials", "data"];
      if (this.useBlockParams || this.useDepths) {
        params.push("blockParams");
      }
      if (this.useDepths) {
        params.push("depths");
      }
      var source = this.mergeSource(varDeclarations);
      if (asObject) {
        params.push(source);
        return Function.apply(this, params);
      } else {
        return this.source.wrap(["function(", params.join(","), `) {
  `, source, "}"]);
      }
    },
    mergeSource: function mergeSource(varDeclarations) {
      var isSimple = this.environment.isSimple, appendOnly = !this.forceBuffer, appendFirst = undefined, sourceSeen = undefined, bufferStart = undefined, bufferEnd = undefined;
      this.source.each(function(line) {
        if (line.appendToBuffer) {
          if (bufferStart) {
            line.prepend("  + ");
          } else {
            bufferStart = line;
          }
          bufferEnd = line;
        } else {
          if (bufferStart) {
            if (!sourceSeen) {
              appendFirst = true;
            } else {
              bufferStart.prepend("buffer += ");
            }
            bufferEnd.add(";");
            bufferStart = bufferEnd = undefined;
          }
          sourceSeen = true;
          if (!isSimple) {
            appendOnly = false;
          }
        }
      });
      if (appendOnly) {
        if (bufferStart) {
          bufferStart.prepend("return ");
          bufferEnd.add(";");
        } else if (!sourceSeen) {
          this.source.push('return "";');
        }
      } else {
        varDeclarations += ", buffer = " + (appendFirst ? "" : this.initializeBuffer());
        if (bufferStart) {
          bufferStart.prepend("return buffer + ");
          bufferEnd.add(";");
        } else {
          this.source.push("return buffer;");
        }
      }
      if (varDeclarations) {
        this.source.prepend("var " + varDeclarations.substring(2) + (appendFirst ? "" : `;
`));
      }
      return this.source.merge();
    },
    lookupPropertyFunctionVarDeclaration: function lookupPropertyFunctionVarDeclaration() {
      return `
      lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    }
    `.trim();
    },
    blockValue: function blockValue(name) {
      var blockHelperMissing = this.aliasable("container.hooks.blockHelperMissing"), params = [this.contextName(0)];
      this.setupHelperArgs(name, 0, params);
      var blockName = this.popStack();
      params.splice(1, 0, blockName);
      this.push(this.source.functionCall(blockHelperMissing, "call", params));
    },
    ambiguousBlockValue: function ambiguousBlockValue() {
      var blockHelperMissing = this.aliasable("container.hooks.blockHelperMissing"), params = [this.contextName(0)];
      this.setupHelperArgs("", 0, params, true);
      this.flushInline();
      var current = this.topStack();
      params.splice(1, 0, current);
      this.pushSource(["if (!", this.lastHelper, ") { ", current, " = ", this.source.functionCall(blockHelperMissing, "call", params), "}"]);
    },
    appendContent: function appendContent(content) {
      if (this.pendingContent) {
        content = this.pendingContent + content;
      } else {
        this.pendingLocation = this.source.currentLocation;
      }
      this.pendingContent = content;
    },
    append: function append() {
      if (this.isInline()) {
        this.replaceStack(function(current) {
          return [" != null ? ", current, ' : ""'];
        });
        this.pushSource(this.appendToBuffer(this.popStack()));
      } else {
        var local = this.popStack();
        this.pushSource(["if (", local, " != null) { ", this.appendToBuffer(local, undefined, true), " }"]);
        if (this.environment.isSimple) {
          this.pushSource(["else { ", this.appendToBuffer("''", undefined, true), " }"]);
        }
      }
    },
    appendEscaped: function appendEscaped() {
      this.pushSource(this.appendToBuffer([this.aliasable("container.escapeExpression"), "(", this.popStack(), ")"]));
    },
    getContext: function getContext(depth) {
      this.lastContext = depth;
    },
    pushContext: function pushContext() {
      this.pushStackLiteral(this.contextName(this.lastContext));
    },
    lookupOnContext: function lookupOnContext(parts, falsy, strict, scoped) {
      var i = 0;
      if (!scoped && this.options.compat && !this.lastContext) {
        this.push(this.depthedLookup(parts[i++]));
      } else {
        this.pushContext();
      }
      this.resolvePath("context", parts, i, falsy, strict);
    },
    lookupBlockParam: function lookupBlockParam(blockParamId, parts) {
      this.useBlockParams = true;
      this.push(["blockParams[", blockParamId[0], "][", blockParamId[1], "]"]);
      this.resolvePath("context", parts, 1);
    },
    lookupData: function lookupData(depth, parts, strict) {
      if (!depth) {
        this.pushStackLiteral("data");
      } else {
        this.pushStackLiteral("container.data(data, " + depth + ")");
      }
      this.resolvePath("data", parts, 0, true, strict);
    },
    resolvePath: function resolvePath(type, parts, startPartIndex, falsy, strict) {
      var _this2 = this;
      if (this.options.strict || this.options.assumeObjects) {
        this.push(strictLookup(this.options.strict && strict, this, parts, startPartIndex, type));
        return;
      }
      var len = parts.length;
      var _loop = function(i2) {
        _this2.replaceStack(function(current) {
          var lookup = _this2.nameLookup(current, parts[i2], type);
          if (!falsy) {
            return [" != null ? ", lookup, " : ", current];
          } else {
            return [" && ", lookup];
          }
        });
      };
      for (var i = startPartIndex;i < len; i++) {
        _loop(i);
      }
    },
    resolvePossibleLambda: function resolvePossibleLambda() {
      this.push([this.aliasable("container.lambda"), "(", this.popStack(), ", ", this.contextName(0), ")"]);
    },
    pushStringParam: function pushStringParam(string, type) {
      this.pushContext();
      this.pushString(type);
      if (type !== "SubExpression") {
        if (typeof string === "string") {
          this.pushString(string);
        } else {
          this.pushStackLiteral(string);
        }
      }
    },
    emptyHash: function emptyHash(omitEmpty) {
      if (this.trackIds) {
        this.push("{}");
      }
      if (this.stringParams) {
        this.push("{}");
        this.push("{}");
      }
      this.pushStackLiteral(omitEmpty ? "undefined" : "{}");
    },
    pushHash: function pushHash() {
      if (this.hash) {
        this.hashes.push(this.hash);
      }
      this.hash = { values: {}, types: [], contexts: [], ids: [] };
    },
    popHash: function popHash() {
      var hash = this.hash;
      this.hash = this.hashes.pop();
      if (this.trackIds) {
        this.push(this.objectLiteral(hash.ids));
      }
      if (this.stringParams) {
        this.push(this.objectLiteral(hash.contexts));
        this.push(this.objectLiteral(hash.types));
      }
      this.push(this.objectLiteral(hash.values));
    },
    pushString: function pushString(string) {
      this.pushStackLiteral(this.quotedString(string));
    },
    pushLiteral: function pushLiteral(value) {
      this.pushStackLiteral(value);
    },
    pushProgram: function pushProgram(guid) {
      if (guid != null) {
        this.pushStackLiteral(this.programExpression(guid));
      } else {
        this.pushStackLiteral(null);
      }
    },
    registerDecorator: function registerDecorator(paramSize, name) {
      var foundDecorator = this.nameLookup("decorators", name, "decorator"), options = this.setupHelperArgs(name, paramSize);
      this.decorators.push(["var decorator = ", foundDecorator, ";"]);
      this.decorators.push(['if (typeof decorator !== "function") { throw new Error(', this.quotedString('Missing decorator: "' + name + '"'), "); }"]);
      this.decorators.push(["fn = ", this.decorators.functionCall("decorator", "", ["fn", "props", "container", options]), " || fn;"]);
    },
    invokeHelper: function invokeHelper(paramSize, name, isSimple) {
      var nonHelper = this.popStack(), helper = this.setupHelper(paramSize, name);
      var possibleFunctionCalls = [];
      if (isSimple) {
        possibleFunctionCalls.push(helper.name);
      }
      possibleFunctionCalls.push(nonHelper);
      if (!this.options.strict) {
        possibleFunctionCalls.push(this.aliasable("container.hooks.helperMissing"));
      }
      var functionLookupCode = ["(", this.itemsSeparatedBy(possibleFunctionCalls, "||"), ")"];
      var functionCall = this.source.functionCall(functionLookupCode, "call", helper.callParams);
      this.push(functionCall);
    },
    itemsSeparatedBy: function itemsSeparatedBy(items, separator) {
      var result = [];
      result.push(items[0]);
      for (var i = 1;i < items.length; i++) {
        result.push(separator, items[i]);
      }
      return result;
    },
    invokeKnownHelper: function invokeKnownHelper(paramSize, name) {
      var helper = this.setupHelper(paramSize, name);
      this.push(this.source.functionCall(helper.name, "call", helper.callParams));
    },
    invokeAmbiguous: function invokeAmbiguous(name, helperCall) {
      this.useRegister("helper");
      var nonHelper = this.popStack();
      this.emptyHash();
      var helper = this.setupHelper(0, name, helperCall);
      var helperName = this.lastHelper = this.nameLookup("helpers", name, "helper");
      var lookup = ["(", "(helper = ", helperName, " || ", nonHelper, ")"];
      if (!this.options.strict) {
        lookup[0] = "(helper = ";
        lookup.push(" != null ? helper : ", this.aliasable("container.hooks.helperMissing"));
      }
      this.push(["(", lookup, helper.paramsInit ? ["),(", helper.paramsInit] : [], "),", "(typeof helper === ", this.aliasable('"function"'), " ? ", this.source.functionCall("helper", "call", helper.callParams), " : helper))"]);
    },
    invokePartial: function invokePartial(isDynamic, name, indent) {
      var params = [], options = this.setupParams(name, 1, params);
      if (isDynamic) {
        name = this.popStack();
        delete options.name;
      }
      if (indent) {
        options.indent = JSON.stringify(indent);
      }
      options.helpers = "helpers";
      options.partials = "partials";
      options.decorators = "container.decorators";
      if (!isDynamic) {
        params.unshift(this.nameLookup("partials", name, "partial"));
      } else {
        params.unshift(name);
      }
      if (this.options.compat) {
        options.depths = "depths";
      }
      options = this.objectLiteral(options);
      params.push(options);
      this.push(this.source.functionCall("container.invokePartial", "", params));
    },
    assignToHash: function assignToHash(key) {
      var value = this.popStack(), context = undefined, type = undefined, id = undefined;
      if (this.trackIds) {
        id = this.popStack();
      }
      if (this.stringParams) {
        type = this.popStack();
        context = this.popStack();
      }
      var hash = this.hash;
      if (context) {
        hash.contexts[key] = context;
      }
      if (type) {
        hash.types[key] = type;
      }
      if (id) {
        hash.ids[key] = id;
      }
      hash.values[key] = value;
    },
    pushId: function pushId(type, name, child) {
      if (type === "BlockParam") {
        this.pushStackLiteral("blockParams[" + name[0] + "].path[" + name[1] + "]" + (child ? " + " + JSON.stringify("." + child) : ""));
      } else if (type === "PathExpression") {
        this.pushString(name);
      } else if (type === "SubExpression") {
        this.pushStackLiteral("true");
      } else {
        this.pushStackLiteral("null");
      }
    },
    compiler: JavaScriptCompiler,
    compileChildren: function compileChildren(environment, options) {
      var children = environment.children, child = undefined, compiler = undefined;
      for (var i = 0, l = children.length;i < l; i++) {
        child = children[i];
        compiler = new this.compiler;
        var existing = this.matchExistingProgram(child);
        if (existing == null) {
          var index = this.context.programs.push("") - 1;
          child.index = index;
          child.name = "program" + index;
          this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
          this.context.decorators[index] = compiler.decorators;
          this.context.environments[index] = child;
          this.useDepths = this.useDepths || compiler.useDepths;
          this.useBlockParams = this.useBlockParams || compiler.useBlockParams;
          child.useDepths = this.useDepths;
          child.useBlockParams = this.useBlockParams;
        } else {
          child.index = existing.index;
          child.name = "program" + existing.index;
          this.useDepths = this.useDepths || existing.useDepths;
          this.useBlockParams = this.useBlockParams || existing.useBlockParams;
        }
      }
    },
    matchExistingProgram: function matchExistingProgram(child) {
      for (var i = 0, len = this.context.environments.length;i < len; i++) {
        var environment = this.context.environments[i];
        if (environment && environment.equals(child)) {
          return environment;
        }
      }
    },
    programExpression: function programExpression(guid) {
      var child = this.environment.children[guid], programParams = [child.index, "data", child.blockParams];
      if (this.useBlockParams || this.useDepths) {
        programParams.push("blockParams");
      }
      if (this.useDepths) {
        programParams.push("depths");
      }
      return "container.program(" + programParams.join(", ") + ")";
    },
    useRegister: function useRegister(name) {
      if (!this.registers[name]) {
        this.registers[name] = true;
        this.registers.list.push(name);
      }
    },
    push: function push(expr) {
      if (!(expr instanceof Literal)) {
        expr = this.source.wrap(expr);
      }
      this.inlineStack.push(expr);
      return expr;
    },
    pushStackLiteral: function pushStackLiteral(item) {
      this.push(new Literal(item));
    },
    pushSource: function pushSource(source) {
      if (this.pendingContent) {
        this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent), this.pendingLocation));
        this.pendingContent = undefined;
      }
      if (source) {
        this.source.push(source);
      }
    },
    replaceStack: function replaceStack(callback) {
      var prefix = ["("], stack = undefined, createdStack = undefined, usedLiteral = undefined;
      if (!this.isInline()) {
        throw new _exception2["default"]("replaceStack on non-inline");
      }
      var top = this.popStack(true);
      if (top instanceof Literal) {
        stack = [top.value];
        prefix = ["(", stack];
        usedLiteral = true;
      } else {
        createdStack = true;
        var _name = this.incrStack();
        prefix = ["((", this.push(_name), " = ", top, ")"];
        stack = this.topStack();
      }
      var item = callback.call(this, stack);
      if (!usedLiteral) {
        this.popStack();
      }
      if (createdStack) {
        this.stackSlot--;
      }
      this.push(prefix.concat(item, ")"));
    },
    incrStack: function incrStack() {
      this.stackSlot++;
      if (this.stackSlot > this.stackVars.length) {
        this.stackVars.push("stack" + this.stackSlot);
      }
      return this.topStackName();
    },
    topStackName: function topStackName() {
      return "stack" + this.stackSlot;
    },
    flushInline: function flushInline() {
      var inlineStack = this.inlineStack;
      this.inlineStack = [];
      for (var i = 0, len = inlineStack.length;i < len; i++) {
        var entry = inlineStack[i];
        if (entry instanceof Literal) {
          this.compileStack.push(entry);
        } else {
          var stack = this.incrStack();
          this.pushSource([stack, " = ", entry, ";"]);
          this.compileStack.push(stack);
        }
      }
    },
    isInline: function isInline() {
      return this.inlineStack.length;
    },
    popStack: function popStack(wrapped) {
      var inline = this.isInline(), item = (inline ? this.inlineStack : this.compileStack).pop();
      if (!wrapped && item instanceof Literal) {
        return item.value;
      } else {
        if (!inline) {
          if (!this.stackSlot) {
            throw new _exception2["default"]("Invalid stack pop");
          }
          this.stackSlot--;
        }
        return item;
      }
    },
    topStack: function topStack() {
      var stack = this.isInline() ? this.inlineStack : this.compileStack, item = stack[stack.length - 1];
      if (item instanceof Literal) {
        return item.value;
      } else {
        return item;
      }
    },
    contextName: function contextName(context) {
      if (this.useDepths && context) {
        return "depths[" + context + "]";
      } else {
        return "depth" + context;
      }
    },
    quotedString: function quotedString(str) {
      return this.source.quotedString(str);
    },
    objectLiteral: function objectLiteral(obj) {
      return this.source.objectLiteral(obj);
    },
    aliasable: function aliasable(name) {
      var ret = this.aliases[name];
      if (ret) {
        ret.referenceCount++;
        return ret;
      }
      ret = this.aliases[name] = this.source.wrap(name);
      ret.aliasable = true;
      ret.referenceCount = 1;
      return ret;
    },
    setupHelper: function setupHelper(paramSize, name, blockHelper) {
      var params = [], paramsInit = this.setupHelperArgs(name, paramSize, params, blockHelper);
      var foundHelper = this.nameLookup("helpers", name, "helper"), callContext = this.aliasable(this.contextName(0) + " != null ? " + this.contextName(0) + " : (container.nullContext || {})");
      return {
        params,
        paramsInit,
        name: foundHelper,
        callParams: [callContext].concat(params)
      };
    },
    setupParams: function setupParams(helper, paramSize, params) {
      var options = {}, contexts = [], types = [], ids = [], objectArgs = !params, param = undefined;
      if (objectArgs) {
        params = [];
      }
      options.name = this.quotedString(helper);
      options.hash = this.popStack();
      if (this.trackIds) {
        options.hashIds = this.popStack();
      }
      if (this.stringParams) {
        options.hashTypes = this.popStack();
        options.hashContexts = this.popStack();
      }
      var inverse = this.popStack(), program2 = this.popStack();
      if (program2 || inverse) {
        options.fn = program2 || "container.noop";
        options.inverse = inverse || "container.noop";
      }
      var i = paramSize;
      while (i--) {
        param = this.popStack();
        params[i] = param;
        if (this.trackIds) {
          ids[i] = this.popStack();
        }
        if (this.stringParams) {
          types[i] = this.popStack();
          contexts[i] = this.popStack();
        }
      }
      if (objectArgs) {
        options.args = this.source.generateArray(params);
      }
      if (this.trackIds) {
        options.ids = this.source.generateArray(ids);
      }
      if (this.stringParams) {
        options.types = this.source.generateArray(types);
        options.contexts = this.source.generateArray(contexts);
      }
      if (this.options.data) {
        options.data = "data";
      }
      if (this.useBlockParams) {
        options.blockParams = "blockParams";
      }
      return options;
    },
    setupHelperArgs: function setupHelperArgs(helper, paramSize, params, useRegister) {
      var options = this.setupParams(helper, paramSize, params);
      options.loc = JSON.stringify(this.source.currentLocation);
      options = this.objectLiteral(options);
      if (useRegister) {
        this.useRegister("options");
        params.push("options");
        return ["options=", options];
      } else if (params) {
        params.push(options);
        return "";
      } else {
        return options;
      }
    }
  };
  (function() {
    var reservedWords = ("break else new var" + " case finally return void" + " catch for switch while" + " continue function this with" + " default if throw" + " delete in try" + " do instanceof typeof" + " abstract enum int short" + " boolean export interface static" + " byte extends long super" + " char final native synchronized" + " class float package throws" + " const goto private transient" + " debugger implements protected volatile" + " double import public let yield await" + " null true false").split(" ");
    var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};
    for (var i = 0, l = reservedWords.length;i < l; i++) {
      compilerWords[reservedWords[i]] = true;
    }
  })();
  JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
    return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
  };
  function strictLookup(requireTerminal, compiler, parts, startPartIndex, type) {
    var stack = compiler.popStack(), len = parts.length;
    if (requireTerminal) {
      len--;
    }
    for (var i = startPartIndex;i < len; i++) {
      stack = compiler.nameLookup(stack, parts[i], type);
    }
    if (requireTerminal) {
      return [compiler.aliasable("container.strict"), "(", stack, ", ", compiler.quotedString(parts[len]), ", ", JSON.stringify(compiler.source.currentLocation), " )"];
    } else {
      return stack;
    }
  }
  exports.default = JavaScriptCompiler;
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars.js
var require_handlebars = __commonJS((exports, module) => {
  exports.__esModule = true;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _handlebarsRuntime = require_handlebars_runtime();
  var _handlebarsRuntime2 = _interopRequireDefault(_handlebarsRuntime);
  var _handlebarsCompilerAst = require_ast();
  var _handlebarsCompilerAst2 = _interopRequireDefault(_handlebarsCompilerAst);
  var _handlebarsCompilerBase = require_base2();
  var _handlebarsCompilerCompiler = require_compiler();
  var _handlebarsCompilerJavascriptCompiler = require_javascript_compiler();
  var _handlebarsCompilerJavascriptCompiler2 = _interopRequireDefault(_handlebarsCompilerJavascriptCompiler);
  var _handlebarsCompilerVisitor = require_visitor();
  var _handlebarsCompilerVisitor2 = _interopRequireDefault(_handlebarsCompilerVisitor);
  var _handlebarsNoConflict = require_no_conflict();
  var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);
  var _create = _handlebarsRuntime2["default"].create;
  function create() {
    var hb = _create();
    hb.compile = function(input, options) {
      return _handlebarsCompilerCompiler.compile(input, options, hb);
    };
    hb.precompile = function(input, options) {
      return _handlebarsCompilerCompiler.precompile(input, options, hb);
    };
    hb.AST = _handlebarsCompilerAst2["default"];
    hb.Compiler = _handlebarsCompilerCompiler.Compiler;
    hb.JavaScriptCompiler = _handlebarsCompilerJavascriptCompiler2["default"];
    hb.Parser = _handlebarsCompilerBase.parser;
    hb.parse = _handlebarsCompilerBase.parse;
    hb.parseWithoutProcessing = _handlebarsCompilerBase.parseWithoutProcessing;
    return hb;
  }
  var inst = create();
  inst.create = create;
  _handlebarsNoConflict2["default"](inst);
  inst.Visitor = _handlebarsCompilerVisitor2["default"];
  inst["default"] = inst;
  exports.default = inst;
  module.exports = exports["default"];
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/dist/cjs/handlebars/compiler/printer.js
var require_printer = __commonJS((exports) => {
  exports.__esModule = true;
  exports.print = print;
  exports.PrintVisitor = PrintVisitor;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _visitor = require_visitor();
  var _visitor2 = _interopRequireDefault(_visitor);
  function print(ast) {
    return new PrintVisitor().accept(ast);
  }
  function PrintVisitor() {
    this.padding = 0;
  }
  PrintVisitor.prototype = new _visitor2["default"];
  PrintVisitor.prototype.pad = function(string) {
    var out = "";
    for (var i = 0, l = this.padding;i < l; i++) {
      out += "  ";
    }
    out += string + `
`;
    return out;
  };
  PrintVisitor.prototype.Program = function(program2) {
    var out = "", body = program2.body, i = undefined, l = undefined;
    if (program2.blockParams) {
      var blockParams = "BLOCK PARAMS: [";
      for (i = 0, l = program2.blockParams.length;i < l; i++) {
        blockParams += " " + program2.blockParams[i];
      }
      blockParams += " ]";
      out += this.pad(blockParams);
    }
    for (i = 0, l = body.length;i < l; i++) {
      out += this.accept(body[i]);
    }
    this.padding--;
    return out;
  };
  PrintVisitor.prototype.MustacheStatement = function(mustache) {
    return this.pad("{{ " + this.SubExpression(mustache) + " }}");
  };
  PrintVisitor.prototype.Decorator = function(mustache) {
    return this.pad("{{ DIRECTIVE " + this.SubExpression(mustache) + " }}");
  };
  PrintVisitor.prototype.BlockStatement = PrintVisitor.prototype.DecoratorBlock = function(block) {
    var out = "";
    out += this.pad((block.type === "DecoratorBlock" ? "DIRECTIVE " : "") + "BLOCK:");
    this.padding++;
    out += this.pad(this.SubExpression(block));
    if (block.program) {
      out += this.pad("PROGRAM:");
      this.padding++;
      out += this.accept(block.program);
      this.padding--;
    }
    if (block.inverse) {
      if (block.program) {
        this.padding++;
      }
      out += this.pad("{{^}}");
      this.padding++;
      out += this.accept(block.inverse);
      this.padding--;
      if (block.program) {
        this.padding--;
      }
    }
    this.padding--;
    return out;
  };
  PrintVisitor.prototype.PartialStatement = function(partial) {
    var content = "PARTIAL:" + partial.name.original;
    if (partial.params[0]) {
      content += " " + this.accept(partial.params[0]);
    }
    if (partial.hash) {
      content += " " + this.accept(partial.hash);
    }
    return this.pad("{{> " + content + " }}");
  };
  PrintVisitor.prototype.PartialBlockStatement = function(partial) {
    var content = "PARTIAL BLOCK:" + partial.name.original;
    if (partial.params[0]) {
      content += " " + this.accept(partial.params[0]);
    }
    if (partial.hash) {
      content += " " + this.accept(partial.hash);
    }
    content += " " + this.pad("PROGRAM:");
    this.padding++;
    content += this.accept(partial.program);
    this.padding--;
    return this.pad("{{> " + content + " }}");
  };
  PrintVisitor.prototype.ContentStatement = function(content) {
    return this.pad("CONTENT[ '" + content.value + "' ]");
  };
  PrintVisitor.prototype.CommentStatement = function(comment) {
    return this.pad("{{! '" + comment.value + "' }}");
  };
  PrintVisitor.prototype.SubExpression = function(sexpr) {
    var params = sexpr.params, paramStrings = [], hash = undefined;
    for (var i = 0, l = params.length;i < l; i++) {
      paramStrings.push(this.accept(params[i]));
    }
    params = "[" + paramStrings.join(", ") + "]";
    hash = sexpr.hash ? " " + this.accept(sexpr.hash) : "";
    return this.accept(sexpr.path) + " " + params + hash;
  };
  PrintVisitor.prototype.PathExpression = function(id) {
    var path4 = id.parts.join("/");
    return (id.data ? "@" : "") + "PATH:" + path4;
  };
  PrintVisitor.prototype.StringLiteral = function(string) {
    return '"' + string.value + '"';
  };
  PrintVisitor.prototype.NumberLiteral = function(number) {
    return "NUMBER{" + number.value + "}";
  };
  PrintVisitor.prototype.BooleanLiteral = function(bool) {
    return "BOOLEAN{" + bool.value + "}";
  };
  PrintVisitor.prototype.UndefinedLiteral = function() {
    return "UNDEFINED";
  };
  PrintVisitor.prototype.NullLiteral = function() {
    return "NULL";
  };
  PrintVisitor.prototype.Hash = function(hash) {
    var pairs = hash.pairs, joinedPairs = [];
    for (var i = 0, l = pairs.length;i < l; i++) {
      joinedPairs.push(this.accept(pairs[i]));
    }
    return "HASH{" + joinedPairs.join(", ") + "}";
  };
  PrintVisitor.prototype.HashPair = function(pair) {
    return pair.key + "=" + this.accept(pair.value);
  };
});

// ../../node_modules/.bun/handlebars@4.7.9/node_modules/handlebars/lib/index.js
var require_lib = __commonJS((exports, module) => {
  var handlebars = require_handlebars()["default"];
  var printer = require_printer();
  handlebars.PrintVisitor = printer.PrintVisitor;
  handlebars.print = printer.print;
  module.exports = handlebars;
  function extension(module2, filename) {
    var fs4 = __require("fs");
    var templateString = fs4.readFileSync(filename, "utf8");
    module2.exports = handlebars.compile(templateString);
  }
  if (__require.extensions) {
    __require.extensions[".handlebars"] = extension;
    __require.extensions[".hbs"] = extension;
  }
});

// ../../node_modules/.bun/commander@13.1.0/node_modules/commander/esm.mjs
var import__ = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  Command,
  Argument,
  Option,
  Help
} = import__.default;

// src/commands/analyze.ts
import fs2 from "node:fs";
import path2 from "node:path";

// ../analyzer/src/patterns.ts
var LAYER_PATTERNS = [
  {
    role: "modules",
    label: "Modules",
    candidates: ["features", "modules", "domain", "domains", "apps"]
  },
  {
    role: "ui",
    label: "UI / Components",
    candidates: ["components", "ui", "widgets"]
  },
  {
    role: "data-layer",
    label: "Data layer",
    candidates: ["services", "repositories", "repository", "api", "clients", "data"]
  },
  {
    role: "routes",
    label: "Routes",
    candidates: ["app", "routes", "pages", "router"]
  },
  {
    role: "handlers",
    label: "Handlers",
    candidates: ["controllers", "handlers", "resolvers", "views"]
  },
  {
    role: "screens",
    label: "Screens",
    candidates: ["screens"]
  },
  {
    role: "navigation",
    label: "Navigation",
    candidates: ["navigation"]
  },
  {
    role: "shared",
    label: "Shared",
    candidates: ["lib", "utils", "common", "shared", "helpers"]
  },
  {
    role: "config",
    label: "Config",
    candidates: ["config", "configs", "settings"]
  }
];
var LAYER_ROOT_PREFIXES = ["src", "app", "internal", ""];
// ../analyzer/src/mcp-registry.ts
var MCP_REGISTRY = [
  {
    id: "atlassian-rovo",
    name: "Atlassian Rovo",
    description: "Official Atlassian MCP for Jira and Confluence (OAuth 2.1 on first connect).",
    url: "https://mcp.atlassian.com/v1/mcp",
    docsUrl: "https://www.atlassian.com/platform/mcp",
    placeholdersDoc: ".agents/atlassian.md",
    harness: {
      cursor: {
        type: "json",
        key: "mcpServers.atlassian-rovo",
        config: {
          command: "npx",
          args: ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/mcp"]
        }
      },
      opencode: {
        type: "json",
        key: "mcp.atlassian-rovo",
        config: {
          type: "remote",
          url: "https://mcp.atlassian.com/v1/mcp"
        }
      },
      "claude-code": {
        type: "json",
        key: "mcpServers.atlassian-rovo",
        config: {
          url: "https://mcp.atlassian.com/v1/mcp"
        }
      }
    }
  },
  {
    id: "figma",
    name: "Figma",
    description: "Design context, components, and assets from Figma files.",
    docsUrl: "https://developers.figma.com/docs/figma-mcp-server/",
    placeholdersDoc: ".agents/figma.md",
    envVars: ["FIGMA_API_TOKEN"],
    harness: {
      cursor: {
        type: "json",
        key: "mcpServers.figma",
        config: {
          command: "npx",
          args: ["-y", "figma-developer-mcp", "--figma-api-key=YOUR_FIGMA_TOKEN"]
        }
      },
      opencode: {
        type: "json",
        key: "mcp.figma",
        config: {
          type: "local",
          command: ["npx", "-y", "figma-developer-mcp", "--figma-api-key=YOUR_FIGMA_TOKEN"]
        }
      },
      "claude-code": {
        type: "json",
        key: "mcpServers.figma",
        config: {
          command: "npx",
          args: ["-y", "figma-developer-mcp", "--figma-api-key=YOUR_FIGMA_TOKEN"]
        }
      }
    }
  },
  {
    id: "context7",
    name: "Context7",
    description: "Library and framework documentation lookup.",
    docsUrl: "https://context7.com",
    harness: {
      cursor: {
        type: "json",
        key: "mcpServers.context7",
        config: {
          url: "https://mcp.context7.com/mcp"
        }
      },
      opencode: {
        type: "json",
        key: "mcp.context7",
        config: {
          type: "remote",
          url: "https://mcp.context7.com/mcp"
        }
      },
      "claude-code": {
        type: "json",
        key: "mcpServers.context7",
        config: {
          url: "https://mcp.context7.com/mcp"
        }
      }
    }
  }
];
// ../analyzer/src/scan.ts
import fs from "node:fs";
import path from "node:path";
var IGNORED = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".venv",
  "venv",
  "__pycache__",
  "target",
  ".cache"
]);
var CODE_EXTENSIONS = /\.(tsx?|jsx?|mjs|cjs|py|go|rs|dart|kt|java|swift|rb|php)$/;
function readJsonFile(filePath) {
  if (!fs.existsSync(filePath))
    return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}
function readTextFile(filePath) {
  if (!fs.existsSync(filePath))
    return null;
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}
function detectPackageManager(dir) {
  if (fs.existsSync(path.join(dir, "bun.lock")) || fs.existsSync(path.join(dir, "bun.lockb"))) {
    return "bun";
  }
  if (fs.existsSync(path.join(dir, "pnpm-lock.yaml")))
    return "pnpm";
  if (fs.existsSync(path.join(dir, "yarn.lock")))
    return "yarn";
  if (fs.existsSync(path.join(dir, "package-lock.json")))
    return "npm";
  if (fs.existsSync(path.join(dir, "poetry.lock")))
    return "poetry";
  if (fs.existsSync(path.join(dir, "uv.lock")))
    return "uv";
  if (fs.existsSync(path.join(dir, "requirements.txt")))
    return "pip";
  if (fs.existsSync(path.join(dir, "Cargo.lock")))
    return "cargo";
  if (fs.existsSync(path.join(dir, "go.sum")))
    return "go";
  if (fs.existsSync(path.join(dir, "pubspec.lock")))
    return "flutter";
  return "npm";
}
function runScript(pm, scriptName) {
  switch (pm) {
    case "bun":
      return `bun run ${scriptName}`;
    case "pnpm":
      return `pnpm ${scriptName}`;
    case "yarn":
      return `yarn ${scriptName}`;
    case "npm":
      return `npm run ${scriptName}`;
    default:
      return `${pm} ${scriptName}`;
  }
}
function defaultDevCommand(pm, stack) {
  if (stack === "django")
    return "python manage.py runserver";
  if (stack === "fastapi")
    return "uvicorn main:app --reload";
  if (stack === "go")
    return "go run ./...";
  if (stack === "rust")
    return "cargo run";
  if (stack === "flutter")
    return "flutter run";
  return runScript(pm, "dev");
}
function hasDep(pkg, name) {
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  };
  return name in deps;
}
function detectStack(dir, pkg) {
  if (pkg) {
    if (hasDep(pkg, "next"))
      return "nextjs";
    if (hasDep(pkg, "expo"))
      return "expo";
    if (hasDep(pkg, "react-native"))
      return "react-native";
    if (hasDep(pkg, "@nestjs/core"))
      return "nest";
    if (hasDep(pkg, "fastify"))
      return "fastify";
    if (hasDep(pkg, "express"))
      return "express";
    if (hasDep(pkg, "vite") && hasDep(pkg, "react"))
      return "vite-react";
  }
  if (fs.existsSync(path.join(dir, "pubspec.yaml")))
    return "flutter";
  if (fs.existsSync(path.join(dir, "Cargo.toml")))
    return "rust";
  if (fs.existsSync(path.join(dir, "go.mod")))
    return "go";
  const pyproject = readTextFile(path.join(dir, "pyproject.toml")) ?? "";
  if (fs.existsSync(path.join(dir, "manage.py")) || /django/i.test(pyproject)) {
    return "django";
  }
  if (/fastapi/i.test(pyproject))
    return "fastapi";
  if (fs.existsSync(path.join(dir, "pyproject.toml")) || fs.existsSync(path.join(dir, "requirements.txt"))) {
    return "fastapi";
  }
  return "unknown";
}
function stackFamily(stack, pkg) {
  switch (stack) {
    case "nextjs":
      return "fullstack";
    case "vite-react":
      return "frontend-web";
    case "expo":
    case "react-native":
    case "flutter":
      return "mobile";
    case "express":
    case "nest":
    case "fastify":
    case "fastapi":
    case "django":
    case "go":
    case "rust":
      return "backend";
    default:
      if (pkg && (hasDep(pkg, "react") || hasDep(pkg, "vue") || hasDep(pkg, "svelte"))) {
        return "frontend-web";
      }
      return "unknown";
  }
}
function detectLanguage(dir, pkg, stack) {
  if (stack === "go")
    return "go";
  if (stack === "rust")
    return "rust";
  if (stack === "flutter")
    return "dart";
  if (stack === "django" || stack === "fastapi")
    return "python";
  if (fs.existsSync(path.join(dir, "tsconfig.json")))
    return "typescript";
  if (pkg) {
    if (hasDep(pkg, "typescript"))
      return "typescript";
    return "javascript";
  }
  return "unknown";
}
function listSubdirs(dir) {
  if (!fs.existsSync(dir))
    return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith(".") && !IGNORED.has(e.name)).map((e) => e.name);
}
function detectPathAlias(dir) {
  const tsconfig = readJsonFile(path.join(dir, "tsconfig.json"));
  const paths = tsconfig?.compilerOptions?.paths;
  if (!paths)
    return;
  for (const alias of Object.keys(paths)) {
    if (alias.startsWith("@")) {
      return alias;
    }
  }
  return;
}
function isKebabCase(name) {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name);
}
function isSnakeCase(name) {
  return /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(name);
}
function isPascalCase(name) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}
function inferNaming(names) {
  if (names.length === 0)
    return "kebab-case (default)";
  const stripped = names.map((n) => n.replace(CODE_EXTENSIONS, ""));
  const kebab = stripped.filter(isKebabCase).length;
  const snake = stripped.filter(isSnakeCase).length;
  const pascal = stripped.filter(isPascalCase).length;
  const counts = [
    { name: "kebab-case", count: kebab },
    { name: "snake_case", count: snake },
    { name: "PascalCase", count: pascal }
  ];
  counts.sort((a, b) => b.count - a.count);
  return counts[0].count === 0 ? "mixed" : counts[0].name;
}
function sampleFilenames(dir, limit = 30) {
  const results = [];
  function walk(d, depth) {
    if (results.length >= limit || !fs.existsSync(d) || depth > 4)
      return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (IGNORED.has(entry.name) || entry.name.startsWith("."))
        continue;
      const full = path.join(d, entry.name);
      if (entry.isFile() && CODE_EXTENSIONS.test(entry.name)) {
        results.push(entry.name);
      } else if (entry.isDirectory()) {
        walk(full, depth + 1);
      }
      if (results.length >= limit)
        break;
    }
  }
  walk(dir, 0);
  return results;
}
function walkSubpaths(absDir, relDir) {
  return listSubdirs(absDir).map((name) => `${relDir}/${name}`);
}
function detectLayers(dir, srcRoot) {
  const layers = [];
  const seen = new Set;
  const seenRoles = new Set;
  const prefixes = LAYER_ROOT_PREFIXES.filter((p) => {
    if (p === "")
      return true;
    if (p === srcRoot)
      return true;
    return fs.existsSync(path.join(dir, p));
  });
  for (const pattern of LAYER_PATTERNS) {
    for (const prefix of prefixes) {
      for (const candidate of pattern.candidates) {
        const relPath = prefix ? `${prefix}/${candidate}` : candidate;
        const absPath = path.join(dir, relPath);
        if (seen.has(relPath))
          continue;
        if (!fs.existsSync(absPath))
          continue;
        if (!fs.statSync(absPath).isDirectory())
          continue;
        const layerKey = `${pattern.role}:${prefix}`;
        if (seenRoles.has(pattern.role) && !seen.has(layerKey)) {}
        seen.add(relPath);
        seen.add(layerKey);
        seenRoles.add(pattern.role);
        layers.push({
          role: pattern.role,
          label: pattern.label,
          path: relPath,
          glob: `${relPath}/**/*`,
          subpaths: walkSubpaths(absPath, relPath)
        });
      }
    }
  }
  return layers;
}
function buildVerification(pm, stack, scripts) {
  const v = {};
  if (scripts.dev) {
    v.dev = runScript(pm, "dev");
  } else if (scripts.start) {
    v.dev = runScript(pm, "start");
  } else {
    v.dev = defaultDevCommand(pm, stack);
  }
  if (scripts.lint)
    v.lint = runScript(pm, "lint");
  if (scripts.test)
    v.test = runScript(pm, "test");
  if (scripts.typecheck)
    v.typecheck = runScript(pm, "typecheck");
  else if (scripts["check-types"])
    v.typecheck = runScript(pm, "check-types");
  if (scripts.build)
    v.build = runScript(pm, "build");
  if (stack === "django") {
    v.test ??= "python manage.py test";
  } else if (stack === "fastapi") {
    v.test ??= "pytest";
  } else if (stack === "go") {
    v.test ??= "go test ./...";
    v.build ??= "go build ./...";
  } else if (stack === "rust") {
    v.test ??= "cargo test";
    v.build ??= "cargo build";
  } else if (stack === "flutter") {
    v.test ??= "flutter test";
    v.build ??= "flutter build";
  }
  return v;
}
function detectEntryPattern(stack) {
  switch (stack) {
    case "nextjs":
      return "page.tsx / layout.tsx (App Router)";
    case "expo":
    case "react-native":
      return "App.tsx + screens/";
    case "flutter":
      return "lib/main.dart";
    case "express":
    case "fastify":
    case "nest":
      return "src/index.ts or src/main.ts";
    case "django":
      return "manage.py + {app}/views.py";
    case "fastapi":
      return "main.py";
    case "go":
      return "cmd/{name}/main.go";
    case "rust":
      return "src/main.rs";
    default:
      return;
  }
}
function analyzeProject(targetDir) {
  const dir = path.resolve(targetDir);
  const pkg = readJsonFile(path.join(dir, "package.json"));
  const pm = detectPackageManager(dir);
  const stack = detectStack(dir, pkg);
  const family = stackFamily(stack, pkg);
  const language = detectLanguage(dir, pkg, stack);
  const srcRoot = fs.existsSync(path.join(dir, "src")) ? "src" : undefined;
  const layers = detectLayers(dir, srcRoot);
  const pathAlias = detectPathAlias(dir);
  const scripts = pkg?.scripts ?? {};
  const verification = buildVerification(pm, stack, scripts);
  let sampleDir;
  if (layers.length > 0) {
    sampleDir = path.join(dir, layers[0].path);
  } else if (srcRoot) {
    sampleDir = path.join(dir, srcRoot);
  } else {
    sampleDir = dir;
  }
  const fileSamples = sampleFilenames(sampleDir);
  const folderSamples = layers.flatMap((l) => l.subpaths.map((s) => path.basename(s)));
  return {
    name: pkg?.name ?? path.basename(dir),
    stack,
    stackFamily: family,
    language,
    packageManager: pm,
    devCommand: verification.dev ?? defaultDevCommand(pm, stack),
    layers,
    conventions: {
      folderNaming: inferNaming(folderSamples),
      fileNaming: inferNaming(fileSamples),
      pathAlias,
      entryPattern: detectEntryPattern(stack)
    },
    verification,
    hasExistingAgentsMd: fs.existsSync(path.join(dir, "AGENTS.md")),
    scripts,
    srcRoot
  };
}
// ../analyzer/src/generate-docs.ts
var HARNESS_MCP_PATHS = {
  cursor: ".cursor/mcp.json",
  opencode: "opencode.json",
  "claude-code": ".mcp.json",
  antigravity: ".agent/mcp.json",
  copilot: "~/.copilot/mcp-config.json"
};
function verificationChecklist(profile) {
  const lines = [];
  const v = profile.verification;
  if (v.dev)
    lines.push(`- Dev: \`${v.dev}\``);
  if (v.test)
    lines.push(`- Test: \`${v.test}\``);
  if (v.lint)
    lines.push(`- Lint: \`${v.lint}\``);
  if (v.typecheck)
    lines.push(`- Type check: \`${v.typecheck}\``);
  if (v.build)
    lines.push(`- Build: \`${v.build}\``);
  return lines.length > 0 ? lines.join(`
`) : "- No standard scripts detected — inspect codebase before claiming completion.";
}
function layerTable(layers) {
  if (layers.length === 0) {
    return "| (flat) | — | No standard layered structure detected — inspect existing files before adding new ones. |";
  }
  return layers.map((l) => {
    const detected = l.subpaths.length > 0 ? l.subpaths.map((s) => `\`${s.split("/").pop()}\``).join(", ") : "—";
    return `| ${l.label} | \`${l.path}/\` | ${detected} |`;
  }).join(`
`);
}
function agentsMdContent(profile) {
  const lintRef = profile.verification.lint ? `, \`${profile.verification.lint}\`` : "";
  return `# AGENTS.md

> Agent entry point for **${profile.name}**. Read \`.agents/\` guides before scaffolding or large changes.

**Stack:** ${profile.stack} (${profile.stackFamily})  
**Language:** ${profile.language}  
**Package manager:** ${profile.packageManager}  
**Dev command:** \`${profile.devCommand}\`

## Project layout (detected)

| Layer | Path | Detected children |
|-------|------|-------------------|
${layerTable(profile.layers)}

## Verification

${verificationChecklist(profile)}

## Core rules

- Match existing structure — paths above were scanned from this repo.
- Prefer minimal, focused diffs.
- Never commit secrets or API keys.
- Verify changes before claiming work is complete (\`${profile.devCommand}\`${lintRef}).

## Guides (read when relevant)

| Guide | When |
|-------|------|
| [architecture.md](.agents/architecture.md) | Anything that touches layout or layers |
| [code-conventions.md](.agents/code-conventions.md) | Naming, file organization |
| [mcp-guide.md](.agents/mcp-guide.md) | MCP setup |
| [mcp-registry.md](.agents/mcp-registry.md) | Available MCP integrations |
| [atlassian.md](.agents/atlassian.md) | Jira / Confluence placeholders |
| [figma.md](.agents/figma.md) | Figma placeholders |

<!-- agent-kit:begin -->
## Agent Kit

Installed via Agent Kit analyze → generate workflow. Layers, conventions, and rules reflect this project's detected structure.
<!-- agent-kit:end -->
`;
}
function architectureDoc(profile) {
  if (profile.layers.length === 0) {
    return `# Architecture

No standard layered structure detected. This project uses a flat or custom layout.

## Guidance

- Inspect existing modules before adding new folders.
- Do not invent \`src/features/\`, \`src/services/\`, or other layouts unless the team adopts them explicitly.
- Follow patterns in neighboring files.

**Entry pattern:** ${profile.conventions.entryPattern ?? "—"}
`;
  }
  const layerSections = profile.layers.map((l) => {
    const children = l.subpaths.length > 0 ? `

Detected children:
${l.subpaths.map((s) => `- \`${s}/\``).join(`
`)}` : "";
    return `### ${l.label} — \`${l.path}/\`

${layerGuidance(l, profile)}${children}`;
  }).join(`

`);
  return `# Architecture

Stack: **${profile.stack}** (${profile.stackFamily}).  
Entry pattern: ${profile.conventions.entryPattern ?? "—"}

## Layers

${layerSections}

## Rules

- Do not create parallel folder structures outside the layers above.
- New work belongs in an existing layer — extend it rather than introducing a new top-level folder.
- Follow naming conventions in [code-conventions.md](./code-conventions.md).
`;
}
function layerGuidance(layer, profile) {
  switch (layer.role) {
    case "modules":
      return `Domain or feature modules. Each subfolder represents a self-contained unit. ${profile.stackFamily === "frontend-web" || profile.stackFamily === "fullstack" ? "Routes/pages should stay thin and delegate to a module." : "Group related logic and types together within each module."}`;
    case "ui":
      return `Reusable UI primitives and shared components. Avoid duplicating components across modules.`;
    case "data-layer":
      return `API clients, repositories, or service objects. Keep transport details (HTTP, DB) isolated here; consumers depend on this layer's exported types.`;
    case "routes":
      return profile.stack === "nextjs" ? `Next.js App Router. Route files (\`page.tsx\`, \`layout.tsx\`) stay thin; data and rendering logic live in modules or data-layer.` : `HTTP route declarations or app entry points. Delegate to handlers or modules.`;
    case "handlers":
      return `Controllers, request handlers, or resolvers. Validate input, call the data layer, return responses. Avoid business logic here.`;
    case "screens":
      return `Mobile screens. One folder per screen; navigation wiring lives in the navigation layer.`;
    case "navigation":
      return `Navigation/router configuration. Centralize route definitions here.`;
    case "shared":
      return `Cross-cutting utilities, helpers, and primitives. Do not put domain logic here.`;
    case "config":
      return `Environment and configuration. Read values via a single typed entry point; do not scatter \`process.env\` reads.`;
    default:
      return `Detected layer.`;
  }
}
function codeConventionsDoc(profile) {
  return `# Code Conventions

Inferred from existing codebase. Follow these unless local context dictates otherwise.

| Area | Convention |
|------|------------|
| Language | ${profile.language} |
| Folder names | ${profile.conventions.folderNaming} |
| File names | ${profile.conventions.fileNaming} |
| Path alias | \`${profile.conventions.pathAlias ?? "—"}\` |
| Entry pattern | ${profile.conventions.entryPattern ?? "—"} |

## Rules

- Match neighboring files for naming, imports, and structure.
- Do not mix naming styles within the same folder.
- When unsure, sample 2–3 similar files in the same layer before writing new code.
`;
}
function mcpGuideDoc(harness) {
  const configPath = HARNESS_MCP_PATHS[harness];
  return `# MCP Guide

This project was bootstrapped for **${harness}**.  
MCP config file: \`${configPath}\`

Agent Kit installs MCP placeholders — edit credentials after install.

## Setup

1. Open \`${configPath}\` (copy from \`${configPath}.example\` if present)
2. Replace placeholders / complete OAuth on first connect
3. Restart the agent or reload MCP servers

## Available MCPs

See [mcp-registry.md](./mcp-registry.md) for the full list of integrations available via Agent Kit.

## Config locations by harness

| Harness | MCP config file |
|---------|-----------------|
| Cursor | \`.cursor/mcp.json\` |
| OpenCode | \`opencode.json\` |
| Claude Code | \`.mcp.json\` |
| Antigravity | \`.agent/mcp.json\` |
| Copilot | \`~/.copilot/mcp-config.json\` or repo MCP settings |
`;
}
function mcpRegistryDoc(harness) {
  const sections = MCP_REGISTRY.map((server) => {
    const cfg = server.harness[harness];
    const block = cfg ? `
\`\`\`json
${JSON.stringify({ [cfg.key.split(".")[0]]: { [cfg.key.split(".").slice(1).join(".")]: cfg.config } }, null, 2)}
\`\`\`` : `
_(No preset for this harness — see docs URL.)_`;
    const envNote = server.envVars?.length ? `
**Env vars:** ${server.envVars.map((v) => `\`${v}\``).join(", ")}` : "";
    const docsNote = server.docsUrl ? `
**Docs:** ${server.docsUrl}` : "";
    const placeholdersNote = server.placeholdersDoc ? `
**Placeholders:** [${server.placeholdersDoc}](${server.placeholdersDoc})` : "";
    return `## ${server.name} (\`${server.id}\`)

${server.description}${docsNote}${envNote}${placeholdersNote}

### ${harness} config${block}`;
  }).join(`

---

`);
  return `# MCP Registry

Available MCP integrations for this project. Merge the snippet below into \`${HARNESS_MCP_PATHS[harness]}\` and replace any placeholder tokens.

${sections}
`;
}
function atlassianDoc() {
  return `# Atlassian Integration

Configure after install. Requires Atlassian Rovo MCP (OAuth on first connect).

## Placeholders — fill in for your team

- **Jira project key:** \`YOURPROJ\`
- **Confluence spaceId:** \`"123456"\`
- **cloudId:** \`https://yoursite.atlassian.net\`
- **maxResults:** \`10\` for all JQL/CQL searches

## MCP endpoint

\`https://mcp.atlassian.com/v1/mcp\`

See \`.agents/mcp-guide.md\` for harness-specific config paths.
`;
}
function figmaDoc() {
  return `# Figma Integration

Configure after install. Requires the Figma Developer MCP and a personal access token.

## Placeholders — fill in for your team

- **Default file key:** \`YOUR_FILE_KEY\` (from any Figma file URL: \`figma.com/file/<KEY>/...\`)
- **Team ID:** \`YOUR_TEAM_ID\` (optional, for team-wide queries)
- **API token:** set as env var \`FIGMA_API_TOKEN\` or replace \`YOUR_FIGMA_TOKEN\` in MCP config

## Docs

https://developers.figma.com/docs/figma-mcp-server/

See \`.agents/mcp-guide.md\` for harness-specific config paths.
`;
}
function generateDocs(profile, harness = "cursor") {
  const files = [
    { path: "AGENTS.md", content: agentsMdContent(profile) },
    { path: ".agents/architecture.md", content: architectureDoc(profile) },
    { path: ".agents/code-conventions.md", content: codeConventionsDoc(profile) },
    { path: ".agents/mcp-guide.md", content: mcpGuideDoc(harness) },
    { path: ".agents/mcp-registry.md", content: mcpRegistryDoc(harness) },
    { path: ".agents/atlassian.md", content: atlassianDoc() },
    { path: ".agents/figma.md", content: figmaDoc() }
  ];
  for (const layer of profile.layers) {
    files.push({
      path: `.agents/layers/${layer.role}.md`,
      content: layerDoc(layer, profile)
    });
  }
  return files;
}
function layerDoc(layer, profile) {
  const childrenList = layer.subpaths.length > 0 ? layer.subpaths.map((s) => `- \`${s}/\``).join(`
`) : "_(none detected — folder exists but is empty)_";
  return `# ${layer.label}

Path: \`${layer.path}/\`

${layerGuidance(layer, profile)}

## Detected children

${childrenList}

## Rules

- Naming: **${profile.conventions.folderNaming}** for folders, **${profile.conventions.fileNaming}** for files
- Glob: \`${layer.glob}\`
- See [architecture.md](../architecture.md) for how this layer interacts with the rest of the project.
`;
}
function mergeAgentsMd(existing, generated) {
  const begin = "<!-- agent-kit:begin -->";
  const end = "<!-- agent-kit:end -->";
  const blockMatch = generated.match(new RegExp(`${begin}[\\s\\S]*${end}`));
  const block = blockMatch?.[0] ?? "";
  if (existing.includes(begin) && existing.includes(end)) {
    return existing.replace(new RegExp(`${begin}[\\s\\S]*${end}`), block);
  }
  if (existing.trim().length === 0) {
    return generated;
  }
  return `${existing.trim()}

${block}
`;
}
// ../analyzer/src/generate-rules.ts
function ruleExt(harness) {
  return harness === "cursor" ? "mdc" : "md";
}
function rulesDir(harness) {
  switch (harness) {
    case "cursor":
      return ".cursor/rules";
    case "claude-code":
      return ".claude/rules";
    case "antigravity":
      return ".agent/rules";
    case "opencode":
      return ".opencode/rules";
    case "copilot":
      return ".github/instructions";
    default:
      return ".cursor/rules";
  }
}
function formatRule(harness, description, globs, alwaysApply, body) {
  const ext = ruleExt(harness);
  const frontmatter = [`description: ${description}`];
  if (globs && globs.length > 0) {
    frontmatter.push(`globs: ${globs.join(",")}`);
  }
  frontmatter.push(`alwaysApply: ${alwaysApply}`);
  if (ext === "mdc") {
    return `---
${frontmatter.join(`
`)}
---

${body.trim()}
`;
  }
  return `# ${description}

${body.trim()}
`;
}
function languageStandards(language) {
  switch (language) {
    case "typescript":
      return "- Use strict TypeScript. Avoid `any` unless unavoidable.";
    case "javascript":
      return "- Prefer JSDoc types where the project uses them. Avoid leaving unused variables.";
    case "python":
      return "- Use type hints where existing code uses them. Match the project's typing strictness (mypy/pyright).";
    case "go":
      return "- Use `gofmt` and idiomatic Go. Handle every error explicitly.";
    case "rust":
      return "- Use `cargo fmt` and idiomatic Rust. Prefer `?` for error propagation.";
    case "dart":
      return "- Use `dart format`. Follow Effective Dart conventions.";
    default:
      return "- Follow the language conventions used by the existing codebase.";
  }
}
function coreStandardsRule(profile, harness) {
  const alias = profile.conventions.pathAlias ? `
- Path alias: \`${profile.conventions.pathAlias}\`` : "";
  const body = `# Core Standards

${languageStandards(profile.language)}${alias}
- Package manager: **${profile.packageManager}**
- Dev command: \`${profile.devCommand}\`
- Match existing naming and folder conventions (see \`.agents/code-conventions.md\`).
- Keep changes minimal — one concern per change.
- Do not commit secrets (API keys, tokens, \`.env\`).
- Do not add dependencies without explicit approval.
`;
  return {
    path: `${rulesDir(harness)}/core-standards.${ruleExt(harness)}`,
    content: formatRule(harness, "Core coding standards for this project", undefined, true, body)
  };
}
function projectArchitectureRule(profile, harness) {
  const globs = profile.layers.map((l) => l.glob);
  if (profile.layers.length === 0) {
    const body = `# Project Architecture (generated)

No standard layered structure detected. This project uses a flat or custom layout.

- Inspect existing modules before adding new folders.
- Do not invent \`src/features/\`, \`src/services/\`, or parallel layouts unless the team adopts them explicitly.
- Follow patterns in neighboring files.
- See \`.agents/architecture.md\` for project-specific guidance.
`;
    return {
      path: `${rulesDir(harness)}/project-architecture.${ruleExt(harness)}`,
      content: formatRule(harness, "Project structure conventions (detected from codebase)", undefined, false, body)
    };
  }
  const lines = ["# Project Architecture (generated)", ""];
  for (const layer of profile.layers) {
    const subpathList = layer.subpaths.length > 0 ? layer.subpaths.map((s) => "`" + s + "/`").join(", ") : "_(empty)_";
    lines.push(`- **${layer.label}** → \`${layer.path}/\` — detected: ${subpathList}`);
  }
  lines.push("");
  lines.push("- Do not create parallel folder structures outside the layers above.");
  lines.push("- New work belongs in an existing layer.");
  lines.push("- See `.agents/architecture.md` for responsibilities per layer.");
  return {
    path: `${rulesDir(harness)}/project-architecture.${ruleExt(harness)}`,
    content: formatRule(harness, "Enforce this project's detected architecture", globs.length > 0 ? globs : undefined, false, lines.join(`
`))
  };
}
function stackRulesRule(profile, harness) {
  const { stack, layers } = profile;
  const routes = layers.find((l) => l.role === "routes");
  const handlers = layers.find((l) => l.role === "handlers");
  const screens = layers.find((l) => l.role === "screens");
  if (stack === "nextjs" && routes) {
    const body = `# Next.js / App Router

- App Router root: \`${routes.path}/\`
- Route files: \`page.tsx\`, \`layout.tsx\`, \`loading.tsx\` — keep thin when modules exist
- Use Server Components by default; \`"use client"\` only when needed
- Data fetching in modules or data layer, not duplicated in every route
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (Next.js detected)", [routes.glob], false, body)
    };
  }
  if (stack === "vite-react") {
    const src = profile.srcRoot ?? "src";
    const body = `# Vite + React

- Entry and routes under \`${src}/\`
- Prefer feature folders under \`${src}/features/\` when present
- Environment variables: \`import.meta.env\`
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (Vite + React detected)", [`${src}/**/*`], false, body)
    };
  }
  if (stack === "express" || stack === "fastify") {
    const globs = [routes?.glob, handlers?.glob].filter((g) => Boolean(g));
    const body = `# ${stack === "express" ? "Express" : "Fastify"}

- Keep route declarations thin — delegate to handlers/services
- Validate input at the boundary (handlers); never trust request bodies directly
- Group related routes by domain under \`${routes?.path ?? "routes/"}\` (if present)
- Centralize error handling middleware
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, `Stack-specific rules (${stack} detected)`, globs.length > 0 ? globs : undefined, false, body)
    };
  }
  if (stack === "nest") {
    const body = `# NestJS

- Controllers handle routing and validation; services hold business logic; repositories own data access
- Use DTOs + class-validator for request payloads
- Inject dependencies via constructor; avoid manual instantiation in handlers
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (NestJS detected)", undefined, false, body)
    };
  }
  if (stack === "django") {
    const body = `# Django

- One concern per app under \`apps/\` or top-level (models, views, urls, serializers, admin)
- Use class-based or function-based views consistently — match what's already there
- Migrations are append-only; never edit a committed migration
- Settings split: \`settings/base.py\`, \`settings/dev.py\`, etc., if present
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (Django detected)", undefined, false, body)
    };
  }
  if (stack === "fastapi") {
    const body = `# FastAPI

- Define routers per domain; mount them in the main app
- Use Pydantic models for request/response validation
- Keep business logic out of route functions; delegate to services
- Async-first: use \`async def\` for routes that touch I/O
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (FastAPI detected)", undefined, false, body)
    };
  }
  if (stack === "expo" || stack === "react-native") {
    const globs = [screens?.glob, layers.find((l) => l.role === "navigation")?.glob].filter((g) => Boolean(g));
    const body = `# ${stack === "expo" ? "Expo" : "React Native"}

- Screens under \`${screens?.path ?? "screens/"}\` — one folder per screen
- Navigation centralized (stack/tab navigators) — do not declare routes inline
- Keep platform-specific code behind \`.ios.tsx\` / \`.android.tsx\` suffixes
- Use Reanimated/Gesture Handler for animations rather than ad-hoc Animated API
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, `Stack-specific rules (${stack} detected)`, globs.length > 0 ? globs : undefined, false, body)
    };
  }
  if (stack === "flutter") {
    const body = `# Flutter

- Entry: \`lib/main.dart\`
- Group features under \`lib/features/\` or \`lib/modules/\`
- Use \`flutter format\` and run \`flutter analyze\` before finishing
- Prefer composition over deep widget inheritance
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (Flutter detected)", undefined, false, body)
    };
  }
  if (stack === "go") {
    const body = `# Go

- Layout: \`cmd/{name}/main.go\` for entrypoints; \`internal/\` for private packages; \`pkg/\` for reusable libs
- Run \`go vet\` and \`go test ./...\` before claiming completion
- Wrap errors with \`fmt.Errorf("...: %w", err)\` — never swallow
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (Go detected)", undefined, false, body)
    };
  }
  if (stack === "rust") {
    const body = `# Rust

- Run \`cargo fmt\`, \`cargo clippy\`, and \`cargo test\` before finishing
- Prefer \`Result<T, E>\` and \`?\` over panics
- Module structure mirrors directory layout under \`src/\`
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (Rust detected)", undefined, false, body)
    };
  }
  return null;
}
function verificationRule(profile, harness) {
  const v = profile.verification;
  const checks = [];
  if (v.dev)
    checks.push(`- Start the app with \`${v.dev}\` to confirm it runs`);
  if (v.test)
    checks.push(`- Run \`${v.test}\` before claiming completion`);
  if (v.lint)
    checks.push(`- Run \`${v.lint}\` before finishing`);
  if (v.typecheck)
    checks.push(`- Run \`${v.typecheck}\` when types may be affected`);
  if (v.build)
    checks.push(`- Run \`${v.build}\` if shipping or before release`);
  checks.push("- Do not claim work is complete without running applicable checks.");
  const body = `# Verification

Before marking a task done:

${checks.join(`
`)}
`;
  return {
    path: `${rulesDir(harness)}/verification.${ruleExt(harness)}`,
    content: formatRule(harness, "Verify changes before completion", undefined, false, body)
  };
}
function generateRules(profile, harness = "cursor") {
  const files = [
    coreStandardsRule(profile, harness),
    verificationRule(profile, harness),
    projectArchitectureRule(profile, harness)
  ];
  const stack = stackRulesRule(profile, harness);
  if (stack)
    files.push(stack);
  return files;
}
function generateCopilotInstructions(profile) {
  const rules = generateRules(profile, "copilot");
  const body = rules.map((r) => r.content).join(`
---

`);
  return {
    path: ".github/copilot-instructions.md",
    content: `# Copilot Instructions (Agent Kit generated)

${body}`
  };
}
// src/commands/analyze.ts
var VALID_HARNESSES = ["cursor", "opencode", "claude-code", "antigravity", "copilot"];
async function runAnalyze(targetPath, options) {
  const targetDir = path2.resolve(targetPath);
  if (!fs2.existsSync(targetDir)) {
    console.error(`Directory not found: ${targetDir}`);
    process.exit(1);
  }
  const harness = options.harness ?? "cursor";
  if (!VALID_HARNESSES.includes(harness)) {
    console.error(`Invalid harness: ${harness}. Use: ${VALID_HARNESSES.join(", ")}`);
    process.exit(1);
  }
  const profile = analyzeProject(targetDir);
  if (options.json && !options.write) {
    console.log(JSON.stringify(profile, null, 2));
    return;
  }
  const docs = generateDocs(profile, harness);
  const rules = harness === "copilot" ? [generateCopilotInstructions(profile)] : generateRules(profile, harness);
  const files = [...docs, ...rules];
  if (options.json) {
    console.log(JSON.stringify({ profile, files: files.map((f) => ({ path: f.path, content: f.content })) }, null, 2));
    return;
  }
  if (options.write) {
    for (const file of files) {
      const dest = path2.join(targetDir, file.path);
      fs2.mkdirSync(path2.dirname(dest), { recursive: true });
      if (file.path === "AGENTS.md" && profile.hasExistingAgentsMd) {
        const existing = fs2.readFileSync(dest, "utf-8");
        fs2.writeFileSync(dest, mergeAgentsMd(existing, file.content));
        console.log(`  merged ${file.path}`);
      } else {
        fs2.writeFileSync(dest, file.content);
        console.log(`  wrote ${file.path}`);
      }
    }
    console.log(`
Generated ${files.length} files for harness: ${harness}`);
    return;
  }
  console.log(`
Project: ${profile.name}`);
  console.log(`Stack: ${profile.stack} (${profile.stackFamily})`);
  console.log(`Language: ${profile.language}`);
  console.log(`Layers: ${profile.layers.length === 0 ? "(none detected)" : profile.layers.map((l) => `${l.label} → ${l.path}`).join(", ")}`);
  console.log(`
Run with --write to generate files, or --json for full output.`);
}

// src/commands/index.ts
import fs7 from "node:fs";
import path7 from "node:path";

// src/detect/index.ts
import fs3 from "node:fs";
import path3 from "node:path";
var IGNORED_ENTRIES = new Set([".git", ".DS_Store", "node_modules"]);
function isDirectoryEmpty(dir) {
  if (!fs3.existsSync(dir))
    return true;
  const entries = fs3.readdirSync(dir).filter((e) => !IGNORED_ENTRIES.has(e));
  return entries.length === 0;
}
function readPackageJson(dir) {
  const pkgPath = path3.join(dir, "package.json");
  if (!fs3.existsSync(pkgPath))
    return null;
  try {
    return JSON.parse(fs3.readFileSync(pkgPath, "utf-8"));
  } catch {
    return null;
  }
}
function readTextFile2(filePath) {
  if (!fs3.existsSync(filePath))
    return "";
  try {
    return fs3.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}
function hasDependency(pkg, name) {
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  };
  return name in deps;
}
function hasFile(dir, files) {
  return files.some((f) => fs3.existsSync(path3.join(dir, f)));
}
function detectPackageManager2(dir) {
  if (fs3.existsSync(path3.join(dir, "bun.lock")) || fs3.existsSync(path3.join(dir, "bun.lockb"))) {
    return "bun";
  }
  if (fs3.existsSync(path3.join(dir, "pnpm-lock.yaml")))
    return "pnpm";
  if (fs3.existsSync(path3.join(dir, "yarn.lock")))
    return "yarn";
  return "npm";
}
function devCommand(pm, stack) {
  if (stack === "django")
    return "python manage.py runserver";
  if (stack === "fastapi")
    return "uvicorn main:app --reload";
  if (stack === "go")
    return "go run ./...";
  if (stack === "rust")
    return "cargo run";
  if (stack === "flutter")
    return "flutter run";
  switch (pm) {
    case "bun":
      return "bun run dev";
    case "pnpm":
      return "pnpm dev";
    case "yarn":
      return "yarn dev";
    default:
      return "npm run dev";
  }
}
function detectStackName(dir, pkg) {
  if (pkg) {
    if (hasDependency(pkg, "next"))
      return "nextjs";
    if (hasDependency(pkg, "expo"))
      return "expo";
    if (hasDependency(pkg, "react-native"))
      return "react-native";
    if (hasDependency(pkg, "@nestjs/core"))
      return "nest";
    if (hasDependency(pkg, "fastify"))
      return "fastify";
    if (hasDependency(pkg, "express"))
      return "express";
    if (hasDependency(pkg, "vite") && hasDependency(pkg, "react"))
      return "vite-react";
  }
  if (hasFile(dir, ["pubspec.yaml"]))
    return "flutter";
  if (hasFile(dir, ["Cargo.toml"]))
    return "rust";
  if (hasFile(dir, ["go.mod"]))
    return "go";
  const pyproject = readTextFile2(path3.join(dir, "pyproject.toml"));
  if (hasFile(dir, ["manage.py"]) || /django/i.test(pyproject))
    return "django";
  if (/fastapi/i.test(pyproject))
    return "fastapi";
  if (hasFile(dir, ["pyproject.toml", "requirements.txt"]))
    return "fastapi";
  return null;
}
function detectStack2(targetDir) {
  const empty = isDirectoryEmpty(targetDir);
  const pkg = readPackageJson(targetDir);
  const pm = detectPackageManager2(targetDir);
  if (empty) {
    return {
      stack: null,
      packageManager: pm,
      devCommand: devCommand(pm, null),
      isEmpty: true,
      isExisting: false
    };
  }
  const stack = detectStackName(targetDir, pkg);
  return {
    stack,
    packageManager: pm,
    devCommand: devCommand(pm, stack),
    isEmpty: false,
    isExisting: true
  };
}

// src/install/index.ts
var import_handlebars = __toESM(require_lib(), 1);
import crypto from "node:crypto";
import fs6 from "node:fs";
import path6 from "node:path";

// src/registry/index.ts
import fs5 from "node:fs";
import path5 from "node:path";

// src/paths.ts
import path4 from "node:path";
import fs4 from "node:fs";
import { fileURLToPath } from "node:url";
var CLI_SRC_DIR = path4.dirname(fileURLToPath(import.meta.url));
function getKitRoot() {
  if (process.env.AGENT_KIT_ROOT) {
    return process.env.AGENT_KIT_ROOT;
  }
  const fromCli = path4.resolve(CLI_SRC_DIR, "../../..");
  if (fs4.existsSync(path4.join(fromCli, "profiles"))) {
    return fromCli;
  }
  let dir = CLI_SRC_DIR;
  for (let i = 0;i < 8; i++) {
    if (fs4.existsSync(path4.join(dir, "profiles"))) {
      return dir;
    }
    dir = path4.dirname(dir);
  }
  return fromCli;
}
function getProfilesDir() {
  return path4.join(getKitRoot(), "profiles");
}
function resolveProfileDir(profileId) {
  if (profileId.startsWith("_") || profileId.includes("/")) {
    return profileId.includes("/") ? path4.resolve(profileId) : path4.join(getProfilesDir(), profileId);
  }
  const stackPath = path4.join(getProfilesDir(), profileId);
  if (fs4.existsSync(path4.join(stackPath, "manifest.json"))) {
    return stackPath;
  }
  const addonPath = path4.join(getProfilesDir(), "addons", profileId);
  if (fs4.existsSync(path4.join(addonPath, "manifest.json"))) {
    return addonPath;
  }
  return stackPath;
}

// src/registry/index.ts
function loadManifest(profileId) {
  const profileDir = resolveProfileDir(profileId);
  const manifestPath = path5.join(profileDir, "manifest.json");
  if (!fs5.existsSync(manifestPath)) {
    throw new Error(`Profile not found: ${profileId} (${manifestPath})`);
  }
  const raw = JSON.parse(fs5.readFileSync(manifestPath, "utf-8"));
  return { ...raw, id: raw.id ?? profileId };
}
function resolveProfileChain(profileIds) {
  const resolved = new Map;
  const queue = [...profileIds];
  while (queue.length > 0) {
    const id = queue.shift();
    if (resolved.has(id))
      continue;
    const manifest = loadManifest(id);
    resolved.set(id, manifest);
    for (const req of manifest.requires ?? []) {
      if (!resolved.has(req))
        queue.push(req);
    }
  }
  const order = ["_core", ...profileIds.filter((id) => id !== "_core")];
  const seen = new Set;
  const result = [];
  for (const id of order) {
    if (resolved.has(id) && !seen.has(id)) {
      result.push(resolved.get(id));
      seen.add(id);
    }
  }
  for (const [id, manifest] of resolved) {
    if (!seen.has(id)) {
      result.push(manifest);
      seen.add(id);
    }
  }
  return result;
}
function getProfileDir(profileId) {
  return resolveProfileDir(profileId);
}

// src/install/index.ts
var LOCK_FILE = ".agent-kit.lock.json";
var AGENT_KIT_SECTION = "## Agent Kit";
function checksum(content) {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
}
function ensureDir(filePath) {
  fs6.mkdirSync(path6.dirname(filePath), { recursive: true });
}
function renderTemplate(content, variables) {
  return import_handlebars.default.compile(content, { noEscape: true })(variables);
}
function readLockFile(targetDir) {
  const lockPath = path6.join(targetDir, LOCK_FILE);
  if (!fs6.existsSync(lockPath))
    return null;
  return JSON.parse(fs6.readFileSync(lockPath, "utf-8"));
}
function writeLockFile(targetDir, lock) {
  fs6.writeFileSync(path6.join(targetDir, LOCK_FILE), `${JSON.stringify(lock, null, 2)}
`);
}
function upsertGitignore(targetDir, line) {
  const gitignorePath = path6.join(targetDir, ".gitignore");
  const existing = fs6.existsSync(gitignorePath) ? fs6.readFileSync(gitignorePath, "utf-8") : "";
  if (existing.split(`
`).some((l) => l.trim() === line))
    return;
  const separator = existing.length > 0 && !existing.endsWith(`
`) ? `
` : "";
  fs6.writeFileSync(gitignorePath, `${existing}${separator}${line}
`);
}
function mergeAppend(destPath, content, profileId) {
  const markerBegin = `<!-- agent-kit:begin ${profileId} -->`;
  const markerEnd = `<!-- agent-kit:end ${profileId} -->`;
  const block = `
${markerBegin}
${content.trim()}
${markerEnd}
`;
  if (!fs6.existsSync(destPath)) {
    ensureDir(destPath);
    fs6.writeFileSync(destPath, block);
    return;
  }
  const existing = fs6.readFileSync(destPath, "utf-8");
  if (existing.includes(markerBegin))
    return;
  if (existing.includes(AGENT_KIT_SECTION)) {
    fs6.writeFileSync(destPath, `${existing.trimEnd()}
${block}`);
    return;
  }
  fs6.writeFileSync(destPath, `${existing.trimEnd()}

${AGENT_KIT_SECTION}
${block}`);
}
function installProfileFile(profile, file, ctx, lockEntries, force) {
  const profileDir = getProfileDir(profile.id);
  const srcPath = path6.join(profileDir, file.src);
  const destPath = path6.join(ctx.targetDir, file.dest);
  if (!fs6.existsSync(srcPath)) {
    console.warn(`  skip missing: ${file.src}`);
    return;
  }
  if (fs6.existsSync(destPath) && !force && file.merge !== "append") {
    console.log(`  skip exists: ${file.dest}`);
    return;
  }
  let content = fs6.readFileSync(srcPath, "utf-8");
  if (file.template !== false) {
    content = renderTemplate(content, ctx.variables);
  }
  if (file.merge === "append") {
    mergeAppend(destPath, content, profile.id);
  } else {
    ensureDir(destPath);
    fs6.writeFileSync(destPath, content);
  }
  lockEntries.push({
    path: file.dest,
    checksum: checksum(content),
    profile: profile.id
  });
  console.log(`  + ${file.dest}`);
}
function mergeMcpServers(targetDir, servers) {
  const mcpPath = path6.join(targetDir, ".cursor/mcp.json");
  const examplePath = path6.join(targetDir, ".cursor/mcp.json.example");
  let existing = { mcpServers: {} };
  if (fs6.existsSync(mcpPath)) {
    existing = JSON.parse(fs6.readFileSync(mcpPath, "utf-8"));
  }
  existing.mcpServers = { ...existing.mcpServers, ...servers };
  ensureDir(mcpPath);
  fs6.writeFileSync(mcpPath, `${JSON.stringify(existing, null, 2)}
`);
  fs6.writeFileSync(examplePath, `${JSON.stringify(existing, null, 2)}
`);
  upsertGitignore(targetDir, ".cursor/mcp.json");
}
function installProfiles(profiles, ctx, options = {}) {
  const lockEntries = [];
  const profileIds = profiles.map((p) => p.id);
  for (const profile of profiles) {
    console.log(`Installing profile: ${profile.name} (${profile.id})`);
    for (const file of profile.files) {
      installProfileFile(profile, file, ctx, lockEntries, options.force ?? false);
    }
    if (profile.mcpServers) {
      mergeMcpServers(ctx.targetDir, profile.mcpServers);
    }
  }
  const existingLock = readLockFile(ctx.targetDir);
  const lock = {
    version: "1.0.0",
    agentKitVersion: options.agentKitVersion ?? "0.1.0",
    installedAt: new Date().toISOString(),
    profiles: [...new Set([...existingLock?.profiles ?? [], ...profileIds])],
    detected: {
      stack: ctx.detected.stack ?? undefined,
      packageManager: ctx.detected.packageManager,
      devCommand: ctx.detected.devCommand
    },
    files: [...existingLock?.files ?? [], ...lockEntries]
  };
  writeLockFile(ctx.targetDir, lock);
  return lock;
}
function readProjectLock(targetDir) {
  return readLockFile(targetDir);
}

// src/commands/index.ts
async function runInit(targetPath, options) {
  const targetDir = path7.resolve(targetPath);
  if (!fs7.existsSync(targetDir)) {
    console.error(`Path not found: ${targetDir}`);
    console.error("Create the directory first, then run agent-kit init.");
    process.exit(1);
  }
  const detected = detectStack2(targetDir);
  const addonIds = options.addons ?? ["context7"];
  let profileChain = resolveProfileChain(["_core", ...addonIds]);
  if (options.noFeatureDocs) {
    profileChain = profileChain.map((manifest) => {
      if (manifest.id !== "_core")
        return manifest;
      return {
        ...manifest,
        files: manifest.files.filter((f) => !f.dest.includes("feature-docs.mdc"))
      };
    });
  }
  const ctx = {
    targetDir,
    detected,
    variables: {
      packageManager: detected.packageManager,
      devCommand: detected.devCommand,
      profile: detected.stack ?? "unknown"
    }
  };
  console.log(`
Agent Kit init → ${targetDir}`);
  console.log(`Detected stack: ${detected.stack ?? "unknown"}
`);
  installProfiles(profileChain, ctx, {
    force: options.force,
    agentKitVersion: "0.1.0"
  });
  console.log(`
Done!`);
  console.log("Next steps:");
  console.log("  1. Run agent-kit analyze . --write to generate project-tailored docs and rules.");
  console.log("  2. Edit .cursor/mcp.json — replace YOUR_* with your API keys.");
  console.log(`  3. Run ${detected.devCommand} to verify the project still works.`);
}
async function runAdd(targetPath, addonId, options) {
  const targetDir = path7.resolve(targetPath);
  if (!fs7.existsSync(targetDir)) {
    console.error(`Directory not found: ${targetDir}`);
    process.exit(1);
  }
  const detected = detectStack2(targetDir);
  const lock = readProjectLock(targetDir);
  const profileChain = resolveProfileChain([addonId]);
  const ctx = {
    targetDir,
    detected,
    variables: {
      packageManager: detected.packageManager,
      devCommand: detected.devCommand,
      profile: lock?.detected.stack ?? detected.stack ?? "unknown"
    }
  };
  console.log(`
Agent Kit add → ${addonId}
`);
  installProfiles(profileChain, ctx, { force: options.force });
  console.log(`
Done!`);
}
async function runDoctor(targetPath) {
  const targetDir = path7.resolve(targetPath);
  let exitCode = 0;
  console.log(`
Agent Kit doctor → ${targetDir}
`);
  const lock = readProjectLock(targetDir);
  if (!lock) {
    console.log("✗ .agent-kit.lock.json not found — run agent-kit init");
    return 1;
  }
  console.log(`✓ Lock file (profiles: ${lock.profiles.join(", ")})`);
  const requiredFiles = ["AGENTS.md", ".agents/AGENTS.md"];
  for (const file of requiredFiles) {
    const exists = fs7.existsSync(path7.join(targetDir, file));
    console.log(`${exists ? "✓" : "✗"} ${file}`);
    if (!exists)
      exitCode = 1;
  }
  const archFile = path7.join(targetDir, ".agents/architecture.md");
  if (fs7.existsSync(archFile)) {
    console.log("✓ .agents/architecture.md");
  } else {
    console.log("⚠ .agents/architecture.md missing — run agent-kit analyze . --write");
  }
  const rulesDir2 = path7.join(targetDir, ".cursor/rules");
  if (fs7.existsSync(rulesDir2)) {
    const rules = fs7.readdirSync(rulesDir2).filter((f) => f.endsWith(".mdc"));
    console.log(`✓ .cursor/rules/ (${rules.length} rules)`);
  } else {
    console.log("⚠ .cursor/rules/ missing — run agent-kit analyze . --write --harness cursor");
  }
  const mcpPath = path7.join(targetDir, ".cursor/mcp.json");
  if (fs7.existsSync(mcpPath)) {
    const mcp = fs7.readFileSync(mcpPath, "utf-8");
    if (mcp.includes("YOUR_")) {
      console.log("⚠ .cursor/mcp.json has placeholder API keys — edit before use");
    } else {
      console.log("✓ .cursor/mcp.json configured");
    }
  } else {
    console.log("⚠ .cursor/mcp.json missing — see .agents/mcp-registry.md");
  }
  const gitignore = path7.join(targetDir, ".gitignore");
  if (fs7.existsSync(gitignore)) {
    const content = fs7.readFileSync(gitignore, "utf-8");
    if (content.includes(".cursor/mcp.json")) {
      console.log("✓ .cursor/mcp.json in .gitignore");
    } else {
      console.log("⚠ Add .cursor/mcp.json to .gitignore");
    }
  }
  console.log("");
  return exitCode;
}

// src/index.ts
var program2 = new Command;
program2.name("agent-kit").description("Install agent context (AGENTS.md, rules, skills, MCP) into any codebase").version("0.1.0");
program2.command("init").description("Install Agent Kit core context into an existing project").argument("[path]", "Target directory", ".").option("-a, --addon <id...>", "MCP addons to include", ["context7"]).option("-f, --force", "Overwrite existing agent files").option("--no-feature-docs", "Skip change-docs rule").action(async (targetPath, options) => {
  await runInit(targetPath, {
    force: options.force,
    noFeatureDocs: !options.featureDocs,
    addons: options.addon
  });
});
program2.command("add").description("Add a profile addon (context7, etc.)").argument("<addon>", "Addon profile id").argument("[path]", "Target directory", ".").option("-f, --force", "Overwrite existing files").action(async (addon, targetPath, options) => {
  await runAdd(targetPath, addon, { force: options.force });
});
program2.command("analyze").description("Analyze project structure and optionally generate tailored agent docs and rules").argument("[path]", "Target directory", ".").option("--json", "Output ProjectProfile as JSON").option("-w, --write", "Write generated AGENTS.md, .agents/, and rules to disk").option("-H, --harness <name>", "Target harness: cursor, opencode, claude-code, antigravity, copilot", "cursor").action(async (targetPath, options) => {
  await runAnalyze(targetPath, {
    json: options.json,
    write: options.write,
    harness: options.harness
  });
});
program2.command("doctor").description("Validate agent-kit installation").argument("[path]", "Target directory", ".").action(async (targetPath) => {
  const code = await runDoctor(targetPath);
  process.exit(code);
});
program2.parse();
