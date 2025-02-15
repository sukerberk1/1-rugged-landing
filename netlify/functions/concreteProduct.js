const axios = require("axios");
const cheerio = require("cheerio");
const deepl = require("deepl-node");

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

        let htmlResponse = "";

        // append hero section

        const title = $("div.tit span").first().text().trim();
        const mainImgUrl = "https://onerugged.com" + $(".productSwiper").find(".images img").attr("src");

        htmlResponse += `
        <section class="relative w-screen h-64" id="hero">
            <div class="absolute top-0 left-0 w-full bg-yellow-500 bg-opacity-50 z-50 text-white">
                <div class="p-3 w-full flex justify-around">
                    <div class="inline-flex items-center gap-2">
                        <img src="/assets/svg/mail.svg" alt="Mail" class="w-6 inline-block" /> Obsługa: <a href="mailto:serwis@1-rugged.pl">serwis@1-rugged.pl</a>
                    </div>
                    <div class="inline-flex items-center gap-2">
                        <img src="/assets/svg/telephone.svg" alt="Mail" class="w-6 inline-block" /> +48 123 456 789
                    </div>
                </div>
            </div>
            <img src="${mainImgUrl}" alt="hero-bg"
                class="w-full h-full object-cover">
            <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-30 backdrop-blur-sm">
                <div class="flex flex-col items-center justify-center h-full">
                    <div class="text-center max-w-4xl">
                        <h1 class="text-4xl font-semibold text-white">${title}</h1>
                    </div>
                </div>
            </div>
        </section>
        `;

        // append product overview section

        const description = $("div.detail1.block div.w1440 div.con.flex div.txt p").map((index, element) => $(element).text()).get().join(" ");

        const translator = new deepl.Translator("d6ef2641-5bbc-431c-9590-ab6c9070d5a1:fx");
        const localizedDescription = (await translator.translateText(description, "en", "pl", { formality: "prefer_more", splitSentences: "off" })).text;

        htmlResponse += `
        <section class="container mx-auto px-4 py-12">
                <h2 class="text-2xl">Urządzenie</h2>
                <hr class="my-8"/>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <img src="${mainImgUrl}" alt="product-image"
                            class="w-full h-full object-cover">
                    </div>
                    <div>
                        <h2 class="text-3xl font-semibold mb-2">${title}</h2>
                        <p>${localizedDescription}</p>
                        <div class="flex items-center gap-4 mt-4">
                            <a href="mailto:info@1rugged.pl"
                            class="bg-white text-black px-6 py-3 font-semibold hover:bg-yellow-700 hover:text-white transition-all duration-300 border border-yellow-700">Skontaktuj
                            się</a>
                        </div>
                    </div>
        </section>
        `;

        // append tech specification section

        htmlResponse += `
        <section class="container mx-auto px-4 py-12">
            <h2 class="text-2xl">Spefyfikacja techniczna</h2>
            <hr class="my-8"/>
            <div class="grid grid-cols-2 gap-4">
        `;

        $(".parameters .item").each((index, element) => {
            const title = $(element).find(".t").text().trim();
            const value = $(element).find(".p p").text().trim();
            if (title.includes("配")) { return; }
            htmlResponse += `
            <div class="font-semibold border-b-2 border-gray-200">${title}</div>
            <div class="border-b-2 border-gray-200">${value}</div>
            `;
        });

        htmlResponse += `
            </div>
        </section>
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
