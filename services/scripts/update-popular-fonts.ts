interface GoogleFonts {
  axisRegistry: unknown[],
  familyMetadataList: {
    family: string,
    popularity: number
  }[]
}

using file = Deno.openSync("services/assets/font_popularity.txt", { write: true });
const response = await fetch('https://fonts.google.com/metadata/fonts')
const googleFonts = await response.json() as GoogleFonts;

const fonts = googleFonts.familyMetadataList
.sort((a, b) => a.popularity - b.popularity)
.map(font => font.family)
.join(',')

const encoder = new TextEncoder();
const data = encoder.encode(fonts);

file.writeSync(data);
