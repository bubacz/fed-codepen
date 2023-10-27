export function buildProductImageSrc(item) {
	return `https://es3s8h4u92.execute-api.ca-central-1.amazonaws.com/production/images/product/large/${item.productID}.jpg?width=400&quality=0.5`;
}

export function buildProductVariantImageSrc(item) {
	return `https://es3s8h4u92.execute-api.ca-central-1.amazonaws.com/production/images/SKU/large/${item.manufacturerSEName}/${item.seVariantSKU}.jpg?width=600&quality=0.5`;
}

export function buildProductLinkUrl(item) {
	return `/${item.productSEName}-p-${item.productID}.aspx`;
}

export function buildProductVariantLinkUrl(item) {
	return `/${item.seVariantSKU}-vp-${item.manufacturerSEName}-${item.manufacturerID}.aspx`;
}

export function debounce(func, timeout = 500) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
}
