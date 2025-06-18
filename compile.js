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

            if (word === 'ye' || word === 'bol') {
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

        if (/[\+\-\%\*\/\=]/.test(char)) {
            tokens.push({ type: 'operator', value: char });
            cursor++;
            continue;
        }

        // Ignore unrecognized characters
        cursor++;
    }

    return tokens;
}

function compiler(input) {
    const tokens = lexer(input);
    const variables = {};
    let i = 0;

    while (i < tokens.length) {
        const token = tokens[i];

        if (token.type === 'keyword' && token.value === 'ye') {
            const varName = tokens[++i].value;
            i++; // skip '='
            let value;
            if (tokens[i].type === 'number') {
                value = tokens[i++].value;
            } else if (tokens[i].type === 'identifier') {
                value = variables[tokens[i++].value];
            }

            if (tokens[i] && tokens[i].type === 'operator' && tokens[i].value === '+') {
                i++;
                const right = tokens[i].type === 'identifier'
                    ? variables[tokens[i++].value]
                    : tokens[i++].value;
                value += right;
            }

            variables[varName] = value;

        } else if (token.type === 'keyword' && token.value === 'bol') {
            const varName = tokens[++i].value;
            console.log(variables[varName]);
            i++;
        } else {
            i++;
        }
    }
}

// Sample Code
const code = `
ye x = 10
ye y = 90
ye sum = x + y
bol sum
`;

compiler(code);
