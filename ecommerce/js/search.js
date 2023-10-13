import * as helpers from "./helpers.js";

const algoliaClient = algoliasearch("3VY17DELF4", "455080cdf8c3e2f23fd7d106fac363c7");
const searchClient = {
	...algoliaClient,
	search(requests) {
		// Detect empty search requests to prevent search request on every page load
		if (requests.every(({ params }) => !params.query)) {
			return Promise.resolve({
				results: requests.map(() => ({
					hits: [],
					nbHits: 0,
					nbPages: 0,
					page: 0,
					processingTimeMS: 0,
					hitsPerPage: 0,
					exhaustiveNbHits: false,
					query: "",
					params: ""
				}))
			});
		}

		return algoliaClient.search(requests);
	}
};

new Vue({
	el: "#search-app",
	data() {
		return {
			indexName: "Production",
			searchClient,
			maxRating: 5,
			routing: {
				stateMapping: {
					stateToRoute(uiState) {
						const indexUiState = uiState["Production"];
						return {
							query: indexUiState.query
						};
					},
					routeToState(routeState) {
						return {
							["Production"]: {
								query: routeState.query
							}
						};
					}
				}
			}
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
		refineSearch: helpers.debounce((refine, value) => {
			// Wait to search until after the user has stopped typing for 500ms
			refine(value);
		}),
		goToSearchPage(query) {
			location.href = "/search.aspx?query=" + query;
		},
		formatCurrency(value) {
			return new Intl.NumberFormat("en-CA", {
				style: "currency",
				currency: "CAD",
				maximumFractionDigits: 2
			}).format(value);
		},
		formatNumber(value = 0, digits = 0) {
			return Number(value).toLocaleString("en-CA", {
				minimumFractionDigits: digits,
				maximumFractionDigits: digits
			});
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
		},
		toDisplayLabel(str) {
			if (str.includes("manufacturername")) return "Brands";
			if (str.includes("avgrating")) return "Rating";
			if (str.includes("categories")) return "Category";
			if (str.includes("price")) return "Price";
		}
	}
});
