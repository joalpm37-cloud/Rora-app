const fs = require('fs');

const data = fs.readFileSync('tools.json', 'utf8');
const match = data.match(/data: (.*)/);
if(match) {
  const json = JSON.parse(match[1]);
  if(json.result && json.result.tools) {
    const names = json.result.tools.map(t => t.name);
    console.log(names.join('\\n'));
  }
}
