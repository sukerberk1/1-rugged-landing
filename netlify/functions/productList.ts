import axios from "axios";
import * as cheerio from "cheerio";

enum DeviceCategory {
  Tablets = "Wytrzymałe Tablety",
  Notebooks = "Wytrzymałe Notebooki",
  PanelPC = "Komputery Panel PC",
  Handheld = "Wytrzymałe urządzenia Handheld",
  Other = "Inne"
}

interface Device {
  title: string;
  imageUrl: string;
  productLink: string;
  category: DeviceCategory;
  source: "scraped" | "manual";
}

const manualDevices: Device[] = [
  {
    title: "M10A",
    imageUrl: "https://www.onerugged.com/upload/goods/2023-05/646eb7f469963.png",
    productLink: "https://www.onerugged.com/productinfo17.html",
    category: DeviceCategory.Tablets,
    source: "manual"
  },
  {
    title: "P21A",
    imageUrl: "https://www.onerugged.com/upload/goods/2024-03/65f14eea5b0a8.png",
    productLink: "https://www.onerugged.com/productinfo36.html",
    category: DeviceCategory.PanelPC,
    source: "manual"
  }
];

const categories = [
  DeviceCategory.Tablets,
  DeviceCategory.Notebooks,
  DeviceCategory.PanelPC,
  DeviceCategory.Handheld
];

function getCategoryForDevice(title: string): DeviceCategory {
  switch (title) {
    case "M14A":
    case "M14M":
    case "M10T":
    case "M20A":
      return DeviceCategory.Tablets;
    case "N14A":
    case "N14M":
    case "N15A":
    case "N15M":
      return DeviceCategory.Notebooks;
    case "H68T":
      return DeviceCategory.Handheld;
    default:
      return DeviceCategory.Other;
  }
}

export const handler = async (event: any) => {
  try {
    const targetUrl = "https://www.onerugged.com/";
    const { data } = await axios.get(targetUrl);
    const $ = cheerio.load(data);

    const scrapedDevices: Device[] = [];
    $(".li2 .navboxItem .blx_list ul li").each((_, element) => {
      const title = $(element).find(".nbame").text().trim();
      const imageUrl = `https://www.onerugged.com${$(element).find(".images img").attr("src")}`;
      const relativeLink = $(element).find("a").attr("href");
      const productLink = `https://www.onerugged.com${relativeLink}`;
      const category = getCategoryForDevice(title);
      scrapedDevices.push({ title, imageUrl, productLink, category, source: "scraped" });
    });

    // Combine and group devices by category
    let allDevices: Device[] = [...scrapedDevices, ...manualDevices];

    // Move M10T to the end
    const m10tIndex = allDevices.findIndex(device => device.title === "M10T");
    if (m10tIndex > -1) {
      const m10tDevice = allDevices.splice(m10tIndex, 1)[0];
      allDevices.push(m10tDevice);
    }

    let htmlResponse = "";
    for (const category of categories) {
      htmlResponse += `
        <div style="grid-column: 1/-1;">
            <h2 class="font-semibold text-2xl mb-4 mt-10">${category}</h2>
            <hr/>
        </div>
      `;
      allDevices.filter(device => device.category === category).forEach(device => {
        htmlResponse += `
          <div class="bg-white shadow-lg" data-aos="fade-up" data-aos-anchor-placement="bottom-bottom">
              <img src="${device.imageUrl}" alt="${device.title}"
                  class="w-full h-40 object-contain mb-4">
              <div class="p-6">
                  <h3 class="text-2xl font-semibold mb-4">${device.title}</h3>
                  <a href="/product?url=${device.productLink}" class="text-yellow-700 font-semibold hover:underline">Dowiedz się więcej</a>
              </div>
          </div>
        `;
      });
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: htmlResponse,
    };
  } catch (error: any) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
