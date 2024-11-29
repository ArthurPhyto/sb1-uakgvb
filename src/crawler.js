import axios from 'axios';
import * as cheerio from 'cheerio';
import chalk from 'chalk';
import { lookupDomain } from './domainChecker.js';
import { extractDomain, isValidUrl } from './utils.js';

const crawledUrls = new Set();
const foundDomains = new Set();

export async function startCrawler(startUrl, callbacks) {
  const { onUrlCrawled, onExpiredDomain } = callbacks;
  
  if (!isValidUrl(startUrl)) {
    throw new Error('URL invalide');
  }

  await crawlUrl(startUrl, onUrlCrawled, onExpiredDomain);
}

async function crawlUrl(url, onUrlCrawled, onExpiredDomain) {
  if (crawledUrls.has(url)) return;
  crawledUrls.add(url);

  try {
    console.log(chalk.blue(`Crawling: ${url}`));
    onUrlCrawled(url);

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const links = $('a')
      .map((_, element) => $(element).attr('href'))
      .get()
      .filter(href => href && isValidUrl(href));

    for (const link of links) {
      const domain = extractDomain(link);
      
      if (domain && !foundDomains.has(domain)) {
        foundDomains.add(domain);
        const isExpired = await lookupDomain(domain);
        
        if (isExpired) {
          console.log(chalk.green(`Domaine expiré trouvé: ${domain}`));
          onExpiredDomain(domain);
        }
      }

      if (link.startsWith(url)) {
        await crawlUrl(link, onUrlCrawled, onExpiredDomain);
      }
    }
  } catch (error) {
    console.error(chalk.red(`Erreur lors du crawl de ${url}: ${error.message}`));
  }
}