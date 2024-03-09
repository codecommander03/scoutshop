import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapeAmazonProduct(url: string) {
    if (!url) return;

    // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_b2f0ab29-zone-scoutshop:y3ow1n5ooqxp -k https://lumtest.com/myip.json

    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = (Math.random() * 1000000) | 0;
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }

    try {
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);

        const title = $('#productTitle').text().trim();

        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            $('.a-price.a-text-price'),
        );

        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        );

        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        const images =
            $("#imgBlkFront").attr("data-a-dynamic-image") ||
            $("#landingImage").attr("data-a-dynamic-image") ||
            '{}';
        
        const imageUrls = Object.keys(JSON.parse(images));
        
        const currency = extractCurrency($('.a-price-symbol'));

        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");

        const description = extractDescription($);

        const data = {
            url,
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            isOutOfStock: outOfStock,
            image: imageUrls[0],
            currency: currency || '₹',
            discountRate: Number(discountRate) || 0,
            description,
            priceHistory: [],

            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: (Number(currentPrice) || Number(originalPrice)),

            category: '',
            stars: 0,
            reviewCount: 0,
        };

        return data;
    } catch (error: any) {
        throw new Error('Failed to scrape product: ${error.message}');
    }
};
