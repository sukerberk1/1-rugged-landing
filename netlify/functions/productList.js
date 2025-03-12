const axios = require("axios");
const cheerio = require("cheerio");

const deviceCategories = [
    { categoryName: "Wytrzymałe Tablety", categoryDevices: ["M14A", "M14M", "M10A", "M10T", "M20A"] },
    { categoryName: "Wytrzymałe Notebooki", categoryDevices: ["N14A", "N14M", "N15A", "N15M"] },
    { categoryName: "Komputery Panel PC", categoryDevices: ["P21A"] },
    { categoryName: "Wytrzymałe urządzenia Handheld", categoryDevices: ["H68T"] },
];

exports.handler = async (event) => {
    try {
        const targetUrl = "https://www.onerugged.com/";
        const { data } = await axios.get(targetUrl);

        const $ = cheerio.load(data);

        const allDevices = [];

        $(".li2 .navboxItem .blx_list ul li").each((index, element) => {
            const title = $(element).find(".nbame").text().trim();
            const imageUrl = $(element).find(".images img").attr("src");
            const relativeLink = $(element).find("a").attr("href");
            const productLink = `https://www.onerugged.com${relativeLink}`; // Convert relative to absolute URL
            const fullImageUrl = `https://www.onerugged.com${imageUrl}`; // Convert image path to absolute
            
            allDevices.push({ title, fullImageUrl, productLink });
        });

        let htmlResponse = "";

        deviceCategories.forEach((category) => {
            htmlResponse += `
            <div style="grid-column: 1/-1;">
                <h2 class="font-semibold text-2xl mb-4 mt-10">${category.categoryName}</h2>
                <hr/>
            </div>
            `;

            allDevices.filter(o => category.categoryDevices.includes(o.title)).forEach((device) => {
                htmlResponse += `
                <div class="bg-white shadow-lg" data-aos="fade-up" data-aos-anchor-placement="bottom-bottom">
                    <img src="${device.fullImageUrl}" alt="${device.title}"
                        class="w-full h-40 object-contain mb-4">
                    <div class="p-6">
                        <h3 class="text-2xl font-semibold mb-4">${device.title}</h3>
                        <a href="/product?url=${device.productLink}" class="text-yellow-700 font-semibold hover:underline">Dowiedz się więcej</a>
                    </div>
                </div>
            `;
            });
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
