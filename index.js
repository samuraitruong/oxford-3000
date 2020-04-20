import axios from "axios";
import fs from "fs-extra";
import cheerio from "cheerio";

const ROOT_URL =
  "https://www.oxfordlearnersdictionaries.com/wordlist/american_english/oxford3000";
async function getHtml(url) {
  try {
    console.log("URL", url);
    const { data } = await axios.get(url);
    return data;
  } catch (err) {
    console.error("URL ERROR: ", url);
    throw err;
  }
}
function parseWordList(html) {
  const $ = cheerio.load(html);
  const wordlist = $("#entrylist1 ul li a")
    .toArray()
    .map((x) => $(x).text());
  return wordlist;
}
async function getSession(sessionName) {
  const sectionUrl = `${ROOT_URL}/Oxford3000_${sessionName}`;
  let html = await getHtml(sectionUrl);
  const $ = cheerio.load(html);
  const links = $(".paging_links a")
    .toArray()
    .map((x) => $(x).attr("href"));
  let wordlist = parseWordList(html);
  for (const link of new Set(links).values()) {
    html = await getHtml(link);
    wordlist = wordlist.concat(parseWordList(html));
  }
  return wordlist;
}
async function main() {
  const rootHtml = await getHtml(ROOT_URL);
  const $ = cheerio.load(rootHtml);
  const sections = $("#entries-selector li")
    .toArray()
    .map((s) => $(s).text());

  const promises = sections.map((x) => getSession(x));
  const results = await Promise.all(promises);
  let finalResults = [];
  results.forEach((arr) => {
    finalResults = finalResults.concat(arr);
  });
  finalResults.sort();
  // const set = new Set(finalResults);
  console.log("finalResults", finalResults);
  fs.writeJSONSync("oxford-3000.json", finalResults, { spaces: 4 });
}

main();
