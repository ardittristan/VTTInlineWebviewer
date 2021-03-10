const fs = require("fs");
const results = process.env.RESULTS.split(",");

let file = fs.readFileSync("README.md", "utf8");
results.forEach((result) => {
  if (result.includes("inlineviewer.js")) {
    file = file.replace(
      /(<!-- insert_js_url_start -->).*(<!-- insert_js_url_end -->)/gsu,
      `<!-- insert_js_url_start -->[inlineviewer.js](${result.split("=")[1]})<!-- insert_js_url_end -->`
    );
  } else if (result.includes("inlineViewer.html")) {
    file = file.replace(
      /(<!-- insert_html_url_start -->).*(<!-- insert_html_url_end -->)/gsu,
      `<!-- insert_html_url_start -->[inlineviewer.html](${result.split("=")[1]})<!-- insert_html_url_end -->`
    );
  }
});
fs.writeFileSync("README.md", file);
