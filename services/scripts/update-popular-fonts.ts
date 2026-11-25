interface FontSourceList {
    /*id: string,*/
    family: string,
    /*lastModified: number*/
}

using file = Deno.openSync("services/assets/font_popularity.txt", { write: true });
const response = await fetch('https://api.fontsource.org/v1/fonts')
const fontSourceList = await response.json() as FontSourceList;

const fonts = fontSourceList
/*.sort((a, b) => a.lastModified - b.lastModified)*/
.map(font => font.family)
.join(',')

const encoder = new TextEncoder();
const data = encoder.encode(fonts);

file.writeSync(data);
