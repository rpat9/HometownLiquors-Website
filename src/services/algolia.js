import { algoliasearch } from 'algoliasearch';

const APPLICATION_ID = import.meta.env.VITE_ALGOLIA_APPLICATION_ID;
const API_KEY = import.meta.env.VITE_ALGOLIA_API_KEY;
const INDEX_NAME = "products_index";

const client = algoliasearch(APPLICATION_ID, API_KEY);

export const searchProducts = async (query) => {
    const { hits } = await client.searchSingleIndex({
        indexName: INDEX_NAME,
        searchParams: {
            query,
            hitsPerPage: 24,
        }
    });
    return hits;
};