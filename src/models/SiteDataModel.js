export class SiteDataModel {
  constructor(data) {
    this.brandName = data.brandName || '';
    this.tagline = data.tagline || '';
    this.heroHeadline = data.heroHeadline || '';
    this.heroDescription = data.heroDescription || '';
    this.heroImages = data.heroImages || [];
    this.ctaText = data.ctaText || '';
    this.ctaHref = data.ctaHref || '#';
    this.sectionTitles = data.sectionTitles || {};
    this.footer = data.footer || {};
    this.contact = data.contact || {};
    this.year = data.year || new Date().getFullYear();
  }
}
