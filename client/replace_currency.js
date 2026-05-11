const fs = require('fs');
const path = require('path');

function replaceCurrency(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceCurrency(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Replace $ followed by anything that is NOT {
      // Because ${ is string interpolation
      // Also it could be $0.00, or $ followed by a digit. 
      // Let's replace \$([0-9]) with ₹$1
      // Also \$ followed by variable in jsx like \${item.price} NO wait, it's \$({) so we want \$ followed by { ?
      // Wait, in JSX the code is: \${item.price.toFixed(2)}
      // Which means it is literally \u003e${item.price.toFixed(2)}
      // We want to replace '$' if it's NOT followed by '{'?? No!
      // In JS template literals: `${price}`
      // In JSX text: `${product.price}` --> wait, it's NOT `${product.price}` in JSX text!
      // In JSX, it is written as: `<div>${product.price}</div>`
      // So the literal $ is immediately followed by `{` !!
      // Example: <span>${item.price.toFixed(2)}</span>
      // So the $ we want to replace IS followed by `{`!
      // But we DO NOT want to replace $ in template literals like `${API_URL}/auth`
      // Wait, how to distinguish?
      // Template literals use backticks: \`${API_URL}\`. The $ is part of \${...}.
      // JSX text doesn't use backticks.
      // So we can visually replace using multi_replace_file_content.
    }
  }
}
