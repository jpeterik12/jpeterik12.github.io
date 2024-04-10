
arrayDelimiters = [',', ']'];
dictDelimiters = [',', '}'];
dictKeyDelimiters = [':'];

let i;

function ParseObject(first, second) {
  if (second == undefined) {
    return ParseObjectString(first);
  }
  if (typeof second == "string") {
    return ParseObjectKey(first, second);
  }
  return ParseObjectList(first, second);
}


function ParseObjectString(sjson) {
  i = 0;
  return ParseObjectList(sjson, null)
}

function ParseObjectKey(sjson, key) {
  i = 0;
  const parsed = ParseObject_Dictionary(sjson)
  if (parsed != undefined && parsed.hasOwnProperty(key)) {
    return parsed[key];
  }
  return undefined;
}

function ParseObjectList(sjson, delimiters) {
  let obj = null;
  i = SkipFormatting(sjson, i);
  if (sjson[i] == '{') {
    return ParseObject_Dictionary(sjson);
  }
  if (sjson[i] == '[') {
    return ParseObject_Array(sjson);
  }
  let text = ParseObject_String(sjson, delimiters);
  const text2 = text?.trim();
  if (text2 == null) {
    throw new Error(`Expected value at index ${i}.`);
  }
  if (text2.length == 0) {
    return "";
  }
  if (!isNaN(text)) {
    return parseFloat(text);
  }
  if (text2.toLowerCase() == "true") {
    return true;
  }
  if (text2.toLowerCase() == "false") {
    return false;
  }
  if (text2.startsWith("\"") && text2.endsWith("\"")) {
    text = text2.substr(1, text.length - 2);
  }
  if (text2 == "null") {
    text = null;
  }
  return text;
}

function ParseObject_String(sjson, delimiters) {
  if (sjson[i] == '"') {
    const num = sjson.indexOf('"', i + 1);
    const length = num - i - 1;
    const result = sjson.substr(i + 1, length);
    i = num + 1;
    return result;
  }
  let flag = false;
  let string = ""
  while (i < sjson.length) {
    c = sjson[i];
    if (!flag && c == '\\') {
      flag = true;
      i++;
      continue;
    }
    if (!flag && ((delimiters != null && delimiters.includes(c)) || c == '\n')) {
      break;
    }
    string = string.concat(c);
    flag = false;
    i++;
  }
  return string;
}

function ParseObject_Array(sjson) {
  i++;
  let list = [];
  let c;
  do {
    i = SkipFormatting(sjson, i);
    if (i >= sjson.length) {
      throw new Error(`Expected ']' at ${i}`);
    }
    if (sjson[i] == ']') {
      i++;
      break;
    }
    let item = ParseObject(sjson, arrayDelimiters);
    if (i >= sjson.length) {
      throw new Error(`Expected ']' at ${i}`);
    }
    i = SkipFormatting(sjson, i);
    c = sjson[i];
    if (c != ']' && c != ',') {
      throw new Error(`Expected ']' at ${i}`);
    }
    list.push(item);
    i++;
  }
  while (c != ']');
  return list;
}

function ParseObject_Dictionary(sjson) {
  i++;
  let dictionary = {};
  let c;
  do {
    i = SkipFormatting(sjson, i);
    if (i >= sjson.length) {
      throw new Error(`Expected '}}' at ${i}`);
    }
    if (sjson[i] == '}') {
      i++;
      break;
    }
    let text = ParseObject_String(sjson, dictKeyDelimiters);
    if (text.length == 0 || text === null) {
      throw new Error(`Expected key at ${i}`);
    }
    if (i >= sjson.length) {
      throw new Error(`Expected ':' at ${i}`);
    }
    c = sjson[i];
    if (c != ':') {
      throw new Error(`Expected ':' at ${i}`);
    }
    i++;
    let value = ParseObject(sjson, dictDelimiters);
    dictionary[text] = value;
    i = SkipFormatting(sjson, i);
    if (i >= sjson.length) {
      throw new Error(`Expected '}}' at ${i}`);
    }
    c = sjson[i];
    if (c != '}' && c != ',') {
      throw new Error(`Expected '}}' at ${i}`);
    }
    i++;
  }
  while (c != '}');
  return dictionary;
}

// public static Dictionary < string, object > ParseDictionary(string sjson, string key)
// {
//   object obj = ParseObject(sjson, key);
//   if (obj == null || obj is Dictionary < string, object >)
//   {
//     return obj as Dictionary<string, object>;
//   }
//   throw new Exception("Key \"" + key + "\" is not a dictionary");
// }

// public static T[] ParseArray < T > (string sjson, string key, Converter < string, T > conversionFunction)
// {
//   string[] array = ParseArray(sjson, key);
//   if (array == null) {
//     return null;
//   }
//   return Array.ConvertAll(array, conversionFunction);
// }

