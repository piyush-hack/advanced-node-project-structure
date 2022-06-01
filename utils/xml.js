const moment = require("moment");
const fs = require("fs").promises;
const path = require("path");
const { create } = require("xmlbuilder2");
const companyModel = require("../modules/company/model");

let j = 1;
const getAllData = async () => {
  for (let i = 0; i < 2000000; i += 50000) {
    let companies;
    try {
      companies = await companyModel
        .find()
        .select("companyName _id companyCIN")
        .skip(i)
        .limit(50000);
    } catch (error) {
      return error;
    }
    console.log(companies.length);
    console.log(companies[companies.length - 1]);

    // Save the XML
    const root = create({ version: "1.0" })
      .ele("urlset")
      .txt(
        'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"'
      );
    for (const company of companies) {
      const companyNameArray = company.companyName.split(" ");
      const companyName = companyNameArray.join("-");
      root
        .ele("url")
        .ele("loc")
        .txt(
          `https://hexabull.com/company/${companyName}/CIN/${company.companyCIN}`
        )
        .up()
        .ele("lastmod")
        .txt(moment().format("YYYY-MM-DDTHH:mm:ss+00:00"))
        .up()
        .ele("priority")
        .txt("1.00")
        .up();
    }

    // convert the XML tree to string
    const xml = root.end({ prettyPrint: true });
    await fs.writeFile(path.join(__dirname, "..", `xml/company${j}.xml`), xml);
    j++;
  }
};

// getAllData();
