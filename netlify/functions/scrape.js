const axios = require("axios");
const cheerio = require("cheerio");

exports.handler = async (event) => {
    try {
        const targetUrl = "https://www.onerugged.com/"; // Change this to the site you want to scrape
        const { data } = await axios.get(targetUrl);

        const $ = cheerio.load(data);
        const title = $("h1").first().text(); // Extract first <h1> as example

        let htmlResponse = `
                <div class="bg-white p-6 shadow-lg">
                    <img src="https://www.onerugged.com/upload/goods/2023-03/6421030a5a5ef.jpg" alt="Produkt 1"
                        class="w-full h-40 object-cover mb-4">
                    <h3 class="text-2xl font-semibold mb-4">${title}</h3>
                    <p>Opis produktu 1. Wytrzymałe urządzenie idealne do pracy w trudnych warunkach.</p>
                    <a href="#" class="text-yellow-700 font-semibold hover:underline">Dowiedz się więcej</a>
                </div>
        `

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/html" },
            body: htmlResponse,
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
