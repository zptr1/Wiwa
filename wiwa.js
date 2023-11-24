import { createInterface } from "readline/promises";
import { readFileSync } from "fs";

let _getch = null;
process.stdin.on("data", (data) => {
  if (_getch) {
    _getch(data[0]);
    _getch = null;
  }
});

function depth(arr) {
  return Array.isArray(arr)
    ? Math.max(0, ...arr.map(depth)) + 1
    : 0
}

function clone(arr, o=[]) {
  for (const e of arr) {
    if (e.length) {
      const i = [];
      clone(e, i);
      o.push(i);
    } else o.push([]);
  }
  return o;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    const r = ~~(Math.random() * i);
    [arr[i], arr[r]] = [arr[r], arr[i]];
  }
}

async function run(
  src,
  stack=[],
  lambda="",
  outerStack=[],
) {
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];

    if (ch == "⋯") {
      stack.push([]);
      outerStack.push(stack);
      stack = stack.at(-1);
    } else if (ch == "Ø") {
      stack.push([]);
    } else if ("₁₂₃₄₅₆₇₈₉".includes(ch)) stack.push(Array.from(
      { length: ch.charCodeAt(0) - 0x2080 },
      () => []
    ));
    else if (ch == "⏨") stack.push(Array.from(
      { length: 10 },
      () => []
    ));
    else if (ch == "∥") stack.push(stack.pop(), stack.pop());
    else if (ch == "•") stack.push(clone(stack.at(-1)));
    else if (ch == "↥") stack.push(clone(stack.at(-2)));
    else if (ch == "\\") stack.pop();
    else if (ch == "↶") {
      outerStack.push(stack);
      stack = stack.at(-1);
    } else if (ch == "↷") stack = outerStack.pop();
    else if (ch == "⇅") stack.reverse();
    else if (ch == "⊥") stack.push(clone(stack[0]));
    else if (ch == "∩") stack.at(-2).push(...stack.pop());
    else if (ch == "∪") {
      for (const a of stack.pop())
        stack.push(a);
    } else if (ch == "⊃") {
      stack.at(-1).splice(stack.at(-2).length, Infinity);
    } else if (ch == "∺") {
      const a = stack.pop(), b = stack.pop();
      stack.push(a.reduce((p, c, i) => p.concat(c, b[i]), []));
    } else if (ch == "∈") stack.at(-2).push(stack.pop());
    else if (ch == "∋") stack.push(stack.at(-1).at(-1));
    else if (ch == "⊄") {
      const b = stack.at(-1);
      stack.at(-2).forEach((x, i, a) => {
        if (b.some((y) => y.length == x.length))
          a.splice(a.indexOf(x), 1);
      });
    } else if (ch == "⊂") {
      const b = stack.at(-1);
      stack.at(-2).forEach((x, i, a) => {
        if (!b.some((y) => y.length == x.length))
          a.splice(a.indexOf(x), 1);
      });
    } else if (ch == "⧺") {
      stack.push(Array.from(
        { length: stack.at(-1).length },
        () => []
      ));
    } else if (ch == "⧻") {
      stack.push(Array.from(
        { length: depth(stack.at(-1)) },
        () => {}
      ));
    } else if (ch == "×") {
      const count = stack.pop().length, arr = stack.pop();
      stack.push(Array.from(
        { length: count },
        () => clone(arr)
      ).flat());
    } else if (ch == "÷") {
      stack.push(stack.at(-1).splice(Math.round(stack.at(-1).length / 2), Infinity));
    } else if (ch == "⩷") {
      stack.push(stack.pop().flat());
    } else if (ch == "⊝") {
      const ln = new Set();
      stack.push(stack.pop().filter((x) => {
        if (!ln.has(x.length)) {
          ln.add(x.length);
          return true;
        }
      }));
    } else if (ch == "□") {
      stack.push([stack.pop()]);
    } else if (ch == "⇆") {
      stack.at(-1).reverse();
    } else if (ch == "↥") {
      const arr = stack.at(-1);
      const ln = Math.max(...arr.map((x) => x.length));
      const idx = arr.findIndex((x) => x.length == ln);
      arr.push(arr.splice(idx, 1));
    } else if (ch == "↧") {
      const arr = stack.at(-1);
      const ln = Math.min(...arr.map((x) => x.length));
      const idx = arr.findIndex((x) => x.length == ln);
      arr.push(arr.splice(idx, 1));
    } else if (ch == "⊢") {
      const arr = stack.at(-1);
      [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
    } else if (ch == "∧") {
      stack.at(-1).sort((a, b) => a.length - b.length);
    } else if (ch == "∨") {
      stack.at(-1).sort((a, b) => b.length - a.length);
    } else if (ch == "⚂") shuffle(stack.at(-1));
    else if (ch == "¤") stack.at(-1).push([]);
    else if (ch == "⌑") stack.at(-1).pop();
    else if (ch == "⊠") {
      const arr = stack.pop();
      stack.push(
        Array.from(
          { length: arr.length },
          () => clone(arr)
        ).flat()
      );
    } else if (ch == "↪") {
      console.log(stack.pop().map((x) => String.fromCharCode(x.length)).join(""));
    } else if (ch == "↩") {
      const rl = createInterface(process.stdin, process.stdout);
      const o = await rl.question("");
      rl.close();
      
      stack.push(o.split("").map(
        (x) => Array.from(
          { length: x.charCodeAt(0) },
          () => []
        )
      ));
    } else if (ch == "⍤") {
      process.stdout.write(String.fromCharCode(stack.pop().length));
    } else if (ch == "⍣") {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      const char = await new Promise(res => _getch = res);
      process.stdin.pause();
      process.stdin.setRawMode(false);

      stack.push(Array.from(
        { length: char },
        () => []
      ));
    } else if (ch == "‣") {
      throw new Error("todo");
    } else if (ch == "?") {
      console.log(
        require("util").inspect(stack, {
          depth: Infinity,
          maxArrayLength: Infinity
        })
      )
    } else if (ch == "[") {
      while (src[++i] != "]");
    } else if (ch == "λ") {
      let depth = 1;
      lambda = "";

      while (depth) {
        const ch = src[++i];

        if (ch == "[") {
          while (src[++i] != "]");
          continue;
        } else if (ch == "λ") depth++;
        else if (ch == "." && !--depth) break;

        lambda += ch;
      }
    } else if (ch == "∵") {
      for (const a of stack.at(-1))
        await run(lambda, a, lambda, outerStack.concat(stack));
    } else if (ch == "∶") {
      await run(lambda, stack.at(-2), lambda, outerStack.concat(stack));
      await run(lambda, stack.at(-1), lambda, outerStack.concat(stack));
    } else if (ch == "∷") {
      for (const a of stack)
      await run(lambda, a, lambda, outerStack.concat(stack));
    } else if (ch == "∅") {
      while (stack.at(-1).length)
        await run(lambda, stack, lambda, outerStack);
    } else if (ch == "≍") {
      if (stack.at(-2).length == stack.at(-1).length)
        await run(lambda, stack, lambda, outerStack);
    } else if (!" \n\t]".includes(ch)) {
      console.error("invalid instruction", ch);
      process.exit(1);
    }
  }
}

if (process.argv.length < 3) {
  console.error("usage: ... <file>");
  process.exit(2);
}

run(readFileSync(process.argv[2], "utf-8"));
