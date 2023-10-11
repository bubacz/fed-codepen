
function toKebabCase(str) {
	return str.toLowerCase().replace(/\s+/g, "-");
}

export function isProductVariant(item) {
	return item.recordType === "ProductVariant";
}

export function buildProductImageSrc(productID) {
	return `https://es3s8h4u92.execute-api.ca-central-1.amazonaws.com/production/images/product/large/${productID}.jpg?width=400&quality=0.5`;
}

export function buildProductVariantImageSrc(manufacturerName, sku) {
	return `https://d30ec9xstuh8sw.cloudfront.net/images/SKU/large/${toKebabCase(manufacturerName)}/${sku}.jpg`;
}

export function buildProductLinkUrl(productName, productID) {
	return `/${toKebabCase(productName)}-p-${productID}.aspx`;
}

export function buildProductVariantLinkUrl(sku, manufacturerName, variantID) {
	// TODO: Figure out how to actually build this URL. This is currently just a placeholder for that doesn't work.
	return `/${sku}-vp-${toKebabCase(manufacturerName)}-${variantID}.aspx`;
}
