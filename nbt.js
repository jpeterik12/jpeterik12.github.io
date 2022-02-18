


const swapQuotes = (x) => x.replace(/"/g, String.raw`\"`).replace(/'/g, String.raw`"`);

function parseWaccJSON (str) {
  if (!str || typeof str != 'string') return str;
  if ('\'"'.includes(str[0]) && str.slice(-1) == str[0]) { return parseWaccJSON(eval(str)); }
  try {
    return JSON.parse(str, reviver);
  } catch (err) {
    return JSON.parse(swapQuotes(str), reviver);
  }
}


/* exported readNBT */
function readNBT (page, multipage) {
  const pageObject = parseWaccJSON(page);
  // console.log(pageObject);
  if (multipage) {
    for (const i in pageObject) {
      pageObject[i] = [pageObject[i]].flat().reduce((x, y) => x + y).replace(/\n/g, '<br>');
    }
    return pageObject;
  }
  // console.log(pageObject)
  return pageObject.flat().reduce((x, y) => x + y).replace(/\n/g, '<br>');
  // console.log(JSON.parse(pageObject[1],reviver))
}

function reviver (key, value) {
  // console.log(this,key,value)
  if (value.text || value.with) {
    let style = '';
    if (value.color) style += `color:${value.color};`;
    if (value.underlined) style += 'text-decoration: underline;';
    const text = value.text || value.with[0];
    return `<span style="${style}">${text}</span>`;
  }
  if (typeof value == 'string') {
    try {
      return parseWaccJSON(value);
    } catch (err) {
      return value;
    }
  }
  // if (value instanceof Array) return value.reduce((x,y) => x+y)
  return value;
}
