import * as helpers from "./helpers.js";

new Vue({
	el: "#search-app",
	data() {
		return {
			indexName: "Production",
			searchClient: algoliasearch("3VY17DELF4", "455080cdf8c3e2f23fd7d106fac363c7"),
			maxRating: 5
		};
	},
	created() {
		this.onKeyUp = event => {
			if (event.key !== "Escape") {
				return;
			}
			this.closeFilters();
		};

		this.onClick = event => {
			if (event.target !== this.header) {
				return;
			}

			this.closeFilters();
		};
	},
	mounted() {
		this.resultsContainer = document.querySelector(".container-results");
		this.header = document.querySelector("#header");
	},
	methods: {
		formatCurrency(value) {
			return new Intl.NumberFormat("en-CA", {
				style: "currency",
				currency: "CAD",
				maximumFractionDigits: 2
			}).format(value);
		},
		toValue(value, range) {
			return [typeof value.min === "number" ? value.min : range.min, typeof value.max === "number" ? value.max : range.max];
		},
		openFilters() {
			document.body.classList.add("filtering");
			window.scrollTo(0, 0);
			window.addEventListener("keyup", this.onKeyUp);
			window.addEventListener("click", this.onClick);
		},
		closeFilters() {
			document.body.classList.remove("filtering");
			this.resultsContainer.scrollIntoView();
			window.removeEventListener("keyup", this.onKeyUp);
			window.removeEventListener("click", this.onClick);
		},
		getProductImageSrc(item) {
			return helpers.isProductVariant(item)
				? helpers.buildProductVariantImageSrc(item.manufacturerName, item.sku)
				: helpers.buildProductImageSrc(item.productID);
		},
		getProductLinkUrl(item) {
			return helpers.isProductVariant(item)
				? helpers.buildProductVariantLinkUrl(item.sku, item.manufacturerName, item.variantID)
				: helpers.buildProductLinkUrl(item.productName, item.productID);
		}
	}
});
