import { JSONEditor } from 'https://cdn.jsdelivr.net/npm/vanilla-jsoneditor/standalone.js'

function parseSaveFile(data) {

  let savegame = ParseObject(data);
  return savegame;
}

async function parseProgressData(progress_data) {
  return ParseObject(await decrypter(progress_data, "peekabeyoufoundme"));
}

let decrypterthing;
let salt;
let iv;

async function decrypter(cipherText, passPhrase) {
  const array = new Uint8Array(atob(cipherText).split("").map(c => c.charCodeAt(0)));
  salt = array.slice(0, 32);
  iv = array.slice(32, 64);
  const data = array.slice(64);

  const enc = new TextEncoder("utf-8");
  const passkey = await window.crypto.subtle.importKey(
    "raw", // raw format of the key - should be Uint8Array
    enc.encode(passPhrase),
    { // algorithm details
      name: "PBKDF2",
      hash: { name: "SHA-1" }
    },
    true, // export = false
    ["deriveKey"] // what this key can do
  );


  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 1000,
      hash: "SHA-1",
    },
    passkey,
    { name: "AES-CBC", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const keyarr = new Uint8Array(await window.crypto.subtle.exportKey("raw", key));


  decrypterthing = new RijndaelBlock(keyarr, 'cbc');
  const decrypted = new Uint8Array(decrypterthing.decrypt(data, 256, iv));
  const save = (new TextDecoder().decode(decrypted));
  return save;
}

let content = {
  text: undefined,
  json: {
    TODO: 'Load File Above'
  }
}

const editor = new JSONEditor({
  target: document.getElementById('jsoneditor'),
  props: {
    content,
    onChange: (updatedContent, previousContent, { contentErrors, patchResult }) => {
      // content is an object { json: JSONValue } | { text: string }
      // console.log('onChange', { updatedContent, previousContent, contentErrors, patchResult })
      content = updatedContent
    }
  }
})

// Function to handle file loading
function handleFileSelect(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = async function(event) {
    const data = event.target.result;
    const parsedData = parseSaveFile(data);

    parsedData.save_file_0.progress_data = await parseProgressData(parsedData.save_file_0.progress_data)

    // document.getElementById("decrypted").value = JSON.stringify(parsedData, null, 2);
    content.json = parsedData;
    editor.set(content)
  };

  reader.readAsText(file);
}

function concatTypedArrays(a, b) { // a, b TypedArray of same type
  var c = new (a.constructor)(a.length + b.length);
  c.set(a, 0);
  c.set(b, a.length);
  return c;
}

function Uint8ToString(u8a) {
  var CHUNK_SZ = 0x8000;
  var c = [];
  for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
  }
  return c.join("");
}

// Add event listener to file input element
document.getElementById('file-input').addEventListener('change', handleFileSelect, false);

function downloadObjectAsJson(exportObj, exportName) {
  var dataStr = "data:text;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj).replace(/"/g, "").replace(/,/g, ",\n"));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

async function download_save() {
  let slimjsontoencrypt = JSON.stringify(
    content.json.save_file_0.progress_data)
    .replace(/"([^,]+?)"/g, "$1")
    .replace(/false/gi, "False")
    .replace(/true/gi, "True")
    .replace(/0\.00000([1-9])(\d+)/g, "$1.$2E-06")

  let slimjsonencoded = new TextEncoder().encode(slimjsontoencrypt);

  let padding = slimjsonencoded.length % 32;
  if (padding != 0) {
    padding = 32 - padding;
    let padarray = new Uint8Array(padding);
    for (let i = 0; i < padding; i++) padarray[i] = padding;
    slimjsonencoded = concatTypedArrays(slimjsonencoded, padarray);
  }


  let encrypted = new Uint8Array(decrypterthing.encrypt(slimjsonencoded
    , 256, iv));
  encrypted = btoa(Uint8ToString(concatTypedArrays(concatTypedArrays(salt, iv), encrypted)));
  const output = new Object(content.json);
  output.save_file_0.progress_data = encrypted
  downloadObjectAsJson(output, "primary_save.txt")
}

document.getElementById('save').addEventListener('click',
  download_save, false)