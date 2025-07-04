import axios from "axios";
import * as cheerio from "cheerio";
import * as deepl from "deepl-node";
import { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";

const downloads = [
    {
        product: "M14M",
        spec: "https://drive.google.com/file/d/1MQGz3ZSu2Vly0RhFHYVF9T-YKZMoPiwz/view?usp=sharing"
    },
    {
        product: "M10A",
        spec: "https://drive.google.com/file/d/1ecpnjAkZATOMsCeDT-OTZMrIji1yj4Qw/view?usp=sharing"
    },
    {
        product: "M10T",
        spec: "https://drive.google.com/file/d/1Aox2EQlUNjFYk6OP6oi2aXqLcJSilsuf/view?usp=sharing"
    },
    {
        product: "M20A",
        spec: "https://drive.google.com/file/d/1tnekYiFo5TrcogCLhkCpXnQeXSNZQxa9/view?usp=sharing",
        drivers: "https://drive.google.com/file/d/1VEZWD75rGS2ZnHaJJP1MS_emKCaRFZy1/view?usp=sharing"
    },
    {
        product: "M14A",
        spec: "https://drive.google.com/file/d/1E_IaVkn0qaj3sZQ04CXSFp0CV5NuYlmw/view?usp=sharing"
    },
    {
        product: "N14A",
        spec: "https://drive.google.com/file/d/125SkiQnOP2DlgknxQEGnS-8SOQ-uOBjC/view?usp=sharing"
    },
    {
        product: "N14M",
        spec: "https://drive.google.com/file/d/1jPkv_HZm-H4tmHve1doIa9MyJT_hIOyW/view?usp=sharing",
        drivers: "https://drive.google.com/file/d/1g11eavcqdtRWovvAhU4q2zQL4weuQ7Ld/view?usp=sharing"
    },
    {
        product: "N15A",
        spec: "https://drive.google.com/file/d/1dJSOH5Hwn87aQGiI1gsXUx1retPH869C/view?usp=sharing"
    },
    {
        product: "N15M",
        spec: "https://drive.google.com/file/d/1gmfgIOfc6EMI2_VtZPbjcyevIWkIE72f/view?usp=sharing"
    }
]

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
    try {
        // Get product URL from query parameters
        const productUrl = event.queryStringParameters?.url;
        if (!productUrl) {
            return { statusCode: 400, body: "Missing product URL!" };
        }

        // Fetch the product page
        const { data } = await axios.get(productUrl);
        const $ = cheerio.load(data);

        let htmlResponse = "";

        // append hero section
        const title = $("div.tit span").first().text().trim();
        // body > div.productSwiper.swiper-container-initialized.swiper-container-horizontal > ul > li > div > img
        console.log($(".productSwiper").find("img").eq(0));
        let mainImgUrl = "https://www.onerugged.com" + $(".productSwiper").find("img").eq(0).attr("src");

        htmlResponse += `
        <section class="relative w-screen h-64" id="hero">
            <div class="absolute top-0 left-0 w-full bg-yellow-500 bg-opacity-50 z-50 text-white">
                <div class="p-3 w-full flex justify-around">
                    <div class="inline-flex items-center gap-2 flex-wrap">
                        <img src="/assets/svg/mail.svg" alt="Mail" class="w-6" /> Kontakt: <a href="mailto:info@1rugged.pl">info@1rugged.pl</a>
                    </div>
                    <div class="inline-flex items-center gap-2 flex-wrap">
                        <img src="/assets/svg/telephone.svg" alt="Mail" class="w-6" /> Telefon: <span>+48 453 230 603</span>
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

        htmlResponse += renderDownloads(title);

        // append footer section
        htmlResponse += renderFooter();

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/html" },
            body: htmlResponse,
        };
    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    function renderDownloads(title: string) {
        // find the product in downloads array
        const product = downloads.find(p => title.includes(p.product));
        let renderedResponse = "";
        
        if (product) {
            const downloadLinks: string[] = [];
            
            if (product.spec) {
                downloadLinks.push(`<li><a href="${product.spec}" class="text-blue-600 underline">Specyfikacja techniczna ${product.product}</a></li>`);
            }
            
            if (product.drivers) {
                downloadLinks.push(`<li><a href="${product.drivers}" class="text-blue-600 underline">Aktualne sterowniki ${product.product}</a></li>`);
            }
            
            if (downloadLinks.length > 0) {
                renderedResponse += `
                <section class="container mx-auto px-4 py-12">
                    <h2 class="text-2xl">Do pobrania</h2>
                    <hr class="my-8"/>
                    <div class="space-y-4">
                        <ul class="list-disc pl-6">
                            ${downloadLinks.join('\n')}
                        </ul>
                    </div>
                </section>
                `;
            }
        }
        return renderedResponse;
    }

    function renderFooter() {
        return `
        <footer class="relative bg-yellow-950 pt-8 pb-6 text-white">
            <div class="container mx-auto px-4">
                <div class="flex flex-wrap text-left lg:text-left">
                    <div class="w-full lg:w-6/12 px-4 space-y-5">
                        <h4 class="text-3xl font-semibold text-gray-100">Skontaktuj się z nami, aby omówić swoje
                            potrzeby dotyczące wytrzymałych urządzeń</h4>
                        <p class="mt-5">Poniżej znajdziesz przydatne informacje kontaktowe</p>
                        <div class="px-4 ml-auto">
                            <ul class="list-unstyled text-sm space-y-6 mt-4 text-gray-100 font-semibold">
                                <li>
                                    Mail kontaktowy - informacja: <a href="mailto:info@1rugged.pl"
                                        class="underline">info@1rugged.pl</a>
                                        <p class="text-gray-300">Preferowany adres e-mail do kontaktu w sprawie dostępnej oferty.</p>
                                </li>
                                <li>
                                    Mail kontaktowy - serwis: <a href="mailto:serwis@1rugged.pl"
                                        class="underline">serwis@1rugged.pl</a>
                                        <p class="text-gray-300">Preferowany adres e-mail do kontaktu w sprawie serwisowania urządzeń.</p>
                                </li>
                                <li>
                                    Dystrybutorem urządzeń ONErugged w Polsce jest firma LITEKO
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="w-full lg:w-6/12 px-4">
                        <div class="flex flex-wrap items-top mb-6">
                            <div class="w-full lg:w-4/12 px-4 ml-auto mt-12 lg:mt-0">
                                <span class="block uppercase text-blueGray-500 text-sm font-semibold mb-2">Nawigacja</span>
                                <ul class="list-unstyled">
                                    <li>
                                        <a class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                                            href="#hero">Przewiń do góry</a>
                                    </li>
                                    <li>
                                        <a class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                                            href="#use-cases">Zastosowania</a>
                                    </li>
                                    <li>
                                        <a class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                                            href="#products">Produkty</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="w-full lg:w-4/12 px-4 mt-12 lg:mt-0">
                                <span class="block uppercase text-blueGray-500 text-sm font-semibold mb-2">Inne linki</span>
                                <ul class="list-unstyled">
                                    <li>
                                        <a class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                                            href="https://www.onerugged.com/">Producent urządzeń ONErugged</a>
                                    </li>
                                    <li>
                                        <a class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                                            href="mailto:info@1rugged.pl">Kontakt - informacje</a>
                                    </li>
                                    <li>
                                        <a class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                                            href="mailto:serwis@1rugged.pl">Kontakt - serwis</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <hr class="my-6 border-blueGray-300">
                <div class="flex flex-wrap items-center md:justify-between justify-center">
                    <div class="w-full md:w-4/12 px-4 mx-auto text-center">
                        <div class="text-sm text-blueGray-500 font-semibold py-1">
                            Copyright © <span id="get-current-year">2025</span> LITEKO / 1rugged
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        `;
    }
};
