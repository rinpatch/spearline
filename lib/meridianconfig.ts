export interface SiteConfig {
  sourceId: string;
  sourceName: string;
  baseUrl: string;
  fetchStrategy: 'static' | 'dynamic';
  discovery: {
    type: 'links' | 'sitemap';
    startUrls: string[];
    urlPattern: RegExp;
  };
  pagination: {
    type: 'next_button' | 'numbered_list' | 'infinite_scroll' | 'none';
    selector?: string;
  };
  extraction: {
    titleSelector: string;
    contentSelector: string;
    dateSelector: string;
    elementsToRemove?: string[];
  };
}

export const siteConfigs: SiteConfig[] = [
  {
    sourceId: "bernama",
    sourceName: "Bernama",
    baseUrl: "https://www.bernama.com",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://www.bernama.com/en/"], urlPattern: /\/news\.php\?id=\d+/ },
    pagination: { type: 'next_button', selector: 'ul.pagination a.page-link[aria-label=Next]' },
    extraction: {
      titleSelector: 'h1',
      contentSelector: 'div#topstory + div.row',
      dateSelector: 'h1 + div:has(i.fa-regular.fa-clock)',
      elementsToRemove: ['div.d-flex', 'div.social-buttons']
    }
  },
  {
    sourceId: "malay_mail",
    sourceName: "Malay Mail",
    baseUrl: "https://www.malaymail.com",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://www.malaymail.com/"], urlPattern: /\/(news|money|sports|showbiz)\/.+/ },
    pagination: { type: 'next_button', selector: 'a.page-link[rel=next]' },
    extraction: {
      titleSelector: 'h1.article-title',
      contentSelector: 'div.article-body',
      dateSelector: 'div.article-date',
      elementsToRemove: ['p:contains("Advertisement")']
    }
  },
  {
    sourceId: "the_sun",
    sourceName: "The Sun",
    baseUrl: "https://thesun.my",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://thesun.my/local"], urlPattern: /malaysia-news\/.+/ },
    pagination: { type: 'next_button', selector: 'a.next.page-numbers' },
    extraction: {
      titleSelector: 'div.headline',
      contentSelector: 'div.text',
      dateSelector: '.date',
      elementsToRemove: ['.code-block', '.yarpp-related']
    }
  },
  {
    sourceId: "utusan_malaysia",
    sourceName: "Utusan Malaysia",
    baseUrl: "https://www.utusan.com.my",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://www.utusan.com.my/nasional/"], urlPattern: /\/berita\/\d{4}\/.+/ },
    pagination: { type: 'next_button', selector: 'div.page-nav a i.td-icon-menu-right' },
    extraction: {
      titleSelector: 'h1',
      contentSelector: '.elementor-widget-theme-post-content',
      dateSelector: '.elementor-element-5aef1b6d > div:nth-child(1) > ul:nth-child(1) > li:nth-child(2)',
      elementsToRemove: ['.td-g-rec', 'div.td-post-sharing-bottom']
    }
  },
 {
    sourceId: "harakah",
    sourceName: "Harakah",
    baseUrl: "https://harakahdaily.net",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://harakahdaily.net/"], urlPattern: /\/\d{4}\/\d{2}\/.+/ },
    pagination: { type: 'next_button', selector: 'a.page-nav-next' },
    extraction: {
      titleSelector: '.entry-title',
      contentSelector: '.td-post-content',
      dateSelector: '.td-post-date',
      elementsToRemove: ['.td-g-rec', 'div.td-post-sharing-bottom']
    }
  },
  {
    sourceId: "sin_chew",
    sourceName: "Sin Chew Daily",
    baseUrl: "https://www.sinchew.com.my",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://www.sinchew.com.my/"], urlPattern: /.+\/\d{8}/ },
    pagination: { type: 'next_button', selector: 'a.next' },
    extraction: {
      titleSelector: '.article-page-title',
      contentSelector: '.article-page-content',
      dateSelector: '.time',
      elementsToRemove: ['.advertisement']
    }
  },
  {
    sourceId: "china_press",
    sourceName: "China Press",
    baseUrl: "https://www.chinapress.com.my",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://www.chinapress.com.my/"], urlPattern: /.+\/\d{8}/ },
    pagination: { type: 'next_button', selector: 'a.next.page-numbers' },
    extraction: {
      titleSelector: '.article-page-main-title',
      contentSelector: '.article-page-post-content',
      dateSelector: '.post_date_meta',
      elementsToRemove: ['.adv-wrapper', '.recommended-post']
    }
  }
];
