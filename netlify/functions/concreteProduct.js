const axios = require("axios");
const cheerio = require("cheerio");

exports.handler = async (event) => {
    try {
        // Get product URL from query parameters
        const productUrl = event.queryStringParameters.url;
        if (!productUrl) {
            return { statusCode: 400, body: "Missing product URL!" };
        }

        // Fetch the product page
        const { data } = await axios.get(productUrl);
        const $ = cheerio.load(data);

        // Extract product details
        const title = $("div.tit span").first().text().trim();
        const description = $("div.txt div.p.wow p").first().text().substring(0, 100) + "...";

        // Generate HTML response (to be used by HTMX)
        let htmlResponse = `
            ${title} | ${description}
        `;

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/html" },
            body: htmlResponse,
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