// public static string[] ParseArray(string sjson, string key)
// {
//   string text = Parse(sjson, key);
//   if (text == null) {
//     return null;
//   }
//   return _ParseArrayElements(text);
// }

// private static string[] _ParseArrayElements(string str)
// {
//   int num = SkipFormatting(str, 1);
//   if (num >= str.Length - 1) {
//     return new string[0];
//   }
//   bracketStack.Clear();
//   split.Clear();
//   for (int i = num; i < str.Length; i++)
//   {
//     if (i == str.Length - 1) {
//       string item = Substring(str, num, i - num);
//       split.Add(item);
//       break;
//     }
//     char c = str[i];
//     if (c == '{' || c == '[') {
//       bracketStack.Push(c);
//     }
//     else if (bracketStack.Count > 0 && ((c == '}' && bracketStack.Peek() == '{') || (c == ']' && bracketStack.Peek() == '['))) {
//       bracketStack.Pop();
//     }
//     else if (c == ',' && bracketStack.Count == 0) {
//       int num2 = i - num;
//       if (num2 == 0) {
//         split.Add("");
//       }
//       else {
//         string item2 = Substring(str, num, num2);
//         split.Add(item2);
//       }
//       num = SkipFormatting(str, i + 1);
//       if (str[num] == ']') {
//         break;
//       }
//       i = num - 1;
//     }
//     else if (num == i && c == '"') {
//       int num3 = str.IndexOf('"', i + 1);
//       if (num3 < 0) {
//         string text = ((split.Count > 0) ? split[split.Count - 1] : "");
//         Utils.LogError("[SlimJson] Failure to find matching end quote after index " + i + ". Last parsed entry = " + text);
//         break;
//       }
//       string item3 = Substring(str, i + 1, num3 - i - 1);
//       split.Add(item3);
//       i = num3 + 1;
//       num = SkipFormatting(str, i + 1);
//       if (num >= str.Length || str[num] == ']') {
//         break;
//       }
//       i = num - 1;
//     }
//   }
//   return split.ToArray();
// }

// public static string[][] ParseArray2D(string sjson, string key)
// {
//   string[] array = ParseArray(sjson, key);
//   string[][] array2 = new string[array.Length][];
//   for (int i = 0; i < array.Length; i++)
//   {
//     array2[i] = _ParseArrayElements(array[i]);
//   }
//   return array2;
// }

function SkipFormatting(str, index) {
  while (index < str.length && (str[index] == '\t' || str[index] == '\r' || str[index] == '\n' || str[index] == ' ' || str[index] == '\u2002')) {
    index++;
  }
  return index;
}

// private static string Substring(string str, int startIndex, int length)
// {
//   if (length <= 0) {
//     return "";
//   }
//   char c = str[startIndex];
//   while (c == '\t' || c == '\r' || c == '\n') {
//     startIndex++;
//     length--;
//     if (length <= 0) {
//       return "";
//     }
//     c = str[startIndex];
//   }
//   c = str[startIndex + length - 1];
//   while (c == '\t' || c == '\r' || c == '\n') {
//     length--;
//     if (length <= 0) {
//       return "";
//     }
//     c = str[startIndex + length - 1];
//   }
//   return str.Substring(startIndex, length);
// }

// public static bool HasKey(string sjson, string key)
// {
//   return Parse(sjson, key) != null;
// }

