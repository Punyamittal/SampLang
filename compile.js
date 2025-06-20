// === Lexer ===
function lexer(input) {
    const tokens = [];
    let cursor = 0;

    while (cursor < input.length) {
        let char = input[cursor];

        if (/\s/.test(char)) {
            cursor++;
            continue;
        }

        if (/[a-zA-Z]/.test(char)) {
            let word = '';
            while (/[a-zA-Z]/.test(char)) {
                word += char;
                char = input[++cursor];
            }

            if (['ye', 'bol', 'agar', 'warna'].includes(word)) {
                tokens.push({ type: 'keyword', value: word });
            } else {
                tokens.push({ type: 'identifier', value: word });
            }
            continue;
        }

        if (/[0-9]/.test(char)) {
            let num = '';
            while (/[0-9]/.test(char)) {
                num += char;
                char = input[++cursor];
            }
            tokens.push({ type: 'number', value: parseInt(num) });
            continue;
        }

        if (/[\+\-\*\/\%\=\>\<]/.test(char)) {
            let op = char;
            if ((char === '>' || char === '<' || char === '=') && input[cursor + 1] === '=') {
                op += '=';
                cursor++;
            }
            tokens.push({ type: 'operator', value: op });
            cursor++;
            continue;
        }

        cursor++; // Skip unrecognized characters
    }

    return tokens;
}

// === Parser ===
function parser(tokens) {
    const statements = [];
    let i = 0;

    function parseExpression() {
        const expr = [];
        while (i < tokens.length && tokens[i].type !== 'keyword') {
            expr.push(tokens[i++]);
        }
        return expr;
    }

    while (i < tokens.length) {
        const token = tokens[i];

        if (token.type === 'keyword') {
            if (token.value === 'ye') {
                const name = tokens[++i];
                i++; // skip '='
                const expr = parseExpression();
                statements.push({ type: 'assignment', name: name.value, expr });
            }

            else if (token.value === 'bol') {
                i++;
                const expr = parseExpression();
                statements.push({ type: 'print', expr });
            }

            else if (token.value === 'agar') {
                i++;
                const condition = parseExpression();

                const trueToken = tokens[i++];
                if (trueToken.value !== 'bol') throw new Error(`Expected 'bol' after condition`);

                const trueBranch = parseExpression();

                let falseBranch = [];
                if (tokens[i]?.value === 'warna') {
                    i++;
                    falseBranch = parseExpression();
                }

                statements.push({
                    type: 'if',
                    condition,
                    trueBranch,
                    falseBranch
                });
            }

            else {
                throw new Error(`Unknown keyword: ${token.value}`);
            }
        } else {
            i++;
        }
    }

    return statements;
}

// === Evaluator ===
function evaluateExpression(expr, variables) {
    const jsExpr = expr.map(t => {
        if (t.type === 'number') return t.value;
        if (t.type === 'identifier') return variables[t.value];
        if (t.type === 'operator') return t.value;
    });

    return Function('"use strict"; return (' + jsExpr.join(' ') + ')')();
}

function evaluate(ast) {
    const variables = {};

    for (const stmt of ast) {
        if (stmt.type === 'assignment') {
            variables[stmt.name] = evaluateExpression(stmt.expr, variables);
        }

        else if (stmt.type === 'print') {
            const result = evaluateExpression(stmt.expr, variables);
            console.log(result);
        }

        else if (stmt.type === 'if') {
            const condition = evaluateExpression(stmt.condition, variables);
            const branch = condition ? stmt.trueBranch : stmt.falseBranch;
            const result = evaluateExpression(branch, variables);
            console.log(result);
        }
    }
}

// === Runner ===
function run(input) {
    const tokens = lexer(input);
    const ast = parser(tokens);
    evaluate(ast);
}

// === Sample Program ===
const code = `
ye x = 10
ye y = 5
ye z = x * y + 2
bol z
agar x > y bol x warna bol y
ye a = z % y
bol a
`;

run(code);
