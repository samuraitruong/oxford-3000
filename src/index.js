import axios from "axios";
import fs from "fs-extra";
import cheerio from "cheerio";
import tinyAsyncPool from "tiny-async-pool";

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

async function download5000WordList() {
  const res = await axios.get(
    "https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000"
  );
  const $ = cheerio.load(res.data);
  const items = $("#wordlistsContentPanel .top-g li").toArray();
  const words = items.map((x) => ({
    word: $("a", x).text().trim(),
    sound: {
      uk: [
        $(".pron-uk", x).attr("data-src-mp3"),
        $(".pron-uk", x).attr("data-src-ogg"),
      ],
      us: [
        $(".pron-us", x).attr("data-src-mp3"),
        $(".pron-us", x).attr("data-src-ogg"),
      ],
    },
  }));

  const iteratorFn = async (item) => {
    const files = [...item.sound.us, ...item.sound.uk].filter(Boolean);
    for await (const file of files) {
      const filename = file.split("/").pop();
      const filePath = "data/media/" + filename;
      if (!fs.existsSync(filePath)) {
        console.log("download", file);
        const r = await axios.get(
          `https://www.oxfordlearnersdictionaries.com${file}`,
          { responseType: "arraybuffer" }
        );
        fs.writeFileSync(filePath, r.data);
      }
    }
    return item.word;
  };

  // console.log(words)
  fs.writeJsonSync("./data/oxford-5000.json", words, { spaces: 4 });

  for await (const value of tinyAsyncPool(25, words, iteratorFn)) {
    console.log(value);
  }

  // fs.writeFileSync('a.html', res.data)
}

async function download3000WordList() {
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
  fs.writeJSONSync("./data/oxford-3000.json", finalResults, { spaces: 4 });
}

async function main() {
  await download5000WordList();
  await download3000WordList(); // legacy
}

main();