// public static string Parse(string sjson, string key)
// {
//   key += ":";
//   int length = key.Length;
//   int num = -1;
//   bracketStack.Clear();
//   char c = '.';
//   for (int i = 0; i < sjson.Length - length; i++)
//   {
//     char c2 = sjson[i];
//     if (c2 == key[0] && bracketStack.Count == 1 && (c == ' ' || c == '\u2002' || c == ',' || c == '{' || c == '\t' || c2 == '\r' || c == '\n')) {
//       bool flag = true;
//       for (int j = 0; j < key.Length; j++)
//       {
//         if (sjson[i + j] != key[j]) {
//           flag = false;
//           break;
//         }
//       }
//       if (flag) {
//         num = i;
//         break;
//       }
//     }
//     else if (c2 == '{' || c2 == '[') {
//       bracketStack.Push(c2);
//     }
//     else if (bracketStack.Count > 0 && ((c2 == '}' && bracketStack.Peek() == '{') || (c2 == ']' && bracketStack.Peek() == '['))) {
//       bracketStack.Pop();
//     }
//     c = c2;
//   }
//   if (num < 0) {
//     return null;
//   }
//   num += length;
//   char c3 = sjson[num];
//   switch (c3) {
//     case '[':
//     case '{':
//       {
//         bracketStack.Clear();
//         bracketStack.Push(c3);
//     char c5 = c3;
//         for (int l = num + 1; l < sjson.Length; l++)
//         {
//       char c6 = sjson[l];
//           if (c6 == '"') {
//             c5 = ((c5 != '"') ? '"' : bracketStack.Peek());
//           }
//           if (c5 == '"') {
//             continue;
//           }
//           if ((c6 == '}' && c5 == '{') || (c6 == ']' && c5 == '[')) {
//             bracketStack.Pop();
//             if (bracketStack.Count == 0) {
//               return sjson.Substring(num, l - num + 1);
//             }
//             c5 = bracketStack.Peek();
//           }
//           else if (c6 == '{' || c6 == '[') {
//             bracketStack.Push(c6);
//             c5 = c6;
//           }
//         }
//         Console.Write("Failed to parse sjson. " + sjson);
//         break;
//       }
//     case '"':
//       {
//     int num2 = sjson.IndexOf('"', num + 1);
//         return sjson.Substring(num + 1, num2 - num - 1);
//       }
//     default:
//       {
//         for (int k = num + 1; k < sjson.Length; k++)
//         {
//       char c4 = sjson[k];
//           if (c4 == ',' || c4 == '}' || c4 == ']') {
//             return sjson.Substring(num, k - num);
//           }
//         }
//         Console.Write("Failed to parse sjson. " + sjson);
//         break;
//       }
//   }
//   return null;
// }

// public static string Parse(string sjson, string key, string defaultValue)
// {
//   string text = Parse(sjson, key);
//   if (text == null) {
//     return defaultValue;
//   }
//   return text;
// }

// public static T Parse < T > (string sjson, string key, Converter < string, T > conversionFunction)
// {
//   string text = Parse(sjson, key);
//   if (text == null) {
//     return default (T);
//   }
//   return conversionFunction(text);
// }

// public static T ParseEnum < T > (string sjson, string key)
// {
//   string text = Parse(sjson, key);
//   if (text == null) {
//     return default (T);
//   }
//   return (T)Enum.Parse(typeof (T), text);
// }

// public static T[] ParseEnumArray < T > (string sjson, string key)
// {
//   string[] array = ParseArray(sjson, key);
//   if (array == null) {
//     return null;
//   }
//   return Array.ConvertAll(array, (string str) => (T)Enum.Parse(typeof (T), str));
// }

// public static int ParseInt(string sjson, string key, int defaultValue = 0)
// {
//   string text = Parse(sjson, key);
//   if (text == null) {
//     return defaultValue;
//   }
//   return Utils.ParseInt(text);
// }

// public static long ParseLong(string sjson, string key, long defaultValue = 0L)
// {
//   string text = Parse(sjson, key);
//   if (text == null) {
//     return defaultValue;
//   }
//   return Utils.ParseLong(text);
// }

// public static bool ParseBool(string sjson, string key, bool defaultValue = false)
// {
//   string text = Parse(sjson, key);
//   if (text == null) {
//     return defaultValue;
//   }
//   return bool.Parse(text);
// }

// public static float ParseFloat(string sjson, string key, float defaultValue = 0f)
// {
//   string text = Parse(sjson, key);
//   if (text == null) {
//     return defaultValue;
//   }
//   return Utils.ParseFloat(text);
// }

// public static DateTime ParseDateTime(string sjson, string key)
// {
//   string text = Parse(sjson, key);
//   if (text == null) {
//     Console.Write("Failed to parse DateTime with key " + key + " in sjson string " + sjson);
//     return DateTime.Now;
//   }
//   return _ParseDateTime(text);
// }

// public static DateTime ParseDateTime(string sjson, string key, DateTime defaultValue)
// {
//   string text = Parse(sjson, key);
//   if (text == null) {
//     return defaultValue;
//   }
//   return _ParseDateTime(text);
// }

// private static DateTime _ParseDateTime(string result)
// {
//   if (result.Length == 8) {
//     try {
//       int year = Utils.ParseInt(result.Substring(0, 4));
//       int month = Utils.ParseInt(result.Substring(4, 2));
//       int day = Utils.ParseInt(result.Substring(6, 2));
//       return new DateTime(year, month, day);
//     }
//     catch
//     {
//     }
//   }
//   return DateTime.Parse(result, CultureInfo.InvariantCulture);
// }

// public static Color ParseColor(string sjson, string key)
// {
//   return ParseColor(sjson, key, Color.white);
// }

// public static Color ParseColor(string sjson, string key, Color defaultValue)
// {
//   string text = Parse(sjson, key);
//   if (text == null) {
//     return defaultValue;
//   }
//   Color color = default (Color);
//   if (ColorUtility.TryParseHtmlString(text, out color)) {
//     return color;
//   }
//   return defaultValue;
// }
