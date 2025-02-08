const axios = require("axios");
const cheerio = require("cheerio");

exports.handler = async (event) => {
    try {
        const targetUrl = "https://www.onerugged.com/"; // Change this to the site you want to scrape
        const { data } = await axios.get(targetUrl);

        const $ = cheerio.load(data);
        const title = $("div.nbame").first().text(); // Extract first <h1> as example

        let htmlResponse = "";

        $(".li2 .navboxItem .blx_list ul li").each((index, element) => {
            const title = $(element).find(".nbame").text().trim();
            const imageUrl = $(element).find(".images img").attr("src");
            const relativeLink = $(element).find("a").attr("href");
            const productLink = `https://www.onerugged.com${relativeLink}`; // Convert relative to absolute URL
            const fullImageUrl = `https://www.onerugged.com${imageUrl}`; // Convert image path to absolute

            htmlResponse += `
                <div class="bg-white shadow-lg">
                    <img src="${fullImageUrl}" alt="${title}"
                        class="w-full h-40 object-cover mb-4">
                    <div class="p-6">
                        <h3 class="text-2xl font-semibold mb-4">${title}</h3>
                        <a href="${productLink}" class="text-yellow-700 font-semibold hover:underline">Dowiedz się więcej</a>
                    </div>
                </div>
            `;
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/html" },
            body: htmlResponse,
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
