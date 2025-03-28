const axios = require("axios");
const cheerio = require("cheerio");

const deviceCategories = [
    { 
        categoryName: "Wytrzymałe Tablety", 
        categoryDevices: ["M14A", "M14M", "M10T", "M20A"],
        manuallyAdded: [
            {
                name: "M10A",
                imageUrl: "https://www.onerugged.com/upload/goods/2023-05/646eb7f469963.png",
                productLink: "https://www.onerugged.com/productinfo17.html"
            }
        ]
    },
    { 
        categoryName: "Wytrzymałe Notebooki", 
        categoryDevices: ["N14A", "N14M", "N15A", "N15M"],
        manuallyAdded: []
    },
    { 
        categoryName: "Komputery Panel PC", 
        categoryDevices: [],
        manuallyAdded: [
            {
                name: "P21A",
                imageUrl: "https://www.onerugged.com/upload/goods/2024-03/65f14eea5b0a8.png",
                productLink: "https://www.onerugged.com/productinfo36.html"
            }
        ]
    },
    { 
        categoryName: "Wytrzymałe urządzenia Handheld", 
        categoryDevices: ["H68T"],
        manuallyAdded: []
    }
];

exports.handler = async (event) => {
    try {
        const targetUrl = "https://www.onerugged.com/";
        const { data } = await axios.get(targetUrl);

        const $ = cheerio.load(data);

        const allDevices = [];

        // fetch info for category devices and add them to allDevices array
        $(".li2 .navboxItem .blx_list ul li").each((index, element) => {
            const title = $(element).find(".nbame").text().trim();
            const imageUrl = $(element).find(".images img").attr("src");
            const relativeLink = $(element).find("a").attr("href");
            const productLink = `https://www.onerugged.com${relativeLink}`; // Convert relative to absolute URL
            const fullImageUrl = `https://www.onerugged.com${imageUrl}`; // Convert image path to absolute
            
            allDevices.push({ title, fullImageUrl, productLink });
        });

        // add manually added devices
        deviceCategories.forEach((category) => {
            category.manuallyAdded.forEach((device) => {
                allDevices.push({ title: device.name, fullImageUrl: device.imageUrl, productLink: device.productLink });
            });
        });

        // move M10T to the end
        const m10tIndex = allDevices.findIndex(device => device.title === "M10T");
        if (m10tIndex > -1) {
            const m10tDevice = allDevices.splice(m10tIndex, 1)[0];
            allDevices.push(m10tDevice);
        }

        let htmlResponse = "";

        deviceCategories.forEach((category) => {
            htmlResponse += `
            <div style="grid-column: 1/-1;">
                <h2 class="font-semibold text-2xl mb-4 mt-10">${category.categoryName}</h2>
                <hr/>
            </div>
            `;

            allDevices.filter(o => category.categoryDevices.includes(o.title) || category.manuallyAdded.map(x => x.name).includes(o.title))
            .forEach((device) => {
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
