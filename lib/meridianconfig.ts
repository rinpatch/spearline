export interface SiteConfig {
  sourceId: string;
  sourceName: string;
  baseUrl: string;
  fetchStrategy: 'static' | 'dynamic';
  discovery: {
    type: 'links' | 'sitemap';
    startUrls: string;
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
    elementsToRemove?: string;
  };
}

export const siteConfigs: SiteConfig =, urlPattern: /\/news\.php\?id=\d+/ },
    pagination: { type: 'next_button', selector: 'ul.pagination a.page-link[aria-label=Next]' },
    extraction: {
      titleSelector: 'h1.h1-custom',
      contentSelector: 'div.news-content',
      dateSelector: 'p.text-muted small',
      elementsToRemove: ['div.d-flex', 'div.social-buttons']
    }
  },
  {
    sourceId: "malaysiakini",
    sourceName: "Malaysiakini",
    baseUrl: "https://www.malaysiakini.com",
    fetchStrategy: 'dynamic', // Requires headless browser for JS rendering and infinite scroll
    discovery: { type: 'links', startUrls: ["https://www.malaysiakini.com/news", "https://www.malaysiakini.com/columns"], urlPattern: /\/(news|columns)\/\d+/ },
    pagination: { type: 'infinite_scroll' },
    extraction: {
      titleSelector: 'h1[itemprop=headline]',
      contentSelector: 'div.prose',
      dateSelector: 'time[datetime]',
      elementsToRemove: ['div.mb-4.text-sm', 'aside']
    }
  },
  {
    sourceId: "the_star",
    sourceName: "The Star",
    baseUrl: "https://www.thestar.com.my",
    fetchStrategy: 'dynamic', // Often has bot protection
    discovery: { type: 'links', startUrls: ["https://www.thestar.com.my/news/nation"], urlPattern: /\/news\/(nation|world|aseanplus)\/\d{4}\/\d{2}\/\d{2}\/.+/ },
    pagination: { type: 'next_button', selector: 'a.next' },
    extraction: {
      titleSelector: 'h1.headline',
      contentSelector: 'div#story-body',
      dateSelector: 'p.date',
      elementsToRemove:
    }
  },
  {
    sourceId: "nst",
    sourceName: "New Straits Times",
    baseUrl: "https://www.nst.com.my",
    fetchStrategy: 'dynamic', // Fails static parsers
    discovery: { type: 'links', startUrls: ["https://www.nst.com.my/news/nation"], urlPattern: /\/news\/(nation|world|politics)\/\d{4}\/\d{2}\/.+/ },
    pagination: { type: 'next_button', selector: 'li.pager-next a' },
    extraction: {
      titleSelector: 'h1.article-title',
      contentSelector: 'div.field.field-name-field-body',
      dateSelector: 'div.article-meta span.created-date',
      elementsToRemove: ['div.embedded-entity', 'div.recommended-articles']
    }
  },
  {
    sourceId: "malay_mail",
    sourceName: "Malay Mail",
    baseUrl: "https://www.malaymail.com",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://www.malaymail.com/news/malaysia"], urlPattern: /\/(news|money|sports|showbiz)\/\d{4}\/\d{2}\/\d{2}\/.+/ },
    pagination: { type: 'next_button', selector: 'a.page-link[rel=next]' },
    extraction: {
      titleSelector: 'h1',
      contentSelector: 'article div.prose',
      dateSelector: 'time[datetime]',
      elementsToRemove: ['p:contains("Advertisement")']
    }
  },
  {
    sourceId: "the_sun",
    sourceName: "The Sun",
    baseUrl: "https://thesun.my",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://thesun.my/local"], urlPattern: /\/\d{4}\/\d{2}\/\d{2}\/.+/ },
    pagination: { type: 'next_button', selector: 'a.next.page-numbers' },
    extraction: {
      titleSelector: 'h1.entry-title',
      contentSelector: 'div.entry-content',
      dateSelector: 'span.posted-on time[datetime]',
      elementsToRemove: ['.code-block', '.yarpp-related']
    }
  },
  {
    sourceId: "fmt",
    sourceName: "Free Malaysia Today",
    baseUrl: "https://www.freemalaysiatoday.com",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://www.freemalaysiatoday.com/category/nation/"], urlPattern: /\/category\/(news|nation|world)\/\d{4}\/\d{2}\/\d{2}\/.+/ },
    pagination: { type: 'next_button', selector: 'div.page-nav a.next' },
    extraction: {
      titleSelector: 'h1.tdb-title-text',
      contentSelector: 'div.tdb-block-inner.td-fix-index',
      dateSelector: 'time.entry-date',
      elementsToRemove:
    }
  },
  {
    sourceId: "the_edge",
    sourceName: "The Edge",
    baseUrl: "https://theedgemalaysia.com",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://theedgemalaysia.com/news"], urlPattern: /\/node\/\d+/ },
    pagination: { type: 'next_button', selector: 'li.pager-next a' },
    extraction: {
      titleSelector: 'h1.page-title',
      contentSelector: 'div.post-content',
      dateSelector: 'span.date-display-single',
      elementsToRemove: ['div.news-detail_favourite_button_wrapper']
    }
  },
  {
    sourceId: "utusan_malaysia",
    sourceName: "Utusan Malaysia",
    baseUrl: "https://www.utusan.com.my",
    fetchStrategy: 'dynamic',
    discovery: { type: 'links', startUrls: ["https://www.utusan.com.my/nasional/"], urlPattern: /\/berita\/\d{4}\/.+/ },
    pagination: { type: 'next_button', selector: 'div.page-nav a i.td-icon-menu-right' },
    extraction: {
      titleSelector: 'h1.td-post-title',
      contentSelector: 'div.td-post-content',
      dateSelector: 'span.td-post-date time',
      elementsToRemove: ['.td-g-rec', 'div.td-post-sharing-bottom']
    }
  },
  {
    sourceId: "berita_harian",
    sourceName: "Berita Harian",
    baseUrl: "https://www.bharian.com.my",
    fetchStrategy: 'dynamic',
    discovery: { type: 'links', startUrls: ["https://www.bharian.com.my/berita/nasional"], urlPattern: /\/berita\/(nasional|dunia)\/\d{4}\/\d{2}\/.+/ },
    pagination: { type: 'next_button', selector: 'li.pager-next a' },
    extraction: {
      titleSelector: 'h1.article-title',
      contentSelector: 'div.field.field-name-field-body',
      dateSelector: 'div.article-meta span.created-date',
      elementsToRemove: ['div.embedded-entity', 'div.block-recommended-articles']
    }
  },
  {
    sourceId: "harian_metro",
    sourceName: "Harian Metro",
    baseUrl: "https://www.hmetro.com.my",
    fetchStrategy: 'dynamic',
    discovery: { type: 'links', startUrls: ["https://www.hmetro.com.my/mutakhir/nasional"], urlPattern: /\/mutakhir\/(nasional|global)\/\d{4}\/\d{2}\/.+/ },
    pagination: { type: 'next_button', selector: 'li.pager-next a' },
    extraction: {
      titleSelector: 'h1.article-title',
      contentSelector: 'div.field.field-name-field-body',
      dateSelector: 'div.article-meta span.created-date',
      elementsToRemove: ['div.embedded-entity']
    }
  },
  {
    sourceId: "sinar_harian",
    sourceName: "Sinar Harian",
    baseUrl: "https://www.sinarharian.com.my",
    fetchStrategy: 'dynamic',
    discovery: { type: 'links', startUrls: ["https://www.sinarharian.com.my/kategori/nasional"], urlPattern: /\/article\/\d+\/.+/ },
    pagination: { type: 'infinite_scroll' },
    extraction: {
      titleSelector: 'h1.title-detail',
      contentSelector: 'div#article-detail-content',
      dateSelector: 'div.author-section div.date',
      elementsToRemove: ['div.ad-unit', 'div.related-articles']
    }
  },
  {
    sourceId: "harakah",
    sourceName: "Harakah",
    baseUrl: "https://harakahdaily.net",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://harakahdaily.net/category/utama/"], urlPattern: /\/\d{4}\/\d{2}\/\d{2}\/.+/ },
    pagination: { type: 'next_button', selector: 'a.page-nav-next' },
    extraction: {
      titleSelector: 'h1.tdb-title-text',
      contentSelector: 'div.tdb-block-inner.td-fix-index',
      dateSelector: 'time.entry-date',
      elementsToRemove: ['.td-g-rec', 'div.td-post-sharing-bottom']
    }
  },
  {
    sourceId: "sin_chew",
    sourceName: "Sin Chew Daily",
    baseUrl: "https://www.sinchew.com.my",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://www.sinchew.com.my/category/nation/"], urlPattern: /\/.\/content_.\.html/ },
    pagination: { type: 'next_button', selector: 'a.next' },
    extraction: {
      titleSelector: 'h1.article-title',
      contentSelector: 'div.article-content',
      dateSelector: 'div.article-meta span.date',
      elementsToRemove: ['.advertisement']
    }
  },
  {
    sourceId: "china_press",
    sourceName: "China Press",
    baseUrl: "https://www.chinapress.com.my",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://www.chinapress.com.my/latest-news"], urlPattern: /\/.\/\d{8}-.+/ },
    pagination: { type: 'next_button', selector: 'a.next.page-numbers' },
    extraction: {
      titleSelector: 'div.article-header h1',
      contentSelector: 'div.article-content',
      dateSelector: 'div.article-meta span',
      elementsToRemove: ['.adv-wrapper', '.recommended-post']
    }
  },
  {
    sourceId: "nanyang",
    sourceName: "Nanyang Siang Pau",
    baseUrl: "https://www.nanyang.com",
    fetchStrategy: 'static',
    discovery: { type: 'links', startUrls: ["https://www.nanyang.com/news"], urlPattern: /\/main\/\d+\/.+/ },
    pagination: { type: 'next_button', selector: 'a.next.page-numbers' },
    extraction: {
      titleSelector: 'h1.post-title',
      contentSelector: 'div.post-content',
      dateSelector: 'span.post-date',
      elementsToRemove: ['.ads-in-post', 'div.jp-relatedposts']
    }
  }
];
