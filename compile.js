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
            // Check for >=, <=, ==
            if ((char === '>' || char === '<' || char === '=') && input[cursor + 1] === '=') {
                op += '=';
                cursor++;
            }
            tokens.push({ type: 'operator', value: op });
            cursor++;
            continue;
        }

        cursor++; // skip unknown characters
    }

    return tokens;
}

// Evaluates expressions like: x + 5 * y
function evaluateExpression(tokens, variables) {
    const expression = tokens.map(t => {
        if (t.type === 'number') return t.value;
        if (t.type === 'identifier') {
            if (!(t.value in variables)) throw new Error(`Undefined variable: ${t.value}`);
            return variables[t.value];
        }
        if (t.type === 'operator') return t.value;
        throw new Error(`Invalid token in expression`);
    });

    // Evaluate using Function constructor (safe because inputs are parsed)
    return Function('"use strict"; return (' + expression.join(' ') + ')')();
}

// Compiler: Executes the code based on tokens
function compiler(input) {
    const tokens = lexer(input);
    const variables = {};
    let i = 0;

    while (i < tokens.length) {
        const token = tokens[i];

        if (token.type === 'keyword' && token.value === 'ye') {
            const varNameToken = tokens[++i];
            if (!varNameToken || varNameToken.type !== 'identifier') throw new Error('Expected variable name after ye');
            const varName = varNameToken.value;

            const eqToken = tokens[++i];
            if (!eqToken || eqToken.type !== 'operator' || eqToken.value !== '=') throw new Error(`Expected '=' after variable name`);

            // Read expression until next keyword or line ends
            const exprTokens = [];
            i++;
            while (i < tokens.length && tokens[i].type !== 'keyword') {
                exprTokens.push(tokens[i++]);
            }

            variables[varName] = evaluateExpression(exprTokens, variables);
        }

        else if (token.type === 'keyword' && token.value === 'bol') {
            const exprTokens = [];
            i++;
            while (i < tokens.length && tokens[i].type !== 'keyword') {
                exprTokens.push(tokens[i++]);
            }
            const result = evaluateExpression(exprTokens, variables);
            console.log(result);
        }

        else if (token.type === 'keyword' && token.value === 'agar') {
            const condTokens = [];
            i++;
            while (i < tokens.length && tokens[i].type !== 'keyword') {
                condTokens.push(tokens[i++]);
            }

            const conditionResult = evaluateExpression(condTokens, variables);

            if (tokens[i]?.type === 'keyword' && tokens[i].value === 'bol') {
                const trueExpr = [];
                i++;
                while (i < tokens.length && tokens[i].type !== 'keyword') {
                    trueExpr.push(tokens[i++]);
                }

                if (conditionResult) {
                    const result = evaluateExpression(trueExpr, variables);
                    console.log(result);
                } else {
                    if (tokens[i]?.type === 'keyword' && tokens[i].value === 'warna') {
                        const falseExpr = [];
                        i++;
                        while (i < tokens.length && tokens[i].type !== 'keyword') {
                            falseExpr.push(tokens[i++]);
                        }
                        const result = evaluateExpression(falseExpr, variables);
                        console.log(result);
                    }
                }
            } else {
                throw new Error("Expected 'bol' after condition");
            }
        }

        else {
            i++;
        }
    }
}

// 🧪 Sample Code
const code = `
ye x = 10
ye y = 5
ye z = x * y + 2
bol z
agar x > y bol x warna bol y
ye a = z % y
bol a
`;

compiler(code);
